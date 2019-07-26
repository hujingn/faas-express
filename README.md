OpenFaaS Node.js and Express.js template
=============================================

## Trying the template

```
# 安装faas-express，也可以运行faas-express init，会自动创建babel.config.js和.eslintrc.js，Dockerfile打包镜像必须
$ npm i faas-express

# 全局安装faas-express
$ npm i -g faas-express
# 也可以不安装全局模块，使用git库安装并配置scripts，只能使用yarn运行scripts，npm无法传递--参数
$ npm install git+ssh:git@gitlab.aibee.cn:ued/faas-express.git
# 添加 "scripts": { "faas-express": "faas-express" }
$ 使用 yarn faas-express new your-fn-name

# 创建function
$ faas-express new your-fn-name
# 安装部署，部署your-fn-yaml.yml中所有functions使用.代替function-name
$ faas-express build/push/deploy function-name -f your-fn-yaml.yml
```

## Start Development

```
$ npm install
# 修改 your-fn-name/config.yml数据库等配置
# 编写代码models、routes、service
# 自动生成model
$ faas-express model jobs projects ...
# 启动服务
$ node your-fn-name/index.js
```

## build && push && deploy

```
# 修改 function.yml文件
# test-faas-node 为部署到openfaas后接口后缀 http://192.168.9.30:31112/function/test-faas-node
provider:
  name: openfaas
  gateway: http://192.168.9.30:31112
functions:
  test-faas-node:
    build-arg: NODE_ENV=development
    lang: faas-express
    handler: ./your-fn-name
    image: registry.aibee.cn/bi-faas-web/test-faas-node:0.0.1

# 执行
faas-express build . -f ./function.yml
faas-express push . -f ./function.yml
faas-express deploy . -f ./function.yml
```

## Config 
your-fn-name/config.yml

```
env:
  host: localhost:3000
  prefix: ""
schedule:
  # 定时任务，每10秒执行方法 service.projects.test
  projects.test: "*/10 * * * *"
```

## Example usage

Example with express HTTP API:

Routes:

```js
/**
 * your-fn-name/label_types.js
 * app express router
 * db sequelize and all models
 * util wrap tools
 * service
 **/
export default function(app, db, util, service) {
  app.get("/label_types", function(req, res) {
    db.label_types.findAll().then(data => {
      res.json(util.wrap(data));
    });
  });

  app.post("/label_types", function(req, res) {
    let checkData = util.checkModelData(req.body, db.label_types);
    if (checkData) {
      res.json(util.wrapError(checkData));
      return;
    }
    db.label_types
      .create(req.body)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json({ err: err });
      });
  });
}
```

Service Methods:

```js
/**
 * your-fn-name/label_types.js
 * db sequelize and all models
 * all service
 **/
export default function(db, service) {
  return service.define("projects", {
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
}
```

Example with sequelize models:

```js
// generate by initModels.js 
/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    "label_types",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false
      },
      type: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true
      },
      label_configuration: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      tableName: "label_types",
      createdAt: "created_at",
      updatedAt: "updated_at",
      timestamps: true,
      underscored: true
    }
  );
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