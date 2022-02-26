import { Sequelize } from "sequelize";
import { sequelize } from "../utits/db.mjs";

const Errors = sequelize.define("error", {
  error: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
});

export { Errors };
