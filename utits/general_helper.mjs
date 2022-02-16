import crypto from "crypto";
import { unlink } from "fs/promises";
import { getSingleFile } from "./aws.mjs";

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
  aboutCertificates.forEach(({ certificate_img }) => {
    getSingleFile(certificate_img);
  });
};

export const downloadingCoursesImages = (courses) => {
  return new Promise((resolve, reject) => {
    for (const course of courses) {
      getSingleFile(course.course_img)
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.error(err);
        });
      getSingleFile(course.detailed_img)
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.error(err);
        });
    }

    resolve(true);
  });
};
