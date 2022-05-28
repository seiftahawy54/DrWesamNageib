import { About } from "../../../models/index.js";
import { getCertificatesImage } from "../../../utils/general_helper.js";
import { errorRaiser } from "../../../utils/error_raiser.js";
import { uploadFile } from "../../../utils/aws.js";
import { validationResult } from "express-validator";

export const getAboutParagraphs = async (req, res, next) => {
  try {
    const paragraphs = await About.findAll({
      where: {
        instructor_data: null,
      },
    });

    res.status(200).json({
      paragraphs,
    });
  } catch (e) {
    await errorRaiser(e, next, "API");
  }
};

export const getAllInstructors = async (req, res, next) => {
  try {
    const instructors = await About.findAll({
      where: {
        about_us_paragraph: null,
      },
    });

    res.status(200).json({
      instructors,
    });
  } catch (e) {
    await errorRaiser(e, next, "API");
  }
};

export const getAddNewInstructor = async (req, res, next) => {
  try {
    res.render("dashboard/about/instructor", {
      title: "Add new instructor",
      path: "/dashboard/about",
      editMode: false,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getAboutPage = async (req, res, next) => {
  try {
    const certificates = await About.findAll();

    await getCertificatesImage(certificates);

    res.render("dashboard/about", {
      title: "Certificate",
      path: "/dashboard/about",
      editMode: false,
      certificates: certificates,
      errorMessage: "",
      validationErrors: [],
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getNewAbout = (req, res, next) => {
  res.render("dashboard/about_forms", {
    title: "Certificate",
    path: "/dashboard/about",
    editMode: false,
    certificates: [],
    errorMessage: "",
    validationErrors: [],
  });
};

export const postAddNewAbout = async (req, res, next) => {
  try {
    const certificateImage = req.files[0];

    if (certificateImage?.path) {
      const addingResult = await About.create({
        certificate_img: certificateImage.path,
      });

      const uploadingResult = await uploadFile(
        certificateImage.path,
        certificateImage.filename,
        certificateImage.mimetype,
        res,
        next
      );

      console.log(uploadingResult);

      if (addingResult) {
        console.log(`adding_result`, await addingResult);
        res.redirect("/dashboard/about");
      }
    } else {
      return res.render("dashboard/about_forms", {
        title: "Certificate",
        path: "/dashboard/about",
        editMode: false,
        certificates: [],
        errorMessage: "Please enter a correct certificate image",
        validationErrors: [
          {
            param: "certificate_img",
          },
        ],
      });
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postDeleteCertificate = async (req, res, next) => {
  try {
    const certificateId = req.body.certificateId;
    const deletingResult = await (
      await About.findByPk(certificateId)
    ).destroy();
    console.log(deletingResult);
    res.redirect("about");
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postAddNewInstructor = async (req, res, next) => {
  try {
    const instructorName = req.body.instructorName;
    const instructorData = req.body.instructorData;
    const instructorImg = req.files[0].name;
    let instructorCertificates = [];

    for (let i = 1; i < req.files.length; i++) {
      instructorCertificates.push(req.files[i].name);
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(404).json({
        message: errors.array()[0].msg,
      });
    }

    return res.status(201).json({
      message: "Success",
    });
  } catch (e) {
    await errorRaiser(e, next, "API");
  }
};
