// import { extractCart, getCoursesFormCart } from "../../utils/cart_helpers.js";
import {
    calculateExamsGrades,
    constructError,
    createCertificate,
    extractErrorMessages,
    userPerformedExams,
    validURL,
} from "../../utils/general_helper.js";
import {getSingleFile, uploadFile} from "../../utils/aws.js";
import fs from "fs";
import moment from "moment";
import {validationResult} from "express-validator";
import logger from "../../utils/logger.js";

import {Courses, Exams, ExamsReplies, Payment, Rounds, Users,} from "../../models/index.js";
import {errorRaiser} from "../../utils/error_raiser.js";
import userPerRound from "../../models/userPerRound.js";
import {Op, Sequelize} from "sequelize";
import qr from "qrcode";
import path from "path";
import UserPerCertificates from "../../models/UserPerCertificates.js";
import crypto from "crypto";

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
    const email = req.body.email;
    const whatsappNo = req.body.whatsapp_no;
    const specialization = req.body.specialization;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            return res.status(422).json(extractErrorMessages(errors.array()));
        }

        const findingOtherUserWithThisEmail = await Users.findOne({
            where: {
                email: {
                    [Op.ne]: req.user.email,
                    [Op.eq]: email
                },
            },
        })

        if (findingOtherUserWithThisEmail) {
            return res.status(422).json({
                errors: constructError('email', 'This email is already taken!'),
            });
        }

        const updatingUserData = await Users.update(
            {
                email,
                whatsapp_no: whatsappNo,
                specialization,
            },
            {where: {id: req.user.id}}
        );

        return res
            .status(200)
            .json({
                email,
                whatsappNo,
                specialization
            });
    } catch (e) {
        await errorRaiser(e, next, "API");
    }
};

