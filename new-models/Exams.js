import mongoose from 'mongoose';
import Courses from './Courses.js';

const ExamsSchema = new mongoose.Schema({
    exam_id: String,
    title: String,
    status: {
        type: Boolean,
        allowNull: false,
    },
    questions: {
        type: mongoose.Types.Array,
        allowNull: false,
    },
    special_exam: Boolean,
    course: {
        type: String,
        ref: Courses,
    },
}, {
    timestamps: true,
})

const Exams = mongoose.model('exam', ExamsSchema);

export default Exams;
