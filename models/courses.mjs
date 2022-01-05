import db from "../utits/db.mjs";

export function getAllCourses () {
  return db
    .query("select * from courses;")
    .then((result) => {
      return result;
    })
    .catch((err) => err);
}

export function getSingleCourse(courseId) {
  return db
    .query("SELECT * FROM courses WHERE course_id = $1;", [parseInt(courseId)])
    .then((result) => result)
    .catch((err) => err);
}
