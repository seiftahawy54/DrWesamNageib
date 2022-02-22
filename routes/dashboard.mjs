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

import { getPaymentsPage } from "../controllers/dashboard/payments.mjs";
import express from "express";
import { body } from "express-validator";
import {
  getRounds,
  getStartNewRound,
  getUpdateRound,
  postAddNewRound,
  postDeleteRound,
  postUpdateRound,
} from "../controllers/dashboard/d_rounds.mjs";
import { isAuthenticated } from "../middlewares/dashboard-auth.mjs";

const router = express.Router();

router
  .get("/", (req, res) => {
    res.redirect("/dashboard/overview");
  })
  .get("/overview", isAuthenticated, getOverview)
  .get("/courses", isAuthenticated, getCourses)
  .get("/users", isAuthenticated, getUsers)
  .get("/messages", isAuthenticated, getMessages)
  .get("/add-new-course", isAuthenticated, getAddNewCourse)
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
  .get("/edit-course/:courseId", isAuthenticated, getEditCourse)
  .post("/delete-course", postDeleteCourse)
  .post("/edit-course/:courseId", postUpdateCourse)
  .post("/delete-user", postDeleteUser)
  .get("/edit-user/:userId", isAuthenticated, getUpdateUser)
  .post("/edit-user/:userId", postUpdateUser)
  .post("/delete-message", postDeleteMessage)
  .get("/opinions", isAuthenticated, getOpinionsPage)
  .get("/edit-opinion/:opinionId", isAuthenticated, getUpdateOpinion)
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
  .get("/about", isAuthenticated, getAboutPage)
  .get("/add-new-about", isAuthenticated, getNewAbout)
  .post("/add-new-about", postAddNewAbout)
  .get("/payments", isAuthenticated, getPaymentsPage)
  .post("/delete-certificate", postDeleteCertificate)
  .get("/rounds", isAuthenticated, getRounds)
  .get("/start-new-round", isAuthenticated, getStartNewRound)
  .post(
    "/start-new-round",
    [body("round_course").notEmpty(), body("round_date").notEmpty()],
    postAddNewRound
  )
  .get("/edit-round/:roundId", isAuthenticated, getUpdateRound)
  .post(
    "/edit-round/:roundId",
    [body("round_date").notEmpty()],
    postUpdateRound
  )
  .post("/delete-round", postDeleteRound);
//
export { router as dashboardRoutes };
