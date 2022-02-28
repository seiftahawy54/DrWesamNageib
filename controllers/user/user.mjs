import { Payment } from "../../models/payment.mjs";
import { errorRaiser } from "../../utits/error_raiser.mjs";
import { Courses } from "../../models/courses.mjs";
// import { extractCart, getCoursesFormCart } from "../../utits/cart_helpers.mjs";
import { Users } from "../../models/users.mjs";
import { deleteFile } from "../../utits/general_helper.mjs";
import { getSingleFile, uploadFile } from "../../utits/aws.mjs";
import fs from "fs";
import path from "path";
import axios from "axios";
import { sequelize } from "../../utits/db.mjs";

export const getUserProfile = async (req, res, next) => {
  const roundLink = await sequelize.query(
    `select round_link from rounds where ? LIKE ANY (rounds.users_ids)`,
    { replacements: [req.user.user_id] }
  );

  try {
    if (!fs.existsSync(path.resolve("downloaded_images", req.user.user_img))) {
      try {
        const fetchingResult = await getSingleFile(req.user.user_img);
      } catch (e) {
        req.flash("error", e.message);
        return res.render("users/profile", {
          title: req.user.name,
          path: "/profile",
          user: req.user,
          roundLink: "",
          bought_courses: [],
          validationError: {},
        });
      }
    }

    const findingUserPayments = await Payment.findAll({
      where: { user_id: req.user.user_id },
    });

    if (findingUserPayments.length !== 0) {
      const coursesPayments = findingUserPayments.map((payment) => {
        return payment.course_id;
      });

      const findingBoughtCourses = await Promise.all(
        coursesPayments.map(async (courses) => {
          return await Courses.findByPk(courses);
        })
      );

      // const userImgBuffer = await getSingleFile(req.user.user_img);
      // const userImg = JSON.stringify(userImgBuffer);

      return res.render("users/profile", {
        title: req.user.name,
        path: "/profile",
        user: req.user,
        roundLink: roundLink[0][0].round_link,
        bought_courses: findingBoughtCourses,
        validationError: {},
      });
    } else {
      req.flash("error", "There's an error from our end!");
      return res.render("users/profile", {
        title: req.user.name,
        path: "/profile",
        user: req.user,
        bought_courses: [],
        roundLink: roundLink[0][0].round_link,
        validationError: {},
      });
    }
  } catch (e) {
    req.flash("error", e.message);
    return res.render("users/profile", {
      title: req.user.name,
      path: "/profile",
      user: req.user,
      roundLink:
        Array.isArray(roundLink[0]) && roundLink[0].length > 0
          ? roundLink[0][0].roundLink
          : "",
      bought_courses: [],
      validationError: {},
    });
  }
};

export const postUpdateUserImg = async (req, res, next) => {
  try {
    const userImg = req?.files[0];
    console.log(userImg);

    if (userImg?.path) {
      uploadFile(userImg.path, userImg.filename, userImg.mimetype, res, next)
        .then(async (result) => {
          console.log(`uploading result: `, result);
          const updatingResult = await Users.update(
            {
              user_img: userImg.path,
            },
            { where: { user_id: req.user.user_id } }
          );

          if (updatingResult[0] === 1) {
            req.flash("success", "Success");
            return res.redirect("/profile");
          } else {
            req.flash("error", "Something wrong happened");
            return res.redirect("/profile");
          }
        })
        .catch((err) => errorRaiser(err, next));
    } else {
      const findingUserPayments = await Payment.findAll({
        where: { user_id: req.user.user_id },
      });

      const coursesPayments = findingUserPayments.map((payment) => {
        return payment.course_id;
      });

      const findingBoughtCourses = coursesPayments.map(async (courses) => {
        return await Courses.findByPk(courses);
      });

      const boughtCourses = [];

      for (const key of findingBoughtCourses) {
        boughtCourses.push(await key);
      }

      res.render("users/profile", {
        title: req.user.name,
        path: "/profile",
        user: req.user,
        bought_courses: boughtCourses,
        errorMessage: "Please enter a valid img!",
        validationError: {
          error: "img",
        },
      });
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};
