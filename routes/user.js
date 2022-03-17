import {
  getUserProfile,
  postUpdateUserImg,
  getUpdateUserData,
  getUserCertificate,
} from "../controllers/user/user.js";
import { Router } from "express";

const router = Router();

router
  .get("/profile", getUserProfile)
  .post("/update-user-img", postUpdateUserImg)
  .get("/update-user-data", getUpdateUserData)
  .get("/certificates/:courseId", getUserCertificate);

export { router as userRoutes };
