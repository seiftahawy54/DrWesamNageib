// import { getSingleCourse } from "../models/courses.mjs";
// import {
//   addUserPaymentDetails,
//   addUserInfoWithoutCart,
// } from "../models/users.mjs";
import crypto from "crypto";
import paypal from "@paypal/checkout-server-sdk";
import { validationResult } from "express-validator";
import { Courses } from "../models/courses.mjs";
import { errorRaiser } from "../utits/error_raiser.mjs";
import { Users } from "../models/users.mjs";

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
  let message = req.flash("error")[0];

  if (!(typeof message === "string")) {
    message = null;
  }

  res.render("auth/login", {
    title: "Login",
    path: "/login",
    errorMessage: message,
  });
};

const postLogin = (req, res, next) => {
  const email = req.body.email;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("auth/login", {
      title: "Login",
      path: "/login",
      errorMessage: errors.array()[0].msg,
    });
  } else {
    req.session.isAuthenticated = true;
    req.session.user = {
      email,
    };
    res.redirect("/dashboard/overview");
  }
};

const getRegister = (req, res, next) => {
  const selectedCourse = req.cookies["courseId"];
  let message = req.flash("error")[0];
  if (!(typeof message === "string")) {
    message = null;
  }

  if (selectedCourse) {
    Courses.findByPk(selectedCourse)
      .then((courseData) => {
        SelectedCourseData = courseData;
        req.session.savedCourse = SelectedCourseData;
        res.render("auth/register", {
          title: "Register",
          path: "/register",
          course: SelectedCourseData,
          errorMessage: message,
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
  let message = req.flash("error")[0];
  if (!(typeof message === "string")) {
    message = null;
  }

  if (selectedCourse) {
    Courses.findByPk(selectedCourse)
      .then((dbResult) => {
        const selectedData = dbResult;
        // Removing Arabic Description for avoiding parsing error;
        const filteredCourse = {
          name: selectedData.name,
          price: selectedData.price,
          course_id: selectedData.course_id,
        };
        const clientId = process.env.PAYPAL_CLIENT_ID;
        res.render("auth/complete-payment", {
          title: "complete payment",
          path: "/complete-payment",
          course: filteredCourse,
          clientId,
          errorMessage: message,
        });
      })
      .catch((err) => {
        errorRaiser(err, next);
      });
  } else {
    res.redirect("/");
  }
};

const postRegister = (req, res, next) => {
  const errors = validationResult(req);
  const name = req.body.name;
  const email = req.body.email;
  const whatsapp_no = req.body.whatsapp_number;
  const specialization = req.body.specialization;

  if (!errors.isEmpty()) {
    return res.status(400).render("auth/register", {
      title: "Register",
      path: "/register",
      course: req.session.savedCourse,
      errorMessage: "Please Enter Correct Data !",
    });
  } else {
    crypto.randomBytes(10, (err, buffer) => {
      if (err) {
        console.log(err);
        req.flash("there's an error in the website, please contact us!");
        res.redirect("/register");
      }
      const token = buffer.toString("hex");
      req.session.newUser = {
        id: token,
        name,
        email,
        whatsapp_no,
        specialization,
      };
      res.redirect("/complete-payment");
      /**/
    });
  }
};

const postCreateOrder = async (req, res, next) => {
  const request = new paypal.orders.OrdersCreateRequest();
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

    console.log("order: ", order);
    req.session.userOrder = order;
    res.json({ id: order.result.id });
  } catch (e) {
    res.status(500).json({ error: e });
    // errorRaiser(e, next);
  }
};

const postSuccess = async (req, res, next) => {
  try {
    const userDataFromSession = req.session.newUser;
    Users.create({
      user_id: userDataFromSession.id,
      name: userDataFromSession.name,
      email: userDataFromSession.email,
      whatsapp_no: userDataFromSession.whatsapp_no,
      specialization: userDataFromSession.specialization,
    })
      .then((result) => {
        console.log("adding result", result);
        Users.update(
          { payment_details: req.session.userOrder },
          { where: { user_id: userDataFromSession.id } }
        ).then((result) => {
          console.log("updating result", result);
          res.redirect("/success_payment");
        });
      })
      .catch((err) => {
        errorRaiser(err, next);
      });

    // console.log("addedUserResult: ", addedUser);
    // console.log("addingPurchaseResult: ", addingResult);
    // if (addedUser && addingPayment) {
    //   return res.redirect("/success_payment");
    // } else {
    //   errorRaiser("Database error", next);
    // }
  } catch (e) {
    errorRaiser(e, next);
  }
};

const getSuccess = (req, res, next) => {
  res.render("auth/done-payment", {
    title: "Payment is Done",
    path: "/done-payment",
  });
};

const getCancelled = (req, res, next) => {
  res.render("auth/cancel", {
    title: "Cancel payment",
    path: "/cancel_payment",
    returnLocation: "/",
  });
};

const postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

export {
  getLogin,
  postLogin,
  postLogout,
  getRegister,
  postSuccess,
  getSuccess,
  postRegister,
  getCancelled,
  getCompletePayment,
  postCreateOrder,
};
