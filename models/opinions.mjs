import Sequelize from "sequelize";
import { sequelize } from "../utits/db.mjs";

const Opinions = sequelize.define("opinions", {
  opinion_id: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  sender_name: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  sender_course: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  sender_message: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  created_on: {
    type: Sequelize.DATE,
    allowNull: true,
  },
});

export { Opinions };
