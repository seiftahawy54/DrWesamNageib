import Sequelize from "sequelize";
import { sequelize } from "../utits/db.mjs";
import { hashCreator } from "../utits/general_helper.mjs";

const Users = sequelize.define("user", {
  user_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: hashCreator(),
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  created_on: {
    type: Sequelize.DATE,
    defaultValue: sequelize.literal("current_timestamp"),
    allowNull: false,
  },
  whatsapp_no: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  specialization: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  payment_details: {
    type: Sequelize.JSON,
  },
  password: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  cart: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  type: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  user_img: {
    type: Sequelize.STRING,
  },
});

export { Users };
