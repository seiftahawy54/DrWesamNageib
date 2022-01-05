import {getLogin, getRegister} from "../controllers/auth.mjs"
import express from "express"

const router = express.Router();

router.get('/login', getLogin)
router.get('/register', getRegister)

export { router as authRoutes };
