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
import { Payment } from "../models/payment.mjs";
import bcrypt from "bcrypt";
import {
  calcTotalFromCart,
  convertCartToArr,
  extractCart,
  getCoursesFormCart,
} from "../utits/cart_helpers.mjs";

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

export const getLogin = (req, res, next) => {
  res.render("auth/login", {
    title: "Login",
    path: "/login",
    validationErrors: {},
    user: {},
    errorMessage: "",
  });
};

export const postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  // console.log("login errors", errors.array());
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      title: "Login",
      path: "/login",
      user: { email, password },
      validationErrors: { email: true, password: true },
      errorMessage: "Maybe user name or password is invalid!",
    });
  } else if (
    email.localeCompare(process.env.ADMIN_EMAIL) === 0 &&
    password.localeCompare(process.env.ADMIN_PASSWORD) === 0
  ) {
    req.session.isAuthenticatedAdmin = true;
    req.session.adminUser = {
      email,
    };
    res.redirect("/dashboard/overview");
  } else {
    const findingUserResult = await Users.findAll({
      where: {
        email,
      },
    });

    if (findingUserResult.length > 0) {
      const comparingResult = await bcrypt.compare(
        password,
        findingUserResult[0].password
      );
      if (comparingResult) {
        req.session.userIsAuthenticated = true;
        req.session.user = {
          email: email,
          user_id: findingUserResult[0].user_id,
        };
        return res.redirect("/profile");
      } else {
        return res.status(422).render("auth/login", {
          title: "Login",
          path: "/login",
          user: { email, password },
          validationErrors: { email: true, password: true },
          errorMessage: "Maybe username or password is invalid!",
        });
      }
    } else {
      return res.status(422).render("auth/login", {
        title: "Login",
        path: "/login",
        user: { email, password },
        validationErrors: { email: true, password: true },
        errorMessage: "Maybe user name or password is invalid!",
      });
    }
  }
};

export const getRegister = (req, res, next) => {
  res.render("auth/register", {
    title: "Register",
    path: "/register",
    validationErrors: [{}],
    user: {},
    errorMessage: "",
  });
};

export const postRegister = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const whatsapp_no = req.body.whatsapp_number;
  const specialization = req.body.specialization;
  const password = req.body.password;
  const confirmPassword = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/register", {
      title: "Register",
      path: "/register",
      validationErrors: errors.array(),
      user: {
        name,
        email,
        whatsapp_no,
        specialization,
        password,
        confirmPassword,
      },
      errorMessage: errors.array()[0].msg,
    });
  } else {
    const encryptionResult = await bcrypt.hash(password, 12);
    if (await encryptionResult) {
      Users.create({
        name,
        email,
        whatsapp_no,
        specialization,
        password: await encryptionResult,
        cart: "{}",
        type: 2,
      });
      res.redirect("/login");
    } else {
      errorRaiser(new Error("Encryption error"), next);
    }
    /*crypto.randomBytes(10, (err, buffer) => {
      errorRaiser(err, next);
      const token = buffer.toString("hex");
      req.session.newUser = {
        id: token,
        name,
        email,
        whatsapp_no,
        specialization,
      };
      res.redirect("/complete-payment");
    });*/
  }
};

export const getCompletePayment = async (req, res, next) => {
  // const selectedCourse = req.cookies["courseId"];
  const coursesJSON = extractCart(req.body.cart);
  let message = req.flash("error")[0];
  if (!(typeof message === "string")) {
    message = null;
  }

  if (coursesJSON.length !== 0 && Array.isArray(coursesJSON)) {
    const clientId = process.env.PAYPAL_CLIENT_ID;

    const boughtCourses = await getCoursesFormCart(coursesJSON);

    res.render("auth/complete-payment", {
      title: "complete payment",
      path: "/complete-payment",
      bought_courses: boughtCourses,
      clientId,
      errorMessage: message,
    });
    /*Courses.findByPk(selectedCourse)
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
      });*/
  } else {
    res.redirect("/courses");
  }
};

export const postCreateOrder = async (req, res, next) => {
  const request = new paypal.orders.OrdersCreateRequest();
  const cart = await extractCart(req);
  const total = await calcTotalFromCart(cart, req);

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
    req.session.userOrder = order;
    res.json({ id: order.result.id });
  } catch (e) {
    res.status(500).json({ error: e });
    // errorRaiser(e, next);
  }
};

export const postSuccess = async (req, res, next) => {
  // const coursesArrayJSON = extractCart(req.user.cart);
  // const courseIdsArr = convertCartToArr(coursesArrayJSON);
  // res.send(courseIdsArr);
  try {
    Payment.create({
      user_id: req.user.user_id,
      course_id: req.user.cart,
      status: "success",
      details: req.session.userOrder,
    })
      .then((result) => {
        return Users.update(
          {
            cart: "{}",
          },
          { where: { user_id: req.user.user_id } }
        );
      })
      .then((result) => {
        return res.redirect("/success_payment");
      })
      .catch((err) => {
        Payment.create({
          user_id: req.user.user_id,
          course_id: req.user.cart,
          status: "failed",
          details: req.session.userOrder,
        });
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

export const getSuccess = (req, res, next) => {
  res.render("auth/done-payment", {
    title: "Payment is Done",
    path: "/done-payment",
  });
};

export const getCancelled = (req, res, next) => {
  res.render("auth/cancel", {
    title: "Cancel payment",
    path: "/cancel_payment",
    returnLocation: "/",
  });
};

export const postLogout = (req, res, next) => {
  // req.logout();
  req.session.destroy((err) => {
    console.log(`A Destroy `, err);
    res.redirect("/");
  });
};
