import Sequelize from "sequelize";
import {sequelize} from "../utils/db.js";
import {UUIDV4} from "sequelize";

const ContentAccessList = sequelize.define("contentAccessList", {
    contentId: {
        type: Sequelize.STRING,
        foreignKey: true,
        defaultValue: UUIDV4,
        allowNull: false,
    },
    userId: {
        type: Sequelize.STRING,
        defaultValue: UUIDV4,
        foreignKey: true,
        allowNull: false,
    },
    isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
});

export default ContentAccessList;
