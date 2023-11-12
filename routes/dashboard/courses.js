import {
    getAddNewCourse,
    getCourses,
    getEditCourse,
    postAddNewCourse,
    postDeleteCourse,
    postUpdateCourse,
} from "../../controllers/dashboard/courses.js";
import {body} from "express-validator";
import {Router} from "express";
import {upload} from "../../middlewares/multer.js";

const courseObjectValidation = [
    body("courseName").isString().notEmpty(),
    body("arCourseName").isString().notEmpty(),
    body("coursePrice").isNumeric().notEmpty(),
    body("courseRank").isNumeric().notEmpty(),
    body("courseThumbnail").isString().notEmpty(),
    body("courseDescription").isString().notEmpty(),
    body("isSpecial").isString().notEmpty(),
    body("courseTotalHours").isString().isLength({min: 1}),
    body("courseCategory").isString().isLength({min: 5}),
]
export default Router()
    .get("/", getCourses)
    .get("/:courseId", getEditCourse)
    .post(
        "/",
        upload().fields([
            {
                name: 'mainImg',
                maxCount: 1,
            },
            {
                name: 'briefImg',
                maxCount: 1
            }
        ]),
        courseObjectValidation,
        postAddNewCourse
    )
    .delete("/:courseId", postDeleteCourse)
    .put(
        "/:courseId",
        upload().fields([
            {
                name: 'mainImg',
                maxCount: 1,
                required: false,
            },
            {
                name: 'briefImg',
                maxCount: 1,
                required: false,
            }
        ]),
        courseObjectValidation,
        postUpdateCourse
    );
