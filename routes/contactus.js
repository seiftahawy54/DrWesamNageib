const contactUsControllers = require("../controllers/contactus");

const express = require("express");
const router = express.Router();

router.get('/', contactUsControllers.getIndex);

exports.routes = router;