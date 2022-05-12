// import { extractCart, getCoursesFormCart } from "../../utils/cart_helpers.js";
import {
  calculateExamsGrades,
  createCertificate,
  deleteFile,
} from "../../utils/general_helper.js";
import { getSingleFile, uploadFile } from "../../utils/aws.js";
import fs from "fs";
import path from "path";
import { sequelize } from "../../utils/db.js";
import moment from "moment";
import { validationResult } from "express-validator";

import { Exams, Payment, Courses, Rounds, Users } from "../../models/index.js";
import { errorRaiser } from "../../utils/error_raiser.js";
import axios from "axios";

export const getUserProfile = async (req, res, next) => {
  const roundLink = await sequelize.query(
    `select * from rounds where ? LIKE ANY (rounds.users_ids)`,
    { replacements: [req.user.user_id], type: "SELECT" }
  );

  const allExams = await Exams.findAll({
    attributes: ["exam_id", "title", "replies", "questions"],
  });

  let findingUsersExams = allExams.map(
    ({ exam_id, replies, title, questions }) => {
      if (Array.isArray(replies)) {
        return {
          examId: exam_id,
          title,
          questions: questions.filter((examObj) => "questionHeader" in examObj)
            .length,
          replies: replies.map(({ user_id, grade }) => {
            if (req.user.user_id === user_id) {
              return grade;
            }
          }),
          preview_link: replies.map(({ user_id, grade }, index) => {
            if (req.user.user_id === user_id) {
              return `/exam/preview/${exam_id}/${user_id}/${index}`;
            }
          }),
        };
      }
    }
  );

  console.log(`before ====> `, findingUsersExams);

  findingUsersExams = findingUsersExams.filter((reply) => reply?.replies);

  for (let examData of findingUsersExams) {
    examData.replies = examData.replies.filter((i) => i);
    examData.preview_link = examData.preview_link.filter((i) => i);
  }

  console.log(`after ===> `, findingUsersExams);

  /*  let unfoundRepliesFlag = false;

    for (let i of findingUsersExams) {
      if (i.replies.some((reply) => reply === undefined)) {
        unfoundRepliesFlag = true;
        break;
      }
    }
  
    if (unfoundRepliesFlag) {
      findingUsersExams = [];
    }*/

  // console.log(findingUsersExams.replies.some((ele) => ele === undefined));

  // console.log(findingUsersExams.some((ele) => ele === undefined));

  // findingUsersExams = [];

  // let currentUserGrades = findingUsersExams.map(({ title, replies }) => {
  //
  // });

  let round = "",
    finishedCourseName = "",
    courseId = "",
    roundDate = "",
    userGrades = findingUsersExams;

  if (
    Array.isArray(roundLink) &&
    !roundLink[0]?.finished &&
    roundLink.length > 0 &&
    "round_link" in roundLink[0]
  ) {
    round = roundLink[0].round_link;
  }

  if (
    typeof req.user.finished_course === "string" &&
    findingUsersExams.length > 0
  ) {
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
            userGrades,
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
        userGrades,
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
        userGrades,
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
      userGrades,
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

export const getUpdateUserData = async (req, res, next) => {
  try {
    if (!"user_id" in req.user) {
      req.flash("error", "Something happened");
      return res.redirect("/profile");
    }

    return res.render("users/user_form", {
      title: req.user.name,
      path: "/profile",
      user: req.user,
      validationErrors: [],
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postUpdateUserData = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const whatsappNo = req.body.whatsapp_number;
  const specialization = req.body.specialization;
  const errors = validationResult(req);
  try {
    console.log(`errors ===>`, errors.array());

    if (!errors.isEmpty()) {
      return res.render("users/user_form", {
        title: req.user.name,
        path: "/profile",
        user: {
          ...req.user,
          name,
          email,
          whatsapp_no: whatsappNo,
          specialization,
        },
        validationErrors: errors.array(),
      });
    }

    const updatingUserData = await Users.update(
      {
        name,
        email,
        whatsapp_no: whatsappNo,
        specialization,
      },
      { where: { user_id: req.user.user_id } }
    );

    console.log(`updating user data result ==> `, updatingUserData);

    if (updatingUserData[0] === 1) {
      req.flash("success", "Your Data is updated successfully");
      return res.redirect("/profile");
    } else {
      req.flash(
        "error",
        "Something happened in our end, please contact the admins"
      );
      return res.redirect("/profile");
    }
  } catch (e) {
    req.flash("error", e.message);
    console.log(e);
    return res.render("users/user_form", {
      title: req.user.name,
      path: "/profile",
      user: {
        ...req.user,
        name,
        email,
        whatsapp_no: whatsappNo,
        specialization,
      },
      validationErrors: errors.array(),
      errorMessage: [e.errors[0].message],
    });
  }
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

export const getPerformExam = async (req, res, next) => {
  try {
    const examId = req.params.examId;
    const findingExam = await Exams.findByPk(examId);
    let performedBefore = false;

    if (findingExam) {
      let allRoundsUsersIds = await Rounds.findAll({
        attributes: ["users_ids"],
      });

      allRoundsUsersIds = allRoundsUsersIds.map(({ users_ids }) => {
        return users_ids;
      });

      let searchingResult = false;

      for (let round of allRoundsUsersIds) {
        for (let userId of round) {
          if (req.user.user_id === userId) {
            searchingResult = true;
            break;
          }
        }
      }

      if (!searchingResult) {
        req.flash("error", "You are not enrolled on any round!");
        return res.redirect("/profile");
      }

      for (let reply in findingExam.replies) {
        if (findingExam.replies[reply].user_id === req.user.user_id) {
          performedBefore = true;
          req.flash("error", "Exam is already performed!");
          return res.redirect("/profile");
        }
      }

      const testing = async () => {
        for (const questionObj of findingExam.questions) {
          if ("examImage" in questionObj) {
            const fetchingResult = await getSingleFile(questionObj.examImage);
            console.log("Image searching result => ", fetchingResult);
          }
        }
      };

      testing();
      /*findingExam.questions = findingExam.questions.filter(
        (quesObj) => "questionHeader" in quesObj
      );*/

      return res.status(200).render("users/exam", {
        title: findingExam.title,
        path: "/profile",
        exam: findingExam,
      });
    }

    // req.flash("error", "Please check the link!");
    // return res.redirect("/profile");
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const postPerformExam = async (req, res, next) => {
  try {
    const userAnswers = req.body.userAnswers;
    const examId = req.body.examId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).json({
        userAnswers,
        errors,
      });
    }

    const exam = await Exams.findByPk(examId);

    if (exam) {
      let filteredQuestions = exam.questions.filter(
        (examObj) => "questionHeader" in examObj
      );

      const grade = calculateExamsGrades(userAnswers, filteredQuestions);
      const examData = await Exams.findByPk(examId);

      let newReplies,
        userData = { user_id: req.user.user_id, grade, userAnswers };

      if (!exam.replies && !Array.isArray(exam.replies)) {
        newReplies = [userData];
      } else {
        newReplies = [...examData?.replies, userData];
      }

      const updatingReplies = await Exams.update(
        {
          replies: newReplies,
        },
        { where: { exam_id: examId } }
      );

      return res.status(201).json({
        grade,
      });
    } else {
      return res.status(404).json({
        userAnswers,
        examId,
      });
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getExamPreview = async (req, res, next) => {
  try {
    const examId = req.params.examId;
    const userId = req.params.userId;
    const replyIndex = req.params.replyIndex;

    const examData = await Exams.findByPk(examId);

    if (examData && req.user.user_id === userId) {
      const examReplies = examData.replies;
      const userPreviewAnswers = examReplies.filter(
        ({ user_id }) => user_id === userId
      );

      let questionsWithoutImages = examData.questions
        .map((question) => {
          if ("questionHeader" in question) {
            return question;
          }
        })
        .filter((question) => question !== undefined);

      console.log(questionsWithoutImages);

      let questionsWithUserAnswers = [];

      for (
        let question = 0;
        question < questionsWithoutImages.length;
        question++
      ) {
        questionsWithUserAnswers.push({
          userAnswer:
            userPreviewAnswers[replyIndex].userAnswers[question][
              `${question + 1}`
            ],
          correctAnswer: parseInt(
            questionsWithoutImages[question].correctAnswer
          ),
        });
      }

      // console.log(questionsWithUserAnswers);

      const userData = await Users.findByPk(req.user.user_id, {
        attributes: ["name"],
      });

      return res.render("users/exam_preview", {
        title: `Trying Exam ${examData.title} for User ${userData.name}`,
        path: "/profile",
        performingData: questionsWithUserAnswers,
        questions: questionsWithoutImages,
        examData,
      });
    }

    req.flash("error", "You've not entered this exam before");
    return res.redirect("user/profile");
  } catch (e) {
    await errorRaiser(e, next);
  }
};

export const getSubmittedExam = async (req, res, next) => {
  res.render("users/exam-result", {
    title: "Your exam has submitted successfully",
    path: "/profile",
  });
};

export const getAllUserData = async (req, res, next) => {
  try {
    return res.json({ user: req.user });
  } catch (e) {
    await errorRaiser(e, next);
  }
};
