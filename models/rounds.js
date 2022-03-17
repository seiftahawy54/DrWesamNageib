import Sequelize from "sequelize";
import { sequelize } from "../utits/db.js";
import { hashCreator } from "../utits/general_helper.js";
import { UUIDV4 } from "sequelize";

const Rounds = sequelize.define("rounds", {
  round_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  course_id: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: false,
    references: {
      model: "courses",
      key: "course_id",
    },
    onDelete: "cascade",
    onUpdate: "cascade",
  },
  users_ids: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    foreignKey: true,
    onUpdate: "cascade",
    onDelete: "cascade",
  },
  round_date: {
    type: Sequelize.DATE,
  },
  round_link: {
    type: Sequelize.TEXT,
  },
  finished: {
    type: Sequelize.BOOLEAN,
  },
});

export { Rounds };
