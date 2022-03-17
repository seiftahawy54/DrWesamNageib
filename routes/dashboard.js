import {
  getOverview,
  getMessages,
  postDeleteMessage,
  getOpinionsPage,
  postDeleteOpinion,
  getAboutPage,
  getNewAbout,
  postAddNewAbout,
  postDeleteCertificate,
  getUpdateOpinion,
  postUpdateOpinion,
} from "../controllers/dashboard/dashboard.js";

import {
  getUsers,
  postDeleteUser,
  getUpdateUser,
  postUpdateUser,
} from "../controllers/dashboard/d_users.js";

import {
  getCourses,
  getAddNewCourse,
  postAddNewCourse,
  postDeleteCourse,
  getEditCourse,
  postUpdateCourse,
} from "../controllers/dashboard/d_courses.js";

import { getPaymentsPage } from "../controllers/dashboard/payments.js";
import express from "express";
import { body } from "express-validator";
import {
  getRounds,
  getStartNewRound,
  getUpdateRound,
  postAddNewRound,
  postDeleteRound,
  postUpdateRound,
} from "../controllers/dashboard/d_rounds.js";
import { isAuthenticated } from "../middlewares/dashboard-auth.js";

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
      // body("course_img").notEmpty(),
      // body("detailed_img").notEmpty(),
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
  .post("/delete-opinion", postDeleteOpinion)
  .get("/about", getAboutPage)
  .get("/add-new-about", getNewAbout)
  .post("/add-new-about", postAddNewAbout)
  .get("/payments", getPaymentsPage)
  .post("/delete-certificate", postDeleteCertificate)
  .get("/rounds", getRounds)
  .get("/start-new-round", getStartNewRound)
  .post(
    "/start-new-round",
    [
      body("round_course").notEmpty(),
      body("round_date").notEmpty(),
      body("round_link").notEmpty(),
    ],
    postAddNewRound
  )
  .get("/edit-round/:roundId", getUpdateRound)
  .post(
    "/edit-round/:roundId",
    [body("round_date").notEmpty()],
    postUpdateRound
  )
  .post("/delete-round", postDeleteRound);
//
export { router as dashboardRoutes };
