import { errorRaiser } from "../../utils/error_raiser.js";
import moment from "moment";
import { sequelize } from "../../utils/db.js";

export const getPaymentsPage = async (req, res, next) => {
  try {
    const allPayments = await sequelize.query(
      `
      select payments.status, users.name as user_name, course.name as course_name, round.round_date as round_date from payments
        Inner JOIN users on users.user_id = payments.user_id
        Inner Join courses course on course.course_id = payments.course_id
        Inner Join rounds round on round.round_id = payments.round_id;
      `
    );

    res.render("dashboard/payments", {
      title: "Payments",
      path: "/dashboard/payments",
      payments: allPayments,
      moment,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};
