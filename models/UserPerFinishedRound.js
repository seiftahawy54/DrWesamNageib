import Sequelize from "sequelize";
import {sequelize} from "../utils/db.js";
import {UUIDV4} from "sequelize";

const UserPerFinishedRound = sequelize.define("UserPerFinishedRound", {
    roundId: {
        type: Sequelize.STRING,
        allowNull: false,
        foreignKey: true,
        defaultValue: UUIDV4,
        onUpdate: "cascade",
        onDelete: "cascade",
    },
    userId: {
        type: Sequelize.STRING,
        foreignKey: true,
        onUpdate: "cascade",
        onDelete: "cascade",
    },
});

export default UserPerFinishedRound;
