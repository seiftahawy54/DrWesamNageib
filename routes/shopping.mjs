import {getContactPage, getAboutPage, getHomePage, getShoppingCart } from "../controllers/shop.mjs";
import express from "express";
const router = express.Router();

router
  .get("/", getHomePage)
  .get("/aboutme", getAboutPage)
  .get("/contact", getContactPage)
  .get("/cart", getShoppingCart);

export { router as shoppingRoutes};
