import Sequelize from "sequelize";
import {sequelize} from "../utils/db.js";
import {UUIDV4} from "sequelize";

const UserPerCertificates = sequelize.define("UserPerCertificates", {
    certificateHash: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    courseId: {
        type: Sequelize.STRING,
        foreignKey: true,
    },
    userId: {
        type: Sequelize.STRING,
        foreignKey: true,
    },
});

export default UserPerCertificates;
