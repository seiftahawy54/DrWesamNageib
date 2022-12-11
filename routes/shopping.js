import {
  getContactPage,
  getAboutPage,
  getHomePage,
  getShoppingCart,
  downloadCV,
  postContactPage,
  postOpinions,
  getOpinionsForm,
  postDeleteFromCart,
  getAllOpinions,
} from "../controllers/shop.js";
import express from "express";
import { body } from "express-validator";
import { isAuthenticated } from "../middlewares/dashboard-auth.js";

const router = express.Router();

router
  .get("/", getHomePage)
  .get("/all-opinions", getAllOpinions)
  .get("/aboutus", getAboutPage)
  .get("/download_cv", downloadCV)
  .get("/contact", getContactPage)
  .get("/cart", getShoppingCart)
  .post(
    "/contact",
    [
      body("contact_name").isString().notEmpty(),
      body("contact_email").isEmail().notEmpty(),
      body("contact_content").isString().isLength({
        min: 10,
      }),
    ],
    postContactPage
  )
  .get("/opinions", (req, res, next) => res.redirect("/opinions_form"))
  .get("/opinions_form", getOpinionsForm)
  .post(
    "/opinions_form",
    [
      body("name")
        .isString()
        .notEmpty()
        .trim()
        .custom((value) => {
          if (value === "Henryimmob") {
            return false;
          }
        }),
      body("email").isEmail().notEmpty(),
      body("sender_course").isString().notEmpty(),
      // body("date").isDate().notEmpty(),
      body("opinion").isString().notEmpty(),
    ],
    postOpinions
  )
  .post("/delete_from_cart", postDeleteFromCart);

export { router as shoppingRoutes };
