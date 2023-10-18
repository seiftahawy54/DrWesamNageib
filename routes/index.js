import {Router} from "express";
import UserRoutes from "./user.js";
import AuthRoutes from "./auth.js";
import HomeRoutes from "./home.js";
import CoursesRoutes from "./courses.js";
import AboutRoutes from "./about-us.js";
import OpinionsRoutes from './opinions.js'
import DashboardRoutes from './dashboard.js';
import ContentsRoutes from './content.js';
import PaymentRoutes from './payment.js';
import CertificatesRoutes from './certificates.js';
import {isAdminAuthenticated, isModeratorAuthenticated, isUserAuthenticated} from "../middlewares/user-auth.js";

const router = Router();

router
    .use("/auth", AuthRoutes)
    .use("/courses", CoursesRoutes)
    .use("/profile", isUserAuthenticated, UserRoutes)
    .use("/home", HomeRoutes)
    .use("/aboutUs", AboutRoutes)
    .use("/opinions", OpinionsRoutes)
    .use("/certificates", CertificatesRoutes)
    .use('/payment', isUserAuthenticated, PaymentRoutes)
    .use("/contents", isUserAuthenticated, ContentsRoutes)
    .use("/dashboard", isUserAuthenticated, isModeratorAuthenticated, DashboardRoutes)

export default router;
