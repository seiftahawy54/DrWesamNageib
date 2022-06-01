import { Router } from "express";
import {
  getAboutPage,
  getAboutParagraphs,
  getAddNewInstructor,
  getAllInstructors,
  postDeleteCertificate,
  postAddNewInstructor,
  postDeleteInstructor,
  getUpdateInstructor,
  getInstructorData,
  postUpdateInstructor,
  getAddNewAbout,
  postAddNewAbout,
  updateParagraph,
  getUpdateParagraph,
  getParagraphData,
} from "../../controllers/dashboard/about/about.js";
import { body } from "express-validator";

export default Router()
  .get("/", getAboutPage)
  .get("/add-new-about", getAddNewAbout)
  .post("/add-new-about", postAddNewAbout)
  .post("/delete-certificate", postDeleteCertificate)
  .get("/add-new-instructor", getAddNewInstructor)
  .get("/paragraphs-data", getAboutParagraphs)
  .get("/instructors-data", getAllInstructors)
  .post(
    "/add-new-instructor",
    [
      body("instructorName").trim().isString().isLength({ min: 5 }),
      body("instructorData").trim().isString().isLength({ min: 5 }),
    ],
    postAddNewInstructor
  )
  .delete("/delete-instructor", postDeleteInstructor)
  .get("/edit-instructor/:instructorId", getUpdateInstructor)
  .get("/instructor-data/:instructorId", getInstructorData)
  .post(
    "/edit-instructor/:instructorId",
    [
      body("instructorName").trim().isString().isLength({ min: 5 }),
      body("instructorData").trim().isString().isLength({ min: 5 }),
    ],
    postUpdateInstructor
  )
  .delete("/delete-paragraph", postDeleteInstructor)
  .post("/edit-paragraph", updateParagraph)
  .get("/edit-paragraph/:paragraphId", getUpdateParagraph)
  .get("/paragraph/:paragraphId", getParagraphData);
