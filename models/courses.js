const db = require("../utits/db");

class Course {
  static getAllCourses() {
    return db
      .query("select * from courses;")
      .then((result) => {
        return result;
      })
      .catch((err) => err);
  }

  static getSingleCourse(courseId) {
    return db
      .query("SELECT * FROM courses WHERE course_id = $1;", [
        parseInt(courseId),
      ])
      .then((result) => result)
      .catch((err) => err);
  }
}

module.exports = Course;
