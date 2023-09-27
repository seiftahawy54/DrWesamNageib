import {Courses, ExamImages, Exams, ExamsCourses, ExamsReplies, Rounds, Users} from "../../../models/index.js";
import {errorRaiser} from "../../../utils/error_raiser.js";
import {validationResult} from "express-validator";
import {getSingleFile, uploadFile, uploadFileV2} from "../../../utils/aws.js";
import joi from "joi";
import {calcPagination, constructSelectors, extractErrorMessages, validURL} from "../../../utils/general_helper.js";
import {Op, Sequelize} from "sequelize";
import {DeletedExams} from "../../../models/exams.js";
import {upload} from "../../../middlewares/multer.js";
import * as util from "util";
import logger from "../../../utils/logger.js";
import {BOOLEAN_TYPE, STRING_TYPE, validateRequestInput} from "../../../validators/typesValidators.js";


const questionsSchema = joi.array().items(
    joi.object({
        questionHeader: joi.string().min(5),
        answers: joi.array().min(1).items(joi.string()),
        correctAnswer: joi.string().min(1).max(1),
        questionHint: joi.string().min(0),
        order: joi.string().min(0),
    }),
    joi.object({
        examImage: joi.string().min(13),
    })
);

export const getAllExams = async (req, res, next) => {
    try {
        let pageNumber = req.query.page;
        if (!pageNumber) {
            pageNumber = 1
        }

        const MAX_NUMBER = 10;
        const exams = await ExamsCourses.findAll({
            limit: MAX_NUMBER,
            offset: (parseInt(pageNumber) - 1) * MAX_NUMBER,
            order: [['createdAt', 'DESC']],
            include:
                [
                    {
                        model: Courses,
                        attributes: ['name'],
                        on: {
                            course_id: {[Op.eq]: Sequelize.col("examsCourses.course_id")},
                        },
                        where: {
                            isDeleted: false,
                        }
                    },
                    {
                        model: Exams,
                        on: {
                            exam_id: {[Op.eq]: Sequelize.col("examsCourses.exam_id")},
                        },
                        attributes: ["exam_id", "title", "status", "createdAt", "updatedAt", 'id'],
                        where: {
                            isDeleted: false
                        }
                    }
                ]
        });

        for (let exam of exams) {
            const {count} = (await ExamsReplies.findAndCountAll({
                where: {exam_id: exam.exam.exam_id},
            }));

            exam.dataValues.noOfReplies = count;
        }

        const pagination = await calcPagination(Exams, pageNumber)

        return res.status(200).json({
            exams,
            pagination,
        })

    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getAddNewExam = async (req, res, next) => {
    try {
        res.render("dashboard/exams/exams_forms", {
            title: "Exams",
            path: "/dashboard/exams",
            exam: {},
            editMode: false,
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const startNewExam = async (req, res, next) => {
    try {
        const {courseId, questions, examTitle, examStatus, specialExam} = req.body;
        const errors = validationResult(req);
        const {error} = await questionsSchema.validate(questions);

        console.log(`Validation of schema ===> `, util.inspect(error, false, null));

        if (error || !errors.isEmpty()) {
            return res.status(422).json(extractErrorMessages(errors.array()));
        }

        const addingExam = await Exams.create({
            status: examStatus,
            questions,
            title: examTitle,
            special_exam: specialExam,
            course_id: courseId,
        });

        const examCourses = await ExamsCourses.create({
            exam_id: addingExam.exam_id,
            course_id: courseId,
        })

        return res.status(201).json({
            questions,
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const postDeleteExam = async (req, res, next) => {
    try {
        const {examId} = req.params;

        const exam = await Exams.findOne({
            where: {exam_id: examId}
        });

        if (!exam) {
            return res.status(404).json({message: "Exam not found"})
        }

        await exam.update({isDeleted: true});

        return res.status(200).json({message: "Exam deleted successfully"})

    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getUpdateExam = async (req, res, next) => {
    try {
        const {examId} = req.params;
        const {exam, course_id} = await ExamsCourses.findOne({
            where: {exam_id: examId},
            include: [
                {
                    model: Exams,
                    on: {
                        exam_id: {
                            [Op.eq]: Sequelize.col("examsCourses.exam_id"),
                        },
                    }
                }
            ]
        });

        exam.courseId = course_id;

        if (!exam) {
            return res.status(404).send("Exam Not Found")
        }

        for (const questionObj of exam.questions) {
            if ("examImage" in questionObj && !validURL(questionObj.examImage)) {
                const generatedLink = await getSingleFile(questionObj.examImage);
                logger.debug(generatedLink);
                questionObj.examImage = generatedLink;
            }
        }

        /*await (async () => {
            for (const questionObj of exam.questions) {
                if ("examImage" in questionObj) {
                    if (!validURL(questionObj.examImage)) {
                        const generatedLink = await getSingleFile(questionObj.examImage);
                        logger.debug(generatedLink)
                        questionObj.examImage = generatedLink;
                    }
                }
            }
        })();*/

        /*exam.questions = exam.questions.map(q => {
            if (q.examImage && !(q.examImage.startsWith("http://") || q.examImage.startsWith("https://"))) {
                const newImageLink = `${process.env.STATIC_URL}/${q.examImage}`;
                return {
                    examImage: newImageLink
                };
            }

            return q;
        })
*/
        return res.status(200).send(exam)

    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const postUpdateExam = async (req, res, next) => {
    try {
        const examId = req.params.examId;
        const questions = req.body.questions;
        const examTitle = req.body.examTitle;
        const examStatus = req.body.examStatus;
        const specialExam = req.body.specialExam;

        const validationErrors = validationResult(req);
        const {error} = await questionsSchema.validate(questions);

        console.log(`Validation of schema ===> `, util.inspect(error, false, null));

        if (error || !validationErrors.isEmpty()) {
            return res.status(422).json(extractErrorMessages(validationErrors.array()));
        }

        const updatingExam = await Exams.update(
            {
                status: examStatus,
                questions,
                title: examTitle,
                special_exam: specialExam,
            },
            {where: {exam_id: examId}}
        );

        console.log(updatingExam);

        res.status(201).json({
            questions,
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const postAddingExamImage = async (req, res, next) => {
    try {
        const questionImage = req.file;
        // const questionNumber = req.body.number;

        const {uploadedImage: uploadingQuestionImg} = await uploadFileV2(
            questionImage.path,
            questionImage.originalname
        );

        return res.status(201).json(uploadingQuestionImg.Location);
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const deleteExamImage = async (req, res, next) => {
    try {
        const imageId = req.body.imageId;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.log(`Image Id ===> `, imageId);
            res.status(404).json({message: errors.array()[0].msg});
        }

        const imageDeleting = await (await ExamImages.findByPk(imageId)).destory();

        console.log(`deleting image ===> `, imageDeleting);

        res.status(201).json({
            message: "Image Deleted",
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const searchForExam = async (req, res, next) => {
    try {
        let {title, courseName, status, special, presentation} = req.query;
        let error, message;
        if (title) ({error, message} = validateRequestInput(title, 'title', STRING_TYPE));
        // if (courseName) ({error, message} = validateRequestInput(courseName, 'courseName', STRING_TYPE));
        // if (presentation)  ({error, message} = validateRequestInput(presentation, 'presentation', BOOLEAN_TYPE))
        // if (status)  ({error, message} = validateRequestInput(status, 'status', BOOLEAN_TYPE))
        // if (special)  ({error, message} = validateRequestInput(special, 'special', BOOLEAN_TYPE))

        if (error) {
            return res.status(400).send(error);
        }

        const filterObject = {};

        if (title) {
            filterObject.exam =
                {
                    title: {
                        [Op.iLike]: `%${title.toLowerCase()}%`
                    }
                }
        }

        // if (courseName) {
        //     filterObject.course.name = {
        //         [Op.iLike]: `%${courseName.toLowerCase()}%`
        //     };
        // }
        //
        // if (phone) {
        //     filterObject.phone = {
        //         [Op.iLike]: `${phone.toLowerCase()}`
        //     };
        // }
        //
        // if (specialization) {
        //     filterObject.specialization = {
        //         [Op.iLike]: `%${specialization.toLowerCase()}%`
        //     };
        // }

        const exams = await ExamsCourses.findAll({
            include:
                [
                    {
                        model: Courses,
                        attributes: ['name'],
                        on: {
                            course_id: {[Op.eq]: Sequelize.col("examsCourses.course_id")},
                        },
                        where: {
                            ...filterObject.course,
                            isDeleted: false,
                        }
                    },
                    {
                        model: Exams,
                        on: {
                            exam_id: {[Op.eq]: Sequelize.col("examsCourses.exam_id")},
                        },
                        attributes: ["exam_id", "title", "status", "createdAt", "updatedAt", 'id'],
                        where: {
                            ...filterObject.exam,
                            isDeleted: false
                        }
                    }
                ]
        })

        if (exams.length === 0)
            return res.status(404).json(exams)

        for (let exam of exams) {
            const {count} = (await ExamsReplies.findAndCountAll({
                where: {exam_id: exam.exam.exam_id},
            }));

            exam.dataValues.noOfReplies = count;
        }

        return res.status(200).json(exams)
    } catch
        (e) {
        await errorRaiser(e, next);
    }
}
