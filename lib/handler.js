var allConfig = require("./config");
var config = allConfig.db;
var scheduleConfig = require("./config").schedule;
var utils = require("./utils/index");
var log4js = require("./utils/log4js");
var CronJob = require("cron").CronJob;
var moment = require("moment");

const basePath = process.env.BASE_PATH;
var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
const modelsDir = basePath + "/models";
const routesDir = basePath + "/routes";
const serviceDir = basePath + "/service";
var db = {};
var service = {};
var logger = log4js.getLogger("db");

var sequelize = new Sequelize(config.dbname, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  pool: config.pool,
  timezone: "+08:00",
  logging: function(sql) {
    logger.info(sql);
  },
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

service.define = function(name, methods) {
  service[name] = methods;
  return methods;
};

//读取/models目录下所有models配置
fs.readdirSync(modelsDir)
  .filter(file => {
    return file.indexOf(".") !== 0 && file.slice(-3) === ".js";
  })
  .forEach(file => {
    var model = sequelize["import"](path.join(modelsDir, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

const op = Sequelize.Op;
db.Op = op;
db.sequelize = sequelize;
db.Sequelize = Sequelize;

utils.config = allConfig;
utils.log4js = log4js;
//传给其他模块变量
const variables = { config: allConfig, log4js, utils };

//使用redis时才创建redis连接
var redis = null;
Object.defineProperty(variables, "redis", {
  get: function() {
    if (!redis) {
      redis = require("./utils/redis");
    }
    return redis;
  }
});

//读取/service目录下所有service配置
fs.readdirSync(serviceDir)
  .filter(file => {
    return file.indexOf(".") !== 0 && file.slice(-3) === ".js";
  })
  .forEach(file => {
    var model = require(path.join(serviceDir, file));
    model = model.default || model;
    model(db, service, variables);
  });

db.service = service;

module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
module.exports.op = op;
module.exports.service = service;

//加载定时器配置
if (scheduleConfig) {
  let scheduleMethods = Object.keys(scheduleConfig);
  scheduleMethods.forEach(key => {
    let method = key.split(".").reduce((t, c) => {
      return t[c] || {};
    }, service);
    if (method && typeof method === "function") {
      new CronJob(
        scheduleConfig[key],
        function() {
          method().then(() => {
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

module.exports = function(app, expressRouter) {
  let root = allConfig.env.root || "/";
  try {
    var router = require(path.join(routesDir, "index.js"));
    router = router.default || router;
    let pip = router(expressRouter, db, utils, service, variables);
    if (typeof pip === "function") {
      app.use(root, pip);
    }
  } catch (e) {
    console.warn(e);
  }

  //读取/routes目录下所有路由配置
  fs.readdirSync(routesDir)
    .filter(file => {
      return file.indexOf(".") !== 0 && file.slice(-3) === ".js";
    })
    .forEach(file => {
      var router = require(path.join(routesDir, file));
      router = router.default || router;
      router(expressRouter, db, utils, service, variables);
      app.use(root, expressRouter);
    });
};
