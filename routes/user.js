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
import { upload } from "../middlewares/multer.js";
import { Router } from "express";
import { body } from "express-validator";

const userProfileRoutes = Router();
const examsRoutes = Router();
const certificatesRoutes = Router();

userProfileRoutes
  .get("/", getUserProfile)
  .post("/update-profile-img", upload().single("user_img"), postUpdateUserImg)
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
  .get("/certificates", getUserProfileCertificate)
  .get("/data", getAllUserData)
  .get("/payments", getBoughtCourses)
  .get("/round", getUserRound);

//-----------------------------------------------
// Certificates routes
//-----------------------------------------------
certificatesRoutes.get("/:courseId", getUserCertificate);

//-----------------------------------------------
// User exams performance routes
//-----------------------------------------------
examsRoutes
  .get("/submitted-exam", getSubmittedExam)
  .get("/:examId", getPerformExam)
  .post(
    "/",
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
  .get("/grades", getUserGrades);

const usersRoutes = Router()
  .use("/", userProfileRoutes)
  .use("/certificates", certificatesRoutes)
  .use("/exams", examsRoutes);

export default usersRoutes;
