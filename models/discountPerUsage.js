import Sequelize from "sequelize";
import {sequelize} from "../utils/db.js";

const Discounts = sequelize.define("discountPerUsage", {
    userId: {
        type: Sequelize.STRING,
        foreignKey: true,
        allowNull: false,
    },
    discountId: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        allowNull: false,
    },
    isUsed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    isApplied: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
});

export default Discounts;
