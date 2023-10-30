import {Router} from "express";
import {
    getAllReplies,
    getRepliesForExam,
    postDeleteReply,
    postDeleteAllExamReplies,
} from "../../controllers/dashboard/exams-replies/exams-replies.js";

export default Router()
    .get("/", getAllReplies)
    .delete("/replies/:replyId", postDeleteReply)
    .delete("/:examId", postDeleteAllExamReplies)
    .get("/exam/:examId", getRepliesForExam);
