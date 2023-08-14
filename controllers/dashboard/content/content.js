import {errorRaiser} from "../../../utils/error_raiser.js";
import {Content, Courses, Exams, ExamsCourses, ExamsReplies, UserPerRound} from "../../../models/index.js";
import {Op, Sequelize} from "sequelize";
import {calcPagination, constructError, extractErrorMessages} from "../../../utils/general_helper.js";
import {validationResult} from "express-validator";

const allContent = async (req, res, next) => {
    try {
        let pageNumber = req.query.page;
        if (!pageNumber) {
            pageNumber = 1
        }

        const MAX_NUMBER = 10;
        const contents = await Content.findAll({
            limit: MAX_NUMBER,
            offset: (parseInt(pageNumber) - 1) * MAX_NUMBER,
        });

        const pagination = await calcPagination(Exams, pageNumber)

        return res.status(200).json({
            contents,
            pagination,
        })

    } catch (e) {
        await errorRaiser(e, next)
    }
}

const addNewContent = async (req, res, next) => {
    try {
        const file = req.file;
        const {selectedRounds} = req.body;
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json(extractErrorMessages(extractErrorMessages))
        }

        // for (let round of selectedRounds) {
        //     console.log(round)
        //     const userPerRound = await UserPerRound.findAll({
        //         where: {
        //             roundId: round,
        //         }
        //     })
        //     console.log(userPerRound.length)
        // }

        return res.status(200).json(selectedRounds)

    } catch (e) {
        await errorRaiser(e, next)
    }
}

export {
    allContent,
    addNewContent
}
