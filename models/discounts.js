import Sequelize from "sequelize";
import { sequelize } from "../utils/db.js";
import { UUIDV4 } from "sequelize";

const Discounts = sequelize.define("discount", {
  discount_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  status: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  discount_course: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  discount_percentage: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  discount_usage: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  coupon_name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
    allowNull: true,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
    allowNull: true,
  },
  isDeleted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

export default Discounts;
