import {
  getCancelled,
  getCompletePayment,
  getLogin,
  postLogin,
  getRegister,
  postCreateOrder,
  postRegister,
  postLogout,
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
import {
  isUserAuthenticated,
  notRepeatedForUser,
} from "../middlewares/user-auth.js";

const registerRoutes = Router();
const loginRoutes = Router();
const resetPasswordRoutes = Router();
const paymentRoutes = Router();

loginRoutes
  .get("/", getLogin)
  .post(
    "/",
    body("email").isEmail().notEmpty(),
    body("password").isString().notEmpty(),
    postLogin
  );

registerRoutes.get("/", notRepeatedForUser, getRegister).post(
  "/",
  body("first_name").isString().isLength({ min: 3 }).trim(),
  body("middle_name").isString().isLength({ min: 3 }).trim(),
  body("last_name").isString().isLength({ min: 3 }).trim(),
  body("email").isEmail().notEmpty().trim(),
  body("whatsapp_number").isMobilePhone("any").notEmpty().trim(),
  body("specialization").isString().notEmpty().trim(),
  body("password").isString().isLength({ min: 8 }).notEmpty(),
  body("confirmPassword")
    .isString()
    .notEmpty()
    .custom((value, { req }) => {
      if (req.body.password.localeCompare(value) === 0) {
        return true;
      } else {
        return new Error("Passwords doesn't match");
      }
    }),
  postRegister
);

resetPasswordRoutes
  .get("/forget-password", getForgetPassword)
  .post(
    "/forget-password",
    [body("user_email").isEmail().isLength({ min: 5 })],
    postForgetPassword
  )
  .get("/confirm-forget", getConfirmForget)
  .get("/reset-password/:token", getGenerateNewPassword)
  .post(
    "/reset-password/:token",
    [body("password").isString().isLength({ min: 8 }).trim()],
    postGenerateNewPassword
  );

paymentRoutes
  .get("/success_payment", isUserAuthenticated, getSuccess)
  .post("/success_payment", isUserAuthenticated, postSuccess)
  .get("/cancel_payment", isUserAuthenticated, getCancelled)
  .get("/complete_payment", isUserAuthenticated, getCompletePayment)
  .post("/create-order", isUserAuthenticated, postCreateOrder)
  .post(
    "/apply-coupon",
    [body("coupon_name").isString().notEmpty()],
    postApplyCoupon
  );

const authenticationRoutes = Router.use("/login", loginRoutes)
  .use("/register", registerRoutes)
  .use("/payment", paymentRoutes)
  .use("/forget-password", resetPasswordRoutes);

export default authenticationRoutes;
