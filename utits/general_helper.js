import crypto from "crypto";
import { unlink } from "fs/promises";
import { getSingleFile } from "./aws.js";
import path from "path";
import moment from "moment";
import PDFMake from "pdfmake";
import fs from "fs";

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

export const hashCreator = () => {
  const idHash = crypto.randomBytes(10);
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

export const downloadSingleImage = (model, propertyName) => {};

export const getCertificatesImage = (aboutCertificates) => {
  aboutCertificates.forEach(async ({ certificate_img }) => {
    await getSingleFile(certificate_img);
  });
};

export const createCertificate = (
  userName = "",
  userId = "",
  courseName = "",
  roundStartingDate = ""
) => {
  const certificateName = `${userName}-${userId}.pdf`;
  const certificatePath = path.resolve(
    "public",
    "certificates",
    certificateName
  );
  const fontsPath = path.resolve("public", "fonts");
  const fontName = "Lato";
  const imagesPath = path.resolve(
    "public",
    "imgs",
    "imgs",
    "user",
    "certificate"
  );

  const startDate = moment(roundStartingDate.round_date).format("LL");
  const endDate = moment(roundStartingDate.round_date)
    .add(3, "months")
    .format("LL");

  let sendingData = {
    courseName,
    roundDate: moment(roundStartingDate).format("DD-MM-YYYY"),
  };

  const fonts = {
    Roboto: {
      normal: path.resolve(fontsPath, `${fontName}-Regular.ttf`),
      bold: path.resolve(fontsPath, `${fontName}-Bold.ttf`),
      italics: path.resolve(fontsPath, `${fontName}-Italic.ttf`),
      bolditalics: path.resolve(fontsPath, `${fontName}-BoldItalic.ttf`),
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
          image: path.resolve(imagesPath, "full.jpg"),
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
          text: `has attended a structured 3-months, 50 contact hours of training in preparation of healthcare Quality certificate and is therefore awarded the`,
          fontSize: "18",
          italics: true,
          alignment: "center",
          marginTop: 17,
        },
        {
          text: `Certificate of Attendance of Professional in Healthcare Quality "${courseName}"`,
          alignment: "center",
          fontSize: "42",
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
              text: `Pharmacist, CPHQ, TOT, CSSYB, MSC, FISQUA\n`,
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
    certificatePath,
  };
};

export const downloadingCoursesImages = (courses) => {
  return new Promise((resolve, reject) => {
    for (const course of courses) {
      getSingleFile(course.course_img)
        .then((result) => {})
        .catch((err) => {
          console.error(err);
        });
      getSingleFile(course.detailed_img)
        .then((result) => {})
        .catch((err) => {
          console.error(err);
        });
    }

    resolve(true);
  });
};
