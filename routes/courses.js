import {
  getIndex,
  singleCourse,
  addCourseToCart,
  getCoursesCategories,
  getAllCoursesData,
} from "../controllers/courses.js";
import express from "express";
import { isUserAuthenticated } from "../middlewares/user-auth.js";
import { body } from "express-validator";

const router = express.Router();

router
  .get("/", getIndex)
  .get("/courses-categories", getCoursesCategories)
  .get("/all-courses", getAllCoursesData)
  .get("/:courseId", singleCourse)
  .post(
    "/addToCart",
    [body("selected_round").notEmpty()],
    isUserAuthenticated,
    addCourseToCart
  );

export { router as coursesRoutes };
