import { errorRaiser } from "../../utils/error_raiser.js";
import moment from "moment";
import { sequelize } from "../../utils/db.js";

export const getPaymentsPage = async (req, res, next) => {
  try {
    const allPayments = await sequelize.query(
      `
      select payments.status as payment_status, "payments"."createdAt" as payment_date, users.name as user_name, course.name as course_name, round.round_date as round_date from payments
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
        async (
          {
            payment_id,
            payment_status,
            payment_date,
            user_name,
            course_name,
            round_date,
          },
          index
        ) => {
          allPrimaryKeys.push(payment_id);
          return {
            payment_status,
            payment_date: moment(payment_date).format("DD-MM-YYYY h:mm a"),
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
        {
          title: "Payment Status",
          name: "payment-status",
        },
        {
          title: "Payment Date",
          name: "payment-date",
        },
        {
          title: "Payee Name",
          name: "payee-name",
        },
        {
          title: "Bought Course",
          name: "bought-course",
        },
        {
          title: "Bought Round",
          name: "bought-round",
        },
      ],
      tableRows: finalData,
      customStuff: {
        notHaveUpdate: true,
        notHaveNewInsert: true,
        notDeleteRow: true,
      },
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};
