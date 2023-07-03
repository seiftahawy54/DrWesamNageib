import crypto from "crypto";
import { unlink } from "fs/promises";
import { getSingleFile } from "./aws.js";
import path from "path";
import moment from "moment";
import PDFMake from "pdfmake";
import fs from "fs";
import { errorRaiser } from "./error_raiser.js";
import { ExamImages } from "../models/index.js";
import { sequelize } from "./db.js";
import logger from "./logger.js";

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
  aboutCertificates.forEach(async ({ certificate_img }) => {
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
  courseCategory = ""
) => {
  const certificateName = `${userName}-${userId}.pdf`;
  const fontsPath = path.resolve("public", "fonts");
  const fontName = "Lato";
  const imagesPath = path.resolve("downloaded_images");

  const startDate = moment(roundStartingDate).locale("en-CA").format("LL");
  const endDate = moment(roundStartingDate)
    .locale("en-CA")
    .add(3, "months")
    .format("LL");

  let sendingData = {
    courseName,
    roundDate: moment(roundStartingDate).format("DD-MM-YYYY"),
  };

  const fonts = {
    Roboto: {
      normal: path.resolve(
        fontsPath,
        fontName.toLowerCase(),
        `${fontName}-Regular.ttf`
      ),
      bold: path.resolve(
        fontsPath,
        fontName.toLowerCase(),
        `${fontName}-Bold.ttf`
      ),
      italics: path.resolve(
        fontsPath,
        fontName.toLowerCase(),
        `${fontName}-Italic.ttf`
      ),
      bolditalics: path.resolve(
        fontsPath,
        fontName.toLowerCase(),
        `${fontName}-BoldItalic.ttf`
      ),
    },
    Pacifico: {
      normal: path.resolve(fontsPath, `Pacifico-Regular.ttf`),
    },
  };

  PDFMake.fonts = fonts;

  const printer = new PDFMake(fonts);
  const certificateDoc = printer.createPdfKitDocument(
    {
      watermark: { text: "Dr Wesam Nageib", opacity: 0.1, font: "Pacifico" },
      pageOrientation: "landscape",
      pageSize: "A4",
      pageMargins: 15,
      content: [
        {
          image: path.resolve(imagesPath, courseCertificateImg),
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
          text: `has attended a structured ${courseHours % 24} days of training in preparation of ${courseCategory} certificate and is therefore awarded the`,
          fontSize: "18",
          italics: true,
          alignment: "center",
          marginTop: 10,
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
          fontSize: 20,
          bold: true,
          marginTop: 20,
        },
        {
          alignment: "center",
          fontSize: 16,
          marginTop: 20,
          text: [
            {
              text: "Dr Wesam Nageib\n",
              fontSize: 20,
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
              text: `Pharmacist, TOT, CSSYB, MSC, FISQUA\n`,
              italics: true,
            },
            { text: `Wesam Nageib`, font: "Pacifico" },
          ],
        },
        {
          marginTop: 10,
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
      ],
    },
    {}
  );

  return {
    certificateObject: certificateDoc,
    certificateName,
  };
};

export const downloadingCoursesImages = (courses) => {
  return new Promise(async (resolve, reject) => {
    for (const course of courses) {
      await getSingleFile(course.course_img)
        .then((result) => {
          logger.info(`course image ${course.course_img} result ${result}`);
        })
        .catch((err) => {
          logger.error(err);
        });
      await getSingleFile(course.detailed_img)
        .then((result) => {
          logger.info(`course detailed image ${course.detailed_img} result ${result}`);
        })
        .catch((err) => {
          logger.error(err);
        });
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

    console.log(`Exam Correct Answer`, exam[index].correctAnswer);
    console.log(`User answer`, userAnswer);
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
  const usersExamsData = await sequelize.query(
    `
    SELECT e.title, e.questions, reply.reply_id, reply.grade, reply."createdAt" FROM exams_replies reply
        INNER JOIN exams e ON reply.exam_id = e.exam_id
        INNER JOIN users u ON reply.user_id = u.user_id where reply.user_id = ?;
    `,
    {
      replacements: [userId],
      type: "SELECT",
    }
  );

  for (let i of usersExamsData) {
    i.questions = i.questions
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
 * @returns {{field: string, message: string}[]}[]
 */

export const extractErrorMessages = (expressValidatorArray) => {
  return expressValidatorArray.map((errObj) =>
    constructError(errObj.param, errObj.msg)
  );
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
 * @param {string} message
 * @returns - { field: string, reason: string }
 */

export const constructError = (field, message) => ({ field, message });

/**
 * @description Construct the filters for searching in posts
 * @param {object} dataObj
 * @returns - { field: string, reason: string }
 */

export const constructSelectors = (dataObj) =>
  Object.keys(dataObj).map((prop) => ({ [prop]: 1 }));
