import {Router} from "express";
import discountsControllers from "../../controllers/dashboard/discounts.js";
import {body} from 'express-validator';

const discountsRouter = Router();

const discountValidation = [
    body("discountPercentage").isNumeric().notEmpty(),
    body("discountCode").isString().notEmpty(),
    body("status").isBoolean().notEmpty(),
]

// /GET discounts
discountsRouter
    .get('/:discountId', discountsControllers.getSingleDiscountData)
    .get("/", discountsControllers.getDiscountsPage)
    .get("/courses", discountsControllers.getCoursesToDiscounts)

// /POST discounts
discountsRouter
    .post("/", ...discountValidation, discountsControllers.postAddNewDiscount)

// /PUT discounts
discountsRouter
    .put("/:discountId", ...discountValidation, discountsControllers.putUpdateDiscount)


export default discountsRouter;
