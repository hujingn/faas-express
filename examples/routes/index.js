import { router as app, Route } from "../../index";

class Routes {
  @Route("/*")
  global(req, res, next) {
    next();
  }
}

app.use("/*", function(req, res, next) {
  // const { redies } = require("../../index");
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
