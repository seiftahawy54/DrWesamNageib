import {sequelize} from "../utils/db.js";
import Sequelize, {UUIDV4} from "sequelize";

const UserExamProgress = sequelize.define("userExamProgress", {
    examId: {
        type: Sequelize.STRING,
    },
    userId: {
        type: Sequelize.STRING,
        unique: false,
    },
    userAnswers: {
        type: Sequelize.ARRAY(Sequelize.JSON),
        allowNull: false,
    },
    submissionDate: {
        type: Sequelize.DATE,
        allowNull: false,
    },
});

export default UserExamProgress

