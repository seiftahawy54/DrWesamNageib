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
const about = require("./routes/about")

app.get("/", (req, res, next) => {
  res.render("home/home.ejs", {
    title: "Homepage",
    path: "/"
    });
});

app.use("/courses", courses.routes);
app.use("/aboutme", about.routes);

app.listen(3000);