import { Router } from "express";
import UserRoutes from "./user.js";
import AuthRoutes from "./auth.js";
import { isUserAuthenticated } from "../middlewares/user-auth.js";

const router = Router();

router.use("/", isUserAuthenticated, UserRoutes);

export default router;
