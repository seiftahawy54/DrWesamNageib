import {
  getUserProfile,
  postUpdateUserImg,
  getUpdateUserData,
  getUserCertificate,
  postUpdateUserData,
  getPerformExam,
  postPerformExam,
  getSubmittedExam,
  getExamPreview,
  getAllUserData,
  getBoughtCourses,
  getUserRound,
  getUserGrades,
  getUserProfileCertificate,
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
  .get("/certificates/:courseId", getUserCertificate)
  .get("/exam/submitted-exam", getSubmittedExam)
  .get("/exam/:examId", getPerformExam)
  .post(
    "/exam",
    [
      body("userAnswers").isArray().isLength({ min: 1 }),
      body("userAnswers.*").isObject(),
      body("userAnswers.*.*")
        .isNumeric({ no_symbols: true })
        .optional({ nullable: true }),
      body("examId").isString().isLength({ min: 36, max: 36 }),
    ],
    postPerformExam
  )
  .get("/exam/preview/:examId/:userId/:replyIndex", getExamPreview)
  .get("/user-data", getAllUserData)
  .get("/user-payments", getBoughtCourses)
  .get("/user-round", getUserRound)
  .get("/user-grades", getUserGrades)
  .get("/user-certificates", getUserProfileCertificate);

export { router as userRoutes };
