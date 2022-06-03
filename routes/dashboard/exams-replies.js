import { Router } from "express";
import {
  getAllReplies,
  getRepliesForExam,
  postDeleteReply,
} from "../../controllers/dashboard/exams-replies/exams-replies.js";

export default Router()
  .get("/", getAllReplies)
  .post("/delete-exams-replies", postDeleteReply)
  .get("/:examId", getRepliesForExam);
