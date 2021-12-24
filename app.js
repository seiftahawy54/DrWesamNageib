require("dotenv").config();

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const courses = require("./routes/courses");
const shopping = require("./routes/shopping");

app.use("/courses", courses.routes);
app.use("/", shopping.routes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
});