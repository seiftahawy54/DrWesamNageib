import {
  addNewCourse,
  deleteCourse,
  getAllCourses,
  getSingleCourse,
  updateSingleCourse,
} from "../../models/courses.mjs";
import {validationResult} from "express-validator";
import {sortCourses} from "../../utits/general_helper.mjs";

const getCourses = async (req, res, next) => {
  const allCourses = await getAllCourses();

  const sortedCourses = sortCourses(allCourses.rows);

  res.render("dashboard/courses", {
    title: "Courses page",
    path: "/dashboard/courses",
    courses: sortedCourses,
  });
};

const getAddNewCourse = (req, res, next) => {
  res.render("dashboard/courses_forms", {
    title: "New Course",
    path: "/dashboard/courses",
    editMode: "false",
    course: {},
  });
};

const postAddNewCourse = async (req, res, next) => {
  const courseName = req.body.name;
  const coursePrice = req.body.price;
  const courseDescription = req.body.description;
  const courseImage = req.file;
  const imgUrl = courseImage.path;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.redirect("/dashboard/add-new-course");
  } else {
    const addingResult = await addNewCourse(
      courseName,
      coursePrice,
      imgUrl,
      courseDescription
    );
    if (addingResult.rowCount) {
      res.redirect("/dashboard/courses");
    } else {
      res.redirect("/dashboard/add-new-course");
    }
  }
};

const postDeleteCourse = async (req, res, next) => {
  const courseId = req.body.courseId;
  const deletingResult = await deleteCourse(courseId);
  if (deletingResult.command === "DELETE") {
    res.redirect("/dashboard/courses");
  } else {
    res.status(400).redirect("/dashboard/courses");
  }
};

const getEditCourse = async (req, res, next) => {
  const editMode = req.query.edit;
  if (editMode === "false") return res.redirect("/dashboard/courses");

  const courseId = req.params.courseId;

  const findingCourse = await getSingleCourse(courseId);

  res.render("dashboard/courses_forms", {
    title: "New Course",
    path: "/dashboard/courses",
    editMode: "true",
    course: findingCourse.rows[0],
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
  const findingCourse = await getSingleCourse(courseId);

  if (!errors.isEmpty()) {
    res.render("dashboard/courses_forms", {
      title: "Update Course",
      path: "/dashboard/courses",
      editMode: "true",
      course: findingCourse.rows[0],
    });
  } else {
    if (typeof courseImg !== "object") {
      const addingResult = await updateSingleCourse(
        courseName,
        coursePrice,
        courseId,
        null,
        courseDescription,
        courseArName,
        courseThumbnail,
        courseRank
      );

      if (addingResult.rowCount > 0) {
        res.redirect("/dashboard/courses");
      } else {
        res.render("dashboard/courses_forms", {
          title: "Update Course",
          path: "/dashboard/courses",
          editMode: "true",
          course: findingCourse.rows[0],
        });
      }
    } else {
      const addingResult = await updateSingleCourse(
        courseName,
        coursePrice,
        courseId,
        courseImg.path,
        courseDescription,
        courseArName,
        courseThumbnail,
        courseRank
      );

      if (addingResult.rowCount > 0) {
        res.redirect("/dashboard/courses");
      } else {
        res.render("dashboard/courses_forms", {
          title: "Update Course",
          path: "/dashboard/courses",
          editMode: "true",
          course: findingCourse.rows[0],
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
