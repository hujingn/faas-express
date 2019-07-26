/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
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
      configuration: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      label_configuration: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      submitter: {
        type: DataTypes.STRING(64),
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
};
