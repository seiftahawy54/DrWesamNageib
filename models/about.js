// import Sequelize, { UUIDV4 } from "sequelize";
// import { sequelize } from "../utils/db.js";
// import { hashCreator } from "../utils/general_helper.js";
//
// export default sequelize.define("about", {
//   instructor_id: {
//     type: Sequelize.STRING,
//     allowNull: false,
//     primaryKey: true,
//     defaultValue: UUIDV4,
//   },
//   instructor_name: {
//     type: Sequelize.STRING,
//   },
//   instructor_data: {
//     type: Sequelize.TEXT,
//   },
//   instructor_image: {
//     type: Sequelize.STRING,
//   },
//   instructor_certificates: {
//     type: Sequelize.ARRAY(Sequelize.TEXT),
//   },
//   about_us_paragraph: {
//     type: Sequelize.TEXT,
//   },
//   createdAt: {
//     type: Sequelize.DATE,
//     defaultValue: new Date(),
//     allowNull: true,
//   },
//   updatedAt: {
//     type: Sequelize.DATE,
//     defaultValue: new Date(),
//     allowNull: true,
//   },
// });
