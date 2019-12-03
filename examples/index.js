require("@babel/register");
const faasExpress = require("../index");
const path = require("path");
const basePath = path.resolve(__dirname);
const app = new faasExpress(basePath);
app.listen();
