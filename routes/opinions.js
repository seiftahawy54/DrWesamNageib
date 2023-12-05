import {Router} from "express";
import {body} from "express-validator";
import {getOpinionsForm, postOpinions} from "../controllers/shop.js";
import {isUserAuthenticated} from "../middlewares/user-auth.js";

const opinionsRoutes = Router();

/*
{
    "name": "Testing",
    "email": "test@test.com",
    "whatsappNumber": "01142134559",
    "opinion": "This is a really good course",
    "course": "93ed71f10c7f993702e1"
}
*/

opinionsRoutes
    .post(
        "/",
        [
            body("name").isString().notEmpty(),
            body("email").isString().notEmpty(),
            body("whatsappNumber").isNumeric().notEmpty(),
            body("opinion").isString().notEmpty(),
            body("course").isString().notEmpty(),
        ],
        postOpinions
    );

const router = Router().use("/", opinionsRoutes);

export default router;
