import {
  getIndex,
  singleCourse,
  addCourseToCart,
} from "../controllers/courses.mjs";
import express from "express";
import { isUserAuthenticated } from "../middlewares/user-auth.mjs";
import { body } from "express-validator";

const router = express.Router();

router
  .get("/", getIndex)
  .get("/:courseId", singleCourse)
  .post(
    "/addToCart",
    [body("selected_round").notEmpty()],
    isUserAuthenticated,
    addCourseToCart
  );

export { router as coursesRoutes };
