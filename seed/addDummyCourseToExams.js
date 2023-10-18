import {Courses, Exams, ExamsCourses} from "../models/index.js";

const allExams = await Exams.findAll()
const courses = await Courses.findOne({
    where: {
        course_rank: 1
    }
})

for (let exam of allExams) {
    await ExamsCourses.create({
        course_id: courses.course_id,
        exam_id: exam.exam_id
    })
}
