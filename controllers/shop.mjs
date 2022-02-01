import path from "path";
import { validationResult } from "express-validator";
// import { addMessage } from "../models/messages.mjs";
import { Courses } from "../models/courses.mjs";
import { Opinions } from "../models/opinions.mjs";
import { errorRaiser } from "../utits/error_raiser.mjs";
import { sortCourses } from "../utits/general_helper.mjs";

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

const getAboutPage = (req, res, next) => {
  res.render("about/index", {
    title: "Who am i",
    path: "/aboutme",
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
    const sendingResult = await addMessage(
      senderName,
      senderEmail,
      senderContent
    );
    console.log(sendingResult);
    if (sendingResult.command === "INSERT") {
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
  res.render("opinions/index", {
    title: "Your Opinions",
    path: "/opinions",
  });
};

const postOpinions = async (req, res, next) => {
  const senderName = req.body.name;
  const senderCourse = req.body.sender_course;
  const senderOpinion = req.body.opinion;
  const errors = validationResult(req);

  console.log(errors);

  if (!errors.isEmpty()) {
    res.render("opinions/index", {
      title: "Your Opinions",
      path: "/opinions",
    });
  } else {
    try {
      const sendingResult = await addOneOpinion(
        senderName,
        senderCourse,
        senderOpinion
      );

      if (sendingResult.rowCount > 0) {
        res.redirect("/");
      } else {
        res.render("opinions/index", {
          title: "Your Opinions",
          path: "/opinions",
        });
      }
    } catch (e) {
      console.log(e);
    }
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
  postOpinions,
};
