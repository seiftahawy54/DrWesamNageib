import { Sequelize } from "sequelize";
import { sequelize } from "../utits/db.js";
import { hashCreator } from "../utits/general_helper.js";
import { UUIDV4 } from "sequelize";

const Errors = sequelize.define("error", {
  error_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  error: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
});

export { Errors };
