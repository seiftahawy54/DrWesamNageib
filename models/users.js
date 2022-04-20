import Sequelize from "sequelize";
import { sequelize } from "../utils/db.js";
import { hashCreator } from "../utils/general_helper.js";
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
  finished_course: {
    type: Sequelize.STRING,
  },
  certificate_id: {
    type: Sequelize.STRING,
  },
  applied_coupon: {
    type: Sequelize.STRING,
  },
  performed_exams: {
    type: Sequelize.ARRAY(Sequelize.STRING),
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
    allowNull: true,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
    allowNull: true,
  },
});

export default Users;
