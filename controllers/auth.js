import paypal from "@paypal/checkout-server-sdk";
import { validationResult } from "express-validator";
// import { Courses } from "../models";
import { errorRaiser } from "../utils/error_raiser.js";
import { Users, Payment, Rounds, Discounts } from "../models/index.js";
import sendGrid from "@sendgrid/mail";

sendGrid.setApiKey(process.env.SEND_GRID_SECRET);

import bcrypt from "bcrypt";
import {
  calcTotalPrice,
  cartIsEmpty,
  extractArrOfPrices,
  findCartCourses,
} from "../utils/cart_helpers.js";
import { extractErrorMessagesForSchemas, hashCreator } from "../utils/general_helper.js";
import moment from "moment";

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

export const getLogin = (req, res, next) =>
  res.render("auth/login", {
    title: "Login",
    path: "/login",
    validationErrors: {},
    user: {},
    moment: moment,
  });

export const postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  // console.log("login errors", errors.array());
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: true,
      messages: extractErrorMessagesForSchemas(errors.array()),
    });
  }

  
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
};

export const getForgetPassword = (req, res, next) => {
  return res.render("auth/forget_password", {
    title: "Forget Password",
    path: "/forget-password",
    enteredData: {},
    validationErrors: [],
  });
};

export const postForgetPassword = async (req, res, next) => {
  try {
    const userEmail = req.body.user_email;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.render("auth/forget_password", {
        title: "Forget Password",
        path: "/forget-password",
        enteredData: {
          user_email: userEmail,
        },
        validationErrors: errors.array(),
      });
    }

    const searchingForUserResult = await Users.findOne({
      where: {
        email: userEmail,
      },
    });

    if (!searchingForUserResult) {
      req.flash("error", "There's no users found with this email!");
      return res.redirect("/forget-password");
    }

    if (
      searchingForUserResult.token_date &&
      moment().diff(moment(searchingForUserResult.token_date), "hours") * -1 >=
        1
    ) {
      req.flash(
        "error",
        "You've already requested to reset your password, please check your email!"
      );
      return res.redirect("/");
    }

    // to: 'test@example.com', // Change to your recipient
    //   from: 'test@example.com', // Change to your verified sender
    //   subject: 'Sending with SendGrid is Fun',
    //   text: 'and easy to do anywhere, even with Node.js',
    //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',

    const requestedToken = hashCreator(10);
    const oneHourAhead = moment().add(1, "hour").toISOString();

    const updateUserToken = await searchingForUserResult.update({
      reset_token: requestedToken,
      token_date: oneHourAhead,
    });
    /*
    reset_token: `${req.get("origin")}/reset-password/${
            updateUserToken.reset_token
          }`,
          token_date: updateUserToken.token_date,
    */
    sendGrid
      .send({
        to: searchingForUserResult.email,
        from: "admin@drwesamnageib.com",
        subject: "Reset Password Request",
        text: "You've requested a reset to your password please processes the operation",
        html: `
              <h1>Password Reset Request</h1>
              <p>You've requested a reset to your password please process the operation</p>
              <p>You can click on this link to continue this operation <a href="${req.get(
                "origin"
              )}/reset-password/${updateUserToken.reset_token}">RESET</a></p>
              <strong>THE LINK IS AVAILABLE FOR ONE HOUR ONLY!</strong>
              If you didn't request anything please call us immediately <a href="http://localhost:3000/contactus">Contact US</a>
            `,
      })
      .then((result) => {
        return res.redirect("/confirm-forget");
      })
      .catch((error) => {
        req.flash("error", error.message);
        return res.redirect("/");
      });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getConfirmForget = async (req, res, next) => {
  return res.render("auth/confirm_sending", {
    title: "Confirm Sending",
    path: "/confirm_sending",
  });
};

export const getGenerateNewPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    const userWithToken = await Users.findOne({
      where: {
        reset_token: token,
      },
    });

    if (!userWithToken) {
      req.flash("error", "Please check your data!");
      return res.redirect("/login");
    }

    if (moment().diff(moment(userWithToken.token_date), "hours") * -1 >= 1) {
      req.flash(
        "error",
        "Your request to reset your password is invalid, please submit another request!"
      );
      return res.redirect("/login");
    }

    res.render("auth/new_password", {
      title: "Reset Password",
      path: "/reset-password",
      resetToken: token,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postGenerateNewPassword = async (req, res, next) => {
  try {
    const password = req.body.new_password;
    const confirmPassword = req.body.confirm_password;
    const token = req.params.token;

    if (password !== confirmPassword) {
      req.flash("error", "Please make sure that your passwords are the same!");
      return res.redirect(`/reset-password/${token}`);
    }

    const encryptionResult = await bcrypt.hash(password, 12);
    if (!(await encryptionResult)) {
      req.flash("error", "Some error in the server please contact admin!");
      return res.redirect(`/reset-password/${token}`);
    }

    const user = await Users.findOne({
      where: {
        reset_token: token,
      },
    });

    const updatingUserDataResult = user.update(
      {
        password: await encryptionResult,
        reset_token: null,
        token_date: null,
      },
      {
        where: {
          reset_token: token,
        },
      }
    );

    req.flash(
      "success",
      "You've successfully updated your password, now you can login"
    );
    return res.redirect("/login");
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getRegister = (req, res, next) => {
  return res.render("auth/register", {
    title: "Register",
    path: "/register",
    validationErrors: [{}],
    user: {},
  });
};

export const postApplyCoupon = async (req, res, next) => {
  const couponName = req.body.coupon_name;
  const findingCoupon = await Discounts.findOne({
    where: { coupon_name: couponName },
  });

  if (findingCoupon && findingCoupon.status) {
    const updatingResult = await Users.update(
      {
        applied_coupon: findingCoupon.discount_id,
      },
      { where: { user_id: req.user.user_id } }
    );

    if (updatingResult) {
      req.flash("success", "Coupon applied successfully!");
      return res.redirect("/complete_payment");
    } else {
      req.flash("error", "Something happened!");
      return res.redirect("/complete_payment");
    }
  } else {
    req.flash("error", "Invalid Coupon!");
    return res.redirect("/complete_payment");
  }
};

export const postRegister = async (req, res, next) => {
  try {
    let firstName = req.body.first_name;
    let middleName = req.body.middle_name;
    let lastName = req.body.last_name;
    const email = req.body.email;
    const whatsapp_no = req.body.whatsapp_number;
    const specialization = req.body.specialization;
    const password = req.body.password;
    const confirmPassword = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      req.flash(
        "error",
        `${errors.array()[0].param} - ${errors.array()[0].msg}`
      );
      return res.status(422).render("auth/register", {
        title: "Register",
        path: "/register",
        validationErrors: errors.array(),
        user: {
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          email,
          whatsapp_no,
          specialization,
          password,
          confirmPassword,
        },
      });
    }
    const encryptionResult = await bcrypt.hash(password, 12);
    if (await encryptionResult) {
      firstName = firstName[0].toUpperCase() + firstName.slice(1);
      middleName = middleName[0].toUpperCase() + middleName.slice(1);
      lastName = lastName[0].toUpperCase() + lastName.slice(1);
      Users.create({
        name: firstName + " " + middleName + " " + lastName,
        email: email.toLowerCase(),
        whatsapp_no: whatsapp_no,
        specialization: specialization,
        password: await encryptionResult,
        cart: [],
        type: 2,
      })
        .then(async (result) => {
          if (process.env.NODE_ENV === "production") {
            await sendGrid.send({
              to: "drwesamnageib@gmail.com",
              from: "admin@drwesamnageib.com",
              subject: "New User Notification",
              text: "A New User has registered to the website",
              html: `
              <b>This is no REPLY email</b>
              <p>A User with following data have been registered!</p>
              <ul>
                <li>Name: ${firstName + " " + middleName + " " + lastName}</li>
                <li>Email: ${email}</li>
                <li>Whatsapp Number: ${whatsapp_no}</li>
                <li>Specialization: ${specialization}</li>
              </ul>
            `,
            });
          }
          req.flash(
            "success",
            "You have registered to the website successfully, please login to continue"
          );
          return res.redirect("/login");
        })
        .catch((err) => {
          // errorRaiser(err, next);
          console.log(err);
          req.flash("error", err.message);
          return res.render("auth/register", {
            title: "Register",
            path: "/register",
            validationErrors: errors.array(),
            user: {
              first_name: firstName,
              middle_name: middleName,
              last_name: lastName,
              email,
              whatsapp_no,
              specialization,
              password,
              confirmPassword,
            },
          });
        });
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

      let couponData = null,
        filteredCourses = [];

      if (typeof req.user.applied_coupon === "string") {
        const findingCouponData = await Discounts.findByPk(
          req.user.applied_coupon
        );
        if (findingCouponData) couponData = findingCouponData;
        filteredCourses = coursesArr.map((course) => {
          let price = course.price;

          if (couponData) {
            price = price * (1 - findingCouponData.discount_percentage / 100);

            console.log(`Coupon Data |----#----|`);
            console.log(price);
          }

          return {
            name: course.name,
            oldPrice: course.price,
            price,
          };
        });
      } else {
        filteredCourses = coursesArr.map((course) => {
          return {
            name: course.name,
            price: course.price,
          };
        });
      }

      res.render("auth/complete-payment", {
        title: "complete payment",
        path: "/complete-payment",
        bought_courses: filteredCourses,
        clientId,
        couponData,
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
  let filteredCourses = null,
    couponData;
  //  = coursesArr.map((course) => {
  // return {
  //   name: course.name,
  //   price: course.price,
  // };
  // });

  if (typeof req.user.applied_coupon === "string") {
    const findingCouponData = await Discounts.findByPk(req.user.applied_coupon);
    if (findingCouponData) couponData = findingCouponData;
    filteredCourses = coursesArr.map((course) => {
      let price = course.price;

      if (couponData) {
        price = price * (1 - findingCouponData.discount_percentage / 100);
      }

      return {
        name: course.name,
        oldPrice: course.price,
        price,
      };
    });
  } else {
    filteredCourses = coursesArr.map((course) => {
      return {
        name: course.name,
        price: course.price,
      };
    });
  }

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
      .then(async (result) => {
        if (typeof req.user.applied_coupon === "string") {
          const findingAppliedCoupon = await Discounts.findByPk(
            req.user.applied_coupon
          );
          if (findingAppliedCoupon) {
            await Discounts.update(
              {
                discount_usage: findingAppliedCoupon.discount_usage + 1,
              },
              { where: { discount_id: req.user.applied_coupon } }
            );
          }
        }

        return Users.update(
          {
            cart: [],
            current_round: rounds[0],
            applied_coupon: null,
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
      return res.redirect("/");
    } else {
      return res.redirect("/");
    }
  });
};
