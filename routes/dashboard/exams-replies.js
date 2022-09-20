import { Router } from "express";
import {
  getAllReplies,
  getRepliesForExam,
  postDeleteReply,
  postDeleteExamReplies,
} from "../../controllers/dashboard/exams-replies/exams-replies.js";

export default Router()
  .get("/", getAllReplies)
  .post("/delete-exam-replies", postDeleteExamReplies)
  .post("/delete-exams-replies", postDeleteReply)
  .get("/:examId", getRepliesForExam);
