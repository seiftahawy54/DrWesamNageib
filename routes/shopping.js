const shoppingControllers = require("../controllers/shop");
const express = require('express');
const router = express.Router();

router
  .get("/", shoppingControllers.getHomePage)
  .get("/aboutme", shoppingControllers.getAboutPage)
  .get("/contact", shoppingControllers.getContactPage)
  .get("/cart", shoppingControllers.getShoppingCart)

exports.routes = router;