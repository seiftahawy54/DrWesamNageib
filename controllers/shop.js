import path from "path";
import { validationResult } from "express-validator";
// import { addMessage } from "../models/messages.js";
import { Courses } from "../models/index.js";
import { Opinions } from "../models/index.js";
import { Messages } from "../models/index.js";
import { About } from "../models/index.js";
import { Users } from "../models/index.js";

import { errorRaiser } from "../utils/error_raiser.js";
import {
  constructError,
  downloadingCoursesImages,
  extractErrorMessages,
  getCertificatesImage,
  sortCourses,
} from "../utils/general_helper.js";
import fs from "fs/promises";
import moment from "moment";
import {
  calcTotalPrice,
  extractArrOfPrices,
  filterCart,
  findCartCourses,
} from "../utils/cart_helpers.js";
import { sequelize } from "../utils/db.js";
import { QueryTypes } from "sequelize";
import { getSingleFile } from "../utils/aws.js";
import messages from "../i18n/messages.js";
import axios from "axios";

export const getAllOpinions = async (req, res, next) => {
  try {
    const files = await fs.readdir(path.resolve("public/imgs/imgs/opinions"));
    return res.status(200).json({ opinions: files });
  } catch (e) {
    await errorRaiser(e, next, "API");
  }
};

// TODO: Remove in new implementation
export const getHomePage = async (req, res, next) => {
  try {
    const getCoursesResult = await Courses.findAll();
    let getAllOpinionsResult = await Opinions.findAll();

    let sortedCourses = sortCourses(getCoursesResult).sort(
      (a, b) => a.sort - b.sort
    );

    await downloadingCoursesImages(getCoursesResult);

    let files = await fs.readdir(path.resolve("public/imgs/imgs/opinions"));

    return res.render("home/home.ejs", {
      title: "Homepage",
      path: "/",
      courses: sortedCourses,
      opinions: getAllOpinionsResult,
      whatsapp_opinions: files,
      moment: moment,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getHomepageApi = async (req, res) => {
  try {
    const getCoursesResult = await Courses.findAll();
    const getAllOpinionsResult = await Opinions.findAll();
    let sortedCourses = sortCourses(getCoursesResult).sort(
      (a, b) => a.sort - b.sort
    );
    await downloadingCoursesImages(getCoursesResult);
    let files = await fs.readdir(path.resolve("public/imgs/imgs/opinions"));

    return res.json({
      courses: sortedCourses,
      opinions: getAllOpinionsResult,
      whatsapp_opinions: files,
    });
  } catch (e) {
    await errorRaiser(e, next, "API");
  }
};

export const getShoppingCart = async (req, res, next) => {
  try {
    if (req.user.cart) {
      const coursesArr = await findCartCourses(req.user.cart);
      // console.log(coursesArr);

      let coursesRoundsDates = await Promise.all(
        coursesArr.map(async ({ course_id }) => {
          return (
            await sequelize.query(
              `select round_date from rounds inner join courses course on course.course_id = rounds.course_id`,
              {
                replacements: [course_id],
                type: QueryTypes.SELECT,
              }
            )
          )[0]?.round_date;
        })
      );

      coursesRoundsDates = coursesRoundsDates.map((courseRound) => courseRound);

      if (Array.isArray(req.user.cart) && req.user.cart.length > 0) {
        const arrOfPrices = extractArrOfPrices(coursesArr);
        const totalPrice = calcTotalPrice(arrOfPrices);

        return res.render("shopping/index", {
          title: "Shopping Cart",
          path: "/cart",
          cart: req.user.cart,
          bought_courses: coursesArr,
          roundsDates: coursesRoundsDates,
          totalPrice,
          moment,
        });
      } else {
        return res.render("shopping/index", {
          title: "Shopping Cart",
          path: "/cart",
          cart: req.user.cart,
          bought_courses: [],
          roundsDates: [],
          totalPrice: 0,
          moment,
        });
      }
    } else {
      return res.render("shopping/index", {
        title: "Shopping Cart",
        path: "/cart",
        cart: req.user.cart,
        bought_courses: [],
        totalPrice: 0,
        moment,
      });
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postDeleteFromCart = async (req, res, next) => {
  try {
    const wantedToDelete = req.body.courseId;

    const updatedCart = filterCart(req.user.cart, wantedToDelete);

    console.log(`updatedCart`, updatedCart);

    const deletingResult = await Users.update(
      {
        cart: updatedCart,
      },
      { where: { user_id: req.user.user_id } }
    );

    console.log(`deleting result ${deletingResult}`);

    if (Array.isArray(deletingResult)) {
      return res.status(200).json({
        success: true,
        message: "Unwanted items deleted successfully",
      });
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getAboutPageDataApi = async (req, res, next) => {
  try {
    const paragraphs = await About.findAll({
      where: {
        instructor_name: null,
      },
      order: ["createdAt"],
    });

    const instructors = await About.findAll({
      where: {
        about_us_paragraph: null,
      },
      order: ["createdAt"],
    });

    for (let ins of instructors) {
      logger.info(`instructor images ===> ${ins.instructor_image}`);
      if (ins.instructor_image && ins.instructor_image.length > 0) {
        getSingleFile(ins.instructor_image)
          .then((res) => {
            logger.info(`Instructor Image ==> ${res}`);
          })
          .catch((err) => {
            logger.error(err);
          });
      }

      if (
        ins.instructor_certificates &&
        ins.instructor_certificates.length > 0
      ) {
        for (let img of ins.instructor_certificates) {
          logger.info(`instructor certificate ${img}`);
          await getSingleFile(img);
        }
      }
    }

    return res.status(200).json({
      paragraphs,
      instructors,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

// TODO: REMOVE IN NEW IMPLEMENTATION
export const getAboutPage = async (req, res, next) => {
  try {
    const paragraphs = await About.findAll({
      where: {
        instructor_name: null,
      },
      order: ["createdAt"],
    });

    const instructors = await About.findAll({
      where: {
        about_us_paragraph: null,
      },
      order: ["createdAt"],
    });

    if (process.env.NODE_ENV === "production")
      for (let ins of instructors) {
        console.log(`instructor images ===> `, ins.instructor_image);
        if (ins.instructor_image && ins.instructor_image.length > 0) {
          getSingleFile(ins.instructor_image)
            .then((res) => {
              console.log(`Instructor Image ==> `, res);
            })
            .catch((err) => {
              console.log(err);
            });
        }

        if (
          ins.instructor_certificates &&
          ins.instructor_certificates.length > 0
        ) {
          for (let img of ins.instructor_certificates) {
            console.log(`instructor certificate ${img}`);
            await getSingleFile(img);
          }
        }
      }

    return res.render("about/index", {
      title: "About Us",
      path: "/aboutme",
      paragraphs,
      instructors,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getContactPage = (req, res, next) => {
  return res.render("contactus/index", {
    title: "Contact Us",
    path: "/contact",
    errorMessage: null,
    successMessage: null,
  });
};

export const postContactPage = async (req, res, next) => {
  const senderName = req.body.contact_name;
  const senderEmail = req.body.contact_email;
  const senderContent = req.body.contact_content;

  let sentToken = "";
  let requestBody = "";

  if (process.env.NODE_ENV === "production") {
    sentToken = req.body["g-recaptcha-response"];
    requestBody = {
      url: `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPCHTA_SECRET}&response=${sentToken}`,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      },
    };
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(extractErrorMessages(errors.array()));
  }

  if (process.env.NODE_ENV === "production") {
    const { data } = await axios(requestBody);
    if (!data.success) {
      return res
        .status(422)
        .json(constructError("reCaptcha", "Failed in robot test"));
    }
  }

  try {
    const sendingResult = await Messages.create({
      sendername: senderName,
      senderemail: senderEmail,
      message: senderContent,
    });

    if (sendingResult._options.isNewRecord) {
      return res
        .status(200)
        .json({ success: true, message: "Message sent successfully" });
    }

    return res
      .status(500)
      .json(
        constructError(
          "server error",
          "Message didn't save, Please call us on our number!"
        )
      );
  } catch (e) {
    await errorRaiser(e, next, "API");
  }
};

export const downloadCV = (req, res, next) => {
  const cvPath = path.resolve("public", "files");
  res.download(cvPath + "/dr_wesam_nageib.docx");
  res.status(200);
};

// export const getOpinionsPage = (req, res, next) => {
//   fs.readdir(path.resolve("public/imgs/imgs/opinions"), (err, files) => {
//     if (!err) {
//       let opinionsImages = files;
//
//       res.render("opinions/index", {
//         title: "Opinions",
//         path: "/opinions",
//         opinionsImages,
//       });
//     } else {
//       errorRaiser(err, next);
//     }
//   });
// };

export const getOpinionsForm = (req, res, next) => {
  res.render("opinions/form", {
    title: "Opinion Form",
    path: "/opinions/form",
    validationErrors: [],
    opinion: {},
  });
};

export const postOpinions = async (req, res, next) => {
  const senderName = req.body.name;
  const senderEmail = req.body.email;
  const senderCourse = req.body.sender_course;
  const senderOpinion = req.body.opinion;
  const errors = validationResult(req);

  if (!errors.isEmpty() && senderName === "Henryimmob") {
    req.flash("error", errors.array()[0].msg);
    console.log(errors.array());
    res.render("opinions/form", {
      title: "Your Opinions",
      path: "/opinions_form",
      validationErrors: errors.array(),
      opinion: {
        sender_name: senderName,
        sender_email: senderEmail,
        sender_course: senderCourse,
        opinion: senderOpinion,
      },
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
          req.flash("success", "Thanks for your opinion 😄");
          res.redirect("/");
        } else {
          req.flash("error", "You've entered an opinion before!");
          res.redirect("/");
        }
      })
      .catch((err) => {
        console.log(err);
        req.flash("error", err.message);
        res.render("opinions/form", {
          title: "Your Opinions",
          path: "/opinions_form",
          validationErrors: [],
          opinion: {
            sender_name: senderName,
            sender_email: senderEmail,
            sender_course: senderCourse,
            opinion: senderOpinion,
          },
        });
      });
  }
};
