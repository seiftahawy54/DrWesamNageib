import {
  getUserProfile,
  postUpdateUserImg,
  getUpdateUserData,
  getUserCertificate,
  postUpdateUserData,
} from "../controllers/user/user.js";
import { Router } from "express";
import { body } from "express-validator";

const router = Router();

router
  .get("/profile", getUserProfile)
  .post("/update-user-img", postUpdateUserImg)
  .get("/update-data/:userId", getUpdateUserData)
  .post(
    "/update-data",
    [
      body("email").isEmail().notEmpty(),
      body("whatsapp_number").isMobilePhone("any").notEmpty(),
      body("specialization").isString().notEmpty(),
    ],
    postUpdateUserData
  )
  .get("/certificates/:courseId", getUserCertificate);

export { router as userRoutes };
