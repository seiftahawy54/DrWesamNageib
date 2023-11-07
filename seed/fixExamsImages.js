import {Exams} from "../models/index.js";
import dotenv from "dotenv";
import {validURL} from "../utils/general_helper.js";
import {getSingleFile, uploadFileV2} from "../utils/aws.js";
import path from "path";
import fs from "fs/promises";
import {sequelize} from "../utils/db.js";
import {Sequelize} from "sequelize";
import {file} from "googleapis/build/src/apis/file/index.js";
import Questions from './dumped.js'

dotenv.config();

const allExams = await Exams.findAll({
    where: {
        exam_id: '990941a5-5458-46fc-aa74-bda0391e42b4'
    }
})

// let images = [];
//
// for (let exam = 0; exam < allExams.length; exam ++) {
//     console.log(`current working exam => ${allExams[exam].title}`)
//     allExams[exam].questions.forEach(async (q) => {
//         if (q && "examImage" in q) {
//             if (!validURL(q.examImage)) {
//                 // images.push(q.examImage)
//                 const generatedLink = await getSingleFile(q.examImage);
//                 console.log(generatedLink)
//             }
//         }
//     })
// }
//
// console.log(images, images.length)

// const image = '45f8c9897589190a563f-Screenshot%202023-03-01%20153513.png';
// const generatedLink = await getSingleFile(image);
// console.log(generatedLink)


// const uploadDownloadedImages = async () => {
//     const downloadedExamsImages = await fs.readdir(path.resolve('downloaded_images'))
//     console.log(downloadedExamsImages)
//
//     for (const imgName of downloadedExamsImages) {
//         const result = await uploadFileV2(path.resolve('downloaded_images', imgName), imgName)
//         console.log(result)
//     }
// }
//
// uploadDownloadedImages()

const updatedVersionOfQuestionsImages = () => {
    // const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.]/g, '_'); // Sanitize the filename
    const fixedKhara = Questions.questions.map((q) => {
        if (q && "examImage" in q) {
            if (!validURL(q.examImage)) {
                return { examImage: `${process.env.AWS_URL}/${q.examImage.replace(/[^a-zA-Z0-9.]/g, '_')}` };
            }
        }
        return q
    })


    fixedKhara.forEach((q) => {
        if (q && "examImage" in q) {
            console.log(q.examImage)
        }
    })
}

updatedVersionOfQuestionsImages()
