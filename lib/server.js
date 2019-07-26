var path = require("path");

module.exports = function(basePath) {
  process.env.BASE_PATH = basePath;

  const port = process.env.http_port || 3000;
  const express = require("express");
  const app = express();
  let log4js = require(`./utils/log4js`);
  let config = require(`./config`);
  config.env.function = config.env.function || "";
  config.env.root = config.env.root || "";

  // add swagger support start
  var swaggerUi = require("swagger-ui-express");
  var swaggerJSDoc = require("swagger-jsdoc");
  var swaggerDefinition = {
    info: {
      title: "Node Swagger API",
      version: "1.0.0",
      description: "鲁班标注工具 RESTful API with Swagger"
    },
    host: "",
    basePath: path.join("/", config.env.function, config.env.root)
  };
  var options = {
    swaggerDefinition: swaggerDefinition,
    apis: [basePath + "/routes/*.js"]
  };
  var swaggerSpec = swaggerJSDoc(options);
  // serve swagger
  app.get(path.join(config.env.root, "/swagger.json"), function(req, res) {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  app.use(path.join(config.env.root, "/api-docs"), swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // add swagger support end

  const appHandler = require("./handler.js");
  const bodyParser = require("body-parser");

  //httpLog
  const httpLogger = log4js.getLogger("http");
  app.use(log4js.connectLogger(httpLogger, { level: "auto", format: ":method :url" }));

  // app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(bodyParser.raw());
  app.use(bodyParser.text({ type: "text/*" }));
  app.disable("x-powered-by");

  appHandler(app, express.Router());

  app.listen(port, () => {
    console.log(`OpenFaaS Node.js listening on port: ${port}`);
    console.log("swagger base:" + path.join(config.env.host, config.env.function, config.env.root, "/api-docs"));
    console.log("api url base:" + path.join(config.env.host, config.env.function, config.env.root));
  });
};
