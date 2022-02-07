import { getUserProfile } from "../controllers/user/user.mjs";
import { Router } from "express";

const router = Router();

router.get("/profile", getUserProfile);

export { router as userRoutes };
