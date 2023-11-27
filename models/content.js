import Sequelize from "sequelize";
import {sequelize} from "../utils/db.js";
import {UUIDV4} from "sequelize";

const Content = sequelize.define("content", {
    contentUrl: {
        type: Sequelize.STRING,
    },
    isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
});

export default Content;
