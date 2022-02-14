import { Courses } from "../../models/courses.mjs";
import { Users } from "../../models/users.mjs";
import { Messages } from "../../models/messages.mjs";
import { Opinions } from "../../models/opinions.mjs";
import { Certificates } from "../../models/about.mjs";
import { errorRaiser } from "../../utits/error_raiser.mjs";
import { validationResult } from "express-validator";
import moment from "moment";
import { Sequelize } from "sequelize";

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
  try {
    let pageNumber = req.query.page;
    if (!pageNumber) {
      pageNumber = 1;
    }
    const MAX_NUMBER = 5;
    const numberOfResults = await Messages.findAndCountAll();
    const allMessages = await Messages.findAll({
      limit: MAX_NUMBER,
      offset: (parseInt(pageNumber) - 1) * MAX_NUMBER,
    });

    res.render("dashboard/messages", {
      title: "Messages page",
      path: "/dashboard/messages",
      messages: allMessages,
      numberOfLinks: numberOfResults,
    });
  } catch (e) {
    errorRaiser(e, next);
  }
};

export const postDeleteMessage = async (req, res, next) => {
  try {
    const messageId = req.body.messageId;
    const deletingResult = await (await Messages.findByPk(messageId)).destroy();
    console.log(deletingResult);
    res.redirect("/dashboard/messages");
  } catch (e) {
    errorRaiser(e, next);
  }
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
      res.redirect("opinions");
    } else {
      res.redirect("opinions");
    }
  } catch (e) {
    errorRaiser(e, next);
  }
};

export const getUpdateOpinion = async (req, res, next) => {
  try {
    const opinionId = req.params.opinionId;
    const findingOpinion = await Opinions.findByPk(opinionId);

    res.render("dashboard/opinions_form", {
      title: "Update Opinion",
      path: "/dashboard/update_opinion",
      opinion: findingOpinion,
      errorMessage: "",
      validationErrors: [],
      moment: moment,
      editMode: true,
    });
  } catch (e) {
    errorRaiser(e, next);
  }
};

export const postUpdateOpinion = async (req, res, next) => {
  try {
    const opinionId = req.body.opinionId;
    const email = req.body.sender_email;
    const name = req.body.sender_name;
    const course = req.body.sender_course;
    const opinion = req.body.opinion;
    const errors = validationResult(req);
    const date = req.body.date;

    const findingOpinion = await Opinions.findByPk(opinionId);

    if (!errors.isEmpty()) {
      res.render("dashboard/opinions_form", {
        title: "Update Opinion",
        path: "/dashboard/update_opinion",
        opinion: {
          opinion_id: opinionId,
          sender_name: name,
          sender_email: email,
          sender_course: course,
          sender_message: opinion,
          created_on: findingOpinion,
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
        editMode: true,
        moment: moment,
      });
    } else {
      const updatingResult = await Opinions.update(
        {
          sender_name: name,
          sender_email: email,
          sender_course: course,
          sender_message: opinion,
          created_on: moment(date).toISOString(),
        },
        { where: { opinion_id: opinionId } }
      );

      console.log(`updating opinion: `, updatingResult);

      if (updatingResult[0] === 1) {
        return res.status(201).redirect("/dashboard/opinions");
      } else {
        return res.status(500).render("dashboard/opinions_form", {
          title: "Update Opinion",
          path: "/dashboard/update_opinion",
          opinion: {
            opinion_id: opinionId,
            sender_name: name,
            sender_email: email,
            sender_course: course,
            sender_message: opinion,
            created_on: findingOpinion.created_on,
          },
          errorMessage: "There's an error from database",
          validationErrors: [],
          editMode: true,
          moment: moment,
        });
      }
    }
  } catch (e) {
    errorRaiser(e, next);
  }
};

export const getAboutPage = async (req, res, next) => {
  try {
    const certificates = await Certificates.findAll();

    res.render("dashboard/about", {
      title: "Certificate",
      path: "/dashboard/about",
      editMode: false,
      certificates: certificates,
      errorMessage: "",
      validationErrors: [],
    });
  } catch (e) {
    errorRaiser(e, next);
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
      const addingResult = await Certificates.create({
        certificate_img: certificateImage.path,
      });

      if (addingResult) {
        console.log(`adding_result`, await addingResult);
        res.redirect("about");
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
    errorRaiser(e, next);
  }
};

export const postDeleteCertificate = async (req, res, next) => {
  try {
    const certificateId = req.body.certificateId;
    const deletingResult = await (
      await Certificates.findByPk(certificateId)
    ).destroy();
    console.log(deletingResult);
    res.redirect("about");
  } catch (e) {
    errorRaiser(e, next);
  }
};
