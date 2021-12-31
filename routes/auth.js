const coursesControllers = require("../controllers/auth")
const express = require("express")

const router = express.Router();

router.get('/login', coursesControllers.getLogin)

exports.routes = router;

