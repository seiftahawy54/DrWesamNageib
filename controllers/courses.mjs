// import { getAllCourses, getSingleCourse } from "../models/courses.mjs";
import { errorRaiser } from "../utits/error_raiser.mjs";
import {
  downloadingCoursesImages,
  extractError,
  sortCourses,
} from "../utits/general_helper.mjs";
import { Courses } from "../models/courses.mjs";
import { Users } from "../models/users.mjs";
import { getArray, getPgArray, updateCart } from "../utits/cart_helpers.mjs";
import { getSingleFile } from "../utits/aws.mjs";

const getIndex = async (req, res, next) => {
  try {
    let fetchingResult = await Courses.findAll();

    await downloadingCoursesImages(fetchingResult);

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

    let message = req.flash("error")[0];
    console.log(`custom error message`, message);
    if (!(typeof message === "string")) {
      message = null;
    }

    res.render("courses/single_course", {
      title: course.name,
      path: "/courses",
      course,
      errorMessage: message,
    });
  } catch (e) {
    errorRaiser(e, next);
  }
};

const addCourseToCart = async (req, res, next) => {
  try {
    const courseId = req.body.courseId;
    // const cart = getArray(req.user.cart);
    const course = await Courses.findByPk(courseId);

    if (
      req.user.cart.length !== 0 &&
      req.user.cart.localeCompare(courseId) === 0
    ) {
      return res.render("courses/single_course", {
        title: course.name,
        path: "/courses",
        course,
        errorMessage: `You've already chosen this course and added to your cart! proceed to <a href='/cart'>checkout</a>?`,
      });
    } else if (
      req.user.cart.length === 0 &&
      req.user.cart.localeCompare(courseId) === 0
    ) {
      return res.render("courses/single_course", {
        title: course.name,
        path: "/courses",
        course,
        errorMessage: `You've already have item in your card! proceed to <a href='/cart'>checkout</a>?`,
      });
    } else {
      req.user.cart = courseId;
      const addingResult = await Users.update(
        { cart: req.user.cart },
        { where: { user_id: req.user.user_id } }
      );

      if (addingResult[0] === 1) {
        res.redirect("/cart");
      } else {
        errorRaiser(addingResult, next);
      }
    }

    // if (cart.find((id) => id === courseId)) {
    //   return res.render("courses/single_course", {
    //     title: course.name,
    //     path: "/courses",
    //     course,
    //     errorMessage: `You've already chosen this course and added to your cart! proceed to <a href='/cart'>checkout</a>?`,
    //   });
    // } else {
    //   cart.push(courseId);
    //   console.log(cart);
    //   const pgArr = getPgArray(cart);
    //   console.log(pgArr);
    //   const addingResult = await Users.update(
    //     { cart: pgArr },
    //     { where: { user_id: req.user.user_id } }
    //   );
    //
    //   if (addingResult[0] === 1) {
    //     res.redirect("/cart");
    //   }
    // }
  } catch (e) {
    errorRaiser(e, next);
  }
};

export { getIndex, addCourseToCart, singleCourse };
