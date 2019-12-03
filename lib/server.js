var path = require("path");
var fs = require("fs");
var moment = require("moment");
var express = require("express");
var CronJob = require("cron").CronJob;
var bodyParser = require("body-parser");
var Sequelize = require("sequelize");

function FaasExpress(options) {
  // 配置信息
  const defaultOptions = {
    BASE_PATH: path.resolve(__dirname),
    NODE_ENV: process.env.NODE_ENV || "development",
    useSwagger: true
  };
  if (typeof options === "string") {
    defaultOptions.BASE_PATH = options;
  } else if (typeof options === "object") {
    Object.assign(defaultOptions, options);
  }
  process.env.NODE_ENV = defaultOptions.NODE_ENV;
  process.env.BASE_PATH = defaultOptions.BASE_PATH;
  this.options = defaultOptions;

  // 初始化express
  var app = express();
  require("express-ws")(app);
  var utils = require("./utils/index");
  var config = require(`./config`);
  var log4js = require(`./utils/log4js`)(config.log4j);
  config.env.function = config.env.function || "";
  config.env.root = config.env.root || "";

  //log config
  const httpLogger = log4js.getLogger("http");
  const dbLogger = log4js.getLogger("db");
  app.use(log4js.connectLogger(httpLogger, { level: "auto", format: ":method :url" }));
  if (!this.options.dbLogging) {
    this.options.dbLogging = function(sql, time) {
      dbLogger.info(sql);
      dbLogger.info("sql executed time: " + time + "ms");
    };
  }

  // app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  app.use(bodyParser.raw({ limit: "50mb" }));
  app.use(bodyParser.text({ type: "text/*", limit: "50mb" }));
  app.disable("x-powered-by");

  // 创建数据库连接
  var dbConfig = config.db;
  var sequelize = new Sequelize(dbConfig.dbname, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    timezone: "+08:00",
    benchmark: true,
    logging: this.options.dbLogging,
    dialectOptions: {
      // dateStrings: true,
      // 如果要输出不带时区日期字符串，可注释掉typeCast，打开dateStrings:true
      typeCast: function(field, next) {
        if (field.type === "DATETIME") {
          const date = field.string();
          if (date && date != "null") {
            return moment(date).format();
          } else {
            return null;
          }
        } else if (field.type === "DATE" || field.type === "DATEONLY") {
          const date = field.string();
          if (date && date != "null") {
            return moment(date).format("YYYY-MM-DD");
          } else {
            return null;
          }
        }
        return next();
      }
    }
  });

  this.app = app;
  this.config = config;
  this.options = defaultOptions;
  FaasExpress.utils = utils;
  this.log4js = log4js;
  FaasExpress.sequelize = sequelize;
  this.initialized = false;
}

FaasExpress.Sequelize = Sequelize;
FaasExpress.associates = [];
// 所有db定义放在db
FaasExpress.db = {
  define: (modelName, attributes, options, associate) => {
    var model = FaasExpress.sequelize.define(modelName, attributes, options);
    if (associate) FaasExpress.associates.push(associate); // model.associate = associate;
    FaasExpress.db[model.name] = model;
  },
  sequelize: null,
  Sequelize: null,
  DataTypes: null,
  Op: null,
  Model: null
};
// 所有service操作放在service
FaasExpress.service = {
  define: (name, methods) => {
    if (!FaasExpress.service[name]) FaasExpress.service[name] = {};
    Object.entries(methods).forEach(([fn, f]) => {
      FaasExpress.service[name][fn] = f;
    });
    return methods;
  }
};

FaasExpress.router = null;
FaasExpress.utils = null;
FaasExpress.variables = null;

FaasExpress.Service = name => {
  return function(target, key, descriptor) {
    // console.log(name, target, key, descriptor);
    if (!FaasExpress.service[name]) FaasExpress.service[name] = {};
    target.elements.forEach(e => {
      FaasExpress.service[name][e.key] = e.descriptor.value;
    });
  };
};

FaasExpress.Route = (route, method = "use") => {
  return function(target, key, descriptor) {};
};

FaasExpress.DB = name => {
  return function(target, key, descriptor) {
    const attributes = target.elements.find(e => e.key === "attributes" && e.kind === "field").initializer();
    const options = target.elements.find(e => e.key === "options" && e.kind === "field").initializer();
    const associate = target.elements.find(e => e.key === "associate" && e.kind === "method").descriptor;
    FaasExpress.db.define(name, attributes, options, associate && associate.value ? associate.value : null);
  };
};

