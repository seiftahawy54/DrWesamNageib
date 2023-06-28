// import { extractCart, getCoursesFormCart } from "../../utils/cart_helpers.js";
import {
    calculateExamsGrades,
    constructError,
    createCertificate,
    extractErrorMessages,
    extractErrorMessagesForSchemas,
    userPerformedExams,
} from "../../utils/general_helper.js";
import {getSingleFile, uploadFile} from "../../utils/aws.js";
import fs from "fs";
import {sequelize} from "../../utils/db.js";
import moment from "moment";
import {validationResult} from "express-validator";
import logger from "../../utils/logger.js";

import {
    Exams,
    Payment,
    Courses,
    Rounds,
    Users,
    ExamsReplies,
} from "../../models/index.js";
import {errorRaiser} from "../../utils/error_raiser.js";
import axios from "axios";
import userPerRound from "../../models/userPerRound.js";
import {Op, Sequelize} from "sequelize";

export const getUserProfile = async (req, res, next) => {
    try {
        if (req.user.user_img) {
            try {
                const fetchingResult = await getSingleFile(req.user.user_img);
            } catch (e) {
                req.flash("error", e.message);
                return res.render("users/profile", {
                    title: req.user.name,
                    path: "/profile",
                    user: {
                        user_img: req.user.user_img,
                    },
                    validationError: {},
                    moment,
                });
            }
        }

        return res.render("users/profile", {
            title: req.user.name,
            path: "/profile",
            user: {
                user_img: req.user.user_img,
            },
            validationError: {},
            moment,
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const postUpdateUserImg = async (req, res, next) => {
    try {
        const userImg = req?.files[0];

        if (userImg?.path) {
            uploadFile(userImg.path, userImg.filename, userImg.mimetype, res, next)
                .then(async (result) => {
                    const updatingResult = await Users.update(
                        {
                            user_img: userImg.path,
                        },
                        {where: {user_id: req.user.user_id}}
                    );

                    if (updatingResult[0] === 1) {
                        return res.status(200).send({success: true});
                    } else {
                        return res.status(500).json({message: "Something went wrong"});
                    }
                })
                .catch((err) => errorRaiser(err, next));
        } else {
            res
                .status(422)
                .json(constructError("user-img", "Please select a valid image!"));
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
        if (!errors.isEmpty()) {
            return res.status(422).json(extractErrorMessages(errors.array()));
        }

        const updatingUserData = await Users.update(
            {
                name,
                email,
                whatsapp_no: whatsappNo,
                specialization,
            },
            {where: {user_id: req.user.user_id}}
        );

        if (updatingUserData[0] === 1) {
            // req.flash("success", ");
            return res
                .status(200)
                .json({success: true, message: "Your Data is updated successfully"});
        }

        return res.status(500).json({
            error: true,
            message: "Server error",
        });
    } catch (e) {
        await errorRaiser(e, next, "API");
    }
};

export const getUserCertificate = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;

        const roundAndCourse = await sequelize.query(
            `select *, course.* from rounds inner join courses course on rounds.round_id = ? and course.course_id = ?`,
            {
                replacements: [req.user.finished_course, courseId],
                type: "SELECT",
            }
        );

        if (roundAndCourse[0].special_course) {
            getSingleFile(roundAndCourse[0].course_img)
                .then((response) => {
                    const certificateDoc = createCertificate(
                        req.user.name,
                        req.user.user_id,
                        roundAndCourse[0].name,
                        roundAndCourse[0].total_hours,
                        roundAndCourse[0].round_date,
                        roundAndCourse[0].course_img,
                        roundAndCourse[0].course_category
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
                })
                .catch((err) => {
                    logger.error(err);
                    return res.status(500).json({
                        error: true,
                        message: "Server error",
                    });
                });
        } else {
            logger.error(err);
            return res.status(500).json({
                error: true,
                message: "Server error",
            });
        }
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getPerformExam = async (req, res, next) => {
    try {
        const examId = req.params.examId;
        const findingExam = await Exams.findByPk(examId);
        const findingUserReply = await ExamsReplies.findAll({
            where: {user_id: req.user.user_id, exam_id: examId},
        });

        logger.info(`Finding USER REPLY ===> `, findingUserReply);

        if (findingExam) {
            let allRoundsUsersIds = await Rounds.findAll({
                attributes: ["users_ids"],
            });

            allRoundsUsersIds = allRoundsUsersIds.map(({users_ids}) => {
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
                return res.status(401).json({
                    message: "You are not enrolled on any round!",
                });
            }

            if (findingUserReply.length > 0) {
                return res.status(200).json({
                    message: "Exam is already performed!",
                });
            }

            (async () => {
                for (const questionObj of findingExam.questions) {
                    if ("examImage" in questionObj) {
                        const fetchingResult = await getSingleFile(questionObj.examImage);
                        logger.info("Image searching result => ", fetchingResult);
                    }
                }
            })();

            return res.status(200).json({
                exam: findingExam,
            });
        }
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

            const creatingNewReplyResult = await ExamsReplies.create({
                exam_id: examId,
                user_id: req.user.user_id,
                grade,
                user_answers: userAnswers,
            });

            logger.info(`creating New Reply Result ====> `, creatingNewReplyResult);

            return res.status(201).json({
                grade,
                previewLink: creatingNewReplyResult.reply_id,
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
        const replyId = req.params.replyId;
        // const userData = await Users.findByPk(req.userId);

        let replyData = await sequelize.query(
            `
      SELECT e.title, e.questions, reply.reply_id, u.name as user_name, reply.grade, reply.user_answers FROM exams_replies reply
        INNER JOIN exams e ON reply.exam_id = e.exam_id
        INNER JOIN users u ON reply.user_id = u.user_id where reply.reply_id = ?;
    `,
            {
                replacements: [replyId],
                type: "SELECT",
            }
        );

        replyData = Array.isArray(replyData) ? replyData[0] : false;

        if (replyData) {
            // Filter questions from images
            // replyData.questions = replyData.questions.filter(
            //   (q) => "questionHeader" in q
            // );

            // let questionsWithoutImages = examData.questions
            //   .map((question) => {
            //     if ("questionHeader" in question) {
            //       return question;
            //     }
            //   })
            //   .filter((question) => question !== undefined);

            let questionsWithUserAnswers = [];
            let imgsCounter = 0;
            let answersCounter = 0;

            const newUserAnswerArr = replyData.questions.map((question, index) => {
                if ("questionHeader" in question) {
                    return replyData.user_answers[answersCounter++];
                } else {
                    return question;
                }
            });

            for (let question = 0; question < newUserAnswerArr.length; question++) {
                if (!("examImage" in newUserAnswerArr[question])) {
                    questionsWithUserAnswers.push({
                        userAnswer: Object.values(newUserAnswerArr[question])[0],
                        correctAnswer: parseInt(
                            replyData.questions[question].correctAnswer
                        ),
                    });
                } else {
                    questionsWithUserAnswers.push({
                        questionImage: Object.values(newUserAnswerArr[question])[0],
                    });
                }
            }

            return res.status(200).json({
                userAnswers: questionsWithUserAnswers,
                questions: replyData.questions,
                examData: {
                    title: replyData.title,
                },
            });

            /* return res.render("users/exam_preview", {
              title: `Trying Exam ${replyData.title} for User ${replyData.name}`,
              path: "/profile",
              performingData: questionsWithUserAnswers,
              questions: replyData.questions,
              examData: {
                title: replyData.title,
              },
              userData: req.user,
            }); */
        }

        return res.status(500).json({
            error: true,
            message: "Server Error"
        })
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
    const {name, whatsapp_no, user_id, email, specialization, user_img} =
        await Users.findByPk(req.user.user_id);

    try {
        return res.status(200).json({name, whatsapp_no, user_id, email, specialization, user_img});
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getBoughtCourses = async (req, res, next) => {
    try {
        const findingUserPayments = await Payment.findAll({
            where: {user_id: req.user.user_id},
            include: [
                {
                    model: Courses,
                    on: {
                        course_id: {
                            [Op.ne]: Sequelize.col("payments.course_id")
                        }
                    },
                    attributes: ["name", "price"],
                    where: {
                        isDeleted: false
                    }
                }
            ]
        });

        if (
          !Array.isArray(findingUserPayments) ||
          findingUserPayments.length === 0
        ) {
          return res
            .status(200)
            .json({ message: "No payments found", payments: [] });
        }
        //
        // const coursesPayments = findingUserPayments.map((payment) => {
        //   return payment.course_id;
        // });
        //
        // if (!Array.isArray(coursesPayments) || coursesPayments.length === 0) {
        //   return res
        //     .render(200)
        //     .json({ message: "No courses are payed for!", payments: null });
        // }
        //
        // const findingBoughtCourses = await Promise.all(
        //   await coursesPayments.map(async (courses) => {
        //     return await Courses.findByPk(courses, {
        //       attributes: ["name", "price"],
        //     });
        //   })
        // );

        return res
            .status(200)
            .json({message: "Payments found!", payments: findingBoughtCourses});
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getUserRound = async (req, res, next) => {
    try {
        // let roundData = await sequelize.query(
        //   `// SELECT * FROM rounds WHERE ? LIKE ANY (rounds.users_ids)`,
        //   { replacements: [req.user.user_id], type: "SELECT" }
        // );

        let roundData = await userPerRound.findAll({
            where: {userId: req.user.user_id},
            include: [
                {
                    model: Rounds,
                    as: "rounds",
                    on: {
                        round_id: {
                            [Op.eq]: Sequelize.col("userPerRound.roundId"),
                        },
                    },
                    attributes: ["round_date", "round_id", "finished", "course_id", "round_link"],
                    include: [
                        {
                            model: Courses,
                            as: "course",
                            on: {
                                course_id: {
                                    [Op.eq]: Sequelize.col("rounds.course_id"),
                                },
                            },
                            attributes: ["name", "price"],
                        }
                    ]
                }
            ]
        })

        return res.status(200).json({
            message: "Round found",
            rounds: roundData,
        });
    } catch (e) {
        await errorRaiser(e, next, "API");
    }
};

export const getUserGrades = async (req, res, next) => {
    try {
        console.log(`entered here`)
        let usersExamsData = await userPerformedExams(req.user.user_id);

        res.status(200).json({
            userExams: usersExamsData.length > 0 ? usersExamsData : null,
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getUserProfileCertificate = async (req, res, next) => {
    try {
        const usersExamsData = await sequelize.query(
            `
    SELECT e.title, e.questions, reply.reply_id, reply.grade, e.special_exam FROM exams_replies reply
        INNER JOIN exams e ON reply.exam_id = e.exam_id
        INNER JOIN users u ON reply.user_id = u.user_id WHERE reply.user_id = ?;
    `,
            {
                replacements: [req.user.user_id],
                type: "SELECT",
            }
        );

        let havePassedSpecial = false;

        for (let reply of usersExamsData) {
            reply.questions = reply.questions
                .map((question) => {
                    if ("questionHeader" in question) return question;
                })
                .filter((q) => q);
        }

        for (let reply of usersExamsData) {
            if (reply.special_exam && reply.grade > reply.questions.length / 2) {
                havePassedSpecial = true;
            }
        }

        let roundDate = "",
            finishedCourseName = "",
            courseId;

        if (typeof req.user.finished_course === "string" && havePassedSpecial) {
            const findingFinishedRoundResult = await Rounds.findByPk(
                req.user.finished_course
            );

            if (findingFinishedRoundResult) {
                const findingFinishedCourseResult = await Courses.findByPk(
                    findingFinishedRoundResult.course_id
                );

                roundDate = findingFinishedRoundResult.round_date;

                if (
                    findingFinishedCourseResult &&
                    findingFinishedCourseResult.special_course
                ) {
                    finishedCourseName = findingFinishedCourseResult.name;
                    courseId = findingFinishedCourseResult.course_id;
                }
            }
        }

        let certificateData = {};

        if (
            !(
                roundDate.length === 0 ||
                courseId.length === 0 ||
                finishedCourseName.length === 0
            )
        ) {
            certificateData = {
                roundDate: moment(roundDate).format("LL"),
                courseName: finishedCourseName,
                courseId,
            };
        }

        if ("courseId" in certificateData) {
            return res.status(200).json({
                certificateData,
            });
        }

        return res.status(200).json({certificateData: null});
    } catch (e) {
        await errorRaiser(e, next);
    }
};
