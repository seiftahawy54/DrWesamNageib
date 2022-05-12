import { errorRaiser } from "../../utils/error_raiser.js";
import moment from "moment";
import { sequelize } from "../../utils/db.js";

export const getPaymentsPage = async (req, res, next) => {
  try {
    const allPayments = await sequelize.query(
      `
      select payments.*, users.name as user_name, course.name as course_name, round.round_date as round_date from payments
        Inner JOIN users on users.user_id = payments.user_id
        Inner Join courses course on course.course_id = payments.course_id
        Inner Join rounds round on round.round_id = payments.round_id;
      `,
      {
        type: "SELECT",
      }
    );

    const allPrimaryKeys = [];

    let data = await Promise.all(
      allPayments.map(
        async ({ payment_id, user_name, course_name, round_date }, index) => {
          allPrimaryKeys.push(payment_id);
          return {
            payment_id,
            user_name,
            course_name,
            round_date: moment(round_date).format("DD-MM-YYYY"),
          };
        }
      )
    );

    data = Object.entries(data).map(([key, value], index) => {
      return {
        item: value,
        entry: key,
      };
    });

    let finalData = [];

    data.forEach((value, key) => {
      finalData.push({
        data: {
          ...data[key],
        },
        primaryKey: allPrimaryKeys[key],
        updateInputName: "paymentId",
      });
    });

    return res.render("dashboard/payments", {
      title: "Payments",
      path: "/dashboard/payments",
      tableName: "Payments",
      addingNewLink: "payments",
      singleTableName: "payment",
      tableHead: [
        {
          title: "#",
          name: "payments-number",
        },
      ],
      tableRows: finalData,
      customStuff: {
        pagination: true,
        notHaveUpdate: true,
        notHaveNewInsert: true,
      },
    });

    // res.render("dashboard/payments", {
    //   title: "Payments",
    //   path: "/dashboard/payments",
    //   payments: allPayments,
    //   moment,
    // });
  } catch (e) {
    await errorRaiser(e, next);
  }
};
