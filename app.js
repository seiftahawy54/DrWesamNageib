
let envPath = `.env.${process.env.NODE_ENV}`

if (process.env.NODE_ENV === 'production') {
    envPath = `.env`
}

dotenv.config({
    path: envPath,
});

// NODE MODULES IMPORTS
import * as dotenv from "dotenv";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import {body} from "express-validator";
import morgan from "morgan";

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
    ContentAccessList, Content, Discounts
} from "./models/index.js";
import discountPerUsage from "./models/discountPerUsage.js";
import {imageDownloader} from "./utils/general_helper.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import errorHandler from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(cookieParser());

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
app.use(morgan("common"));

Payment.hasOne(Courses, {
    constraints: false,
});
Payment.hasOne(Users,
    {
        constraints: false,
    }
);
Payment.hasOne(Rounds,
    {
        constraints: false,
    });

Rounds.hasOne(Users,
    {
        constraints: false,
    });
Rounds.hasOne(Courses,
    {
        constraints: false,
    });

Rounds.belongsToMany(Users, {
    through: "users_ids",
    constraints: false,
});

Rounds.belongsToMany(Courses, {
    through: "users_ids",
    constraints: false,
});

Courses.hasMany(Exams,
    {
        constraints: false,
    });
Exams.hasOne(Courses,
    {
        constraints: false,
    });

ExamsCourses.hasOne(Courses,
    {
        constraints: false,
    })


ExamsCourses.hasOne(Exams, {
    foreignKey: "exam_id",
    constraints: false,
})

ExamsReplies.hasOne(Exams,
    {
        constraints: false,
    });
ExamsReplies.belongsTo(Users,
    {
        constraints: false,
    });

Exams.hasMany(ExamsReplies,
    {
        constraints: false,
    });

UserPerRound.hasMany(Users, {
    foreignKey: "userId",
    constraints: false,
})

UserPerRound.hasMany(Rounds, {
    foreignKey: "roundId",
    targetKey: "round_id",
    constraints: false,
})

Users.belongsTo(UserPerRound,
    {
        constraints: false,
    })

Rounds.belongsTo(UserPerRound,
    {
        constraints: false,
    })

Content.belongsTo(ContentAccessList,
    {
        constraints: false,
    })
Users.belongsTo(ContentAccessList,
    {
        constraints: false,
    })

ContentAccessList.hasMany(Content,
    {
        constraints: false,
    })
ContentAccessList.hasMany(Users,
    {
        constraints: false,
    })

discountPerUsage.hasMany(Users, {
    constraints: false,
})

discountPerUsage.hasMany(Discounts, {
    constraints: false,
})

Discounts.hasMany(discountPerUsage, {
    constraints: false,
})

const port = process.env.PORT || process.env.DEV_PORT || 4000;

try {
    await sequelize.authenticate();

    let dbOptions = {};

    if (process.env.NODE_ENV === 'test') {
        dbOptions['alter'] = false;
        dbOptions['force'] = true;
    } else {
        dbOptions['alter'] = true;
        dbOptions['force'] = false;
    }

    await sequelize.sync(dbOptions);

    app.listen(port, () => {
        logger.info(`${process.env.BACKEND_URL} working on ${port}`)
    });
} catch (e) {
    logger.error(e)
    throw new Error(e);
}

export default app;
