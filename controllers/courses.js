exports.getIndex = (req, res, next) => {
  res.render("courses/index", {
    title: "Courses",
    path: "/courses"
  })
}

exports.singleCourse = (req, res, next) => {
  res.render("courses/single_course", {
    title: "Course Name",
    path: '/courses',
    courseName: "CPHQ Certificate test preparation course, Round 99",
    coursePrice: 300.00,
    courseDescription: "The course is blended in nature that consists of 16 sessions: 10 live streaming sessions and 6",
  })
}