import dotenv from "dotenv";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import expressSession from "express-session";
import pgSession from "connect-pg-simple";
import csrf from "csurf";
import flash from "connect-flash";

import Pool from "./utits/db.mjs";
import { coursesRoutes } from "./routes/courses.mjs";
import { shoppingRoutes } from "./routes/shopping.mjs";
import { authRoutes } from "./routes/auth.mjs";
import { dashboardRoutes } from "./routes/dashboard.mjs";

dotenv.config();
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve("public")));

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
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/courses", coursesRoutes);
app.use("/dashboard", dashboardRoutes);
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
