import crypto from "crypto";
import {unlink} from "fs/promises";
import {getSingleFile} from "./aws.js";
import path from "path";
import moment from "moment";
import PDFMake from "pdfmake";
import fs from "fs";
import {errorRaiser} from "./error_raiser.js";
import {ExamImages, Exams, ExamsReplies, Users} from "../models/index.js";
import {sequelize} from "./db.js";
import logger from "./logger.js";
import {Op, Sequelize} from "sequelize";
import qr from "qrcode";
import config from "config";
import axios from "axios";

export const sortCourses = (courses) => {
    let coursesRanks = [];
    const coursesArr = courses;

    // Extract Ranks
    for (let coursesArrKey in coursesArr) {
        coursesRanks[coursesArrKey] = coursesArr[coursesArrKey].course_rank;
    }

    // Sort Based On Ranking
    coursesRanks = coursesRanks.sort((a, b) => a - b);

    // Get All Courses In Ranking
    return coursesRanks.map((rank) => {
        return coursesArr.find((course) => course.course_rank === rank);
    });
};

export const hashCreator = (size = 10) => {
    const idHash = crypto.randomBytes(size);
    return idHash.toString("hex");
};

export const extractError = (req) => {
    // Check if the message we extract is there not empty arr!
    let message = req.flash("error")[0];
    console.log(`custom error message`, message);
    if (!(typeof message === "string")) {
        message = null;
    }
    return message;
};

export const deleteFile = async (filePath) => {
    try {
        await unlink(filePath);
        return true;
    } catch (e) {
        return false;
    }
};

export const getCertificatesImage = (aboutCertificates) => {
    aboutCertificates.forEach(async ({certificate_img}) => {
        await getSingleFile(certificate_img);
    });
};

