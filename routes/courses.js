const coursesControllers = require("../controllers/courses")
const express = require("express")

const router = express.Router();

router.get('/', coursesControllers.getIndex)
router.get('/:courseId', coursesControllers.singleCourse)

exports.routes = router;

