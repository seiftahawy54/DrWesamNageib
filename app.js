require("dotenv").config();

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const db = require("./utits/db");
const session = require("express-session");
const PostgresStore = require("express-pg-session")(session);
const csrf = require("csurf");

const app = express();
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: PostgresStore,
  })
);

const courses = require("./routes/courses");
const shopping = require("./routes/shopping");
const auth = require("./routes/auth");

app.use("/courses", courses.routes);

app.use(csrfProtection);

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
});

app.use(auth.routes);
app.use(shopping.routes);

const port = process.env.PORT || 3000;

db.connect((connection) => {
  app.listen(port, () => {});
});
