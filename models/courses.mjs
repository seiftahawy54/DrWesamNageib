import db from "../utits/db.mjs";

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

export { getSingleCourse, getAllCourses, getNumberOfCourses };
