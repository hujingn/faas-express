var path = require("path");
var fs = require("fs");

function initSwagger(app, routesDir, config) {
  // add swagger support start
  var swaggerUi = require("swagger-ui-express");
  var swaggerJSDoc = require("swagger-jsdoc");
  var swaggerDefinition = {
    info: {
      title: "Node Swagger API",
      version: "1.0.0",
      description: "RESTful API with Swagger"
    },
    host: "",
    basePath: path.join("/", config.env.function, config.env.root)
  };
  var swaggerOtions = {
    swaggerDefinition: swaggerDefinition,
    apis: [routesDir + "/*.js"]
  };
  var swaggerSpec = swaggerJSDoc(swaggerOtions);
  // serve swagger
  app.get(path.join(config.env.root, "/swagger.json"), function(req, res) {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  app.use(path.join(config.env.root, "/api-docs"), swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // add swagger support end
}

module.exports = initSwagger;
