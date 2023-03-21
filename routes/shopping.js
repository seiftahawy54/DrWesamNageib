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
  getHomepageApi,
  getAboutPageDataApi,
} from "../controllers/shop.js";
import express from "express";
import { body } from "express-validator";
import { isAuthenticated } from "../middlewares/isAdminAuth.js";

const router = express.Router();

// EJS shopping routes
router
  .get("/", getHomePage)
  .get("/aboutus", getAboutPage)
  .get("/api/aboutus", getAboutPageDataApi)
  .get("/download_cv", downloadCV)

export default router;
