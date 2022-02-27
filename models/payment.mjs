import Sequelize from "sequelize";
import { sequelize } from "../utits/db.mjs";
import { hashCreator } from "../utits/general_helper.mjs";
import { UUIDV4 } from "sequelize";

const Payment = sequelize.define("payments", {
  payment_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  course_id: {
    type: Sequelize.STRING,
  },
  round_id: {
    type: Sequelize.STRING,
  },
  user_id: {
    type: Sequelize.STRING,
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
