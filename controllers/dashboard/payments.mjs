import { Payment } from "../../models/payment.mjs";
import { Courses } from "../../models/courses.mjs";
import { Users } from "../../models/users.mjs";
import { extractCart, findCartCourses } from "../../utits/cart_helpers.mjs";
import { errorRaiser } from "../../utits/error_raiser.mjs";
import { Rounds } from "../../models/rounds.mjs";
import moment from "moment";

export const getPaymentsPage = async (req, res, next) => {
  try {
    const allPayments = await Payment.findAll();
    let coursesIds = [],
      usersIds = [],
      roundIds = [];

    allPayments.forEach((payment) => {
      coursesIds.push(payment.course_id);
      usersIds.push(payment.user_id);
      roundIds.push(payment.round_id);
    });

    const users = await Promise.all(
      usersIds.map(async (id) => await Users.findByPk(id))
    );

    const courses = await Promise.all(
      coursesIds.map(async (coursesForSingle) => {
        return Promise.all(
          coursesForSingle.map(async (id) => await Courses.findByPk(id))
        );
      })
    );

    const rounds = await Promise.all(
      roundIds.map(async (roundsForSingle) => {
        return Promise.all(
          roundsForSingle.map(async (id) => await Rounds.findByPk(id))
        );
      })
    );

    res.render("dashboard/payments", {
      title: "Payments",
      path: "/dashboard/payments",
      payments: allPayments,
      users,
      courses,
      rounds,
      moment,
    });
  } catch (e) {
    errorRaiser(e, next);
  }
};
