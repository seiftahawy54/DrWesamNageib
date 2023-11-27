import Sequelize from "sequelize";
import { sequelize } from "../utils/db.js";
import { hashCreator } from "../utils/general_helper.js";
import { UUIDV4 } from "sequelize";

const UserPerRound = sequelize.define("userPerRound", {
    roundId: {
        type: Sequelize.STRING,
        allowNull: false,
        foreignKey: true,
        defaultValue: UUIDV4,
    },
    userId: {
        type: Sequelize.STRING,
        foreignKey: true,
    },
    specialAccess: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
});

export default UserPerRound;
