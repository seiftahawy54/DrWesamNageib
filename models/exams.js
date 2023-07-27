import Sequelize from "sequelize";
import { sequelize } from "../utils/db.js";
import { UUIDV4 } from "sequelize";

const Exams = sequelize.define("exam", {
  id: {
    type: Sequelize.INTEGER,
  },
  exam_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  title: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  questions: {
    type: Sequelize.ARRAY(Sequelize.JSON),
    allowNull: false,
  },
  special_exam: {
    type: Sequelize.BOOLEAN,
  },
  course_id: {
    type: Sequelize.STRING,
    allowNull: true,
    foreignKey: true,
    defaultValue: UUIDV4,
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
});

export default Exams;
