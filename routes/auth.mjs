import {
  getCancelled,
  getCompletePayment,
  getLogin,
  getRegister,
  postCreateOrder,
  postRegister,
  postSuccess,
} from "../controllers/auth.mjs";
import { Router } from "express";

const router = Router();

router
  .get("/login", getLogin)
  .get("/register", getRegister)
  .post("/register", postRegister)
  .post("/success_payment", postSuccess)
  .post("/cancel_payment", getCancelled)
  .get("/complete-payment", getCompletePayment)
  .post("/create-order", postCreateOrder);

export { router as authRoutes };
