import { getAllCourses, getSingleCourse } from "../models/courses.mjs";

export function getIndex (req, res, next) {
  getAllCourses()
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
}

export function singleCourse (req, res, next) {
  getSingleCourse(req.params.courseId)
    .then((course) => {
      res.render("courses/single_course", {
        title: "Course Name",
        path: "/courses",
        course: course.rows[0],
        courseDescription:
          "The course is blended in nature that consists of 16 sessions: 10 live streaming sessions and 6",
      });
    })
    .catch((err) => {
      console.log(err);
    });
}
