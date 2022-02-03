import { Courses } from "../../models/courses.mjs";
import { validationResult } from "express-validator";
import { extractError, sortCourses } from "../../utits/general_helper.mjs";

const getCourses = async (req, res, next) => {
  const allCourses = await Courses.findAll();

  const sortedCourses = sortCourses(allCourses);

  res.render("dashboard/courses", {
    title: "Courses page",
    path: "/dashboard/courses",
    courses: sortedCourses,
  });
};

const getAddNewCourse = (req, res, next) => {
  const errorMessage = extractError(req);

  res.render("dashboard/courses_forms", {
    title: "New Course",
    path: "/dashboard/courses",
    editMode: false,
    course: {},
    errorMessage,
    validationErrors: [],
  });
};

const postAddNewCourse = async (req, res, next) => {
  const courseName = req.body.name;
  const coursePrice = req.body.price;
  const courseDescription = req.body.description;
  const courseThumbnail = req.body.thumbnail;
  const courseRank = req.body.rank;
  const courseImage = req.files[0].path;
  const detailedImage = req.files[1].path;
  // const imgUrl = courseImage.path;
  // const detailedImage = courseImage.path;
  const courseArName = req.body.arabic_name;
  const errors = validationResult(req);

  // console.log("course name: ", courseName);
  // console.log(errors.array().find((e) => e.param === "price"));
  // console.log(`detailed image: `, );

  if (!errors.isEmpty()) {
    res.status(422).render("dashboard/courses_forms", {
      title: "New Course",
      path: "/dashboard/courses",
      editMode: false,
      course: {
        name: courseName,
        price: coursePrice,
        course_img: courseImage,
        detailed_img: detailedImage,
        description: courseDescription,
        ar_course_name: courseArName,
        course_thumbnail: courseThumbnail,
        course_rank: courseRank,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  } else {
    const addingResult = await Courses.create({
      name: courseName,
      price: coursePrice,
      course_img: courseImage,
      detailed_img: detailedImage,
      description: courseDescription,
      ar_course_name: courseArName,
      course_thumbnail: courseThumbnail,
      course_rank: courseRank,
    });

    if (addingResult._options.isNewRecord) {
      res.redirect("/dashboard/courses");
    } else {
      res.redirect("/dashboard/add-new-course");
    }
  }
};

const postDeleteCourse = async (req, res, next) => {
  const courseId = req.body.courseId;
  const deletingResult = await (await Courses.findByPk(courseId)).destroy();
  console.log(deletingResult);
  if (deletingResult) {
    res.redirect("/dashboard/courses");
  } else {
    res.status(422).redirect("/dashboard/courses");
  }
};

const getEditCourse = async (req, res, next) => {
  const editMode = req.query.edit;
  if (editMode === "false") return res.redirect("/dashboard/courses");

  const courseId = req.params.courseId;

  const findingCourse = await Courses.findByPk(courseId);

  res.render("dashboard/courses_forms", {
    title: "New Course",
    path: "/dashboard/courses",
    editMode: "true",
    course: findingCourse,
    errorMessage: null,
    validationErrors: [],
  });
};

const postUpdateCourse = async (req, res, next) => {
  const editMode = req.query.edit;
  if (editMode === "false") return res.redirect("/dashboard/courses");
  const courseId = req.params.courseId;

  const courseName = req.body.name;
  const coursePrice = req.body.price;
  const courseImg = req.file;
  const courseDescription = req.body.description;
  const courseArName = req.body.arabic_name;
  const courseThumbnail = req.body.thumbnail;
  const courseRank = req.body.course_rank;

  const errors = validationResult(req);
  const findingCourse = await Courses.findByPk(courseId);

  if (!errors.isEmpty()) {
    res.render("dashboard/courses_forms", {
      title: "Update Course",
      path: "/dashboard/courses",
      editMode: "true",
      course: findingCourse,
    });
  } else {
    if (typeof courseImg !== "object") {
      const addingResult = await Courses.update(
        {
          name: courseName,
          price: coursePrice,
          course_img: findingCourse.course_img,
          description: courseDescription,
          ar_course_name: courseArName,
          course_thumbnail: courseThumbnail,
          course_rank: courseRank,
        },
        { where: { course_id: courseId } }
      );

      if (addingResult[0] === 1) {
        res.redirect("/dashboard/courses");
      } else {
        res.render("dashboard/courses_forms", {
          title: "Update Course",
          path: "/dashboard/courses",
          editMode: "true",
          course: findingCourse,
        });
      }
    } else {
      const addingResult = await Courses.update(
        {
          name: courseName,
          price: coursePrice,
          course_img: courseImg.path,
          description: courseDescription,
          ar_course_name: courseArName,
          course_thumbnail: courseThumbnail,
          course_rank: courseRank,
        },
        { where: { course_id: courseId } }
      );

      if (addingResult[0] === 1) {
        res.redirect("/dashboard/courses");
      } else {
        res.render("dashboard/courses_forms", {
          title: "Update Course",
          path: "/dashboard/courses",
          editMode: "true",
          course: findingCourse,
        });
      }
    }
  }
};

export {
  getCourses,
  getAddNewCourse,
  getEditCourse,
  postAddNewCourse,
  postUpdateCourse,
  postDeleteCourse,
};
