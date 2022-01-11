import { getOverview } from "../controllers/dashboard.mjs";
import express from "express";

const router = express.Router();

router.get("/overview", getOverview);

export { router as dashboardRoutes };
