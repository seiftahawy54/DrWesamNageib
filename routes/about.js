const aboutControllers = require("../controllers/about")
const express = require("express")

const router = express.Router();

router.get('/', aboutControllers.getIndex);

exports.routes = router;
