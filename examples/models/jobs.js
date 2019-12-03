/* jshint indent: 1 */
import { db, DB } from "../../index";
var { sequelize, Sequelize, Model, Op, DataTypes } = db;

db.define(
  "jobs",
  {
    id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    project_id: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    labeler_id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      defaultValue: "-1"
    },
    name: {
      type: Sequelize.STRING(128),
      allowNull: false
    },
    status: {
      type: Sequelize.INTEGER(4),
      allowNull: true,
      defaultValue: "0"
    },
    label_time: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    assigned_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    submitted_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "jobs",
    createdAt: "created_at",
    updatedAt: "updated_at",
    timestamps: true,
    underscored: true,
    getterMethods: {
      configuration() {
        return JSON.parse(this.getDataValue("configuration"));
      },
      label_configuration() {
        return JSON.parse(this.getDataValue("label_configuration"));
      }
    },
    setterMethods: {
      configuration(val) {
        this.setDataValue("configuration", JSON.stringify(val));
      },
      label_configuration(val) {
        this.setDataValue("label_configuration", JSON.stringify(val));
      }
    }
  }
);

db.associate(models => {
  models.jobs.belongsTo(models.projects, { foreignKey: "project_id", as: "project" });
});
