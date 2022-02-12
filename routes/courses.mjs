import {
  getIndex,
  singleCourse,
  addCourseToCart,
} from "../controllers/courses.mjs";
import express from "express";
import { isUserAuthenticated } from "../middlewares/user-auth.mjs";

const router = express.Router();

router
  .get("/", getIndex)
  .get("/:courseId", singleCourse)
  .post("/addToCart", isUserAuthenticated, addCourseToCart);

export { router as coursesRoutes };
