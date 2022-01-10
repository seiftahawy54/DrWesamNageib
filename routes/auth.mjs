import {
  getCancelled,
  getCompletePayment,
  getLogin,
  getRegister,
  getSuccess,
  postCreateOrder,
  postRegister,
} from "../controllers/auth.mjs";
import { Router } from "express";

const router = Router();

router
  .get("/login", getLogin)
  .get("/register", getRegister)
  .post("/register", postRegister)
  .get("/success_payment", getSuccess)
  .get("/cancel_payment", getCancelled)
  .get("/complete-payment", getCompletePayment)
  .post("/create-order", postCreateOrder);

export { router as authRoutes };
