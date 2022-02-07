import { Courses } from "../../models/courses.mjs";
import { Users } from "../../models/users.mjs";
import { Messages } from "../../models/messages.mjs";
import { Opinions } from "../../models/opinions.mjs";
import { Certificates } from "../../models/about.mjs";
import { errorRaiser } from "../../utits/error_raiser.mjs";
import { validationResult } from "express-validator";

export const getOverview = async (req, res, next) => {
  const numberOfUsers = await Users.findAndCountAll();
  const numberOfCourses = await Courses.findAndCountAll();

  res.render("dashboard/overview", {
    title: "Over View Page",
    path: "/dashboard/overview",
    statsNumbers: {
      users: numberOfUsers.count,
      courses: numberOfCourses.count,
    },
  });
};

export const getMessages = async (req, res, next) => {
  const allMessages = await Messages.findAll();
  res.render("dashboard/messages", {
    title: "Messages page",
    path: "/dashboard/messages",
    messages: allMessages,
  });
};

export const postDeleteMessage = async (req, res, next) => {
  const messageId = req.body.messageId;
  const deletingResult = await (await Messages.findByPk(messageId)).destroy();
  console.log(deletingResult);
  res.redirect("/dashboard/messages");
};

export const getOpinionsPage = async (req, res, next) => {
  try {
    let pageNumber = req.query.page;
    if (!pageNumber) {
      pageNumber = 1;
    }
    const MAX_NUMBER = 5;
    const numberOfResults = await Opinions.findAndCountAll();
    const fetchingResults = await Opinions.findAll({
      limit: MAX_NUMBER,
      offset: (parseInt(pageNumber) - 1) * MAX_NUMBER,
    });

    res.render("dashboard/opinions", {
      title: "Opinions",
      path: "/dashboard/opinions",
      opinions: fetchingResults,
      numberOfLinks: Math.ceil(numberOfResults.count / 5),
    });
  } catch (e) {
    errorRaiser(e, next);
  }
};

export const postDeleteOpinion = async (req, res, next) => {
  try {
    const fetchingResults = (
      await Opinions.findByPk(req.body.opinionId)
    ).destroy();
    if (fetchingResults.rowCount === 1) {
      res.redirect("/dashboard/opinions");
    } else {
      res.redirect("/dashboard/opinions");
    }
  } catch (e) {
    errorRaiser(e, next);
  }
};

export const getAboutPage = async (req, res, next) => {
  const certificates = await Certificates.findAll();

  res.render("dashboard/about", {
    title: "Certificate",
    path: "/dashboard/about",
    editMode: false,
    certificates: certificates,
    errorMessage: "",
    validationErrors: [],
  });
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
  const certificateImage = req.files[0];
  const errors = validationResult(req);

  if (certificateImage?.path) {
    const addingResult = await Certificates.create({
      certificate_img: certificateImage.path,
    });
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

  if (addingResult._options.isNewRecord) {
    console.log(`adding_result`, await addingResult);
    res.redirect("/dashboard/about");
  } else {
    res.render("dashboard/about_forms", {
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
};
