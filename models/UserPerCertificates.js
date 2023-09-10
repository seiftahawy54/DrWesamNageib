import Sequelize from "sequelize";
import {sequelize} from "../utils/db.js";
import {UUIDV4} from "sequelize";

const UserPerCertificates = sequelize.define("UserPerCertificates", {
    certificateId: {
        type: Sequelize.STRING,
        allowNull: false,
        foreignKey: true,
        defaultValue: UUIDV4,
    },
    userId: {
        type: Sequelize.STRING,
        foreignKey: true,
    },
});

export default UserPerCertificates;
