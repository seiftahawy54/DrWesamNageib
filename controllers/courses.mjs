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

      console.log(findingCourseId);

      if (Array.isArray(findingCourseId) && findingCourseId.length > 0) {
        req.flash("error", "There's no course with this id!");
        return res.redirect(`/courses/${findingCourseId[0].courseId}`);
      } else {
        return res.redirect("/courses");
      }
      // console.log(findingCourseId[0].course_id);
    }

    let fetchingResult = await Courses.findAll();

    await downloadingCoursesImages(fetchingResult);

    return res.render("courses/index", {
      title: "Courses",
      path: "/courses",
      courses: sortCourses(fetchingResult),
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

const singleCourse = async (req, res, next) => {
  try {
    const course = await Courses.findByPk(req.params.courseId);
    const roundsResult = await Rounds.findAll({
      where: { course_id: course.course_id },
    });

    const numberOfCourses = await Courses.findAndCountAll();

    res.render("courses/single_course", {
      title: course.name,
      path: "/courses",
      course,
      numberOfCourses: numberOfCourses.count,
      rounds: roundsResult,
      moment,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

const addCourseToCart = async (req, res, next) => {
  try {
    const courseId = req.body.courseId;
    const roundId = req.body.selected_round;
    const errors = validationResult(req);

    let findingItemResult = false;

    if (!errors.isEmpty()) {
      // res.status(422).json({ message: "Please select a valid date!" });
      req.flash("error", "Please select a valid date!");
      res.redirect(`/courses/${courseId}`);
    } else {
      if (Array.isArray(req.user.cart)) {
        findingItemResult = courseExistsInCart(req.user.cart, courseId);
      } else {
        req.user.cart = [];
      }

      if (Array.isArray(req.user.cart) && findingItemResult) {
        req.flash(
          "error",
          `You've already chosen this course and added to your cart! proceed to <a href="/cart">Checkout</a> or <a href="/complete_payment">pay now</a>?`
        );
        res.redirect(`/courses/${courseId}`);
      } else if (Array.isArray(req.user.cart) && findingItemResult) {
        // res.status(422).json({
        //   message: ,
        // });

        req.flash(
          "error",
          `You've already chosen this course and added to your cart! proceed to <a href="/cart">Checkout</a> or <a href="/complete_payment">pay now</a>?`
        );
        res.redirect(`/courses/${courseId}`);
      } else {
        req.user.cart.push({ courseId: courseId, roundId: roundId });

        const addingResult = await Users.update(
          { cart: req.user.cart },
          { where: { user_id: req.user.user_id } }
        );

        if (Array.isArray(addingResult)) {
          // res.status(201).json({ message: "Item added successfully" });
          req.flash(
            "success",
            `Item add successfully, proceed to <a href="/cart">checkout</a> or continue <a href="/courses">Shopping</a>?`
          );
          res.redirect(`/courses/${courseId}`);
        } else {
          await errorRaiser(addingResult, next);
        }
      }
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export { getIndex, addCourseToCart, singleCourse };
