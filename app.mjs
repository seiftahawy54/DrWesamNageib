import dotenv from "dotenv";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import db from "./utits/db.mjs";
import { coursesRoutes } from "./routes/courses.mjs";
import { shoppingRoutes } from "./routes/shopping.mjs";
import { authRoutes } from "./routes/auth.mjs";

dotenv.config();

// const session = require("express-session");
// const PostgresStore = require("express-pg-session")(session);
// const csrf = require("csurf");

const app = express();
// const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve("public")));

/*
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: PostgresStore,
  })
);
*/

app.use("/courses", coursesRoutes);

/*app.use(csrfProtection);

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
});*/

app.use(authRoutes);
app.use(shoppingRoutes);

const port = process.env.PORT || 3000;

db.connect((connection) => {
  app.listen(port, () => {});
});