export const createCertificate = (
    userName = "",
    userId = "",
    courseName = "",
    courseHours = "",
    roundStartingDate = "",
    courseCertificateImg = "",
    courseCategory = "",
    qrCodeImg = '',
    certificateSerial = ''
) => {
    const certificateName = `${userName}-${userId}.pdf`
    const certificatePath = path.resolve(
        "public",
        "certificates",
        certificateName,
    )
    const fontsPath = path.resolve("public", "fonts")
    const fontName = "Lato"
    const imagesPath = path.resolve("downloaded_images")

    const startDate = moment(roundStartingDate).locale("en-CA").format("LL")
    const endDate = moment(roundStartingDate)
        .locale("en-CA")
        .add(3, "months")
        .format("LL")

    let sendingData = {
        courseName,
        roundDate: moment(roundStartingDate).format("DD-MM-YYYY"),
    }

    const fonts = {
        Roboto: {
            normal: path.resolve(
                fontsPath,
                fontName.toLowerCase(),
                `${fontName}-Regular.ttf`,
            ),
            bold: path.resolve(
                fontsPath,
                fontName.toLowerCase(),
                `${fontName}-Bold.ttf`,
            ),
            italics: path.resolve(
                fontsPath,
                fontName.toLowerCase(),
                `${fontName}-Italic.ttf`,
            ),
            bolditalics: path.resolve(
                fontsPath,
                fontName.toLowerCase(),
                `${fontName}-BoldItalic.ttf`,
            ),
        },
        Pacifico: {
            normal: path.resolve(fontsPath, `Pacifico-Regular.ttf`),
        },
    }

    PDFMake.fonts = fonts

    let content = []

    if (courseName === "CBAHI Accreditation Orientation Course") {
        content = [
            {
                image: validURL(courseCertificateImg) ? courseCertificateImg : path.resolve(imagesPath, courseCertificateImg),
                fit: [150, 150],
            },
            {
                text: userName,
                alignment: "center",
                fontSize: "32",
                bold: true,
                decoration: "underline",
                lineHeight: 1.2,
            },
            {
                text: `has attended a structured 5 days, with 20 Hours of training in ${courseCategory} and is therefore awarded the`,
                fontSize: "18",
                italics: true,
                alignment: "center",
                marginTop: 5,
            },
            {
                text: `Certificate of Attendance of "${courseName}"`,
                alignment: "center",
                fontSize: "30",
                bold: true,
                marginTop: 30,
                width: 100,
            },
            {
                text: `${startDate} to ${moment(startDate).add(5, "days").format("LL")} online ZOOM`.toUpperCase(),
                alignment: "center",
                fontSize: 18,
                bold: true,
                marginTop: 20,
            },
            {
                alignment: "center",
                fontSize: 14,
                marginTop: 20,
                text: [
                    {
                        text: "Dr Wesam Nageib\n",
                        fontSize: 18,
                        bold: true,
                        normal: true,
                        italics: true,
                    },
                    {
                        text: "Course Director\n",
                        bold: true,
                        italics: true,
                    },
                    {
                        text: `Professional trainer in health care quality\n`,
                        italics: true,
                    },
                    {
                        text: `Pharmacist, TOT, CSSGB, CSSBB MSC, FISQUA\n`,
                        italics: true,
                    },
                    {text: `Wesam Nageib`, font: "Pacifico"},
                ],
            },
            {
                marginTop: 5,
                columns: [
                    {
                        width: "30%",
                        columns: [
                            {
                                width: "25%",
                                text: "Email:",
                            },
                            {
                                width: "75%",
                                text: "drwesamnageib@gmail.com",
                                link: "mailto:drwesamnageib@gamil.com",
                                decoration: "underline",
                                color: "#00F",
                            },
                        ],
                    },
                    {
                        width: "*",
                        text: "",
                    },
                    {
                        width: "35%",
                        columns: [
                            {
                                width: "30%",
                                text: "Website: ",
                            },
                            {
                                width: "70%",
                                text: "https://www.drwesamnageib.com",
                                link: "https://www.drwesamnageib.com",
                                decoration: "underline",
                                color: "#00F",
                            },
                        ],
                    },
                ],
            },
        ]
    } else {
        content = [
            {
                columns: [
                    {
                        image: validURL(courseCertificateImg) ? courseCertificateImg : path.resolve(imagesPath, courseCertificateImg),
                        fit: [150, 150],
                        alignment: "left",
                        width: "50%"
                    },
                    {
                        image: qrCodeImg,
                        fit: [150, 150],
                        alignment: "right",
                        width: "50%"
                    }
                ]
            },
            {
                text: userName,
                alignment: "center",
                fontSize: "32",
                bold: true,
                decoration: "underline",
                lineHeight: 1.2,
            },
            {
                text: `has attended a structured 3-months, ${courseHours} contact hours of training in preparation of ${courseCategory} certificate and is therefore awarded the`,
                fontSize: "18",
                italics: true,
                alignment: "center",
                marginTop: 5,
            },
            {
                text: `Certificate of Attendance of Professional in ${courseCategory} "${courseName}"`,
                alignment: "center",
                fontSize: "30",
                bold: true,
                marginTop: 30,
                width: 100,
            },
            {
                text: `${startDate} to ${endDate} online ZOOM`.toUpperCase(),
                alignment: "center",
                fontSize: 18,
                bold: true,
                marginTop: 20,
            },
            {
                alignment: "center",
                fontSize: 14,
                marginTop: 20,
                text: [
                    {
                        text: "Dr Wesam Nageib\n",
                        fontSize: 18,
                        bold: true,
                        normal: true,
                        italics: true,
                    },
                    {
                        text: "Course Director\n",
                        bold: true,
                        italics: true,
                    },
                    {
                        text: `Professional trainer in health care quality\n`,
                        italics: true,
                    },
                    {
                        text: `Pharmacist, TOT, CSSGB, CSSBB MSC, FISQUA\n`,
                        italics: true,
                    },
                    {text: `Wesam Nageib`, font: "Pacifico"},
                ],
            },
            {
                marginTop: 5,
                columns: [
                    {
                        width: "30%",
                        columns: [
                            {
                                width: "50%",
                                text: "Certificate Serial:",
                            },
                            {
                                width: "50%",
                                text: certificateSerial,
                            },
                        ],
                    },
                    {
                        width: "*",
                        text: "",
                    },
                    {
                        width: "35%",
                        columns: [
                            {
                                width: "30%",
                                text: "Website: ",
                            },
                            {
                                width: "70%",
                                text: process.env.FRONTEND_URL,
                                link: process.env.FRONTEND_URL,
                                decoration: "underline",
                                color: "#00F",
                            },
                        ],
                    },
                ],
            },
        ]
    }

    const printer = new PDFMake(fonts)
    const certificateDoc = printer.createPdfKitDocument(
        {
            background: [
                {
                    image: validURL(courseCertificateImg) ? courseCertificateImg : path.resolve(imagesPath, courseCertificateImg),
                    width: 792,
                    opacity: 0.1
                }
            ],
            pageOrientation: "landscape",
            pageSize: "A4",
            pageMargins: 15,
            content,
        },
        {},
    )

    return {
        certificateObject: certificateDoc,
        certificateName,
        certificatePath,
    }
}
export const downloadingCoursesImages = (courses) => {
    return new Promise(async (resolve, reject) => {
        for (const course of courses) {
            if (!validURL(course.course_img)) {
                await getSingleFile(course.course_img)
                    .then((result) => {
                        course.course_img = result;
                        logger.info(`course image ${course.course_img} result ${result}`);
                    })
                    .catch((err) => {
                        logger.error(err);
                    });
            }
            if (!validURL(course.detailed_img)) {
                await getSingleFile(course.detailed_img)
                    .then((result) => {
                        course.detailed_img = result;
                        logger.info(`course detailed image ${course.detailed_img} result ${result}`);
                    })
                    .catch((err) => {
                        logger.error(err);
                    });
            }
        }

        resolve(true);
    });
};

