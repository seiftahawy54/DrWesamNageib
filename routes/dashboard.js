import {
  getOverview,
  getMessages,
  postDeleteMessage,
  getOpinionsPage,
  postDeleteOpinion,
  getUpdateOpinion,
  postUpdateOpinion,
  postDeleteAllMessages,
} from "../controllers/dashboard/dashboard.js";

import { getPaymentsPage } from "../controllers/dashboard/payments.js";
import express from "express";
import { body } from "express-validator";
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
import DashboardCoursesRoutes from "./dashboard/courses.js";
import DashboardExamsRepliesRoutes from "./dashboard/exams-replies.js";
import DashboardAboutRoutes from "./dashboard/about.js";

const router = express.Router();

router
  .get("/", (req, res) => res.status(301).redirect("/dashboard/overview"))
  .get("/overview", getOverview)
  .use("/users", DashboardUsersRoutes)
  .use("/rounds", DashboardRoundsRoutes)
  .use("/exams", DashboardExamsRoutes)
  .use("/courses", DashboardCoursesRoutes)
  .use("/exams-replies", DashboardExamsRepliesRoutes)
  .use("/about", DashboardAboutRoutes)
  .get("/messages", getMessages)
  .post("/messages/delete-messages", postDeleteMessage)
  .post("/messages/delete-all-messages", postDeleteAllMessages)
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
  .get("/payments", getPaymentsPage)
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
  .get("/discounts/edit-discount/:discountId", getUpdateDiscount)
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
