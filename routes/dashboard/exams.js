import { Router } from "express";
import {
  getAllExams,
  getAddNewExam,
  startNewExam,
  getUpdateExam,
  postDeleteExam,
  postUpdateExam,
  postAddingExamImage,
  deleteExamImage,
} from "../../controllers/dashboard/exams/exams.js";
import { body } from "express-validator";

const router = Router();

router
  .get("/", getAllExams)
  .get("/add-new-exams", getAddNewExam)
  .get("/edit-exam/:examId", getUpdateExam)
  .post(
    "/edit-exam",
    body("examTitle").isString().isLength({ min: 5 }),
    body("examStatus").isBoolean(),
    body("examId").isString().isLength({ min: 36 }),
    // body("questions").isArray(),
    // body("questions.*?.questionHeader").isString().trim().isLength({ min: 5 }),
    // body("questions.*?.answers").isArray(),
    // body("questions.*?.answers.*").isString().trim(),
    // body("questions.*?.correctAnswer").isString().isLength({ min: 1, max: 1 }),
    // body("questions.*?.examImage").isString().isLength({ min: 10 }),
    postUpdateExam
  )
  .post(
    "/start-new-exam",
    [
      body("examTitle").isString().isLength({ min: 5 }),
      body("examStatus").isBoolean(),
      body("questions").isArray(),
      // body("questions.*?.questionHeader").isString().isLength({ min: 5 }),
      // body("questions.*?.answers").isArray(),
      // body("questions.*?.answers.*").isString(),
      // body("questions.*?.correctAnswer")
      //   .isString()
      //   .isLength({ min: 1, max: 1 }),
      // body("questions.*?.examImage").isString().isLength({ min: 10 }),
    ],
    startNewExam
  )
  .post("/delete-exams", postDeleteExam)
  .post("/exam-image", postAddingExamImage)
  .post(
    "/delete-exam-image",
    [body("imageId").isString().isLength({ min: 36 })],
    deleteExamImage
  );

export default router;
