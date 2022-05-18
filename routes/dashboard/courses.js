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

const router = Router();

router
  .get("/", getCourses)
  .get("/add-new-course", getAddNewCourse)
  .post(
    "/add-new-course",
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
  .get("/edit-course/:courseId", getEditCourse)
  .post("/delete-courses", postDeleteCourse)
  .post(
    "/edit-course/:courseId",
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
    ],
    postUpdateCourse
  );

export default router;
