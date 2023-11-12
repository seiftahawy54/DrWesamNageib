import { Router } from "express";
import { addNewDiscount, getDiscountsPage, getUpdateDiscount, postAddNewDiscount, postDeleteDiscount, postUpdateDiscount } from "../../controllers/dashboard/discounts.js";
import { body } from "express-validator";

const discountsRouter = Router();

discountsRouter
  .get("/", getDiscountsPage)
  .get("/add-new-discounts", addNewDiscount)
  .post(
    "/add-new-discount",
    [
      body("discount_course").notEmpty(),
      body("discount_percentage").isNumeric(),
      body("coupon_name").notEmpty().isString(),
    ],
    postAddNewDiscount
  )
  .get("/edit-discount/:discountId", getUpdateDiscount)
  .post(
    "/edit-discount",
    [
      body("discount_percentage").isNumeric(),
      body("coupon_name").notEmpty().isString(),
    ],
    postUpdateDiscount
  )
  .post("/delete-discounts", postDeleteDiscount);


export default discountsRouter;