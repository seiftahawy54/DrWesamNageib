import {errorRaiser} from "../../utils/error_raiser.js";
import UserExamProgress from "../../models/UserExamProgress.js";

const postSaveProgress = async (req, res, next) => {
    try {
        const {examId, userAnswers, userId} = req.body;

        const creatingNewReplyResult = await UserExamProgress.create({
            examId,
            userId: userId.toString(),
            userAnswers,
            submissionDate: new Date()
        });

        return res.status(200).send(creatingNewReplyResult)
    } catch (e) {
        console.log(e)
        await errorRaiser(e, next);
    }
}

export default {
    postSaveProgress
}
