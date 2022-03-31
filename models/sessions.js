import Sequelize from "sequelize";
import { sequelize } from "../utils/db.js";
import { hashCreator } from "../utils/general_helper.js";

const Sessions = sequelize.define(
  "Sessions",
  {
    sid: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    expires: {
      type: String.DATE,
    },
    data: {
      type: String.TEXT,
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

export { Sessions };
