// import { getAllCourses, getSingleCourse } from "../models/courses.js";
import { errorRaiser } from "../utils/error_raiser.js";
import {
  downloadingCoursesImages,
  extractError,
  sortCourses,
} from "../utils/general_helper.js";
import { Courses } from "../models/index.js";
import { Users } from "../models/index.js";
import { Rounds } from "../models/index.js";
import moment from "moment";
import { validationResult } from "express-validator";
import { cartIsEmpty, courseExistsInCart } from "../utils/cart_helpers.js";
import { sequelize } from "../utils/db.js";

const getIndex = async (req, res, next) => {
  try {
    const courses = await sequelize.query(
      "SELECT * FROM courses ORDER BY course_rank ASC",
      {
        type: "SELECT",
      }
    );

    // await downloadingCoursesImages(fetchingResult);

    return res.render("courses/index", {
      title: "Courses",
      path: "/courses",
      courses,
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

    const filteredRounds = roundsResult.filter((round) => !round.finished);

    return res.status(200).json({
      course,
      numberOfCourses: numberOfCourses.count,
      rounds: filteredRounds,
    })
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getAllCoursesData = async (req, res, next) => {
  try {
    const courses = await Courses.findAll();
    await downloadingCoursesImages(courses);
    return res.status(200).json({
      courses,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getCoursesCategories = async (req, res, next) => {
  try {
    let coursesCategories = await Courses.findAll({
      attributes: ["course_category"],
    });

    coursesCategories = coursesCategories.map(
      ({ course_category }) => course_category
    );
    coursesCategories = [...new Set(coursesCategories)];
    
    return res.status(200).json({
      coursesCategories,
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
        return res.redirect(`/courses/${courseId}`);
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
          return res.redirect(`/courses/${courseId}`);
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
