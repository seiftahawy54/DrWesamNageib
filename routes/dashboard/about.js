import { Router } from "express";
import {
  getAboutPage,
  getAboutParagraphs,
  getAddNewInstructor,
  getAllInstructors,
  getNewAbout,
  postAddNewAbout,
  postDeleteCertificate,
  postAddNewInstructor,
} from "../../controllers/dashboard/about/about.js";
import { body } from "express-validator";

export default Router()
  .get("/", getAboutPage)
  .get("/add-new-about", getNewAbout)
  .post("/delete-certificate", postDeleteCertificate)
  .get("/add-new-instructor", getAddNewInstructor)
  .post("/add-new-about", postAddNewAbout)
  .get("/paragraphs-data", getAboutParagraphs)
  .get("/instructors-data", getAllInstructors)
  .post(
    "/add-new-instructor",
    [body("instrcutorName").trim().isString().isLength({ min: 5 })],
    postAddNewInstructor
  );
