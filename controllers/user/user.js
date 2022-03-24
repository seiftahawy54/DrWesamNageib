import { Payment } from "../../models/payment.js";
import { errorRaiser } from "../../utils/error_raiser.js";
import { Courses } from "../../models/courses.js";
// import { extractCart, getCoursesFormCart } from "../../utils/cart_helpers.js";
import { Users } from "../../models/users.js";
import { createCertificate, deleteFile } from "../../utils/general_helper.js";
import { getSingleFile, uploadFile } from "../../utils/aws.js";
import fs from "fs";
import path from "path";
import { sequelize } from "../../utils/db.js";
import { Rounds } from "../../models/rounds.js";
import moment from "moment";

export const getUserProfile = async (req, res, next) => {
  const roundLink = await sequelize.query(
    `select * from rounds where ? LIKE ANY (rounds.users_ids)`,
    { replacements: [req.user.user_id], type: "SELECT" }
  );

  let round = "",
    finishedCourseName = "",
    courseId = "",
    roundDate = "";

  if (
    Array.isArray(roundLink) &&
    roundLink.length > 0 &&
    "round_link" in roundLink[0]
  ) {
    round = roundLink[0].round_link;

    // if (typeof req.user.finished_course === "string") {
    //   let courseResult = await sequelize.query(
    //     `select course.name, course.course_id from rounds inner join courses course on rounds.round_id = ? and course.course_id = ?`,
    //     {
    //       replacements: [req.user.finished_course, roundLink[0].course_id],
    //       type: "SELECT",
    //     }
    //   );
    //
    //   finishedCourseName = courseResult[0].name;
    //   courseId = roundLink[0].course_id;
    // }
  }

  if (typeof req.user.finished_course === "string") {
    const findingFinishedRoundResult = await Rounds.findByPk(
      req.user.finished_course
    );

    if (findingFinishedRoundResult) {
      const findingFinishedCourseResult = await Courses.findByPk(
        findingFinishedRoundResult.course_id
      );

      roundDate = findingFinishedRoundResult.round_date;

      if (findingFinishedCourseResult) {
        finishedCourseName = findingFinishedCourseResult;
        courseId = findingFinishedCourseResult.course_id;
      }
    }
  }

  try {
    if (req.user.user_img) {
      if (
        !fs.existsSync(path.resolve("downloaded_images", req.user.user_img))
      ) {
        try {
          const fetchingResult = await getSingleFile(req.user.user_img);
        } catch (e) {
          req.flash("error", e.message);
          return res.render("users/profile", {
            title: req.user.name,
            path: "/profile",
            user: req.user,
            roundLink: "",
            courseName: "",
            bought_courses: [],
            validationError: {},
            moment,
            roundDate,
          });
        }
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

      return res.render("users/profile", {
        title: req.user.name,
        path: "/profile",
        user: req.user,
        roundLink: round,
        courseName: finishedCourseName,
        courseId: courseId,
        bought_courses: findingBoughtCourses,
        validationError: {},
        moment,
        roundDate,
      });
    } else {
      // req.flash("error", "There's an error from our end!");
      return res.render("users/profile", {
        title: req.user.name,
        path: "/profile",
        user: req.user,
        bought_courses: [],
        courseName: finishedCourseName,
        courseId: courseId,
        roundLink: round,
        validationError: {},
        moment,
        roundDate,
      });
    }
  } catch (e) {
    console.log(`we've entered here`, e);
    req.flash("error", e.message);

    // res.redirect("/profile");
    return res.render("users/profile", {
      title: req.user.name,
      path: "/profile",
      user: req.user,
      roundLink: round,
      courseName: finishedCourseName,
      courseId: courseId,
      bought_courses: [],
      validationError: {},
      moment,
      roundDate,
    });
  }
};

export const postUpdateUserImg = async (req, res, next) => {
  try {
    const userImg = req?.files[0];

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
      req.flash("error", "Please select a valid image!");
      res.redirect("/profile");
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getUpdateUserData = (req, res, next) => {
  req.flash("error", "Not Implemented yet!");
  res.redirect("/profile");
};

export const getUserCertificate = async (req, res, next) => {
  const courseId = req.params.courseId;

  const roundAndCourse = await sequelize.query(
    `select * from rounds inner join courses course on rounds.round_id = ? and course.course_id = ?`,
    {
      replacements: [req.user.finished_course, courseId],
      type: "SELECT",
    }
  );

  console.log(`selected rounds: `, roundAndCourse[0].round_date);
  // console.log(`new certificate: `, roundAndCourse[0].round_date);

  const certificateDoc = createCertificate(
    req.user.name,
    req.user.user_id,
    roundAndCourse[0].name,
    roundAndCourse[0].round_date
  );

  certificateDoc.certificateObject.pipe(
    fs.createWriteStream(certificateDoc.certificatePath)
  );

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${certificateDoc.certificateName}"`
  );

  certificateDoc.certificateObject.pipe(res);
  certificateDoc.certificateObject.end();
};
