import Sequelize, { UUIDV4 } from "sequelize";
import { sequelize } from "../utits/db.js";
import { hashCreator } from "../utits/general_helper.js";

const Certificates = sequelize.define("about", {
  certificate_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  certificate_img: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

export { Certificates };
