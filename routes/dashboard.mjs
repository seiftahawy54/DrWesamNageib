import {
  getOverview,
  getCourses,
  getUsers,
} from "../controllers/dashboard.mjs";
import { isAuthenticated } from "../middlewares/dashboard-auth.mjs";
import express from "express";

const router = express.Router();

router
  .get("/overview", isAuthenticated, getOverview)
  .get("/courses", isAuthenticated, getCourses)
  .get("/users", isAuthenticated, getUsers);

export { router as dashboardRoutes };
