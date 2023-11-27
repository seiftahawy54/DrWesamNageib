import Sequelize from "sequelize";
import {sequelize} from "../utils/db.js";

const Discounts = sequelize.define("discount", {
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    percentage: {
        type: Sequelize.DOUBLE,
        allowNull: false,
    },
    discountCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

export default Discounts;
