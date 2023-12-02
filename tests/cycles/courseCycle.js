// Create a dummy course

import {Courses} from "../../models/index.js";

const courseCycle = async () => {
    const course = {
        name: "course name",
        description: "course description",
        course_img: "course_img",
        isDeleted: false,
        detailed_img: "detailed_img",
        ar_course_name: "هذا كورس جديد",
        course_thumbnail: "thumbnail",
        special_course: true,
        course_category: "course_category",
        course_rank: (Math.random() * 1000).toFixed(0),
        total_hours: (Math.random() * 1000).toFixed(0),
        price: (Math.random() * 1000).toFixed(0),
    }

    return await Courses.create(course)
}

export default courseCycle
