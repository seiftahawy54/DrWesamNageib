import {Router} from "express";
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

import {body} from "express-validator";
import {fileUploader} from "../../middlewares/multer.js";

const router = Router();

router
    .get("/", getAllExams)
    .get("/add-new-exams", getAddNewExam)
    .get("/:examId", getUpdateExam)
    .put(
        `/edit-exam/:examId`,
        [
            body("examTitle").isString().isLength({min: 5}),
            body("examStatus").isBoolean(),
            body("questions").isArray().isLength({min: 1}),
            body("specialExam").isBoolean(),
            body("courseId").isString().isLength({min: 16}),
        ],
        postUpdateExam
    )
    .post(
        "/new-exam",
        [
            body("examTitle").isString().isLength({min: 5}),
            body("examStatus").isBoolean(),
            body("questions").isArray(),
            body("specialExam").isBoolean(),
            body("courseId").isString().isLength({min: 16})
        ],
        startNewExam
    )
    .delete("/:examId", postDeleteExam)
    .post("/exam-image", fileUploader.single('examImage'), postAddingExamImage)
    .post(
        "/delete-exam-image",
        [body("imageId").isString().isLength({min: 36})],
        deleteExamImage
    );

export default router;
