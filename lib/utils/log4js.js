const log4js = require("log4js");

log4js.addLayout("json", function(config) {
  return function(logEvent) {
    var data = logEvent.data[0];
    var result = {
      log_type: logEvent.categoryName,
      level: logEvent.level.levelStr,
      timestamp: logEvent.startTime
    };
    if (Array.isArray(data)) {
      Object.assign(result, data[0]);
    } else if (typeof data === "object") {
      Object.assign(result, data);
    } else {
      result.data = data;
    }
    return JSON.stringify(result);
  };
});

module.exports = function(config) {
  let defaultConfig = {
    appenders: {
      out: { type: "console" },
      default: {
        type: "console"
      },
      http: {
        type: "console"
      },
      db: {
        type: "console"
      }
    },
    categories: {
      default: {
        appenders: ["default"],
        level: "info"
      },
      http: {
        appenders: ["http"],
        level: "info"
      },
      db: {
        appenders: ["db"],
        level: "info"
      }
    },
    replaceConsole: true
  };

  if (config) {
    Object.keys(config).forEach(key => {
      if (defaultConfig.appenders[key]) {
        Object.assign(defaultConfig.appenders[key], config[key]);
        delete defaultConfig.appenders[key].level;
      } else {
        defaultConfig.appenders[key] = Object.assign({}, config[key]);
      }
      if (defaultConfig.categories[key]) {
        defaultConfig.categories[key].level = defaultConfig.categories[key].level || config[key].level || "info";
        defaultConfig.categories[key].appenders = [key];
      } else {
        defaultConfig.categories[key] = { level: config[key].level || "info", appenders: [key] };
      }
    });
  }

  try {
    log4js.configure(defaultConfig);
  } catch (e) {
    console.log("log4js configure error");
    console.log(e);
  }

  return log4js;
};
