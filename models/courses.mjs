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

const updateSingleCourse = (
  courseName,
  coursePrice,
  courseId,
  courseImg,
  courseDescription
) => {
  if (courseImg) {
    return db
      .query(
        "UPDATE courses SET name=$1, price=$2, course_img=$3, description=$4 WHERE course_id=$5;",
        [
          courseName,
          parseFloat(coursePrice),
          courseImg,
          courseDescription,
          courseId,
        ]
      )
      .then((result) => result)
      .catch((err) => err);
  } else {
    return db
      .query(
        "UPDATE courses SET name=$1, price=$2, description=$3 WHERE course_id=$4;",
        [courseName, parseFloat(coursePrice), courseDescription, courseId]
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
