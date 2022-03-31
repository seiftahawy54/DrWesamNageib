import Sequelize from "sequelize";
import { sequelize } from "../utils/db.js";
import { hashCreator } from "../utils/general_helper.js";
import { UUIDV4 } from "sequelize";

const Opinions = sequelize.define("opinions", {
  opinion_id: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
    defaultValue: UUIDV4,
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

export { Opinions };
