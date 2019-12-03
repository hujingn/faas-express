import { service, db, variables, Service } from "../../index";

@Service("projects")
class Projects {
  /**
   * 分页查询项目信息
   * @param {*} where
   * @param {*} limit
   * @param {*} offset
   */
  async queryPage(where, limit, offset) {
    let result = await db.projects.findAndCount({
      where,
      limit,
      offset
    });
    if (result.rows.length > 0) {
      let allTypes = await db.tool_types.findAll();
      let typeMap = allTypes.reduce((t, c) => {
        t[c.type] = c.label_configuration;
        return t;
      }, {});
      result.rows.forEach(item => {
        item.label_configuration = Object.assign({}, typeMap[item.tool_type], item.label_configuration);
      });
    }
    return Promise.resolve(result);
  }
  async test2() {
    console.log("test schedule2");
  }
}

service.define("projects2", {
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
            max_worker_count: label_configuration.max_worker_count || -1,
            staff_group_list: label_configuration.staff_group_list,
            max_staff_worker_count: label_configuration.max_staff_worker_count || -1
          },
          {
            where: { project_id: pid },
            transaction: t
          }
        )
      ]);
    });
  },
  async test() {
    console.log("test schedule");
  }
});
