module.exports = function(app, db, util, service, variables) {
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
   *         description: 项目状态，0 未编排，1 已编排，2 任务完成
   *       date:
   *         type: string
   *         description: 项目日期
   *       label_type:
   *         type: string
   *         description: 标注类型
   *       configuration:
   *         type: object
   *         description: 项目配置信息
   *       label_configuration:
   *         type: object
   *         description: 标注配置信息
   *       submitter:
   *         type: string
   *         description: 送标人
   *       customer:
   *         type: string
   *         description: 客户
   *       city:
   *         type: string
   *         description: 城市
   *       store:
   *         type: string
   *         description: 门店
   *       created_at:
   *         type: string
   *         description: 创建时间/送标时间
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
   *       - name: submitter
   *         description: 送标人
   *         in: query
   *         type: string
   *       - name: customer
   *         description: 客户
   *         in: query
   *         type: string
   *       - name: date
   *         description: 项目日期
   *         in: query
   *         type: string
   *       - name: status
   *         description: 项目状态，0 未编排，1 已编排，2 任务完成
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
  app.get("/projects", function(req, res) {
    console.log(variables);
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
        res.json(util.wrapError(err));
      });
  });

  /**
   * @swagger
   * /projects/{id}:
   *   get:
   *     tags:
   *       - 项目管理
   *     description: 查询详情
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: integer
   *     responses:
   *       200:
   *         description: A single projects
   *         schema:
   *           $ref: '#/definitions/projects'
   */
  app.get("/projects/:id", function(req, res) {
    if (!req.params.id) {
      res.json(util.wrapError("参数缺失"));
      return;
    }
    db.projects
      .findOne({
        where: {
          id: req.params.id
        }
      })
      .then(data => {
        res.json(util.wrap(data));
      })
      .catch(err => {
        res.json(util.wrapError(err));
      });
  });

  /**
   * @swagger
   * /projects:
   *   post:
   *     tags:
   *       - 项目管理
   *     description: 新增
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: projects
   *         description: json对象
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/projects'
   *     responses:
   *       200:
   *         description: Successfully created
   */
  app.post("/projects", function(req, res) {
    let checkData = util.checkModelData(req.body, db.projects);
    if (checkData) {
      res.json(util.wrapError(checkData));
      return;
    }
    db.projects
      .create(req.body)
      .then(data => {
        res.json(util.wrap(data));
      })
      .catch(err => {
        res.json(util.wrapError(err));
      });
  });

  /**
   * @swagger
   * /projects/{id}:
   *   put:
   *     tags:
   *       - 项目管理
   *     description: 更新
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *       - name: projects
   *         description: json对象
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/projects'
   *     responses:
   *       200:
   *         description: Successfully updated
   */
  app.put("/projects/:id", function(req, res) {
    if (!req.params.id) {
      res.json(util.wrapError("参数缺失"));
      return;
    }
    let checkData = util.checkModelData(req.body, db.projects);
    if (checkData) {
      res.json(util.wrapError(checkData));
      return;
    }
    db.projects
      .update(req.body, {
        where: { id: req.params.id }
      })
      .then(data => {
        res.json(util.wrap(data));
      })
      .catch(err => {
        res.json(util.wrapError(err));
      });
  });

  /**
   * @swagger
   * /projects/{id}:
   *   delete:
   *     tags:
   *       - 项目管理
   *     description: 删除
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         type: integer
   *     responses:
   *       200:
   *         description: Successfully deleted
   */
  app.delete("/projects/:id", function(req, res) {
    if (!req.params.id) {
      res.json(util.wrapError("参数缺失"));
      return;
    }
    db.projects
      .destroy({
        where: { id: req.params.id }
      })
      .then(data => {
        res.json(util.wrap(data));
      })
      .catch(() => {
        res.json(util.wrapError(err));
      });
  });
};
