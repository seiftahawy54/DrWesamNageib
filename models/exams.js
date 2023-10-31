import Sequelize from "sequelize";
import {sequelize} from "../utils/db.js";
import {UUIDV4} from "sequelize";

const examsSchema = {
    exam_id: {
        type: Sequelize.STRING,
        allowNull: false,
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
    isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    presentation: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
};

const Exams = sequelize.define("exam", examsSchema);
const DeletedExams = sequelize.define('deleted-exam', examsSchema)

export {Exams, DeletedExams};
export default Exams;
