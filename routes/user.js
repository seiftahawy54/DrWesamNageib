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
import { globalAccess } from "../middlewares/dashboard-auth.js";
import { isUserAuthenticated } from "../middlewares/user-auth.js";

const router = Router();

// router.use(globalAccess).get("/exams/preview/:replyId", getExamPreview);

router
  .use(isUserAuthenticated)
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
  .get("/user-data", getAllUserData)
  .get("/user-payments", getBoughtCourses)
  .get("/user-round", getUserRound)
  .get("/user-grades", getUserGrades)
  .get("/user-certificates", getUserProfileCertificate);

export { router as userRoutes };
