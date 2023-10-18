import Sequelize from "sequelize";
import { sequelize } from "../utils/db.js";
import { hashCreator } from "../utils/general_helper.js";
import { UUIDV4 } from "sequelize";

const Rounds = sequelize.define("rounds", {
  round_id: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: UUIDV4,
  },
  course_id: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: false,
    onDelete: "cascade",
    onUpdate: "cascade",
  },
  round_date: {
    type: Sequelize.DATE,
  },
  round_link: {
    type: Sequelize.TEXT,
  },
  finished: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  archived: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
    allowNull: false,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
    allowNull: false,
  },
  isDeleted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  }
});

export default Rounds;
