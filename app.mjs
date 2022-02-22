import dotenv from "dotenv";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import expressSession from "express-session";
import SessionStore from "connect-session-sequelize";
// import pgSession from "connect-pg-simple";
import { Sequelize } from "sequelize";
import csrf from "csurf";
import flash from "connect-flash";

import Multer from "multer";
import { sequelize } from "./utits/db.mjs";
import { coursesRoutes } from "./routes/courses.mjs";
import { shoppingRoutes } from "./routes/shopping.mjs";
import { authRoutes } from "./routes/auth.mjs";
import { dashboardRoutes } from "./routes/dashboard.mjs";
import { isAuthenticated } from "./middlewares/dashboard-auth.mjs";
import crypto from "crypto";
import { errorRaiser } from "./utits/error_raiser.mjs";
import { userRoutes } from "./routes/user.mjs";
import { Users } from "./models/users.mjs";
import { getSingleFile } from "./utits/aws.mjs";
import { Rounds } from "./models/rounds.mjs";
import { Payment } from "./models/payment.mjs";

dotenv.config();
const app = express();

const fileStorage = Multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "");
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
  Multer({ storage: fileStorage, fileFilter: fileFilter }).any(
    "course_img",
    "detailed_img",
    "certificate_img",
    "user_img"
  )
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve("public")));
app.use(
  "/downloaded_images",
  express.static(path.resolve("downloaded_images"))
);

// Session Configurations
const SequelizeStore = SessionStore(expressSession.Store);

app.use(
  expressSession({
    store: new SequelizeStore({
      db: sequelize,
      // table: "sessions",
    }),
    secret: "app_secret",
    resave: false,
    saveUninitialized: false,
  })
);

const csrfProtection = csrf();
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticatedAdmin;
  res.locals.isUserAuthenticated = req.session.userIsAuthenticated;
  res.locals.errorMessage = req.flash("error");
  res.locals.successMessage = req.flash("success");
  const token = req.csrfToken();
  res.cookie("XSRF-TOKEN", token);
  res.locals.csrfToken = token;
  // req.session.reload((err) => {
  //   console.log(`session things: `, err);
  // });
  next();
});

app.use(async (req, res, next) => {
  if (req.session.user) {
    const findingUser = await Users.findAll({
      where: { user_id: req.session.user.user_id },
    });

    if (!findingUser) {
      return next();
    } else {
      req.user = findingUser[0];
      return next();
    }
  } else {
    return next();
  }
});

app.use("/courses", coursesRoutes);
app.use("/dashboard", dashboardRoutes);
app.use(authRoutes);
app.use(shoppingRoutes);
app.use(userRoutes);

Rounds.hasMany(Users, { througth: "users_ids" });

app.use((error, req, res, next) => {
  res.render("500", {
    title: "Server Error",
    path: "",
  });
  console.log(error);
});

app.use((req, res, next) => {
  res.render("404", {
    title: "There's an error!",
    path: "",
  });
});

const port = process.env.PORT || process.env.DEV_PORT || 4000;

try {
  const connectionResult = await sequelize.authenticate();
  const syncingResult = await sequelize.sync({
    alter: true,
    logging: false,
  });

  app.listen(port, () => {
    console.log(`working on ${port}`);
  });
} catch (e) {
  throw new Error(e);
}
