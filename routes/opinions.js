import {Router} from "express";
import {body} from "express-validator";
import {getOpinionsForm, postOpinions} from "../controllers/shop.js";
import {isUserAuthenticated} from "../middlewares/user-auth.js";

const opinionsRoutes = Router();

opinionsRoutes
    .get("/form", getOpinionsForm)
    .post(
        "/",
        isUserAuthenticated,
        [
            body("course").isString().notEmpty(),
            body("opinion").isString().notEmpty(),
            body("rate").isNumeric().notEmpty(),
        ],
        postOpinions
    );

const router = Router().use("/", opinionsRoutes);

export default router;
