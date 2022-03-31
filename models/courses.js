import Sequelize from "sequelize";
import { sequelize } from "../utils/db.js";
import { UUIDV4 } from "sequelize";

const Courses = sequelize.define("course", {
  course_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: sequelize.literal("current_timestamp"),
  },
  course_img: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  detailed_img: {
    type: Sequelize.TEXT,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  ar_course_name: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  course_thumbnail: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  course_rank: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
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
});

export { Courses };
