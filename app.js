// NODE MODULES IMPORTS
import * as dotenv from "dotenv";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import Multer from "multer";
import cors from "cors";

// MY MODULES IMPORTS
import {sequelize} from "./utils/db.js";
import AppRoutes from './routes/index.js'
import {
    ExamsReplies,
    Users,
    Rounds,
    Payment,
    Courses,
    UserPerRound,
    Exams,
    ExamsCourses,
    ContentAccessList, Content
} from "./models/index.js";
import {imageDownloader} from "./utils/general_helper.js";
import {body} from "express-validator";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import {fileFilter, fileStorage} from "./middlewares/multer.js";
import errorHandler from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";

dotenv.config();
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(cookieParser());
// app.use(
//     Multer({
//         limits: {fileSize: 5 * 1024 * 1024},
//         storage: fileStorage,
//         fileFilter,
//     }).any(
//         "course_img",
//         "detailed_img",
//         "certificate_img",
//         "exam_q_image",
//         "instructor_img",
//         "instructor_certificates"
//     )
// );

app.use(bodyParser.urlencoded({extended: false}));
app.use("/robots.txt", express.static(path.resolve("public", "robots.txt")));
app.use("/sitemap.xml", express.static(path.resolve("public", "sitemap.xml")));
app.use(express.static(path.resolve("public")));
app.use(
    "/static",
    express.static(path.resolve("downloaded_images"))
);

app.use(
    "/static/certificates",
    express.static(path.resolve("public/certificates"))
);

// app.use(helmet());
app.use(compression());

app.post(
    "/download_image",
    body("img_id").isString().isLength({min: 15}),
    imageDownloader
);

app.use("/api", AppRoutes);
app.use("*", notFoundHandler);
app.use(errorHandler);

Payment.hasOne(Courses);
Payment.hasOne(Users);
Payment.hasOne(Rounds);

Rounds.hasOne(Users);
Rounds.hasOne(Courses);

Rounds.belongsToMany(Users, {
    through: "users_ids",
    constraints: false,
});

Rounds.belongsToMany(Courses, {
    through: "users_ids",
    constraints: false,
});

ExamsCourses.hasOne(Courses)

ExamsCourses.hasOne(Exams, {
    foreignKey: "exam_id",
    constraints: false,
})

ExamsReplies.hasOne(Exams, {
    foreignKey: "exam_id",
    constraints: false,
});

Users.hasOne(ExamsReplies);
ExamsReplies.belongsTo(Users);

UserPerRound.hasMany(Users, {
    foreignKey: "userId",
    constraints: false,
})

UserPerRound.hasMany(Rounds, {
    foreignKey: "roundId",
    targetKey: "round_id",
    constraints: false,
})

Users.belongsTo(UserPerRound)

Rounds.belongsTo(UserPerRound)

Content.belongsTo(ContentAccessList)
Users.belongsTo(ContentAccessList)

ContentAccessList.hasMany(Content)
ContentAccessList.hasMany(Users)

const port = process.env.PORT || process.env.DEV_PORT || 4000;

try {
    await sequelize.authenticate();
    await sequelize.sync({
        // alter: true,
    });

    app.listen(port, () => {
        logger.info(`working on ${port}`)
    });
} catch (e) {
    logger.error(e)
    throw new Error(e);
}

export default app;
