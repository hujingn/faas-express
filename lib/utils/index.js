var moment = require("moment");

module.exports = {
  /**
   * 包装返回信息
   * @param {*} data
   * @param {*} error_no
   * @param {*} error_msg
   */
  wrap(data, error_no = 0, error_msg = "") {
    return {
      error_no,
      error_msg,
      data: data || null
    };
  },
  /**
   * 包装错误返回信息
   * @param {*} error_msg
   * @param {*} error_no
   */
  wrapError(error_msg, error_no = 500) {
    return {
      error_no,
      error_msg,
      data: null
    };
  },
  /**
   * 包装返回值，包含分页
   * @param {*} data
   * @param {*} page
   * @param {*} size
   */
  wrapWithPage(data, page, size) {
    return {
      error_no: 0,
      error_msg: "",
      data: {
        list: data.rows,
        total: data.count,
        page,
        size
      }
    };
  },
  /**
   * 生成查询条件
   * @param {*} query
   */
  getQueryWhere(query, Op, model, namespace) {
    let where = {};
    Object.keys(query).forEach(item => {
      let key = item;
      if (namespace) {
        if (item.indexOf(`${namespace}.`) === 0) {
          key = item.replace(`${namespace}.`, "");
        } else {
          return;
        }
      }
      if (!["page", "size"].includes(item) && (query[item] || query[item] === 0) && (!model || (model && model.tableAttributes[key]))) {
        if (key == "name") {
          where[key] = { [Op.like]: "%" + query[item] + "%" };
        } else {
          let vals = (query[item] || "").split(",");
          if (vals.length > 1) {
            where[key] = { [Op.in]: vals };
          } else {
            where[key] = { [Op.eq]: query[item] };
          }
        }
      }
    });
    return where;
  },
  /**
   * 返回page条件
   * @param {*} query
   */
  getPage(query) {
    let page = query && query.page ? parseInt(query.page) : 1;
    return page < 1 ? 1 : page;
  },
  /**
   * 返回size条件
   * @param {*} query
   */
  getSize(query) {
    return query && query.size ? parseInt(query.size) : 10;
  },
  /**
   * 返回mysql limit分页条件
   * @param {*} query
   */
  getSqlLimit(query) {
    let page = this.getPage(query);
    let size = this.getSize(query);
    return {
      offset: (page - 1) * size,
      limit: size
    };
  },
  /**
   * 返回mysql order排序条件
   * @param {*} query
   * @param {*} model
   * @param {*} def query.order为空时取默认值
   */
  getOrder(query, model, def) {
    let str = (query.order || "").replace(/^\s+|\s+$/g, "");
    if (!str && !def) {
      return [];
    } else if (!str && def) {
      str = def;
    }
    let orders = str.split(/\s*,+?[,\s]+/);
    return orders.reduce((t, c) => {
      let [key, type] = c.split(/\s+/);
      if (c && key && (!model || (model && model.tableAttributes[key]))) {
        t.push([key, /^(asc|desc)$/i.test(type) ? type : "asc"]);
      }
      return t;
    }, []);
  },
  /**
   * 判断空
   * @param {*} dt
   */
  isEmpty(dt) {
    return !dt && dt !== 0;
  },
  //不验证字段
  WHITEFIELDS: ["id", "created_at", "updated_at"],
  /**
   * 校验对象数据和model验证，用于保存校验
   * @param {*} data
   * @param {*} model
   */
  checkModelData(data, model) {
    let checkResult = [];
    if (!data) {
      checkResult.push("参数不能为空");
      return checkResult;
    }
    let tableAttributes = model.tableAttributes;
    Object.keys(tableAttributes).forEach(key => {
      if (!this.WHITEFIELDS.includes(key) && !tableAttributes[key].allowNull && this.isEmpty(data[key])) {
        checkResult.push(key + ":不能为空");
      }
    });
    return checkResult.join(",");
  },

  /**
   * 平级列表转树形结构children
   * return element-ui tree格式
   * @param {*} list 数据
   * @param {*} idKey pid的关联id字段，默认 id
   * @param {*} pidKey 父节点字段，默认 parent_id
   * @param {*} startWidth pid开始值，默认 -1
   * @param {*} labelKey 生成label字段，默认取 name
   */
  genTreeNodes(list, idKey = "id", pidKey = "parent_id", startWidth = "-1", labelKey = "name") {
    if (!list) {
      return [];
    }
    let result = list.reduce(function(prev, item) {
      let treeData = { id: item[idKey], data: item, label: item[labelKey] };
      prev[item[pidKey]] ? prev[item[pidKey]].push(treeData) : (prev[item[pidKey]] = [treeData]);
      return prev;
    }, {});
    for (let prop in result) {
      result[prop].forEach(function(item, i) {
        result[item.id] ? (item.children = result[item.id]) : "";
      });
    }
    return result[startWidth];
  },
  /**
   * 格式化日期
   * @param {*} date
   * @param {*} format
   */
  formatDate(date, format) {
    if (date) {
      return moment(date).format(format || "YYYY-MM-DD HH:mm:ss");
    } else {
      return null;
    }
  }
};
