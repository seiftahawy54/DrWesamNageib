import {
  getCancelled,
  getCompletePayment,
  postLogin,
  postCreateOrder,
  postRegister,
  getSuccess,
  postSuccess,
  postApplyCoupon,
  getForgetPassword,
  postForgetPassword,
  getConfirmForget,
  getGenerateNewPassword,
  postGenerateNewPassword,
} from "../controllers/auth.js";
import { Router } from "express";
import { body } from "express-validator";
import { isUserAuthenticated } from "../middlewares/user-auth.js";
import messages from "../i18n/messages.js";

const registerRoutes = Router();
const loginRoutes = Router();
const resetPasswordRoutes = Router();
const paymentRoutes = Router();

loginRoutes.post(
  "/",
  body("email").isEmail().notEmpty(),
  body("password").isString().notEmpty(),
  postLogin
);

registerRoutes.post(
  "/",
  body("first_name").isString().isLength({ min: 3 }).withMessage().trim(),
  body("middle_name").isString().isLength({ min: 3 }).trim(),
  body("last_name").isString().isLength({ min: 3 }).trim(),
  body("email")
    .isEmail()
    .notEmpty()
    .trim()
    .custom((value) =>
      value.split("").every((letter) => letter.toLowerCase() === letter)
    )
    .withMessage(messages.en.validationErrors.invalidEmailLetters),
  body("whatsapp_number").isMobilePhone("any").notEmpty().trim(),
  body("specialization").isString().notEmpty().trim(),
  body("password").isString().isLength({ min: 8 }).notEmpty(),
  body("confirmPassword")
    .isString()
    .notEmpty()
    .custom((value, { req }) => {
      return req.body.password.localeCompare(value) === 0;
    })
    .withMessage(messages.en.validationErrors.passwordNotEqual),
  postRegister
);

resetPasswordRoutes
  .post(
    "/forget-password",
    [body("user_email").isEmail().isLength({ min: 5 })],
    postForgetPassword
  )
  .post(
    "/reset-password/:token",
    [body("password").isString().isLength({ min: 8 }).trim()],
    postGenerateNewPassword
  );

paymentRoutes
  .get("/success_payment", getSuccess)
  .post("/success-payment", postSuccess)
  .get("/cancel_payment", getCancelled)
  .get("/complete_payment", getCompletePayment)
  .post("/create-order", postCreateOrder)
  .post(
    "/apply-coupon",
    [body("coupon_name").isString().notEmpty()],
    postApplyCoupon
  );

const authenticationRoutes = Router()
  .use("/login", loginRoutes)
  .use("/register", registerRoutes)
  .use("/payment", isUserAuthenticated, paymentRoutes)
  .use("/forget-password", resetPasswordRoutes);

export default authenticationRoutes;
