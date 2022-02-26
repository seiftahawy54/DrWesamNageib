// import { getAllCourses, getSingleCourse } from "../models/courses.mjs";
import { errorRaiser } from "../utits/error_raiser.mjs";
import {
  downloadingCoursesImages,
  extractError,
  sortCourses,
} from "../utits/general_helper.mjs";
import { Courses } from "../models/courses.mjs";
import { Users } from "../models/users.mjs";
import { Rounds } from "../models/rounds.mjs";
import moment from "moment";
import { validationResult } from "express-validator";
import { cartIsEmpty, courseExistsInCart } from "../utits/cart_helpers.mjs";

const getIndex = async (req, res, next) => {
  try {
    let courseRank = parseInt(req.query.rank);

    if (
      !isNaN(courseRank) &&
      courseRank !== 0 &&
      typeof courseRank === "number"
    ) {
      const findingCourseId = await Courses.findAll({
        attributes: ["course_id"],
        where: { course_rank: courseRank },
      });

      // console.log(findingCourseId[0].course_id);
      return res.redirect(`/courses/${findingCourseId[0].courseId}`);
    }

    let fetchingResult = await Courses.findAll();

    await downloadingCoursesImages(fetchingResult);

    return res.render("courses/index", {
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
    const roundsResult = await Rounds.findAll({
      where: { course_id: course.course_id },
    });

    const numberOfCourses = await Courses.findAndCountAll();

    const nextCourse = await Courses.findAll({
      where: { course_rank: course.course_rank + 1 },
    });

    const prevCourse = await Courses.findAll({
      where: { course_rank: course.course_rank - 1 },
    });

    res.render("courses/single_course", {
      title: course.name,
      path: "/courses",
      course,
      numberOfCourses: numberOfCourses.count,
      rounds: roundsResult,
      moment,
    });
  } catch (e) {
    errorRaiser(e, next);
  }
};

const addCourseToCart = async (req, res, next) => {
  try {
    const courseId = req.body.courseId;
    const roundId = req.body.selected_round;
    // const cart = getArray(req.user.cart);
    // const course = await Courses.findByPk(courseId);
    const errors = validationResult(req);

    let findingItemResult = false;

    if (!errors.isEmpty()) {
      req.flash("error", "Please select a valid date!");
      res.redirect(`/courses/${courseId}`);
    } else {
      if (Array.isArray(req.user.cart)) {
        findingItemResult = courseExistsInCart(req.user.cart, courseId);
        // findingItemResult.push(
        //   req.user.cart.find((cartItem) => {
        //     return cartItem.courseId.localeCompare(courseId) === 0;
        //   })
        // );
      } else {
        req.user.cart = [];
      }

      if (Array.isArray(req.user.cart) && findingItemResult) {
        req.flash(
          "error",
          `You've already chosen this course and added to your cart! proceed to <a href='/cart'>checkout</a>?`
        );
        res.redirect(`/courses/${courseId}`);
      } else if (Array.isArray(req.user.cart) && findingItemResult) {
        req.flash(
          "error",
          `You've already chosen this course and added to your cart! proceed to <a href='/cart'>checkout</a>?`
        );
      } else {
        // if (cartIsEmpty(req.user.cart)) {
        //   req.user.cart = [
        //     req.user.cart,
        //     { courseId: courseId, roundId: roundId },
        //   ];
        // } else {
        //   req.user.cart = [
        //     ...req.user.cart,
        //     { courseId: courseId, roundId: roundId },
        //   ];
        // }

        req.user.cart.push({ courseId: courseId, roundId: roundId });

        const addingResult = await Users.update(
          { cart: req.user.cart },
          { where: { user_id: req.user.user_id } }
        );

        if (Array.isArray(addingResult)) {
          res.redirect("/cart");
        } else {
          errorRaiser(addingResult, next);
        }
      }
    }
  } catch (e) {
    errorRaiser(e, next);
  }
};

export { getIndex, addCourseToCart, singleCourse };
