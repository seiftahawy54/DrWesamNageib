import {Courses, ExamImages, Exams, ExamsCourses, ExamsReplies, Rounds, Users} from "../../../models/index.js";
import {errorRaiser} from "../../../utils/error_raiser.js";
import {validationResult} from "express-validator";
import {getSingleFile, uploadFile} from "../../../utils/aws.js";
import joi from "joi";
import {calcPagination} from "../../../utils/general_helper.js";
import {Op, Sequelize} from "sequelize";
import {DeletedExams} from "../../../models/exams.js";

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
        const questions = req.body.questions;
        const examTitle = req.body.examTitle;
        const examStatus = req.body.examStatus;
        const specialExam = req.body.specialExam;
        const errors = validationResult(req);
        const schemaValidation = await questionsSchema.validate(questions);

        console.log(`Validation of schema ===> `, schemaValidation);

        if ("error" in schemaValidation || !errors.isEmpty()) {
            return res.status(422).json({
                errors,
            });
        }

        const addingExam = await Exams.create({
            status: examStatus,
            questions,
            title: examTitle,
            special_exam: specialExam,
        });

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
            where: {id: examId}
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
        const examId = req.params.examId;
        const exam = await Exams.findByPk(examId);

        exam.questions = JSON.stringify(exam.questions);

        res.render("dashboard/exams/exams_forms", {
            title: "Exams",
            path: "/dashboard/exams",
            exam,
            editMode: true,
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

const questionsSchema = joi.array().items(
    joi.object({
        questionHeader: joi.string().min(5),
        answers: joi.array().min(1).items(joi.string()),
        correctAnswer: joi.string().min(1).max(1),
    }),
    joi.object({
        examImage: joi.string().min(13),
    })
);

export const postUpdateExam = async (req, res, next) => {
    try {
        const examId = req.body.examId;
        const questions = req.body.questions;
        const examTitle = req.body.examTitle;
        const examStatus = req.body.examStatus;
        const specialExam = req.body.specialExam;

        const errors = validationResult(req);
        const schemaValidation = await questionsSchema.validate(questions);

        console.log(`Testing schema`, schemaValidation);

        console.log(errors.array());

        if ("error" in schemaValidation || !errors.isEmpty()) {
            return res.status(422).json({
                errors,
            });
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
        const questionImage = req.files[0];
        // const questionNumber = req.body.number;

        const uploadingQuestionImg = await uploadFile(
            questionImage.path,
            questionImage.filename,
            questionImage.mimetype,
            res,
            next
        );

        // console.log(questionImage);

        const addingNewImage = await ExamImages.create({
            image_path: questionImage.path,
        });

        if (uploadingQuestionImg) {
            await getSingleFile(addingNewImage.image_path);
        }

        res.status(201).json({
            image_path: addingNewImage.image_path,
        });
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
