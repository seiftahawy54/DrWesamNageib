import Sequelize from "sequelize";
import { sequelize } from "../utils/db.js";
import { UUIDV4 } from "sequelize";

const ExamsReplies = sequelize.define("exams_replies", {
  reply_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,

  },
  exam_id: {
    type: Sequelize.STRING,
    allowNull: false,
    foreignKey: true,
    onUpdate: "cascade",
    onDelete: "cascade",
    references: {
      model: "exams",
      key: "exam_id",
    },
  },
  user_id: {
    type: Sequelize.STRING,
    allowNull: false,
    foreignKey: true,
    onUpdate: "cascade",
    onDelete: "cascade",
    references: {
      model: "users",
      key: "user_id",
    },
  },
  grade: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  user_answers: {
    type: Sequelize.ARRAY(Sequelize.JSON),
    allowNull: false,
  },
});

export default ExamsReplies;
