import { Router } from "express";
import { getHomepageApi } from "../controllers/shop";

const homeRouter = Router();

homeRouter.get("/", getHomepageApi);

const router = Router().use("/home", getHomepageApi);

export default router;