var faasExpress = require("faas-express");
var path = require("path");
var basePath = path.resolve(__dirname);
console.log(basePath);
faasExpress(basePath);
