const log4js = require("log4js");
const config = require("../config").log4j;

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

Object.keys(defaultConfig.appenders).forEach(key => {
  if (config[key]) {
    Object.assign(defaultConfig.appenders[key], config[key]);
    delete defaultConfig.appenders[key].level;
  }
});

Object.keys(defaultConfig.categories).forEach(key => {
  if (config[key] && config[key].level) {
    defaultConfig.categories[key].level = config[key].level;
  }
});

log4js.configure(defaultConfig);

module.exports = log4js;
