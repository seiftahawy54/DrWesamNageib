import {
  getAboutPage,
  getHomePage,
  downloadCV,
  getAboutPageDataApi,
} from "../controllers/shop.js";
import express from "express";

const router = express.Router();

// EJS shopping routes
router
  .get("/", getHomePage)
  .get("/aboutus", getAboutPage)
  .get("/download_cv", downloadCV)

export default router;
