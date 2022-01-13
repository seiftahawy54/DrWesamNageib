import {
  getContactPage,
  getAboutPage,
  getHomePage,
  getShoppingCart,
  downloadCV,
  postContactPage,
} from "../controllers/shop.mjs";
import express from "express";
import { body } from "express-validator";

const router = express.Router();

router
  .get("/", getHomePage)
  .get("/aboutme", getAboutPage)
  .get("/download_cv", downloadCV)
  .get("/contact", getContactPage)
  .get("/cart", getShoppingCart)
  .post(
    "/contact",
    [
      body("contact_name").isString().notEmpty(),
      body("contact_email").isEmail().notEmpty(),
      body("contact_content").isString().isLength({
        min: 80,
      }),
    ],
    postContactPage
  );

export { router as shoppingRoutes };
