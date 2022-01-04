const Courses = require("../models/courses");

exports.getIndex = (req, res, next) => {
  Courses.getAllCourses()
    .then((result) => {
      res.render("courses/index", {
        title: "Courses",
        path: "/courses",
        courses: result.rows,
      });
    })
    .catch((errs) => {
      console.log(errs);
    });
};

exports.singleCourse = (req, res, next) => {
  Courses.getSingleCourse(req.params.courseId)
    .then((course) => {
      // res.send(course);
      res.render("courses/single_course", {
        title: "Course Name",
        path: "/courses",
        course: course.rows[0],
        courseDescription:
          "The course is blended in nature that consists of 16 sessions: 10 live streaming sessions and 6",
      });
    })
    .catch((err) => {
      console.log(error);
    });
  /**/
};
