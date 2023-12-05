import Sequelize from "sequelize";
import {sequelize} from "../utils/db.js";
import {UUIDV4} from "sequelize";

const ContentAccessList = sequelize.define("contentAccessList", {
    contentId: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        allowNull: false,
    },
    userId: {
        type: Sequelize.STRING,
        foreignKey: true,
        allowNull: false,
    },
    isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
});

export default ContentAccessList;
