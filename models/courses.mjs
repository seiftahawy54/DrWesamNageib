import db from "../utits/db.mjs";
import crypto from "crypto";

const addNewCourse = (courseName, coursePrice) => {
  const idHash = crypto.randomBytes(10);
  const id = idHash.toString("hex");
  return db
    .query("INSERT INTO courses VALUES ($1, $2, $3, current_timestamp);", [
      id,
      courseName,
      coursePrice,
    ])
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
    .query("select * from courses;")
    .then((result) => {
      return result;
    })
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

export {
  addNewCourse,
  getSingleCourse,
  getAllCourses,
  getNumberOfCourses,
  deleteCourse,
};
