import Sequelize from "sequelize";
import {sequelize} from "../utils/db.js";
import {UUIDV4} from "sequelize";

const UserPerFinishedRound = sequelize.define("UserPerFinishedRound", {
    seederName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    }
});

export default UserPerFinishedRound;
