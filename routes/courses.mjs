import { getIndex, singleCourse } from "../controllers/courses.mjs"
import express from "express"

const router = express.Router();

router.get("/", getIndex);
router.get("/:courseId", singleCourse);

export {router as coursesRoutes};
