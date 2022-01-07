import {
  getIndex,
  singleCourse,
  addCourseToCart,
} from "../controllers/courses.mjs";
import express from "express";

const router = express.Router();

router
  .get("/", getIndex)
  .get("/:courseId", singleCourse)
  .post("/addToCart", addCourseToCart);

export { router as coursesRoutes };
