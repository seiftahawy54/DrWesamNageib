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
} from "../controllers/dashboard/users/d_users.js";

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
import {
  addNewDiscount,
  getDiscountsPage,
  postAddNewDiscount,
  postDeleteDiscount,
  postUpdateDiscount,
  getUpdateDiscount,
} from "../controllers/dashboard/discounts.js";

import DashboardUsersRoutes from "./dashboard/users.js";
import DashboardRoundsRoutes from "./dashboard/rounds.js";
import DashboardExamsRoutes from "./dashboard/exams.js";

const router = express.Router();

router
  .get("/", (req, res) => res.status(301).redirect("/dashboard/overview"))
  .get("/overview", getOverview)
  .use("/users", DashboardUsersRoutes)
  .use("/rounds", DashboardRoundsRoutes)
  .use("/exams", DashboardExamsRoutes)
  .get("/courses", getCourses)
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

  .get("/discounts", getDiscountsPage)
  .get("/discounts/add-new-discounts", addNewDiscount)
  .post(
    "/discounts/add-new-discount",
    [
      body("discount_course").notEmpty(),
      body("discount_percentage").isNumeric(),
      body("coupon_name").notEmpty().isString(),
    ],
    postAddNewDiscount
  )
  .get("/discount/edit-discount/:discountId", getUpdateDiscount)
  .post(
    "/discounts/edit-discount",
    [
      body("discount_percentage").isNumeric(),
      body("coupon_name").notEmpty().isString(),
    ],
    postUpdateDiscount
  )
  .post("/discount/delete-discount", postDeleteDiscount);

export { router as dashboardRoutes };
