import { Payment } from "../../models/payment.mjs";
import { errorRaiser } from "../../utits/error_raiser.mjs";
import { Courses } from "../../models/courses.mjs";
import { extractCart, getCoursesFormCart } from "../../utits/cart_helpers.mjs";

export const getUserProfile = async (req, res, next) => {
  try {
    const findingUserPayments = await Payment.findAll({
      where: { user_id: req.user.user_id },
    });

    if (findingUserPayments.length !== 0) {
      const coursesPayments = findingUserPayments.map((payment) => {
        return JSON.parse(payment.course_id);
      });

      const findingBoughtCourses = coursesPayments.map((courses) => {
        return courses.map(({ item }) => {
          return Courses.findByPk(item);
        });
      });

      const boughtCourses = [];

      for (const key of findingBoughtCourses) {
        for (const item of key) {
          boughtCourses.push(await item);
        }
      }
      res.render("users/profile", {
        title: req.user.name,
        path: "/profile",
        user: req.user,
        bought_courses: boughtCourses,
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
