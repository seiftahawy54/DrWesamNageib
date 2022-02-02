import {
  getOverview,
  getMessages,
  postDeleteMessage,
  getOpinionsPage,
  postDeleteOpinion,
  getAboutPage,
} from "../controllers/dashboard/dashboard.mjs";

import {
  getUsers,
  postDeleteUser,
  getUpdateUser,
  postUpdateUser,
} from "../controllers/dashboard/d_users.mjs";

import {
  getCourses,
  getAddNewCourse,
  postAddNewCourse,
  postDeleteCourse,
  getEditCourse,
  postUpdateCourse,
} from "../controllers/dashboard/d_courses.mjs";

import express from "express";
import { body } from "express-validator";

const router = express.Router();

router
  .get("/", (req, res) => {
    res.redirect("/dashboard/overview");
  })
  .get("/overview", getOverview)
  .get("/courses", getCourses)
  .get("/users", getUsers)
  .get("/messages", getMessages)
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
      body("course_img").notEmpty(),
    ],
    postAddNewCourse
  )
  .get("/edit-course/:courseId", getEditCourse)
  .post("/delete-course", postDeleteCourse)
  .post("/edit-course/:courseId", postUpdateCourse)
  .post("/delete-user", postDeleteUser)
  .get("/edit-user/:userId", getUpdateUser)
  .post("/edit-user/:userId", postUpdateUser)
  .post("/delete-message", postDeleteMessage)
  .get("/opinions", getOpinionsPage)
  .post("/delete-opinion", postDeleteOpinion)
  .get("/about", getAboutPage);
//
export { router as dashboardRoutes };
