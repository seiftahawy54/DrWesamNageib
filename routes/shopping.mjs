import {
  getContactPage,
  getAboutPage,
  getHomePage,
  getShoppingCart,
  downloadCV,
} from "../controllers/shop.mjs";
import express from "express";

const router = express.Router();

router
  .get("/", getHomePage)
  .get("/aboutme", getAboutPage)
  .get("/download_cv", downloadCV)
  .get("/contact", getContactPage)
  .get("/cart", getShoppingCart);

export { router as shoppingRoutes };
