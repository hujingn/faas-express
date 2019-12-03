require("@babel/register");
const faasExpress = require("faas-express");
const path = require("path");
const basePath = path.resolve(__dirname);
const app = new faasExpress({ BASE_PATH: basePath, NODE_ENV: process.env.NODE_ENV, useSwagger: true });
app.listen();
