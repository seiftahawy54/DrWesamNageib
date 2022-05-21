import { Router } from "express";
import {
  getAllReplies,
  postDeleteReply,
} from "../../controllers/dashboard/exams-replies/exams-replies.js";

const router = Router();

router.get("/", getAllReplies).post("/delete-exams-replies", postDeleteReply);

export default router;
