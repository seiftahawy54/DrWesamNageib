import paypal from "@paypal/checkout-server-sdk";
import { validationResult } from "express-validator";
import { Courses } from "../models/courses.js";
import { errorRaiser } from "../utits/error_raiser.js";
import { Users } from "../models/users.js";
import { Payment } from "../models/payment.js";
import bcrypt from "bcrypt";
import { Rounds } from "../models/rounds.js";
import {
  calcTotalPrice,
  cartIsEmpty,
  extractArrOfPrices,
  findCartCourses,
} from "../utits/cart_helpers.js";

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
    req.flash("error", "Maybe user name or password is invalid!");
    return res.status(422).render("auth/login", {
      title: "Login",
      path: "/login",
      user: { email, password },
      validationErrors: { email: true, password: true },
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
    Users.findAll({
      where: {
        email,
      },
    })
      .then(async (findingUserResult) => {
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

          req.flash("success", "Welcome on Board 😄");
          return res.redirect("/profile");
        } else {
          req.flash("error", "Maybe username or password is invalid!");
          return res.status(422).render("auth/login", {
            title: "Login",
            path: "/login",
            user: { email, password },
            validationErrors: { email: true, password: true },
          });
        }
      })
      .catch((err) => {
        req.flash("error", "Maybe user name or password is invalid!");
        return res.status(422).render("auth/login", {
          title: "Login",
          path: "/login",
          user: { email, password },
          validationErrors: { email: true, password: true },
        });
      });
  }
};

export const getRegister = (req, res, next) => {
  res.render("auth/register", {
    title: "Register",
    path: "/register",
    validationErrors: [{}],
    user: {},
  });
};

export const postRegister = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const whatsapp_no = req.body.whatsapp_number;
    const specialization = req.body.specialization;
    const password = req.body.password;
    const confirmPassword = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("", errors.array()[0].msg);
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
      });
    } else {
      const encryptionResult = await bcrypt.hash(password, 12);
      if (await encryptionResult) {
        Users.create({
          name: name,
          email: email,
          whatsapp_no: whatsapp_no,
          specialization: specialization,
          password: await encryptionResult,
          cart: [],
          type: 2,
        })
          .then((result) => {
            req.flash(
              "success",
              "You have registered to the website successfully, please login to continue"
            );
            res.redirect("/login");
          })
          .catch((err) => {
            // errorRaiser(err, next);
            req.flash("error", err.message);
            res.render("auth/register", {
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
            });
          });
      }
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getCompletePayment = async (req, res, next) => {
  try {
    if (Array.isArray(req.user.cart) && !cartIsEmpty(req.user.cart)) {
      const clientId = process.env.PAYPAL_CLIENT_ID;
      const coursesArr = await findCartCourses(req.user.cart);
      const filteredCourses = coursesArr.map((course) => {
        return {
          name: course.name,
          price: course.price,
        };
      });

      res.render("auth/complete-payment", {
        title: "complete payment",
        path: "/complete-payment",
        bought_courses: filteredCourses,
        clientId,
      });
    } else {
      req.flash("error", "Please select a course to buy!");
      res.redirect("/courses");
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postCreateOrder = async (req, res, next) => {
  const request = new paypal.orders.OrdersCreateRequest();
  const coursesArr = await findCartCourses(req.user.cart);
  const filteredCourses = coursesArr.map((course) => {
    return {
      name: course.name,
      price: course.price,
    };
  });
  const coursesPrice = extractArrOfPrices(filteredCourses);

  const total = calcTotalPrice(coursesPrice);

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
    req.flash("error", "There's an error in payment");
    res.status(500).json({ error: e });
    // errorRaiser(e, next);
  }
};

export const postSuccess = async (req, res, next) => {
  try {
    const rounds = req.user.cart.map(({ roundId }) => roundId);
    const courses = req.user.cart.map(({ courseId }) => courseId);

    // const round = req.user.cart.find((roundId) => roundId);
    // const course = req.user.cart.find((roundId) => roundId);
    console.log(`post success: `, rounds, courses);

    Payment.create({
      user_id: req.user.user_id,
      course_id: courses[0],
      round_id: rounds[0],
      status: "success",
      details: req.session.userOrder,
    })
      .then(async (result) => {
        const findingSingleRound = await Rounds.findByPk(rounds[0]);
        return Rounds.update(
          {
            users_ids: [...findingSingleRound.users_ids, req.user.user_id],
          },
          { where: { round_id: rounds[0], course_id: courses[0] } }
        );
      })
      .then((result) => {
        return Users.update(
          {
            cart: [],
            current_round: rounds[0],
          },
          { where: { user_id: req.user.user_id } }
        );
      })
      .then((result) => {
        return res.redirect("/success_payment");
      })
      .catch(async (err) => {
        Payment.create({
          user_id: req.user.user_id,
          course_id: req.user.cart,
          status: "failed",
          details: req.session.userOrder,
        });
        req.flash(
          "error",
          "There's an error in completing your payment, please contact us!"
        );
        await errorRaiser(err, next);
      });
  } catch (e) {
    req.flash(
      "error",
      "There's an error in completing your payment, please contact us!"
    );
    await errorRaiser(e, next);
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
  req.session.destroy((err) => {
    if (err) {
      console.log(`A Destroy `, err);
      res.redirect("/");
    } else {
      res.redirect("/");
    }
  });
};
