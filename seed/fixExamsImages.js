import {Exams} from "../models/index.js";
import dotenv from "dotenv";
import {validURL} from "../utils/general_helper.js";

dotenv.config();

const allExams = await Exams.findAll()
//
// const modifiedExams = {};
//
// for (let exam of allExams) {
//     for (let q of exam.questions) {
//         if (q === null) {
//             console.log(exam.title)
//         }
//     }
    // const newQuestions = exam.questions.map((q) => {
    //     if (q && "examImage" in q) {
    //         if (validURL(q.examImage)) {
    //             const imageURL = new URL(q.examImage);
    //             const backendHostURL = new URL(process.env.BACKEND_URL)
    //
    //             if (imageURL.hostname === backendHostURL.hostname) {
    //                 q.examImage = imageURL.pathname.split('/').at(-1);
    //                 console.log(q.examImage)
    //                 return q;
    //             }
    //         }
    //     } else {
    //         return q;
    //     }
    // })
//
//     // modifiedExams[exam.exam_id] = newQuestions;
// }
//
// Object.keys(modifiedExams).forEach(async (examId) => {
//     await Exams.update({
//         questions: modifiedExams[examId]
//     }, {
//         where: {
//             exam_id: examId
//         }
//     })
// })
