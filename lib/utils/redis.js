var config = require("./config").redis;

let Redis = require("ioredis");
let client = new Redis({
  post: config.port,
  host: config.host,
  password: config.password,
  db: config.db || 0
});

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
   * @param {*} expire 秒
   */
  async set(key, val, expire) {
    return new Promise((resolve, reject) => {
      client.set(key, val, (err, val) => {
        if (err) {
          reject(err);
        } else {
          if (expire) {
            client.expire(key, expire);
          }
          resolve(val);
        }
      });
    });
  },
  /**
   * 设置redis
   * @param {*} key
   * @param {*} json
   * @param {*} expire 秒
   */
  async setJSON(key, json, expire) {
    return new Promise((resolve, reject) => {
      let val;
      if (typeof json == "object") {
        val = JSON.stringify(json);
      } else {
        val = json;
      }
      client.set(key, val, (err, val) => {
        if (err) {
          reject(err);
        } else {
          if (expire) {
            client.expire(key, expire);
          }
          resolve(val);
        }
      });
    });
  }
};
