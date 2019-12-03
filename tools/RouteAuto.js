const fs = require("fs");
const path = require("path");
var Sequelize = require("sequelize");
require("art-template");
var art = require("./route.art");
var artDecorator = require("./route-decorator.art");

module.exports = class {
  constructor(handler, useDecorator) {
    this.basePath = handler;
    this.useDecorator = useDecorator;
    this.models = {};
    // 后续解决加载model问题后打开
    // var modelsDir = path.join(handler, "models");
    // //读取所有models
    // fs.readdirSync(modelsDir)
    //   .filter(file => {
    //     return file.indexOf(".") !== 0 && file.slice(-3) === ".js";
    //   })
    //   .forEach(file => {
    //     var model = require(path.join(modelsDir, file));
    //     if (model.default) {
    //       model = model.default;
    //     }
    //     try {
    //       model(this, Sequelize.DataTypes);
    //     } catch (e) {}
    //   });
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
    var art;
    if (this.useDecorator) {
      art = require("./route-decorator.art");
    } else {
      art = require("./route.art");
    }
    models.forEach(model => {
      // 后续解决加载model问题后打开this.models[model]
      if (!this.models[model] || this.useDecorator) {
        var result = art({
          name: model,
          fields: this.models[model] || []
        });
        fs.writeFileSync(path.join(this.basePath, "routes", `${model}.js`), result, {
          encoding: "utf8"
        });
        console.log(`create route ${model} done!`);
      } else {
        console.log(`model name not exist:${model}`);
      }
    });
  }
};
