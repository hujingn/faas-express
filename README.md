OpenFaaS Node.js and Express.js template
=============================================

## Quick Start

```
$ npm i -g faas-express
$ faas-express init 
$ faas-express new your-fn-name

# start dev
$ node your-fn-name
# build && push && deploy
$ faas-express build/push/deploy function-name -f your-fn-yaml.yml
```
## Trying the template

```
# 安装faas-express，也可以运行faas-express init，会自动创建babel.config.js和.eslintrc.js，Dockerfile打包镜像必须
$ npm i faas-express

# 全局安装faas-express
$ npm i -g faas-express
# 也可以不安装全局模块，使用git库安装并配置scripts，只能使用yarn运行scripts，npm无法传递--参数
$ npm install git+ssh:git@code.aibee.cn:ued/faas-express.git
# 添加 "scripts": { "faas-express": "faas-express" }
$ 使用 yarn faas-express new your-fn-name

# 项目初始化
$ npm init
$ faas-express init 
$ faas-express new your-fn-name

# 创建function
$ faas-express new your-fn-name
# 安装部署，部署your-fn-yaml.yml中所有functions使用.代替function-name
$ faas-express build/push/deploy function-name -f your-fn-yaml.yml
```

## Start Development && Automatic code generation

```
$ npm install
# 修改 your-fn-name/config.yml数据库等配置
# 编写代码models、routes、service
# 自动生成model，多个表名空格隔开。根据-f your-fn-yaml.yml中-n function-name的数据库配置生成，不指定-f-n默认读取functiom.yml第一个function的数据库配置，-d参数根据带修饰器模板生成代码
$ faas-express model jobs projects ... -n function-name -f your-fn-yaml.yml
# 自动生成route，根据models目录下model名称生成，多个model空格隔开。指定-f your-fn-yaml.yml中-n function-name的handler配置目录下去读models，不指定-f-n默认读取functiom.yml第一个function的handler目录配置，-d参数根据带修饰器模板生成代码
$ faas-express route jobs projects ... -n function-name -f your-fn-yaml.yml
# service 业务性复杂的函数写在service下，方便维护和调用
# 本地启动服务
$ node your-fn-name/index.js
```

## build && push && deploy

```
# 修改 function.yml文件
# functions test-faas-node 为部署到openfaas后接口后缀 http://192.168.9.30:31112/function/test-faas-node
# build-arg docker镜像打包时传入环境变量
# handler 代码相对路径
# image docker镜像名
provider:
  name: openfaas
  gateway: http://192.168.9.30:31112
functions:
  test-faas-node:
    build-arg: NODE_ENV=development
    lang: faas-express
    handler: ./your-fn-name
    image: registry.aibee.cn/bi-faas-web/test-faas-node:0.0.1

# build docker image，如果项目根目录下有Dockerfile会使用自定义的Dockerfile
faas-express build . -f ./function.yml
# push docker image
faas-express push . -f ./function.yml
# deploy function
faas-express deploy . -f ./function.yml
```

## Config 
your-fn-name/config.yml

```
env:
  host: localhost:3000
  function: ""
  root: /
schedule:
  # 定时任务，每10秒执行方法 service.projects.test
  projects.test: "*/10 * * * *"
```

