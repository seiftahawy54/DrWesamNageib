import {Exams, ExamsReplies, Users} from "../../../models/index.js";
import {errorRaiser} from "../../../utils/error_raiser.js";
import config from 'config'
import {validationResult} from "express-validator";
import {getSingleFile, uploadFile} from "../../../utils/aws.js";
import {sequelize} from "../../../utils/db.js";
import moment from "moment";
import Sequelize, {Op} from "sequelize";
import {calcPagination} from "../../../utils/general_helper.js";

export const getAllReplies = async (req, res, next) => {
    try {
        let {page} = req.query;

        if (!page) {
            page = 1;
        }

        let allExamsReplies = await Exams.findAll({
            attributes: ["id", ["exam_id", "examId"], ["title", "examTitle"], [Sequelize.fn("COUNT", "exams_replies"), 'repliesCount']],
            include: [
                {
                    model: ExamsReplies,
                    on: {
                        exam_id: {
                            [Op.eq]: Sequelize.col("exam.exam_id")
                        }
                    },
                    attributes: [],
                    where: {
                        isDeleted: false
                    }
                }
            ],
            order: [['id', 'ASC']],
            group: ["exam.exam_id", "exam.id", "title"],
        })

        allExamsReplies = allExamsReplies.slice((page - 1) * config.get('paginationMaxSize'), page * config.get('paginationMaxSize'));

        // for (let exam of allExamsReplies) {
        //     exam.dataValues.repliesCount = exam.exams_replies.length;
        // }

        const pagination = await calcPagination(Exams, page)

        return res.send({
            examsReplies: allExamsReplies,
            pagination
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getRepliesForExam = async (req, res, next) => {
    try {
        const {examId} = req.params;
        let {page} = req.query;

        if (!page) {
            page = 1;
        }

        const allExamsReplies = await ExamsReplies.findAll({
            limit: config.get("paginationMaxSize"),
            offset: (parseInt(page) - 1) * config.get("paginationMaxSize"),
            attributes: [["reply_id", "replyId"], "grade", "id", "createdAt"],
            include: [
                {
                    model: Exams,
                    on: {
                        exam_id: {
                            [Op.eq]: Sequelize.col("exams_replies.exam_id")
                        },
                    },
                    attributes: ["exam_id", "title"],
                },
                {
                    model: Users,
                    on: {
                        user_id: {
                            [Op.eq]: Sequelize.col("exams_replies.user_id")
                        }
                    },
                    attributes: ["name"],
                }
            ],
            order: [["id", "DESC"]],
            where: {
                exam_id: examId,
                isDeleted: false
            }
        })

        const pagination = await calcPagination(ExamsReplies, page)

        return res.send({
            replies: allExamsReplies,
            pagination
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const postDeleteAllExamReplies = async (req, res, next) => {
    try {
        const {examId} = req.params;
        const result = await ExamsReplies.update({
            isDeleted: true,
        }, {
            where: {
                exam_id: examId,
            },
        });

        return res.status(200).send(result)
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const postDeleteReply = async (req, res, next) => {
    try {
        const {replyId} = req.params;
        const findingReply = await ExamsReplies.findAll({
            where: {
                exam_id: replyId
            }
        });
        const deletingResult = await findingReply.destroy();

        if (deletingResult) {
            req.flash("success", "Reply Deleted Successfully");
            return res.redirect(`/dashboard/exams-replies/${replyId}`);
        }
        req.flash("error", "Something happened");
        return res.redirect("/dashboard/exams-replies");
    } catch (e) {
        await errorRaiser(e, next);
    }
};
