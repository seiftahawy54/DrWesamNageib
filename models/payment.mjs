import Sequelize from "sequelize";
import { sequelize } from "../utits/db.mjs";
import { hashCreator } from "../utits/general_helper.mjs";

const Payment = sequelize.define("payments", {
  payment_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: hashCreator(),
  },
  course_id: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    allowNull: false,
    foreignKey: true,
    references: {
      model: "courses",
      key: "course_id",
    },
    onDelete: "cascade",
    onUpdate: "cascade",
  },
  user_id: {
    type: Sequelize.STRING,
    allowNull: false,
    foreignKey: true,
    references: {
      model: "users",
      key: "user_id",
    },
    onDelete: "cascade",
    onUpdate: "cascade",
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  details: {
    type: Sequelize.JSON,
    allowNull: false,
  },
});

export { Payment };
