import Sequelize from "sequelize";
import { sequelize } from "../utils/db.js";
import { UUIDV4 } from "sequelize";

const Exams = sequelize.define("exam", {
  exam_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  status: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  questions: {
    type: Sequelize.ARRAY(Sequelize.JSON),
    allowNull: false,
  },
  replies: {
    type: Sequelize.ARRAY(Sequelize.JSON),
  },
});

export default Exams;
