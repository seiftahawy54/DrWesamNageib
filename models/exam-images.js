import { Sequelize } from "sequelize";
import { sequelize } from "../utils/db.js";
import { hashCreator } from "../utils/general_helper.js";
import { UUIDV4 } from "sequelize";

const ExamImages = sequelize.define("exam_images", {
  exam_image_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  image_path: {
    type: Sequelize.STRING,
    allowNull: false,
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

export default ExamImages;
