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
} from "../controllers/auth.mjs";
import { Router } from "express";
import { body } from "express-validator";

const router = Router();

router
  .get("/login", getLogin)
  .post(
    "/login",
    body("email")
      .isEmail()
      .custom((value, { req }) => {
        return value === "admin@wesam.com";
      }),
    body("password").custom((value, { req }) => {
      return value === "wesam@wesam.com";
    }),
    postLogin
  )
  .post("/logout", postLogout)
  .get("/register", getRegister)
  .post(
    "/register",
    body("name").isString().notEmpty(),
    body("email").isEmail().notEmpty(),
    body("whatsapp_number").isMobilePhone("any").notEmpty(),
    body("specialization").isString().notEmpty(),
    postRegister
  )
  .get("/success_payment", getSuccess)
  .post("/success_payment", postSuccess)
  .post("/cancel_payment", getCancelled)
  .get("/complete-payment", getCompletePayment)
  .post("/create-order", postCreateOrder);

export { router as authRoutes };
