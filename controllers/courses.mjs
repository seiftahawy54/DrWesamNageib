import { getAllCourses, getSingleCourse } from "../models/courses.mjs";

const getIndex = (req, res, next) => {
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
};

const singleCourse = (req, res, next) => {
  getSingleCourse(req.params.courseId)
    .then((course) => {
      res.render("courses/single_course", {
        title: "Course Name",
        path: "/courses",
        course: course.rows[0],
        courseDescription:
          "The course is blended in nature that consists of 16 sessions: 10 live streaming sessions with complete prepare for the exam",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

const addCourseToCart = (req, res, next) => {
  const courseId = req.body.courseId;
  const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  res.cookie("courseId", `${courseId}`, {
    maxAge: expirationDate,
    httpOnly: true,
    path: "/",
  });
  res.redirect("/register");
};

export { getIndex, addCourseToCart, singleCourse };
