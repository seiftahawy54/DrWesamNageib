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
      instructor: {
        instructor_data: {},
      },
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getUpdateInstructor = async (req, res, next) => {
  try {
    const instructorId = req.params.instructorId;
    const instructor_data = await About.findByPk(instructorId);

    return res.render("dashboard/about/instructor", {
      title: "Update instructor",
      path: "/dashboard/about",
      editMode: true,
      instructor: instructor_data,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getInstructorData = async (req, res, next) => {
  try {
    const instructorId = req.params.instructorId;
    const instructorData = await About.findByPk(instructorId);

    res.status(200).json({
      instructor: instructorData,
    });
  } catch (e) {
    await errorRaiser(e, next, "API");
  }
};

export const postUpdateInstructor = async (req, res, next) => {
  try {
    const instructorId = req.params.instructorId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect(`/dashboard/about/edit-instructor/${instructorId}`);
    }

    const instructorName = req.body.instructor_name;
    const instructorData = req.body.instructor_data;

    let newInstructorImg = [],
      newInstructorCertificates = [],
      updatingObj = {
        instructor_name: instructorName,
        instructor_data: instructorData,
      };

    if (
      req.files.length > 0 &&
      req.files.length === 1 &&
      req.files[0].fieldname === "instructor_img"
    ) {
      newInstructorImg = req.files[0];
      await uploadFile(
        req.files[0].path,
        req.files[0].filename,
        req.files[0].mimetype,
        res,
        next
      );
    }

    if (
      req.files.length > 0 &&
      req.files[0].fieldname === "instructor_certificates"
    ) {
      for (let i = 0; i < req.files.length; i++) {
        newInstructorCertificates.push(req.files[i].path);
        await uploadFile(
          req.files[i].path,
          req.files[i].filename,
          req.files[i].mimetype,
          res,
          next
        );
      }
    }

    if (
      req.files.length > 0 &&
      req.files.length > 1 &&
      req.files[0].fieldname === "instructor_img"
    ) {
      newInstructorImg = req.files[0].path;
      await uploadFile(
        req.files[0].path,
        req.files[0].filename,
        req.files[0].mimetype,
        res,
        next
      );

      for (let i = 1; i < req.files.length; i++) {
        newInstructorCertificates.push(req.files[i].path);
        await uploadFile(
          req.files[i].path,
          req.files[i].filename,
          req.files[i].mimetype,
          res,
          next
        );
      }
    }

    if (newInstructorImg.length > 0 && newInstructorCertificates.length > 0) {
      updatingObj.instructor_image = newInstructorImg;
      updatingObj.instructor_certificates = newInstructorCertificates;
    } else if (
      newInstructorImg.length > 0 &&
      newInstructorCertificates.length === 0
    ) {
      updatingObj.instructor_image = newInstructorImg;
    } else if (
      newInstructorImg.length === 0 &&
      newInstructorCertificates.length > 0
    ) {
      updatingObj.instructor_certificates = newInstructorCertificates;
    }

    const updatingResult = await About.update(
      {
        ...updatingObj,
      },
      {
        where: { instructor_id: instructorId },
      }
    );

    console.log(updatingResult);

    req.flash("success", "Instructor's data updated successfully");
    return res.redirect("/dashboard/about");
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getAddNewAbout = async (req, res, next) => {
  try {
    return res.render("dashboard/about/paragraph_about", {
      title: "About Paragraph",
      path: "/dashboard/about",
      editMode: false,
      instructor: {
        instructor_id: "",
      },
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postAddNewAbout = async (req, res, next) => {
  try {
    const aboutParagraph = req.body.aboutParagraph;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(404).json({
        message: errors.array()[0].msg,
      });
    }

    const creatingResult = await About.create({
      about_us_paragraph: aboutParagraph,
    });

    return res.status(201).json({ message: "Data added successfully" });
  } catch (e) {
    await errorRaiser(e, next, "API");
  }
};

export const getAboutPage = async (req, res, next) => {
  try {
    const certificates = await About.findAll();

    res.render("dashboard/about/about", {
      title: "About",
      path: "/dashboard/about",
      editMode: false,
      errorMessage: "",
      validationErrors: [],
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

/*export const getNewAbout = (req, res, next) => {
  res.render("dashboard/about_forms", {
    title: "Certificate",
    path: "/dashboard/about",
    editMode: false,
    certificates: [],
    errorMessage: "",
    validationErrors: [],
  });
};*/

/*
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
*/

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
    console.log(req.body, req.files);
    const { instructor_name, instructor_data } = req.body;
    const instructor_img = req.files[0];
    let instructor_certificates = [];

    const uploadingSecondImg = await uploadFile(
      instructor_img.path,
      instructor_img.filename,
      instructor_img.mimetype,
      res,
      next
    );

    for (let i = 1; i < req.files.length; i++) {
      instructor_certificates.push(req.files[i].path);
      await uploadFile(
        req.files[i].path,
        req.files[i].filename,
        req.files[i].mimetype,
        res,
        next
      );
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      req.flash("error", errors[0].msg);
      return res.render("dashboard/about/instructor", {
        title: "Add new instructor",
        path: "/dashboard/about",
        editMode: false,
        instructor: {
          instructor_data: {
            instructor_name,
            instructor_data,
          },
        },
      });
    }

    const creatingNewInstructor = await About.create({
      instructor_name,
      instructor_data,
      instructor_image: instructor_img.path,
      instructor_certificates,
    });

    console.log(creatingNewInstructor);

    return res.redirect("/dashboard/about");

    // return res.status(201).json({
    //   message: "Success",
    //   newInstructor: creatingNewInstructor,
    // });
  } catch (e) {
    console.log(e);
    await errorRaiser(e, next);
  }
};

export const postDeleteInstructor = async (req, res, next) => {
  try {
    const instructorId = req.body.instructorId;

    if (instructorId && instructorId.length !== 36) {
      return res.status(422).json({
        message: "wrong instructor id",
      });
    }

    const deletingResult = await (await About.findByPk(instructorId)).destroy();
    console.log(`deleting Result`, deletingResult);

    return res.status(201).json({ message: "Success" });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const updateParagraph = async (req, res, next) => {
  try {
    const instructorId = req.body.paragraphId;
    const paragraphData = req.body.aboutParagraph;

    if (instructorId && instructorId.length !== 36) {
      return res.status(422).json({
        message: "wrong id",
      });
    }

    const paragraph = await About.findByPk(instructorId);

    const updatingResult = await About.update(
      {
        about_us_paragraph: paragraphData,
      },
      {
        where: { instructor_id: instructorId },
      }
    );

    console.log(paragraph);

    return res.status(204).json({ message: "Success" });
  } catch (e) {
    await errorRaiser(e, next, "API");
  }
};

export const getUpdateParagraph = async (req, res, next) => {
  try {
    const instructorId = req.params.paragraphId;

    if (instructorId && instructorId.length !== 36) {
      req.flash("error", "Please check your data");
      return res.redirect("/dashboard/about");
    }

    const paragraph = await About.findByPk(instructorId);

    res.render("dashboard/about/paragraph_about", {
      title: "Update about paragraph",
      path: "/dashboard/about",
      editMode: true,
      instructor: {
        instructor_id: instructorId,
      },
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getParagraphData = async (req, res, next) => {
  try {
    const instructorId = req.params.paragraphId;

    const paragraphData = await About.findByPk(instructorId);

    return res.status(200).json({
      paragraph: paragraphData,
    });
  } catch (e) {
    await errorRaiser(e, next, "API");
  }
};
