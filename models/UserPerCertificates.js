import Sequelize from "sequelize";
import {sequelize} from "../utils/db.js";
import {UUIDV4} from "sequelize";

const UserPerCertificates = sequelize.define("UserPerCertificates", {
    id: {
        type: Sequelize.INTEGER,
    },
    certificateId: {
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

export default UserPerCertificates;