export const calculateExamsGrades = (reply, exam) => {
    let totalGrades = 0;

    // console.log(reply);
    //
    // for (let answer = 0; answer < reply.length; answer++) {
    //   // reply.forEach((question, index) => {
    //   //   if ("questionHeader" in question) {
    //   // console.log(reply[answer]);
    //   const questionNumber = Object.keys(reply[answer])[0];
    //   // console.log(questionNumber);
    //   const userAnswer = reply[`${questionNumber - 1}`];
    //   //
    //   console.log(`user answer ==> `, userAnswer);
    //   //
    //   // if (
    //   //   exam.questions[answer].correctAnswer.toString() === userAnswer.toString()
    //   // ) {
    //   //   totalGrades += 1;
    //   // }
    // }

    reply.forEach((question, index) => {
        const questionNumber = Object.keys(question)[0];
        const userAnswer = question[`${questionNumber}`];

        // console.log(userAnswer);

        logger.info(`Exam Correct Answer ${exam[index].correctAnswer}`);
        logger.info(`User answer ${userAnswer}`);
        if (
            userAnswer &&
            exam[index].correctAnswer.toString() === userAnswer.toString()
        )
            totalGrades += 1;
    });

    return totalGrades;
};

export const imageDownloader = async (req, res, next) => {
    try {
        const wantedImg = req.body.img_id;
        console.log(`Received id ====> `, JSON.stringify(req.body, null, 2));
        const image = await ExamImages.findByPk(wantedImg);
        console.log(`image_id ===> ${image}`);
        const result = await getSingleFile(wantedImg);
        console.log(`searching result ===> ${result}`);
        return res.status(200).json({
            result,
        });
    } catch (e) {
        // await errorRaiser(e, next);
        res.status(500).json({
            message: e.message,
        });
    }
};

export const userPerformedExams = async (userId) => {
    const usersExamsData = await ExamsReplies.findAll({
        where: {
            user_id: userId,
        },
        include: [
            {
                model: Exams,
                as: "exam",
                on: {
                    exam_id: {
                        [Op.eq]: Sequelize.col("exams_replies.exam_id"),
                    },
                },
            }
        ]
    })

    for (let i of usersExamsData) {
        i.exam.questions = i.exam.questions
            .map((question) => {
                if ("questionHeader" in question) return question;
            })
            .filter((q) => q);
    }

    return usersExamsData;
};

/**
 * @description
 * @param {[{param: string, msg: string}]} expressValidatorArray
 * @returns {[field]: string, message: string}
 */

export const extractErrorMessages = (expressValidatorArray) => {
    const errorObj = {};
    for (let error of expressValidatorArray) {
        console.log(error)
        errorObj[[error.param]] = error.msg
    }

    return {
        errors: errorObj
    }
};

/**
 * @description
 * @param {[{path: [string], message: string}]} expressValidatorArray
 * @returns [{field: string, reason: string}]
 */

export const extractErrorMessagesForSchemas = (expressValidatorArray) => {
    return expressValidatorArray.map((errObj) =>
        constructError(errObj.path[0], errObj.message)
    );
};

/**
 * @description check whether the object passed is empty or not.
 * @param {object} obj
 * @returns - true if object is empty
 *          - false if object is not empty
 */

export const isEmpty = (obj) => Object.keys(obj).length === 0;

/**
 * @description Construct the global object of errors
 * @param {string} field
 * @param {string} msg
 * @returns - { field: string, reason: string }
 */

export const constructError = (field, msg) => ({[field]: msg});

/**
 * @description Construct the filters for searching in posts
 * @param {object} dataObj
 * @returns - { field: string, reason: string }
 */

export const constructSelectors = (dataObj) =>
    Object.keys(dataObj).map((prop) => ({[prop]: 1}));


export const calcPagination = async (model, pageNumber) => {
    const MAX_NUMBER = config.get('paginationMaxSize');
    const numberOfResults = await model.findAndCountAll();
    const numberOfLinks = Math.ceil(numberOfResults.count / MAX_NUMBER);
    const next = Number(Number(pageNumber) + 1);
    const prev = Number(Number(pageNumber) - 1);


    return {
        numberOfLinks,
        next,
        prev,
        hasNext: next <= numberOfLinks,
        hasPrev: prev >= 1,
        lastPage: numberOfLinks,
        firstPage: 1,
        currentPage: Number(pageNumber),
    };
}
export const validURL = (str) =>  {
    return str.startsWith("http://") || str.startsWith("https://")
}

export const isHuman = async (token) => {
    if (process.env.NODE_ENV !== "production") {
        return true;
    }

    const requestBody = {
        url: `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPCHTA_SECRET}&response=${token}`,
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
    };

    const {data} = await axios(requestBody);

    return data.success;
}


export const isTokenValid = (token) => {

}

export const rolesMapper = (byValue = true, role) => {
    let rolesObj = {};

    if (byValue) {
        rolesObj = {
            normal: 1,
            instructor: 2,
            moderator: 3,
            admin: 4,
        }
    } else {
        rolesObj = {
            1: "normal",
            2: "instructor",
            3: "moderator",
            4: "admin",
        }
    }

    return rolesObj[role];
}

export const rolesMap = {
    1: "normal",
    2: "instructor",
    3: "moderator",
    4: "admin",
}
