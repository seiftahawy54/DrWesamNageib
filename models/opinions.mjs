import Sequelize from "sequelize";
import { sequelize } from "../utits/db.mjs";
import { hashCreator } from "../utits/general_helper.mjs";

const Opinions = sequelize.define("opinions", {
  opinion_id: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
    defaultValue: hashCreator(),
  },
  sender_email: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true,
  },
  sender_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  sender_course: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  sender_message: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  created_on: {
    type: Sequelize.DATE,
    allowNull: true,
    defaultValue: sequelize.literal("current_timestamp"),
  },
});

export { Opinions };
