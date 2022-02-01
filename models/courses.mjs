import Sequelize from "sequelize";
import { sequelize } from "../utits/db.mjs";
import { hashCreator } from "../utits/general_helper.mjs";

const Courses = sequelize.define("course", {
  course_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    defaultValue: hashCreator(),
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: sequelize.literal("current_timestamp"),
  },
  course_img: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  ar_course_name: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  course_thumbnail: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  course_rank: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

export { Courses };

/*
import db from "../utits/db.mjs";
import crypto from "crypto";

const addNewCourse = (
  courseName,
  coursePrice,
  courseImg,
  courseDescription
) => {
  const idHash = crypto.randomBytes(10);
  const id = idHash.toString("hex");
  return db
    .query(
      "INSERT INTO courses VALUES ($1, $2, $3, current_timestamp, $4, $5);",
      [id, courseName, coursePrice, courseImg, courseDescription]
    )
    .then((result) => {
      return result;
    })
    .catch((err) => err);
};

const deleteCourse = (courseId) => {
  return db
    .query("DELETE FROM courses WHERE course_id=$1", [courseId])
    .then((res) => res)
    .catch((err) => err);
};

const getAllCourses = () => {
  return db
    .query("SELECT * FROM courses;")
    .then((result) => result)
    .catch((err) => err);
};

const getSingleCourse = (courseId) => {
  return db
    .query("SELECT * FROM courses WHERE course_id=$1;", [courseId.toString()])
    .then((result) => result)
    .catch((err) => err);
};

const getNumberOfCourses = () => {
  return db
    .query("SELECT count(*) FROM courses;")
    .then((result) => result)
    .catch((err) => err);
};

const updateSingleCourse = (
  courseName,
  coursePrice,
  courseId,
  courseImg,
  courseDescription,
  courseArName,
  courseThumbnail,
  courseRank
) => {
  if (courseImg) {
    return db
      .query(
        "UPDATE courses SET name=$1, price=$2, course_img=$3, description=$4, ar_course_name=$5, course_thumbnail=$6, course_rank=$7 WHERE course_id=$8;",
        [
          courseName,
          parseFloat(coursePrice),
          courseImg,
          courseDescription,
          courseArName,
          courseThumbnail,
          parseInt(courseRank),
          courseId,
        ]
      )
      .then((result) => result)
      .catch((err) => err);
  } else {
    return db
      .query(
        "UPDATE courses SET name=$1, price=$2, description=$3, ar_course_name=$4, course_thumbnail=$5, course_rank=$6 WHERE course_id=$7;",
        [
          courseName,
          parseFloat(coursePrice),
          courseDescription,
          courseArName,
          courseThumbnail,
          parseInt(courseRank),
          courseId,
        ]
      )
      .then((result) => result)
      .catch((err) => err);
  }
};

export {
  updateSingleCourse,
  addNewCourse,
  getSingleCourse,
  getAllCourses,
  getNumberOfCourses,
  deleteCourse,
};
*/
