import { Router } from "express";
import { getAllOpinions, getHomepageApi } from "../controllers/shop.js";

const homeRouter = Router();

homeRouter
.get("/", getHomepageApi);

const router = Router().use("/", getHomepageApi);

export default router;
