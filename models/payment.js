import Sequelize from "sequelize";
import {sequelize} from "../utils/db.js";
import {UUIDV4} from "sequelize";

const Payment = sequelize.define("payments", {
    payment_id: {
        type: Sequelize.STRING,
        defaultValue: UUIDV4,
    },
    course_id: {
        type: Sequelize.STRING,
    },
    round_id: {
        type: Sequelize.STRING,
    },
    user_id: {
        type: Sequelize.STRING,
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    details: {
        type: Sequelize.JSON,
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

export default Payment;
