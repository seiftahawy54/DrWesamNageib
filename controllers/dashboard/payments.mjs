import { Payment } from "../../models/payment.mjs";
import { Courses } from "../../models/courses.mjs";
import { Users } from "../../models/users.mjs";
import { extractCart } from "../../utits/cart_helpers.mjs";
import { errorRaiser } from "../../utits/error_raiser.mjs";

export const getPaymentsPage = async (req, res, next) => {
  try {
    const allPayments = await Payment.findAll();

    let courses_names = allPayments.map(async (payment) => {
      return await Courses.findByPk(payment.course_id);
    });

    let users_names = allPayments.map(async (payment) => {
      return await Users.findByPk(payment.user_id);
    });

    // console.log(allPayments, courses_names, courses_names);

    let users = [];

    for (const user of users_names) {
      users.push(await user);
    }

    let courses = [];

    for (const course of courses_names) {
      courses.push(await course);
    }

    // const courseData = await Courses.findByPk(allPayments.course_id);
    // const userData = await Users.findByPk(allPayments.course)

    res.render("dashboard/payments", {
      title: "Payments",
      path: "/dashboard/payments",
      payments: allPayments,
      users: users,
      courses: courses,
    });
  } catch (e) {
    errorRaiser(e, next);
  }
  // const coursesFromString = extractCart({
  //   user: { cart: allPayments[0].course_id },
  // });
  //
  // let courses_names = coursesFromString.map(async (payment) => {
  //   console.log(await Courses.findByPk(payment.item));
  //   return await Courses.findByPk(payment.item);
  // });

  /*
    let users_names = allPayments.map(async (payment) => {
      return await Users.findByPk(payment.user_id);
    });

    // console.log(allPayments, courses_names, courses_names);

    let users = [];

    for (const user of users_names) {
      users.push(await user);
    }

    let courses = [];

    for (const course of courses_names) {
      courses.push(await course);
    }

    // const courseData = await Courses.findByPk(allPayments.course_id);
    // const userData = await Users.findByPk(allPayments.course)
    res.render("dashboard/payments", {
      title: "Payments",
      path: "/dashboard/payments",
      payments: allPayments,
      users: users,
      courses: courses,
    });*/
};
