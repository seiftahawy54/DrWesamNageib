import { Sequelize } from "sequelize";
import { sequelize } from "../utils/db.js";
import { hashCreator } from "../utils/general_helper.js";
import { UUIDV4 } from "sequelize";

const Logs = sequelize.define("message", {
  messageid: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  sendername: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  senderemail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  message: Sequelize.STRING,
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

export default Logs;
