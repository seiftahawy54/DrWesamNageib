import dotenv from "dotenv";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import expressSession from "express-session";
import pgSession from "connect-pg-simple";
import csrf from "csurf";
import flash from "connect-flash";
import Multer from "multer";

import Pool from "./utits/db.mjs";
import { coursesRoutes } from "./routes/courses.mjs";
import { shoppingRoutes } from "./routes/shopping.mjs";
import { authRoutes } from "./routes/auth.mjs";
import { dashboardRoutes } from "./routes/dashboard.mjs";
import { isAuthenticated } from "./middlewares/dashboard-auth.mjs";
import crypto from "crypto";

dotenv.config();
const app = express();

const fileStorage = Multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploaded_images");
  },
  filename: (req, file, cb) => {
    cb(null, crypto.randomBytes(10).toString("hex") + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.json());
app.use(cookieParser());
app.use(
  Multer({ storage: fileStorage, fileFilter: fileFilter }).single("course_img")
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve("public")));
app.use("/uploaded_images", express.static(path.resolve("uploaded_images")));

// Session Configurations
const nPgSession = pgSession(expressSession);
// console.log("pg_session: ", pgSession(Pool));

app.use(
  expressSession({
    store: new nPgSession({
      pool: Pool,
      table: "session",
    }),
    /*    store: nPgSession({
          pool: Pool,
          table: "session",
        }),*/
    secret: "app_secret",
    resave: false,
    saveUninitialized: false,
  })
);

const csrfProtection = csrf();
app.use(flash());
app.use(csrfProtection);

/*app.use(csrfProtection);
 */

/*app.get("*", function (req, res, next) {
  if (req.headers["x-forwarded-proto"] != "http")
    res.redirect("http://www.drwesamnageib.com" + req.url);
  else next(); /!* Continue to other routes if we're not redirecting *!/
});*/

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/courses", coursesRoutes);
app.use("/dashboard", isAuthenticated, dashboardRoutes);
app.use(authRoutes);
app.use(shoppingRoutes);

const port = process.env.PORT || process.env.DEV_PORT || 3000;

Pool.connect()
  .then((pool) => {
    app.listen(port, () => {
      console.log(`working on ${port}`);
    });
  })
  .catch((err) => {
    console.log();
  });
