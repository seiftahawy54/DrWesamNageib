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
} from "../controllers/auth.js";
import { Router } from "express";
import { body } from "express-validator";
import {
  isUserAuthenticated,
  notRepeatedForUser,
} from "../middlewares/user-auth.js";

const router = Router();

router
  .get("/login", notRepeatedForUser, getLogin)
  .post(
    "/login",
    body("email").isEmail().notEmpty(),
    body("password").isString().notEmpty(),
    postLogin
  )
  .post("/logout", postLogout)
  .get("/register", notRepeatedForUser, getRegister)
  .post(
    "/register",
    body("name").isString().notEmpty(),
    body("email").isEmail().notEmpty(),
    body("whatsapp_number").isMobilePhone("any").notEmpty(),
    body("specialization").isString().notEmpty(),
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
  )
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

export { router as authRoutes };
