import { Router } from "express";
import discountsControllers from "../../controllers/dashboard/discounts.js";
import {body} from 'express-validator';

const discountsRouter = Router();

// /GET discounts
discountsRouter
  .get("/", discountsControllers.getDiscountsPage)
  .get("/courses", discountsControllers.getCoursesToDiscounts)

// /POST discounts
discountsRouter
    .post("/", [
        body("discountPercentage").isNumeric().notEmpty(),
        body("discountCode").isString().notEmpty(),
        body("status").isBoolean().notEmpty(),
    ], discountsControllers.postAddNewDiscount)


export default discountsRouter;
