import {errorRaiser} from "../../../utils/error_raiser.js";
import {Content, ContentAccessList, Exams, UserPerRound} from "../../../models/index.js";
import {calcPagination, extractErrorMessages} from "../../../utils/general_helper.js";
import {validationResult} from "express-validator";
import {uploadFileV2} from "../../../utils/aws.js";
import {Sequelize} from "sequelize";
import config from "config";

const allContent = async (req, res, next) => {
    try {
        let pageNumber = req.query.page;
        if (!pageNumber) {
            pageNumber = 1
        }

        const contents = await Content.findAll({
            limit: config.get('paginationMaxSize'),
            offset: (parseInt(pageNumber) - 1) * config.get('paginationMaxSize'),
        });

        const pagination = await calcPagination(Content, pageNumber)

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

        const {uploadedImage} = await uploadFileV2(file.path, file.filename);

        if (!errors.isEmpty()) {
            return res.status(400).json(extractErrorMessages(extractErrorMessages))
        }

        let eachRoundAccessList = [];

        for (let round of selectedRounds) {
            eachRoundAccessList = [
                ...eachRoundAccessList,
                ...(await UserPerRound.findAll({
                    where: {
                        roundId: round,
                    }
                })).map(({userId}) => userId)
            ];
        }


        const newContent = await Content.create({
            contentUrl: uploadedImage.Location
        })

        for (let i = 0; i < eachRoundAccessList.length; i += 1) {
            await ContentAccessList.create({
                userId: eachRoundAccessList[i],
                contentId: newContent.id,
            })
        }

        return res.status(200).json(eachRoundAccessList)

    } catch (e) {
        await errorRaiser(e, next)
    }
}

const getContentLink = async (req, res, next) => {
    try {
        const {contentId} = req.params;


        const content = await Content.findOne({
            where: {
                id: contentId,
            }
        });

        if (!content) {
            return res.status(404).json({message: "Content not found"});
        }

        return res.status(200).json(content);

    } catch (e) {
        await errorRaiser(e, next)
    }
}

export {
    allContent,
    addNewContent,
    getContentLink
}
