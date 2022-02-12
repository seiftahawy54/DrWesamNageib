import {
  getUserProfile,
  postUpdateUserImg,
} from "../controllers/user/user.mjs";
import { Router } from "express";

const router = Router();

router
  .get("/profile", getUserProfile)
  .post("/update-user-img", postUpdateUserImg);

export { router as userRoutes };
