import {calculateExamsGrades} from "../../utils/general_helper.js";
import userExamProgress from "../../models/UserExamProgress.js";
import {Exams, ExamsReplies} from "../../models/index.js";
import crypto from "crypto";

const restoreProgress = async (progressId) => {
    // 1- Insert the progress in the DB
    // 2- Calculate the grade
    const progressData = await userExamProgress.findOne({
        where: {
            id: progressId
        }
    });

    const exam = await Exams.findOne({
        where: {
            exam_id: progressData.examId
        }
    })

    let filteredQuestionsFromImages = exam.questions.filter(
        (examObj) => examObj && ("questionHeader" in examObj)
    );

    const grade = calculateExamsGrades(progressData.userAnswers, filteredQuestionsFromImages);

    // 3- Create and insert it into users replies table in production DB
    const generatedUUIDV4 = crypto.randomUUID();
    // console.log(`
    //     insert into exams_replies (reply_id, exam_id, user_id, grade, user_answers, "createdAt", "updatedAt")
    //     VALUES ('${generatedUUIDV4}', '${exam.exam_id}', '${progressData.userId}', ${grade}, '${JSON.stringify(progressData.userAnswers)}', now(), now());
    // `)

    const creationResult = await ExamsReplies.create({
        exam_id: exam.exam_id,
        user_id: progressData.userId,
        grade,
        user_answers: progressData.userAnswers,
        isDeleted: false
    })

    console.log(creationResult.reply_id)
}

await restoreProgress(386)
