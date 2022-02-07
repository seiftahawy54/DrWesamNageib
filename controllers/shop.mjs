import path from "path";
import { validationResult } from "express-validator";
// import { addMessage } from "../models/messages.mjs";
import { Courses } from "../models/courses.mjs";
import { Opinions } from "../models/opinions.mjs";
import { errorRaiser } from "../utits/error_raiser.mjs";
import { sortCourses } from "../utits/general_helper.mjs";
import { Messages } from "../models/messages.mjs";
import { Certificates } from "../models/about.mjs";
import fs from "fs";

const getShoppingCart = (req, res, next) => {
  res.render("shopping/index", {
    title: "Shopping Cart",
    path: "/cart",
    cart: {
      courses: [courseOptions, courseOptions],
      totalPrice: 399,
    },
  });
};

const getHomePage = async (req, res, next) => {
  try {
    const getCoursesResult = await Courses.findAll();
    const getAllOpinionsResult = await Opinions.findAll();

    let sortedCourses = sortCourses(getCoursesResult);

    res.render("home/home.ejs", {
      title: "Homepage",
      path: "/",
      courses: sortedCourses,
      opinions: getAllOpinionsResult,
    });
  } catch (e) {
    errorRaiser(e, next);
  }
};

const getAboutPage = async (req, res, next) => {
  const aboutCertificates = await Certificates.findAll();

  res.render("about/index", {
    title: "Who am i",
    path: "/aboutme",
    certificates: aboutCertificates,
  });
};

const getContactPage = (req, res, next) => {
  let message = req.flash("error")[0];
  if (!(typeof message === "string")) {
    message = null;
  }

  let sent;

  if (req.session.sentMessage) {
    sent = req.session.sentMessage;
  } else {
    sent = false;
  }

  res.render("contactus/index", {
    title: "Contact Us",
    path: "/contact",
    errorMessage: message,
    messageSent: sent,
  });
};

const postContactPage = async (req, res, next) => {
  const senderName = req.body.contact_name;
  const senderEmail = req.body.contact_email;
  const senderContent = req.body.contact_content;

  console.log(senderName, senderEmail, senderContent);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.session.sentMessage = false;
    res.render("contactus/index", {
      title: "Contact Us",
      path: "/contact",
      errorMessage: "Please enter valid data!",
      messageSent: false,
    });
  } else {
    req.session.sentMessage = true;
    const sendingResult = await Messages.create({
      sendername: senderName,
      senderemail: senderEmail,
      message: senderContent,
    });
    console.log(sendingResult);
    if (sendingResult._options.isNewRecord) {
      res.redirect("/contact");
    } else {
      res.render("contactus/index", {
        title: "Contact Us",
        path: "/contact",
        errorMessage:
          "Some error happened in our end! please contact us on the phone number!",
        messageSent: false,
      });
    }
  }
};

const downloadCV = (req, res, next) => {
  const cvPath = path.resolve("public", "files");
  res.download(cvPath + "/dr_wesam_nageib.docx");
  res.status(200);
};

const getOpinionsPage = (req, res, next) => {
  fs.readdir(path.resolve("public/imgs/imgs/opinions"), (err, files) => {
    if (!err) {
      let opinionsImages = files;

      res.render("opinions/index", {
        title: "Opinions",
        path: "/opinions",
        opinionsImages,
      });
    } else {
      errorRaiser(err, next);
    }
  });
};

const getOpinionsForm = (req, res, next) => {
  res.render("opinions/form", {
    title: "Opinion Form",
    path: "/opinions/form",
    errorMessage: "",
  });
};

const postOpinions = async (req, res, next) => {
  const senderName = req.body.name;
  const senderEmail = req.body.email;
  const senderCourse = req.body.sender_course;
  const senderOpinion = req.body.opinion;
  const errors = validationResult(req);

  console.log(errors);

  if (!errors.isEmpty()) {
    res.render("opinions/index", {
      title: "Your Opinions",
      path: "/opinions",
      errorMessage: errors.array()[0].msg,
    });
  } else {
    Opinions.create({
      sender_name: senderName,
      sender_email: senderEmail,
      sender_course: senderCourse,
      sender_message: senderOpinion,
    })
      .then((result) => {
        if (result) {
          res.redirect("/");
        } else {
          res.render("opinions/index", {
            title: "Your Opinions",
            path: "/opinions",
            errorMessage: "You've entered an opinion before!",
          });
        }
      })
      .catch((err) => {
        res.render("opinions/index", {
          title: "Your Opinions",
          path: "/opinions",
          errorMessage: "You've entered an opinion before!",
        });
      });
  }
};

export {
  postContactPage,
  getContactPage,
  getAboutPage,
  getHomePage,
  getShoppingCart,
  downloadCV,
  getOpinionsPage,
  getOpinionsForm,
  postOpinions,
};
