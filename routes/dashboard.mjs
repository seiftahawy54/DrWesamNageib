import {
  getOverview,
  getCourses,
  getUsers,
  getMessages,
  getAddNewCourse,
  postAddNewCourse,
  postDeleteCourse,
} from "../controllers/dashboard.mjs";
import express from "express";
import { body } from "express-validator";

const router = express.Router();

router
  .get("/overview", getOverview)
  .get("/courses", getCourses)
  .get("/users", getUsers)
  .get("/messages", getMessages)
  .get("/add-new-course", getAddNewCourse)
  .post(
    "/add-new-course",
    body("name").isString().notEmpty(),
    body("price").isNumeric().notEmpty(),
    postAddNewCourse
  )
  .post("/delete-course", postDeleteCourse);

export { router as dashboardRoutes };
