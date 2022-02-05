import Sequelize from "sequelize";
import { sequelize } from "../utits/db.mjs";
import { hashCreator } from "../utits/general_helper.mjs";

const Certificates = sequelize.define("about", {
  certificate_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: hashCreator(),
  },
  certificate_img: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

export { Certificates };
