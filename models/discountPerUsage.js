import Sequelize from "sequelize";
import {sequelize} from "../utils/db.js";

const Discounts = sequelize.define("discount", {
    userId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    discountId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

export default Discounts;
