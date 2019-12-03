import { router as app, db, utils as util, service, variables, Route } from "../../index";

app.get("/jobs", function(req, res) {
  let page = util.getPage(req.query),
    size = util.getSize(req.query),
    offset = (page - 1) * size,
    limit = size;
  let where = util.getQueryWhere(req.query, db.Op, db.jobs);
  let order = util.getOrder(req.query, db.jobs);
  db.jobs
    .findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        {
          model: db.projects,
          as: "project"
        }
      ]
    })
    .then(data => {
      res.json(util.wrapWithPage(data, page, size));
    })
    .catch(err => {
      res.json(util.wrapError(err));
    });
});
