import {Router} from "express";
import {
    getAllReplies,
    getRepliesForExam,
    postDeleteReply,
    postDeleteAllExamReplies,
} from "../../controllers/dashboard/exams-replies/exams-replies.js";

export default Router()
    .get("/", getAllReplies)
    .delete("/:examId", postDeleteAllExamReplies)
    .delete("/reply/:replyId", postDeleteReply)
    .get("/exam/:examId", getRepliesForExam);
