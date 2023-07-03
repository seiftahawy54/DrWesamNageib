import {Courses, Exams} from "../models/index.js";

const allExams = await Exams.findAll()
const courses = await Courses.findOne({
    where: {
        course_rank: 1
    }
})

for (let exam of allExams) {
    await exam.update({
        course_id: courses.course_id
    })
}
