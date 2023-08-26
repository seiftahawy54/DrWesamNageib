import {Content, ContentAccessList} from "../../models/index.js";
import {Sequelize} from "sequelize";
import {errorRaiser} from "../../utils/error_raiser.js";

const getContentLink = async (req, res, next) => {
    try {
        const {contentId} = req.params;
        const {user_id} = req.user;


        let content = await ContentAccessList.findOne({
            where: {
                contentId,
                userId: user_id
            },
            include: [
                {
                    model: Content,
                    on: {
                        id: {
                            [Sequelize.Op.eq]: Sequelize.col("contentAccessList.contentId"),
                        }
                    }
                }
            ]
        });

        if (!content) {
            return res.status(404).json({message: "Content not found"});
        }

        content = content.map(({contents}) => contents).flat();

        return res.status(200).json(content);

    } catch (e) {
        await errorRaiser(e, next)
    }
}

const getAllContentForUser = async (req, res, next) => {
    try {
        const {user_id} = req.user;

        let content = await ContentAccessList.findOne({
            where: {
                userId: user_id
            },
            include: [
                {
                    model: Content,
                    on: {
                        id: {
                            [Sequelize.Op.eq]: Sequelize.col("contentAccessList.contentId"),
                        }
                    },
                    required: false,
                }
            ]
        });

        if (!content) {
            return res.status(404).json({message: "Content not found"});
        }


        return res.status(200).json(content.contents);

    } catch (e) {
        await errorRaiser(e, next)
    }
}

export default {
    getContentLink,
    getAllContentForUser
}
