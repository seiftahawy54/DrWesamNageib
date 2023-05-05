import { errorRaiser } from "../../utils/error_raiser.js";
import moment from "moment";
import { Courses, Payment, Rounds, Users } from "../../models/index.js";
import { Op, Sequelize } from "sequelize";

export const getPaymentsPage = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Users,
          on: {
            user_id: {
              [Op.eq]: Sequelize.col("payments.user_id"),
            },
          },
          attributes: ["name"],
          where: {
            isDeleted: false,
          },
        },
        {
          model: Courses,
          on: {
            course_id: {
              [Op.eq]: Sequelize.col("payments.course_id"),
            },
          },
          attributes: ["name"],
          where: {
            isDeleted: false,
          },
        },
        {
          model: Rounds,
          on: {
            round_id: {
              [Op.eq]: Sequelize.col("payments.round_id"),
            },
          },
          attributes: ["round_date"],
        },
      ],
    });

    return res.status(200).json({
      payments,
      primaryKey: "payment_id",
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};
