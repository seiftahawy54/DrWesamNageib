import Sequelize from "sequelize";
import { sequelize } from "../utils/db.js";
import { UUIDV4 } from "sequelize";

const ExamsCourses = sequelize.define("examsCourses", {
    exam_id: {
        type: Sequelize.STRING,
        foreignKey: true,
        onUpdate: "cascade",
        onDelete: "cascade",
        allowNull: false,
    },
    course_id: {
        type: Sequelize.STRING,
        allowNull: false,
        foreignKey: true,
        onUpdate: "cascade",
        onDelete: "cascade",
    },
});

export default ExamsCourses;
