import { Router } from "express"
import {
  getAllExams,
  getAddNewExam,
  startNewExam,
} from "../../controllers/dashboard/exams/exams.js"
import { body } from "express-validator"

const router = Router()

router
  .get("/", getAllExams)
  .get("/add-new-exams", getAddNewExam)
  .post("/start-new-exam",
    [
      body("questions").isArray(),
      body("questions.*.questionHeader").isString().isLength({ min: 5 }),
      body("questions.*.answers").isArray(),
      body("questions.*.answers.*").isString(),
      body("questions.*.correctAnswer").isString().isLength({ min: 1, max: 1 }),
    ], startNewExam)

export default router
