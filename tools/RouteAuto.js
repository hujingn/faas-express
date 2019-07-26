const fs = require("fs");
const path = require("path");
var Sequelize = require("sequelize");
require("art-template");
var art = require("./route.art");

module.exports = class {
  constructor(handler) {
    this.basePath = handler;
    this.models = {};
    var modelsDir = path.join(handler, "models");
    //读取所有models
    fs.readdirSync(modelsDir)
      .filter(file => {
        return file.indexOf(".") !== 0 && file.slice(-3) === ".js";
      })
      .forEach(file => {
        var model = require(path.join(modelsDir, file));
        if (model.default) {
          model = model.default;
        }
        try {
          model(this, Sequelize.DataTypes);
        } catch (e) {}
      });
  }
  //模拟sequelize.define
  define(name, fields) {
    var modelConfig = Object.keys(fields).map(key => {
      let field = fields[key];
      let type = field.type.toString();
      if (type.indexOf("INTEGER") === 0) {
        type = "integer";
      } else {
        type = "string";
      }
      return {
        key,
        type,
        comment: field.comment || ""
      };
    });
    this.models[name] = modelConfig;
  }
  gen(models) {
    models.forEach(model => {
      if (this.models[model]) {
        var result = art({
          name: model,
          fields: this.models[model]
        });
        fs.writeFileSync(path.join(this.basePath, "routes", `${model}.js`), result, {
          encoding: "utf8"
        });
      } else {
        console.log(`model name not exist:${model}`);
      }
    });
  }
};
