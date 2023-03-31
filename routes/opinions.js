import { Router } from "express";
import { body } from "express-validator";
import { getOpinionsForm, postOpinions } from "../controllers/shop.js";

const opinionsRoutes = Router();

opinionsRoutes
  .get("/form", getOpinionsForm)
  .post(
    "/",
    [
      body("name").isString().notEmpty().trim(),
      body("email").isEmail().notEmpty(),
      body("sender_course").isString().notEmpty(),
      body("opinion").isString().notEmpty(),
    ],
    postOpinions
  );

const router = Router().use("/", opinionsRoutes);

export default router;
