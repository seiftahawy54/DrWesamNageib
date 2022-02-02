import Sequelize from "sequelize";
import { sequelize } from "../utits/db.mjs";

const Certificates = sequelize.define("about", {
  certificate_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  certificate_img: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

export { Certificates };