FaasExpress.prototype.init = function() {
  var config = this.config;
  var app = this.app;
  var options = this.options;
  var sequelize = FaasExpress.sequelize;
  var utils = FaasExpress.utils;
  var log4js = this.log4js;
  const basePath = options.BASE_PATH;
  const modelsDir = basePath + "/models";
  const routesDir = basePath + "/routes";
  const serviceDir = basePath + "/service";

  // 将基础Sequelize放入db
  const op = Sequelize.Op;
  FaasExpress.db.Op = op;
  FaasExpress.db.sequelize = sequelize;
  FaasExpress.db.Sequelize = Sequelize;
  FaasExpress.db.DataTypes = Sequelize.DataTypes;
  FaasExpress.db.Model = Sequelize.Model;
  FaasExpress.variables = { config, log4js, utils, moment };
  FaasExpress.associates = [];
  FaasExpress.db.associate = function(cb) {
    FaasExpress.associates.push(cb);
  };
  FaasExpress.config = this.config;

  //使用redis时才创建redis连接
  var redis = null;
  Object.defineProperty(FaasExpress, "redis", {
    get: function() {
      if (!redis) {
        redis = require("./utils/redis");
      }
      return redis;
    }
  });
  Object.defineProperty(FaasExpress.variables, "redis", {
    get: function() {
      if (!redis) {
        redis = require("./utils/redis");
      }
      return redis;
    }
  });

  //读取/models目录下所有models配置
  fs.readdirSync(modelsDir)
    .filter(file => {
      return file.indexOf(".") !== 0 && file.slice(-3) === ".js";
    })
    .forEach(file => {
      require(path.join(modelsDir, file));
    });
  FaasExpress.associates.forEach(cb => {
    if (typeof cb === "function") {
      cb(FaasExpress.db);
    }
  });

  //读取/service目录下所有service配置
  fs.readdirSync(serviceDir)
    .filter(file => {
      return file.indexOf(".") !== 0 && file.slice(-3) === ".js";
    })
    .forEach(file => {
      require(path.join(serviceDir, file));
    });

  var expressRouter = express.Router();
  FaasExpress.router = expressRouter;

  FaasExpress.Route = (route, method = "use") => {
    return function(target, key, descriptor) {
      expressRouter[method.toLowerCase()](route, target.descriptor.value);
    };
  };

  let root = config.env.root || "/";
  try {
    // 先加载index.js拦截器
    require(path.join(routesDir, "index.js"));
  } catch (e) {
    console.warn(e);
  }

  // 读取/routes目录下所有路由配置
  fs.readdirSync(routesDir)
    .filter(file => {
      return file !== "index.js" && file.indexOf(".") !== 0 && file.slice(-3) === ".js";
    })
    .forEach(file => {
      require(path.join(routesDir, file));
    });

  // 使用swagger
  if (options.useSwagger) {
    require("./utils/swagger.js")(app, routesDir, config);
  }

  app.use(root, expressRouter);

  //加载定时器配置
  var scheduleConfig = config.schedule;
  if (scheduleConfig) {
    let scheduleMethods = Object.keys(scheduleConfig);
    scheduleMethods.forEach(key => {
      let method = key.split(".").reduce((t, c) => {
        return t[c] || {};
      }, FaasExpress.service);
      if (method && typeof method === "function") {
        new CronJob(
          scheduleConfig[key],
          function() {
            method({}).then(() => {
              console.log("schedule done:", key);
            });
          },
          null,
          true,
          "Asia/Shanghai"
        );
        console.log("schedule inited:", key, scheduleConfig[key]);
      }
    });
  }

  this.initialized = true;
};

FaasExpress.prototype.listen = function(port) {
  if (!this.initialized) this.init();
  const config = this.config;
  const app = this.app;
  const options = this.options;
  app.listen(port || 3000, () => {
    console.log(`OpenFaaS Node.js listening on port: ${port || 3000}`);
    if (options.useSwagger) {
      console.log("swagger base:" + path.join(config.env.host, config.env.function, config.env.root, "/api-docs"));
    }
    console.log("api url base:" + path.join(config.env.host, config.env.function, config.env.root));
  });
};

module.exports = FaasExpress;
module.exports.default = FaasExpress;