## log4js Config 
配置参见 [log4js-node](https://github.com/log4js-node/log4js-node/tree/master/docs) 

```js
import { variables } from "faas-express";
var logger = variables.log4js.getLogger("time");
logger.info("this is log");
```

your-fn-name/config.yml

```
log4j:
  http:
    level: info
    type: dateFile
    filename: logs/http
    pattern: _yyyy-MM-dd.log
    alwaysIncludePattern: true
    layout:
      type: 'pattern'
      pattern: '%d %p %c %X{user} %m%n'
  db:
    level: info
    type: console
    layout:
      type: json
  time:
    level: info
    type: console
    layout:
      type: 'pattern'
      pattern: '%d %p %c %X{user} %m%n'
```

## redis Config 
配置参见 [ioredis](https://github.com/luin/ioredis) 

```js
import { redis } from "faas-express";
redis.set("key", "value", 3000);
redis.set("key", "value", "NX", "EX", 100);
redis.get("key");
```

your-fn-name/config.yml

```
redis:
  mode: sentinel/""
  host: 127.0.0.1
  port: 26379
  password: 123456
  name: mymaster
  db: 1
  # 连接失败重试次数，0会一直重试，默认5次
  retry: 1
```

## 参数和变量 
```
# 所有参数都在faas-express对象下
import { router, db, service, ... } from "faas-express";
# router 路由express.Router()
# db 数据库实例及所有模型
# service 所有定义的服务函数
# utils 公用工具函数
# config yml配置变量，参见yml，例如config.db.dbname
# variables 常用变量，{ config, log4js, utils, moment }
# sequelize sequelize实例
# Route 路由修饰器
# DB 数据库修饰器
# Service 服务函数修饰器
# Sequelize 原生Sequelize构造器

# 所有数据库相关对象都在db下
var { define, associate, sequelize, Sequelize, Model, Op, DataTypes, modelName... } = db;
# define 数据模型定义方法
# associate 数据模型关系定义
# sequelize sequelize实例
# sequelize 原生Sequelize构造器
# Model, Op, DataTypes 也可有Sequelize.DataTypes等获取
# db.modelName 所有定义的模型名称

# 所有服务函数相关对象都在service下
var { define, serviceName... } = service;
# define 服务函数定义方法
# serviceName 所有定义的服务名称

# 公用工具函数
var { wrap, wrapError, wrapWithPage, ...  } = utils;
# wrap(data, error_no = 0, error_msg = "") 包装返回信息
# wrapError(error_msg, error_no = 500) 包装错误返回信息
# wrapWithPage(data, page, size) 包装返回值，包含分页
# getQueryWhere(query, Op, model, namespace) 生成查询条件，可直接给model查询条件where
# getPage(query) 返回page条件
# getSize(query) 返回size条件
# getSqlLimit(query) 返回mysql limit分页条件{offset,limit}
# getOrder(query, model, defaultOrder) 返回mysql order排序条件
# checkModelData(data, model) 校验对象数据和model验证，用于保存校验
# genTreeNodes(list, idKey = "id", pidKey = "parent_id", startWidth = "-1", labelKey = "name") list型树数据转children型树结构，element-ui tree格式
```

## Example usage

Example with sequelize models:

使用如下命令可自动生成
```
faas-express model projects -n function-name -f your-fn-yaml.yml
```

```js
/**
 * your-fn-name/projects.js
 **/
import { db, DB } from "faas-express";
var { sequelize, Sequelize, Model, Op, DataTypes } = db;

db.define(
  "projects",
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: "0"
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    label_configuration: {
      type: DataTypes.TEXT,
      allowNull: true,
      get(){
        let json = this.getDataValue("label_configuration");
        if (json) {
          try {
            return JSON.parse(json);
          } catch (e) {
            return json;
          }
        } else {
          return {};
        }
      },
      set(val) {
        try {
          this.setDataValue("label_configuration", JSON.stringify(val));
        } catch (e) {
          this.setDataValue("label_configuration", val);
        }
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    tableName: "projects",
    createdAt: "created_at",
    updatedAt: "updated_at",
    timestamps: true,
    underscored: true,
  }
);

db.associate(models => {
  models.projects.hasMany(models.jobs, { foreignKey: "project_id", as: "jobs" });
};
```

使用修饰器方式
```
faas-express model projects -n function-name -f your-fn-yaml.yml -d
```

```js
/**
 * your-fn-name/projects.js
 **/
import { db, DB } from "faas-express";
var { sequelize, Sequelize, Model, Op, DataTypes } = db;

@DB("projects")
class ProjectsModel {
  attributes = {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    ...
  };
  options = {
    tableName: "projects",
    createdAt: "created_at",
    updatedAt: "updated_at",
    timestamps: true,
    underscored: true,
  };
  associate(models) {
    models.projects.hasMany(models.jobs, { foreignKey: "project_id", as: "jobs" });
  };
)
```

Example with express HTTP API:

使用如下命令可自动生成
```
faas-express route projects -n function-name -f your-fn-yaml.yml
```

Routes:

```js
/**
 * your-fn-name/projects.js
 **/
import { router as app, db, utils as util, service, variables, Route } from "faas-express";

app.get("/projects", function(req, res) {
  let page = util.getPage(req.query),
    size = util.getSize(req.query),
    offset = (page - 1) * size,
    limit = size;
  let where = util.getQueryWhere(req.query, db.Op, db.projects);
  let order = util.getOrder(req.query, db.projects);
  db.projects
    .findAndCountAll({
      where,
      limit,
      offset,
      order
    })
    .then(data => {
      res.json(util.wrapWithPage(data, page, size));
    })
    .catch(err => {
      res.json(util.wrapError(err.message));
    });
});
```

使用修饰器方式
```
faas-express route projects -n function-name -f your-fn-yaml.yml -d
```

Routes:

```js
/**
 * your-fn-name/projects.js
 **/
import { router as app, db, utils as util, service, variables, Route } from "faas-express";

@Route("/projects", "get")
getProjects(req, res) {
  let page = util.getPage(req.query),
    size = util.getSize(req.query),
    offset = (page - 1) * size,
    limit = size;
  let where = util.getQueryWhere(req.query, db.Op, db.projects);
  let order = util.getOrder(req.query, db.projects);
  db.projects
    .findAndCountAll({
      where,
      limit,
      offset,
      order
    })
    .then(data => {
      res.json(util.wrapWithPage(data, page, size));
    })
    .catch(err => {
      res.json(util.wrapError(err.message));
    });
})
```

Service Methods:

```js
/**
 * your-fn-name/projects.js
 **/
import { service, db, variables, Service } from "faas-express";

service.define("projects", {
  /**
   * 更新项目配置，同时更新日常编排任务配置
   * @param {*} pid
   * @param {*} params
   */
  async updateProjectWithTask(pid, params) {
    let label_configuration = params.label_configuration || {};
    return await db.sequelize.transaction(t => {
      return Promise.all([
        db.projects.update(params, {
          where: { id: pid },
          transaction: t
        }),
        db.daily_tasks.update(
          {
            assigned_group_list: label_configuration.assigned_group_list,
            max_worker_count: label_configuration.max_worker_count
          },
          {
            where: { project_id: pid },
            transaction: t
          }
        )
      ]);
    });
  },
  async test(){
    console.log("schedule doing");
  }
});
```

使用修饰器方式
```
faas-express route projects -n function-name -f your-fn-yaml.yml -d
```

```js
/**
 * your-fn-name/projects.js
 **/
import { service, db, variables, Service } from "faas-express";

@Service("projects")
class Projects {
  /**
   * 更新项目配置，同时更新日常编排任务配置
   * @param {*} pid
   * @param {*} params
   */
  async updateProjectWithTask(pid, params) {
    let label_configuration = params.label_configuration || {};
    return await db.sequelize.transaction(t => {
      return Promise.all([
        db.projects.update(params, {
          where: { id: pid },
          transaction: t
        }),
        db.daily_tasks.update(
          {
            assigned_group_list: label_configuration.assigned_group_list,
            max_worker_count: label_configuration.max_worker_count
          },
          {
            where: { project_id: pid },
            transaction: t
          }
        )
      ]);
    });
  },
  async test(){
    console.log("schedule doing");
  }
};
```

swagger support:

```js
  /**
   * @swagger
   * definitions:
   *   projects:
   *     properties:
   *       category_id:
   *         type: string
   *         description: 分类ID
   *       name:
   *         type: string
   *         description: 项目名称
   *       status:
   *         type: integer
   *         description: 项目状态
   */

  /**
   * @swagger
   * /projects:
   *   get:
   *     tags:
   *       - 项目管理
   *     description: 分页查询
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: name
   *         description: 项目名称
   *         in: query
   *         type: string
   *       - name: page
   *         in: query
   *         type: integer
   *       - name: size
   *         in: query
   *         type: integer
   *     responses:
   *       200:
   *         description: An array of projects
   *         schema:
   *            $ref: '#/definitions/projects'
   */
```

## Use Technology && Help Docs

express web服务框架 [express](https://expressjs.com/en/4x/api.html)

sequelize 数据库操作ORM框架 [sequelize](http://docs.sequelizejs.com/manual/querying.html) / [sequelize blog](https://itbilu.com/nodejs/npm/V1PExztfb.html)

swagger 接口文档生成器 [swagger](https://www.breakyizhan.com/swagger/2969.html) / [swagger example](https://mherman.org/blog/swagger-and-nodejs/)


start with [node10-express template](https://github.com/openfaas-incubator/node10-express-template/)