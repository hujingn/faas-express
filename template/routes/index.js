var { router } = require("faas-express");

router.use("/*", function(req, res, next) {
  next();
});
