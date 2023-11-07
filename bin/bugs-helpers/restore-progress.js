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

    console.log(creationResult)
    /*

    INSERT INTO public.exams_replies (reply_id, exam_id, user_id, grade, user_answers, "createdAt", "updatedAt")
VALUES ('cb646689-1ef9-452a-935c-d588932a3b97', '85d7d442-d675-410e-b0a2-c77d3153c49e',
        '684ebe47-9176-4b4f-8623-83434b7d7bab', 114,
        '{"{\"1\":2}","{\"11\":1}","{\"21\":4}","{\"31\":1}","{\"41\":1}","{\"51\":2}","{\"61\":1}","{\"71\":1}","{\"81\":1}","{\"91\":2}","{\"101\":3}","{\"111\":3}","{\"121\":3}","{\"131\":2}","{\"141\":1}","{\"151\":1}","{\"161\":1}","{\"171\":3}","{\"181\":1}","{\"191\":2}","{\"201\":1}","{\"211\":4}","{\"221\":2}","{\"231\":2}","{\"241\":1}","{\"251\":3}","{\"261\":1}","{\"271\":1}","{\"281\":2}","{\"291\":2}","{\"301\":1}","{\"311\":4}","{\"321\":1}","{\"331\":4}","{\"341\":2}","{\"351\":3}","{\"361\":1}","{\"371\":3}","{\"381\":1}","{\"391\":1}","{\"401\":2}","{\"411\":3}","{\"421\":1}","{\"431\":1}","{\"441\":2}","{\"451\":1}","{\"461\":1}","{\"471\":4}","{\"481\":2}","{\"491\":2}","{\"501\":2}","{\"511\":4}","{\"521\":1}","{\"531\":1}","{\"541\":3}","{\"551\":1}","{\"561\":3}","{\"571\":4}","{\"581\":2}","{\"591\":3}","{\"601\":2}","{\"611\":1}","{\"621\":2}","{\"631\":2}","{\"641\":4}","{\"651\":4}","{\"661\":3}","{\"671\":4}","{\"681\":2}","{\"691\":1}","{\"701\":3}","{\"711\":2}","{\"721\":2}","{\"731\":1}","{\"741\":2}","{\"751\":3}","{\"761\":2}","{\"771\":2}","{\"781\":2}","{\"791\":2}","{\"801\":3}","{\"811\":4}","{\"821\":2}","{\"831\":1}","{\"841\":2}","{\"851\":3}","{\"861\":3}","{\"871\":3}","{\"881\":1}","{\"891\":3}","{\"901\":1}","{\"911\":1}","{\"921\":2}","{\"931\":1}","{\"941\":1}","{\"951\":2}","{\"961\":1}","{\"971\":1}","{\"981\":2}","{\"991\":1}","{\"1001\":2}","{\"1011\":3}","{\"1021\":2}","{\"1031\":2}","{\"1041\":3}","{\"1051\":2}","{\"1061\":4}","{\"1071\":2}","{\"1081\":2}","{\"1091\":4}","{\"1101\":4}","{\"1111\":4}","{\"1121\":2}","{\"1131\":3}","{\"1141\":1}","{\"1151\":4}","{\"1161\":4}","{\"1171\":1}","{\"1181\":1}","{\"1191\":2}","{\"1201\":1}","{\"1211\":1}","{\"1221\":2}","{\"1231\":4}"}',
        '2023-11-01T22:19:38.256Z', '2023-11-01T22:19:38.256Z');
    */
}

await restoreProgress(290)