export const getPerformExam = async (req, res, next) => {
    try {
        const examId = req.params.examId;
        const type = req.user.type;

        let exam = await Exams.findOne({
            where: {exam_id: examId}
        });

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found!",
            })
        }

        if (!exam.status && type < 2) {
            return res.status(200).json({
                message: "Exam is closed"
            })
        }

        const isUserInRound = await userPerRound.findAll({
            where: {
                userId: req.user.user_id,
            },
            include: [
                {
                    model: Rounds,
                    on: {
                        round_id: {
                            [Op.eq]: Sequelize.col("userPerRound.roundId"),
                        },
                    },
                    where: {
                        [Op.or]: [
                            {
                                finished: false,
                            },
                            {
                                archived: true
                            }
                        ],
                    }
                }
            ]
        })

        if (Array.isArray(isUserInRound) && isUserInRound.length === 0) {
            return res.status(401).json({
                message: "You are not enrolled on any round!",
            });
        }

        await (async () => {
            for (const questionObj of exam.questions) {
                if ("examImage" in questionObj) {
                    if (!validURL(questionObj.examImage)) {
                        const generatedLink = await getSingleFile(questionObj.examImage);
                        logger.info(`images search ===> ${generatedLink}`)
                        questionObj.examImage = generatedLink;
                    }
                }
            }
        })();

        // Filter answers
        exam.questions = exam.questions.map((question) => {
            if ("correctAnswer" in question) {
                return {
                    ...question,
                    correctAnswer: type > 1 ? question.correctAnswer : null
                }
            } else {
                return question
            }
        })

        return res.status(200).json({
            exam,
        });
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

        const exam = await Exams.findOne({
            where: {
                exam_id: examId
            }
        });

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

        const searchingForUser = await userPerRound.findAll({
            where: {userId: req.user.user_id},
        })

        // Bypass user check if user is admin
        if (req.user.role < 3 && Array.isArray(searchingForUser) && searchingForUser.length === 0) {
            return res.status(404).json({
                message: "User not found!",
            })
        }

        const searchData = {
            reply_id: replyId
        }

        if (req.user.type < 2) {
            searchData.user_id = req.user.user_id;
        }

        const replyData = await ExamsReplies.findOne({
            where: searchData,
            include: [
                {
                    model: Exams,
                    on: {
                        exam_id: {
                            [Op.eq]: Sequelize.col("exams_replies.exam_id"),
                        }
                    }
                }
            ]
        })

        if (!replyData) {
            return res.status(404).json({
                message: "Reply not found!",
            })
        }

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

        const newUserAnswerArr = replyData.exam.questions.map((question, index) => {
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
                        replyData.exam.questions[question].correctAnswer
                    ),
                });
            } else {
                questionsWithUserAnswers.push({
                    questionImage: Object.values(newUserAnswerArr[question])[0],
                });
            }
        }

        await (async () => {
            for (const questionObj of replyData.exam.questions) {
                if ("examImage" in questionObj) {
                    console.log(questionObj.examImage)
                    if (!validURL(questionObj.examImage)) {
                        console.log(`searching for ${questionObj.examImage} from replies`)
                        questionObj.examImage = await getSingleFile(questionObj.examImage);
                    }
                }
            }
        })();

        return res.status(200).json({
            userAnswers: questionsWithUserAnswers,
            questions: replyData.exam.questions,
            title: replyData.exam.title,
        });

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
        let {name, whatsapp_no, user_id, email, specialization, user_img} =
            await Users.findOne({
                where: {
                    user_id: req.user.user_id
                }
            });

        try {
            user_img = await getSingleFile(user_img);
        } catch (e) {
            user_img = `${process.env.BACKEND_URL}/imgs/imgs/default-user.png`;
            console.log(user_img)
        }

        return res.status(200).json({name, whatsapp_no, user_id, email, specialization, user_img});
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getBoughtCourses = async (req, res, next) => {
    try {
        const findingUserPayments = await Payment.findAll({
            where: {user_id: req.user.user_id, status: "success"},
            attributes: ['user_id', 'course_id', 'payment_id'],
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
                .json({message: "No payments found", payments: []});
        }

        return res
            .status(200)
            .json({message: "Payments found!", payments: findingUserPayments});
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getUserRound = async (req, res, next) => {
    try {
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
                    where: {
                        [Op.or]: [
                            {
                                finished: false
                            },
                            {
                                archived: true
                            }
                        ]
                    },
                    attributes: ["round_date", "round_id", "finished", "course_id", "title", "round_link"],
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
                    ],
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
        let usersExamsData = await userPerformedExams(req.user.user_id);

        res.status(200).json({
            userExams: usersExamsData.length > 0 ? usersExamsData : [],
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};


export const getUserCertificate = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;

        const roundAndCourse = await Rounds.findOne(
            {
                where: {course_id: courseId},
                include: [
                    {
                        model: Courses,
                        as: "course",
                        on: {
                            course_id: {
                                [Op.eq]: Sequelize.col("rounds.course_id"),
                            },
                        }
                    }
                ]
            }
        )

        const checkCertificateQrCode = await qr.toDataURL(`${process.env.FRONTEND_URL}/check/certificate/${courseId}`);
        let certificateSerial = '';

        const findingCertificate = await UserPerCertificates.findOne({
            where: {
                userId: req.user.user_id,
                courseId
            }
        });

        logger.info(`Certificate search result ${JSON.stringify(findingCertificate)}`)

        if (!findingCertificate) {
            certificateSerial = crypto.randomBytes(6).toString('hex');
            const userPerCertificate = await UserPerCertificates.create({
                certificateHash: certificateSerial,
                courseId,
                userId: req.user.user_id
            });
            logger.info(`Certificate created !! => ${JSON.stringify(userPerCertificate)}`);
        } else {
            certificateSerial = findingCertificate.certificateHash;
        }

        getSingleFile(roundAndCourse.course.course_img)
            .then(async (response) => {
                const certificateDoc = createCertificate(
                    req.user.name,
                    req.user.user_id,
                    roundAndCourse.course.name,
                    roundAndCourse.course.total_hours,
                    roundAndCourse.round_date,
                    roundAndCourse.course.course_img,
                    roundAndCourse.course.course_category,
                    checkCertificateQrCode,
                    certificateSerial
                );

                certificateDoc.certificateObject.pipe(
                    fs.createWriteStream(path.resolve('public', 'certificates', certificateDoc.certificatePath))
                );

                res.setHeader("Content-Type", "application/pdf");
                res.setHeader(
                    "Content-Disposition",
                    `inline; filename="${certificateDoc.certificateName}"`
                );

                certificateDoc.certificateObject.pipe(res);
                certificateDoc.certificateObject.end();

                // return res.send({certificate: `certificates/${certificateDoc.certificateName}`});

            })
            .catch(async (err) => {
                logger.error(err);
                await errorRaiser(err, next)
            });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getUserProfileCertificate = async (req, res, next) => {
    try {

        const {specialExams, findingFinishedRounds} = await userExamsRelatedData(req.user.user_id);

        if (specialExams.length === 0) {
            return res.status(200).json({message: "You've not passed any exams", certificateData: []});
        }

        /**
         *
         * {
         *   roundDate: "",
         *   finishedCourseName: "",
         *   courseId: ""
         *  }
         */
        let certificatesGenArr = [];


        if (Array.isArray(findingFinishedRounds) && findingFinishedRounds.length === 0) {
            return res.status(200).json({message: "You've not finished any rounds", certificateData: []});
        }

        for (let finishedRound of findingFinishedRounds) {
            certificatesGenArr.push({
                roundDate: moment(finishedRound.rounds[0].round_date).format("LL"),
                courseName: finishedRound.rounds[0].course.name,
                courseId: finishedRound.rounds[0].course.course_id
            })
        }

        return res.status(200).json({certificateData: certificatesGenArr});
    } catch (e) {
        await errorRaiser(e, next);
    }
};


const userExamsRelatedData = async (userId) => {
    // Finding the user's exams
    const userExamsData = await ExamsReplies.findAll({
        where: {
            user_id: userId,
        },
        include: [
            {
                model: Exams,
                as: "exam",
                on: {
                    exam_id: {
                        [Op.eq]: Sequelize.col("exams_replies.exam_id"),
                    },
                },
                where: {
                    special_exam: process.env.NODE_ENV === 'production'
                },
                include: [
                    {
                        model: Courses,
                        on: {
                            course_id: {
                                [Op.eq]: Sequelize.col("exam.course_id"),
                            },
                        },
                    }
                ]
            },
        ]
    })

    // Filter questions from images
    for (let reply of userExamsData) {
        reply.exam.questions = reply.exam.questions
            .map((question) => {
                if ("questionHeader" in question) return question;
            })
            .filter((q) => q);
    }

    // Finding wither user have passed the special exams with more than 50% of correct answers
    let specialExams = [];
    for (let reply of userExamsData) {
        // TODO add control on success percentage
        if (process.env.NODE_ENV === 'production') {
            if (reply.grade > (reply.exam.questions.length / 2)) {
                specialExams.push(reply.exam.exam_id);
            }
        } else {
            specialExams.push(reply.exam.exam_id);
        }
    }

    // Finding if the user finished the rounds that made him passed the exam or not.
    const findingFinishedRounds = await userPerRound.findAll(
        {
            where: {userId},
            include: [
                {
                    model: Rounds,
                    as: "rounds",
                    on: {
                        round_id: {
                            [Op.eq]: Sequelize.col("userPerRound.roundId"),
                        },
                    },
                    where: {
                        finished: process.env.NODE_ENV === 'production',
                    },
                    attributes: ["round_date", "course_id"],
                    include: [
                        {
                            model: Courses,
                            as: "course",
                            on: {
                                course_id: {
                                    [Op.eq]: Sequelize.col("rounds.course_id"),
                                },
                                special_course: {
                                    [Op.eq]: true
                                }
                            },
                            attributes: ["course_id", "name", "special_course"],
                        },
                    ],
                }
            ]
        }
    );

    return {
        specialExams,
        findingFinishedRounds
    }
}
