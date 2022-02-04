// import { getAllCourses, getSingleCourse } from "../models/courses.mjs";
import { errorRaiser } from "../utits/error_raiser.mjs";
import { sortCourses } from "../utits/general_helper.mjs";
import { Courses } from "../models/courses.mjs";

const getIndex = async (req, res, next) => {
  try {
    const fetchingResult = await Courses.findAll();
    res.render("courses/index", {
      title: "Courses",
      path: "/courses",
      courses: sortCourses(fetchingResult),
    });
  } catch (e) {
    errorRaiser(e, next);
  }
};

const singleCourse = async (req, res, next) => {
  try {
    const course = await Courses.findByPk(req.params.courseId);

    res.render("courses/single_course", {
      title: "Course Name",
      path: "/courses",
      course,
    });
  } catch (e) {
    errorRaiser(e, next);
  }
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
