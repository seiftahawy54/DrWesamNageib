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

export const getUserProfile = async (req, res, next) => {
  try {
    if (!fs.existsSync(path.resolve("downloaded_images", req.user.user_img))) {
      console.log("we entered here", req.user.user_img);
      try {
        const fetchingResult = await getSingleFile(req.user.user_img);
        console.log(fetchingResult?.err);
      } catch (e) {
        res.render("users/profile", {
          title: req.user.name,
          path: "/profile",
          user: req.user,
          errorMessage: e.message,
          bought_courses: [],
          validationError: {},
        });
      }
    }
    console.log(
      fs.existsSync(path.resolve("downloaded_images", req.user.user_img))
    );

    const findingUserPayments = await Payment.findAll({
      where: { user_id: req.user.user_id },
    });

    if (findingUserPayments.length !== 0) {
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

      // const userImgBuffer = await getSingleFile(req.user.user_img);
      // const userImg = JSON.stringify(userImgBuffer);

      res.render("users/profile", {
        title: req.user.name,
        path: "/profile",
        user: req.user,
        errorMessage: "",
        bought_courses: boughtCourses,
        validationError: {},
      });
    } else {
      res.render("users/profile", {
        title: req.user.name,
        path: "/profile",
        user: req.user,
        errorMessage: "",
        bought_courses: [],
        validationError: {},
      });
    }
  } catch (e) {
    res.render("users/profile", {
      title: req.user.name,
      path: "/profile",
      user: req.user,
      errorMessage: "There is an error from our side, please contact ASAP!",
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
    errorRaiser(e, next);
  }
};
