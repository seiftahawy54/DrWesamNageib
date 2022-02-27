import Sequelize from "sequelize";
import { sequelize } from "../utits/db.mjs";
import { hashCreator } from "../utits/general_helper.mjs";
import { UUIDV4 } from "sequelize";

const Users = sequelize.define("user", {
  user_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,
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
    type: Sequelize.ARRAY(Sequelize.JSON),
    allowNull: true,
  },
  type: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  user_img: {
    type: Sequelize.STRING,
  },
  current_round: {
    type: Sequelize.STRING,
  },
});

export { Users };
