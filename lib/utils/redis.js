var config = require("../config").redis;
var Redis = require("ioredis");

var client;
// 连接模式  default, sentinel
const mode = (config.mode || "").toLowerCase();
var redisConfig = {
  password: config.password,
  name: config.name,
  db: config.db || 0,
  retryStrategy: function(times) {
    var retry = config.retry === 0 ? 0 : config.retry || 5;
    if (retry !== 0 && times > retry && client) {
      console.log("redis connect retryStrategy " + times + " times fail and disconnect");
      client.disconnect();
      return false;
    }
    console.log("redis connect retryStrategy " + times);
    return times * 1000;
  },
  sentinelRetryStrategy: function(times) {
    var retry = config.retry === 0 ? 0 : config.retry || 5;
    if (retry !== 0 && times > retry && client) {
      console.log("redis connect sentinelRetryStrategy " + times + " times fail and disconnect");
      client.disconnect();
      return false;
    }
    console.log("redis connect sentinelRetryStrategy " + times);
    return times * 1000;
  }
};
if (mode.includes("sentinel")) {
  redisConfig.sentinels = [
    {
      host: config.host,
      port: config.port,
      sentinelPassword: config.sentinelPassword
    }
  ];
} else {
  redisConfig.host = config.host;
  redisConfig.port = config.port;
}
client = new Redis(redisConfig);

console.log("use redis and connect");

module.exports = {
  /**
   * 获取redis
   * @param {*} key
   */
  async get(key) {
    return new Promise((resolve, reject) => {
      client.get(key, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  },
  /**
   * 获取redis，value转json
   * @param {*} key
   */
  async getJSON(key) {
    return new Promise((resolve, reject) => {
      client.get(key, (err, data) => {
        if (err || !data) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  },
  /**
   * 设置redis
   * @param {*} key
   * @param {*} val
   * @param {*} params 或者 expire 秒
   */
  async set(key, val, ...params) {
    return new Promise((resolve, reject) => {
      if (params.length == 1 && Number.isInteger(params[0])) {
        var expire = params[0];
        client.set(key, val, (err, val) => {
          if (err) {
            reject(err);
          } else {
            client.expire(key, expire);
            resolve(val);
          }
        });
      } else {
        client.set(key, val, ...params, (err, val) => {
          if (err) {
            reject(err);
          } else {
            resolve(val);
          }
        });
      }
    });
  },
  /**
   * 设置redis
   * @param {*} key
   * @param {*} json
   * @param {*} params 或者 expire 秒
   */
  async setJSON(key, json, ...params) {
    return new Promise((resolve, reject) => {
      let val;
      if (typeof json == "object") {
        val = JSON.stringify(json);
      } else {
        val = json;
      }
      if (params.length == 1 && Number.isInteger(params[0])) {
        var expire = params[0];
        client.set(key, val, (err, val) => {
          if (err) {
            reject(err);
          } else {
            client.expire(key, expire);
            resolve(val);
          }
        });
      } else {
        client.set(key, val, ...params, (err, val) => {
          if (err) {
            reject(err);
          } else {
            resolve(val);
          }
        });
      }
    });
  }
};
