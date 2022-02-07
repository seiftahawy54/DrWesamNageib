import {
  getContactPage,
  getAboutPage,
  getHomePage,
  getShoppingCart,
  downloadCV,
  postContactPage,
  getOpinionsPage,
  postOpinions,
  getOpinionsForm,
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
  )
  .get("/opinions", getOpinionsPage)
  .get("/opinions_form", getOpinionsForm)
  .post(
    "/opinions",
    [
      body("name").isString().notEmpty(),
      body("email").isEmail().notEmpty(),
      body("sender_course").isString().notEmpty(),
      body("opinion").isString().notEmpty(),
    ],
    postOpinions
  );

export { router as shoppingRoutes };
