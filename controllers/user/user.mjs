import { Payment } from "../../models/payment.mjs";
import { errorRaiser } from "../../utits/error_raiser.mjs";

export const getUserProfile = async (req, res, next) => {
  try {
    const findingUserPayments = await Payment.findAll({
      where: { user_id: req.user.user_id },
    });

    if (findingUserPayments.length !== 0) {
      const bought_courses = await Payment.findAll({
        where: { course_id: findingUserPayments.course_id },
      });

      res.render("users/profile", {
        title: req.user.name,
        path: "/profile",
        user: req.user,
        bought_courses,
      });
    } else {
      res.render("users/profile", {
        title: req.user.name,
        path: "/profile",
        user: req.user,
        bought_courses: [],
      });
    }
  } catch (e) {
    errorRaiser(e, next);
  }
};
