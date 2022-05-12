// NODE MODULES IMPORTS
import dotenv from "dotenv";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import expressSession from "express-session";
import SessionStore from "connect-session-sequelize";
// import pgSession from "connect-pg-simple";
import csrf from "csurf";
import flash from "connect-flash";
import Multer from "multer";
import { Sequelize } from "sequelize";
import crypto from "crypto";

// MY MODULES IMPORTS
import { sequelize } from "./utils/db.js";
import { coursesRoutes } from "./routes/courses.js";
import { shoppingRoutes } from "./routes/shopping.js";
import { authRoutes } from "./routes/auth.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { isAuthenticated } from "./middlewares/dashboard-auth.js";
import { errorRaiser } from "./utils/error_raiser.js";
import { userRoutes } from "./routes/user.js";
import { getSingleFile } from "./utils/aws.js";
import { Users } from "./models/index.js";
import { Rounds } from "./models/index.js";
import { Payment } from "./models/index.js";
import { Courses } from "./models/index.js";
import { isUserAuthenticated } from "./middlewares/user-auth.js";
import { imageDownloader } from "./utils/general_helper.js";
import { body } from "express-validator";

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
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(
  Multer({ storage: fileStorage, fileFilter: fileFilter }).any(
    "course_img",
    "detailed_img",
    "certificate_img",
    "user_img",
    "exam_q_image"
  )
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use("/robots.txt", express.static(path.resolve("public", "robots.txt")));
app.use("/sitemap.xml", express.static(path.resolve("public", "sitemap.xml")));
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
      // table: "Sessions",
    }),
    secret: "app_secret",
    resave: false,
    saveUninitialized: false,
  })
);

const csrfProtection = csrf();
app.use(csrfProtection);
app.use(flash());

const accessLogStream = fs.createWriteStream(path.resolve("access.log"), {
  flags: "a",
});

// app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

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

app.get("/testing", (req, res, next) => {
  res.render("testing.ejs", {
    title: "Testing",
    path: "/testing",
  });
});

app.post(
  "/download_image",
  body("img_id").isString().isLength({ min: 15 }),
  imageDownloader
);
app.use("/courses", coursesRoutes);
app.use("/dashboard", isAuthenticated, dashboardRoutes);
app.use(authRoutes);
app.use(shoppingRoutes);
app.use(isUserAuthenticated, userRoutes);

Payment.hasOne(Courses, { foreignKey: "course_id", through: "course_id" });
Payment.hasOne(Users, { foreignKey: "user_id", through: "user_id" });
Payment.hasOne(Rounds, { foreignKey: "round_id", through: "round_id" });
Users.hasOne(Rounds, { through: "current_round" });
Rounds.belongsToMany(Users, { through: "users_ids" });

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
