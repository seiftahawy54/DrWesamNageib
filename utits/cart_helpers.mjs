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

export const getCoursesFormCart = async (cart) => {
  const boughtCoursesPromises = await cart.map(async (course) => {
    return await Courses.findByPk(course);
  });

  const boughtCourses = [];

  for (const key of boughtCoursesPromises) {
    boughtCourses.push(await key);
  }
  return boughtCourses;
};

export const calcTotalFromCart = async (cart) => {
  const courses = await getCoursesFormCart(cart);

  let fullPrice = 0;

  for (const course of courses) {
    fullPrice += parseFloat(course.price);
  }

  return fullPrice;
};

export const extractCart = (req) => {
  return JSON.parse(req.user.cart);
};

export const convertCartToArr = (cart) => {
  return cart.map(({ item }) => {
    return item;
  });
};

export const getArray = (cart) => {
  if (cart === "{}") {
    return [];
  } else {
    return cart.match(/[\w.-]+/g).map(Number);
  }
};

export const getPgArray = (cart) => {
  cart = JSON.stringify(cart);
  cart = cart.replace("[", "{");
  cart = cart.replace("]", "}");
  return cart;
};

export const calcTotalPrice = (cart) => {
  return cart.reduce((currentValue, previousValue) => {
    return currentValue.price + previousValue.price;
  });
};
