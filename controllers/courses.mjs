import { getAllCourses, getSingleCourse } from "../models/courses.mjs";
import { errorRaiser } from "../utits/error_raiser.mjs";
import { sortCourses } from "../utits/general_helper.mjs";

const getIndex = async (req, res, next) => {
  try {
    const fetchingResult = await getAllCourses();
    res.render("courses/index", {
      title: "Courses",
      path: "/courses",
      courses: sortCourses(fetchingResult.rows),
    });
  } catch (e) {
    errorRaiser(e, next);
  }
};

const singleCourse = (req, res, next) => {
  getSingleCourse(req.params.courseId)
    .then((course) => {
      console.log(course.rows[0]);
      res.render("courses/single_course", {
        title: "Course Name",
        path: "/courses",
        course: course.rows[0],
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
