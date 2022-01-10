import { getSingleCourse } from "../models/courses.mjs";
import paypal from "@paypal/checkout-server-sdk";

const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECERT
  )
);
let SelectedCourseData = {};

const getLogin = (req, res, next) => {
  res.render("auth/login", {
    title: "Login",
    path: "/login",
  });
};

const getRegister = (req, res, next) => {
  const selectedCourse = req.cookies["courseId"];
  if (selectedCourse) {
    getSingleCourse(parseInt(selectedCourse))
      .then((courseData) => {
        SelectedCourseData = courseData.rows[0];
        res.render("auth/register", {
          title: "Register",
          path: "/register",
          course: SelectedCourseData,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    res.redirect("/");
  }
};

const getCompletePayment = (req, res, next) => {
  const selectedCourse = req.cookies["courseId"];
  if (selectedCourse) {
    getSingleCourse(parseInt(selectedCourse))
      .then((dbResult) => {
        const selectedData = dbResult.rows[0];
        const clientId =
          "Ab93AwBqmGoHjjW-W8i1Xj0inen_6wkJWAF1GLqslDDcNi7pXLVLnFxv4sZE4ZSQcvK53n5fcZTr4-gX";
        console.log(selectedData);
        res.render("auth/complete-payment", {
          title: "complete payment",
          path: "/complete-payment",
          course: selectedData,
          clientId,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    res.redirect("/");
  }
};

const postRegister = (req, res, next) => {
  res.redirect("/complete-payment");
  /*const course_price = req.body.coursePrice;
  const course_name = req.body.courseName;
  const course_id = req.body.courseId;

  SelectedCourseData = {
    name: course_name,
    price: course_price,
    id: course_id,
  };

  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success_payment",
      cancel_url: "http://localhost:3000/cancel_payment",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: course_name,
              price: course_price.toString(),
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: course_price.toString(),
        },
        description: course_name,
      },
    ],
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      throw error;
    } else {
      console.log("payment data: ", payment);
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });*/
};

const postCreateOrder = async (req, res, next) => {
  const request = new paypal.orders.OrdersCreateRequest();
  console.log(`item_req: `, req.body.item);
  const total = req.body.item.price;
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: total,
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: total,
            },
          },
        },
      },
    ],
  });

  try {
    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (e) {
    res.status(500).json({ error: e });
  }
};

const getSuccess = (req, res, next) => {
  /*  const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    console.log("payer id: ", payerId);
    console.log("payment id: ", paymentId);

    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: SelectedCourseData.price,
          },
        },
      ],
    };

    paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        res.send("your payment has been made!");
      }
    });*/
};

const getCancelled = (req, res, next) => {
  res.send("your payment has been cancelled!");
};

export {
  getLogin,
  getRegister,
  postRegister,
  getSuccess,
  getCancelled,
  getCompletePayment,
  postCreateOrder,
};
