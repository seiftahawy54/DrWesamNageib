import Sequelize from "sequelize";
import {sequelize} from "../utils/db.js";

const Opinions = sequelize.define("opinions", {
    sender_email: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    sender_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    sender_course: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    sender_message: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    sender_whatsapp: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

export default Opinions;
