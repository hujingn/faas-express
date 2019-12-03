/* jshint indent: 1 */
import { db, DB } from "../../index";
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
    tool_type: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    configuration: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    label_configuration: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    front_status: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: "0"
    },
    export_status: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: "0"
    },
    submitter: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    data_path: {
      type: DataTypes.STRING(1024),
      allowNull: true
    },
    customer: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    store: {
      type: DataTypes.STRING(64),
      allowNull: false
    }
  };
  options = {
    tableName: "projects",
    createdAt: "created_at",
    updatedAt: "updated_at",
    timestamps: true,
    underscored: true,
    getterMethods: {
      configuration() {
        let json = this.getDataValue("configuration");
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
      label_configuration() {
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
      }
    },
    setterMethods: {
      configuration(val) {
        try {
          this.setDataValue("configuration", JSON.stringify(val));
        } catch (e) {
          this.setDataValue("configuration", val);
        }
      },
      label_configuration(val) {
        try {
          this.setDataValue("label_configuration", JSON.stringify(val));
        } catch (e) {
          this.setDataValue("label_configuration", val);
        }
      }
    }
  };
  associate(models) {
    models.projects.hasMany(models.jobs, { foreignKey: "project_id", as: "jobs" });
  }
}
