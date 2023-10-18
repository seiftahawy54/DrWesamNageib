import { Router } from "express";
import {
  getOpinionsPage,
  getUpdateOpinion,
  postDeleteOpinion,
  postUpdateOpinion,
} from "../../controllers/dashboard/dashboard.js";
import { body } from "express-validator";

const opinionsRoutes = Router();

opinionsRoutes
  .get("/", getOpinionsPage)
  .get("/edit-opinion/:opinionId", getUpdateOpinion)
  .post(
    "/edit-opinion",
    [
      body("sender_name").isString().notEmpty(),
      body("sender_email").isEmail().notEmpty(),
      body("sender_course").isString().notEmpty(),
      body("opinion").isString().notEmpty(),
    ],
    postUpdateOpinion
  )
  .post("/delete-opinion", postDeleteOpinion);

export default opinionsRoutes;
