import {Router} from "express";
import publicExams from "../controllers/exams/public-exams.js";

const router = Router();

router.post("/saveProgress", publicExams.postSaveProgress)

export default router;
