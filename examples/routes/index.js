// import redis from "../utils/redis";
module.exports = function(app, db, util) {
  app.use("/*", function(req, res, next) {
    // redis.set("abc", "abc", 10);

    // redis.get("abc").then(data => {
    //   console.log("get-redis:", data);
    // });
    next();

    // let token = req.headers.token;
    // if (!token) {
    //   res.json(util.wrapError("未登录", 401));
    //   return;
    // }
    // redis
    //   .getJSON("uuid")
    //   .then(data => {
    //     console.log("uuid:", data);
    //     req.sessionUser = data;
    //     next();
    //   })
    //   .catch(err => {
    //     res.json(util.wrapError("登录超时", 403));
    //   });
  });
};
