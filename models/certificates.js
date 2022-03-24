import Sequelize from "sequelize";
import { sequelize } from "../utils/db.js";
import { hashCreator } from "../utils/general_helper.js";
import { UUIDV4 } from "sequelize";

const Certificates = sequelize.define("certificates", {
  cert_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  user_id: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  course_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: sequelize.literal("current_timestamp"),
    allowNull: false,
  },
});

export default Certificates;
