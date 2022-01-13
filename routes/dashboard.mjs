import {
  getOverview,
  getCourses,
  getUsers,
  getMessages,
  getAddNewCourse,
  postAddNewCourse,
  postDeleteCourse,
  postDeleteUser,
  getEditCourse,
  postUpdateCourse,
  getUpdateUser,
  postUpdateUser,
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
  .get("/edit-course/:courseId", getEditCourse)
  .post("/delete-course", postDeleteCourse)
  .post("/delete-user", postDeleteUser)
  .post("/edit-course/:courseId", postUpdateCourse)
  .get("/edit-user/:userId", getUpdateUser)
  .post("/edit-user/:userId", postUpdateUser);

export { router as dashboardRoutes };
