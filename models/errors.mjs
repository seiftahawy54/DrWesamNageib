import { Sequelize } from "sequelize";
import { sequelize } from "../utits/db.mjs";
import { hashCreator } from "../utits/general_helper.mjs";

const Errors = sequelize.define("error", {
  error_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: hashCreator(),
  },
  error: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
});

export { Errors };
