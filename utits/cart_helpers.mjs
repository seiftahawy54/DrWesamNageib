import { Users } from "../models/users.mjs";
import { errorRaiser } from "./error_raiser.mjs";
import { Courses } from "../models/courses.mjs";

export const createEmptyCart = () => {};

export const updateCart = async (courseId, req, newCart, next) => {
  try {
    req.user.cart = JSON.stringify(newCart);
    const updatingResult = await Users.update(
      { cart: req.user.cart },
      { where: { user_id: req.user.user_id } }
    );

    return updatingResult[0] === 1;
  } catch (e) {
    errorRaiser(e, next);
  }
};

export const getCoursesFormCart = async (req) => {
  const coursesJSON = JSON.parse(req.user.cart);
  const boughtCoursesPromises = await coursesJSON.map(async (course) => {
    return await Courses.findByPk(course.item);
  });

  const boughtCourses = [];

  for (const key of boughtCoursesPromises) {
    boughtCourses.push(await key);
  }

  return boughtCourses;
};

export const calcTotalFromCart = async (cart, req) => {
  const courses = await getCoursesFormCart(req);

  let fullPrice = 0;

  for (const course of courses) {
    fullPrice += parseFloat(course.price);
  }

  return fullPrice;
};

export const extractCart = (req) => {
  return JSON.parse(req.user.cart);
};
