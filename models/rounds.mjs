import Sequelize from "sequelize";
import { sequelize } from "../utits/db.mjs";
import { hashCreator } from "../utits/general_helper.mjs";

const Rounds = sequelize.define("rounds", {
  round_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: hashCreator(),
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
  },
  round_date: {
    type: Sequelize.DATE,
  },
  round_link: {
    type: Sequelize.TEXT,
  },
});

export { Rounds };
