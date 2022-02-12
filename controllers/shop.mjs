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
import { Users } from "../models/users.mjs";
import {
  calcTotalFromCart,
  getCoursesFormCart,
} from "../utits/cart_helpers.mjs";

export const getHomePage = async (req, res, next) => {
  try {
    const getCoursesResult = await Courses.findAll();
    const getAllOpinionsResult = await Opinions.findAll();

    let sortedCourses = sortCourses(getCoursesResult);

    fs.readdir(path.resolve("public/imgs/imgs/opinions"), (err, files) => {
      if (err) {
        return errorRaiser(err, next);
      }

      res.render("home/home.ejs", {
        title: "Homepage",
        path: "/",
        courses: sortedCourses,
        opinions: getAllOpinionsResult,
        whatsapp_opinions: files,
      });
    });
  } catch (e) {
    errorRaiser(e, next);
  }
};

export const getShoppingCart = async (req, res, next) => {
  const cartJSON = extractCart(req);
  if (!Array.isArray(cartJSON)) {
    const bought_courses = await getCoursesFormCart([cartJSON]);

    res.render("shopping/index", {
      title: "Shopping Cart",
      path: "/cart",
      cart: req.user.cart,
      bought_courses: [],
      totalPrice: 0,
    });
  } else {
    const bought_courses = await getCoursesFormCart(cartJSON);

    res.render("shopping/index", {
      title: "Shopping Cart",
      path: "/cart",
      cart: req.user.cart,
      bought_courses: [],
      totalPrice: 0,
    });
  }
};

export const postDeleteFromCart = async (req, res, next) => {
  const wantedToDelete = req.body.courseId;
  const cartJSON = JSON.parse(req.user.cart);

  const deletingIndex = cartJSON.findIndex((e) => e.item === wantedToDelete);
  cartJSON.splice(deletingIndex, 1);
  const filteredCart = cartJSON;

  console.log(filteredCart);

  const deletingResult = await Users.update(
    { cart: JSON.stringify(filteredCart) },
    { where: { user_id: req.user.user_id } }
  );

  console.log(deletingResult);

  // console.log(
  //   `deleted: ${wantedToDelete}, filtered: ${filteredCart}, ${deletingResult}`
  // );

  res.redirect("/cart");
};

export const getAboutPage = async (req, res, next) => {
  const aboutCertificates = await Certificates.findAll();

  res.render("about/index", {
    title: "Who am i",
    path: "/aboutme",
    certificates: aboutCertificates,
  });
};

export const getContactPage = (req, res, next) => {
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

export const postContactPage = async (req, res, next) => {
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

export const downloadCV = (req, res, next) => {
  const cvPath = path.resolve("public", "files");
  res.download(cvPath + "/dr_wesam_nageib.docx");
  res.status(200);
};

export const getOpinionsPage = (req, res, next) => {
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

export const getOpinionsForm = (req, res, next) => {
  res.render("opinions/form", {
    title: "Opinion Form",
    path: "/opinions/form",
    errorMessage: "",
  });
};

export const postOpinions = async (req, res, next) => {
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
