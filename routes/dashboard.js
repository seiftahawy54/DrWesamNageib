import {getOverview, getStatistics} from "../controllers/dashboard/dashboard.js";

import {getPaymentsPage} from "../controllers/dashboard/payments.js";
import express from "express";

import UsersRoutes from "./dashboard/users.js";
import RoundsRoutes from "./dashboard/rounds.js";
import ExamsRoutes from "./dashboard/exams.js";
import CoursesRoutes from "./dashboard/courses.js";
import ExamsRepliesRoutes from "./dashboard/exams-replies.js";
import AboutRoutes from "./dashboard/about.js";
import DiscountsRoutes from "./dashboard/discounts.js";
import MessagesRoutes from "./dashboard/messages.js";
import opinionsRoutes from "./dashboard/opinions.js";
import ContentRoutes from "./dashboard/content.js";

const allDashboardRoutes = express.Router();

allDashboardRoutes
    .get("/statistics", getStatistics)
    .use("/users", UsersRoutes)
    .use("/rounds", RoundsRoutes)
    .use("/exams", ExamsRoutes)
    .use("/courses", CoursesRoutes)
    .use("/exams-replies", ExamsRepliesRoutes)
    .use("/about", AboutRoutes)
    .use("/discounts", DiscountsRoutes)
    .use("/opinions", opinionsRoutes)
    .use("/messages", MessagesRoutes)
    .use("/contents", ContentRoutes)
    .get("/payments", getPaymentsPage);

export default allDashboardRoutes;
