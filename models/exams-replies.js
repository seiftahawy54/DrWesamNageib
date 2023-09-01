import Sequelize from "sequelize";
import { sequelize } from "../utils/db.js";
import { UUIDV4 } from "sequelize";

const ExamsReplies = sequelize.define("exams_replies", {
  reply_id: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: UUIDV4,
  },
  exam_id: {
    type: Sequelize.STRING,
  },
  user_id: {
    type: Sequelize.STRING,
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
