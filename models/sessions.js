import Sequelize from "sequelize";
import { sequelize } from "../utits/db.js";
import { hashCreator } from "../utits/general_helper.js";

const Courses = sequelize.define(
  "sessions",
  {
    sid: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    expires: {
      type: DataTypes.DATE,
    },
    data: {
      type: DataTypes.TEXT,
    },
  },
  {
    indexes: [
      {
        name: "expires_index",
        method: "BTREE",
        fields: ["expires"],
      },
      {
        name: "createdAt_index",
        method: "BTREE",
        fields: ["createdAt"],
      },
      {
        name: "updatedAt_index",
        method: "BTREE",
        fields: ["updatedAt"],
      },
    ],
  }
);

export { Courses };
