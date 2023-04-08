import {
  getAddNewCourse,
  getCourses,
  getEditCourse,
  postAddNewCourse,
  postDeleteCourse,
  postUpdateCourse,
} from "../../controllers/dashboard/d_courses.js";
import { body } from "express-validator";
import { Router } from "express";

export default Router()
  .get("/", getCourses)
  .post(
    "/",
    // upload.any("course_img", "detailed_img"),
    [
      body("name").isString().notEmpty(),
      body("price").isNumeric().notEmpty(),
      body("arabic_name").isString().notEmpty(),
      body("course_rank").isNumeric().notEmpty(),
      body("thumbnail").isString().notEmpty(),
      body("description").isString().notEmpty(),
      body("special_course").isString().notEmpty(),
      body("total_hours").isString().isLength({ min: 1 }),
      body("course_category").isString().isLength({ min: 5 }),
      // body("course_img").notEmpty(),
      // body("detailed_img").notEmpty(),
    ],
    postAddNewCourse
  )
  .get("/:courseId", getEditCourse)
  .delete("/:courseId", postDeleteCourse)
  .put(
    "/:courseId",
    // upload.any("course_img", "detailed_img"),
    [
      body("name").isString().notEmpty(),
      body("price").isNumeric().notEmpty(),
      body("arabic_name").isString().notEmpty(),
      body("course_rank").isNumeric().notEmpty(),
      body("thumbnail").isString().notEmpty(),
      body("description").isString().notEmpty(),
    ],
    postUpdateCourse
  );
