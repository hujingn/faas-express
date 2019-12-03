var fs = require("fs");
var yaml = require("js-yaml");
var path = require("path");
const nodeEnv = process.env.NODE_ENV || "development";
const basePath = process.env.BASE_PATH || path.resolve(__dirname);

var doc = yaml.safeLoad(fs.readFileSync(path.join(basePath, "config.yml"), "utf8"));
let config = doc[nodeEnv];
if (!config) {
  console.error("config.yml or NODE_ENV error");
}

// module.exports.db = config.db;
// module.exports.redis = config.redis;
// module.exports.log4j = config.log4j;
// module.exports.env = config.env;
// module.exports.schedule = config.schedule;

module.exports = config;
module.exports.default = config;
