import { Courses } from "../../models/courses.mjs";
import { validationResult } from "express-validator";
import {
  deleteFile,
  extractError,
  sortCourses,
} from "../../utits/general_helper.mjs";
import { resolve } from "path";
import { errorRaiser } from "../../utits/error_raiser.mjs";
import { uploadFile } from "../../utits/aws.mjs";

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
  try {
    const courseName = req.body.name;
    const coursePrice = req.body.price;
    const courseDescription = req.body.description;
    const courseThumbnail = req.body.thumbnail;
    const courseRank = req.body.course_rank;
    const courseImg = req.files[0];
    const detailedImg = req.files[1];
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

      const uploadingFirstImg = await uploadFile(
        courseImg.path,
        courseImg.filename,
        courseImg.mimetype,
        res,
        next
      );
      const uploadingSecondImg = await uploadFile(
        detailedImg.path,
        detailedImg.filename,
        detailedImg.mimetype,
        res,
        next
      );

      if (addingResult && uploadingFirstImg && uploadingSecondImg) {
        res.status(201).redirect("/dashboard/courses");
      } else {
        res.redirect("/dashboard/add-new-course");
      }
    }
  } catch (e) {
    errorRaiser(e, next);
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
  try {
    const editMode = req.query.edit;
    if (editMode === "false") return res.redirect("courses");
    const courseId = req.params.courseId;

    const courseName = req.body.name;
    const coursePrice = req.body.price;
    const courseImg = req.files[0];
    const detailedImg = req.files[1];
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
      if (typeof courseImg !== "object" && typeof detailedImg !== "object") {
        const addingResult = await Courses.update(
          {
            name: courseName,
            price: coursePrice,
            course_img: findingCourse.course_img,
            detailed_img: findingCourse.detailed_img,
            description: courseDescription,
            ar_course_name: courseArName,
            course_thumbnail: courseThumbnail,
            course_rank: courseRank,
          },
          { where: { course_id: courseId } }
        );

        if (addingResult[0] === 1) {
          res.redirect("courses");
        } else {
          res.render("dashboard/courses_forms", {
            title: "Update Course",
            path: "/dashboard/courses",
            editMode: "true",
            course: findingCourse,
          });
        }
      } else if (
        typeof courseImg === "object" &&
        typeof detailedImg !== "object"
      ) {
        const uploadingFirstImg = await uploadFile(
          courseImg.path,
          courseImg.filename,
          courseImg.mimetype,
          res,
          next
        );
        const deleteUnWantedImage = await deleteFile(
          resolve("/downloaded_images", findingCourse.course_img)
        );

        // console.log(`delete old image: `, deleteUnWantedImage);

        const addingResult = await Courses.update(
          {
            name: courseName,
            price: coursePrice,
            course_img: courseImg.path,
            detailed_img: findingCourse.detailed_img,
            description: courseDescription,
            ar_course_name: courseArName,
            course_thumbnail: courseThumbnail,
            course_rank: courseRank,
          },
          { where: { course_id: courseId } }
        );

        // console.log(addingResult);

        console.log(`course id `, findingCourse.course_id);

        if (addingResult[0] === 1 && deleteUnWantedImage && uploadingFirstImg) {
          return res.redirect("/dashboard/courses");
        } else {
          return res.render("dashboard/courses_forms", {
            title: "Update Course",
            path: "/dashboard/courses",
            editMode: "true",
            course: findingCourse,
          });
        }
      } else if (
        typeof courseImg !== "object" &&
        typeof detailedImg === "object"
      ) {
        const uploadingSecondImg = await uploadFile(
          detailedImg.path,
          detailedImg.filename,
          detailedImg.mimetype,
          res,
          next
        );

        const deleteUnWantedImage = await deleteFile(
          resolve("/downloaded_images", findingCourse.detailed_img)
        );

        console.log(`delete old image: `, deleteUnWantedImage);

        const addingResult = await Courses.update(
          {
            name: courseName,
            price: coursePrice,
            course_img: findingCourse.course_img,
            detailed_img: detailedImg.path,
            description: courseDescription,
            ar_course_name: courseArName,
            course_thumbnail: courseThumbnail,
            course_rank: courseRank,
          },
          { where: { course_id: courseId } }
        );

        if (
          addingResult[0] === 1 &&
          deleteUnWantedImage &&
          uploadingSecondImg
        ) {
          return res.redirect("/dashboard/courses");
        } else {
          res.render("dashboard/courses_forms", {
            title: "Update Course",
            path: "/dashboard/courses",
            editMode: "true",
            course: findingCourse,
          });
        }
      } else if (
        typeof courseImg === "object" &&
        typeof detailedImg === "object"
      ) {
        const uploadingFirstImg = await uploadFile(
          courseImg.path,
          courseImg.filename,
          courseImg.mimetype,
          res,
          next
        );
        const uploadingSecondImg = await uploadFile(
          detailedImg.path,
          detailedImg.filename,
          detailedImg.mimetype,
          res,
          next
        );

        // const deleteUnWantedImage = await deleteFile(
        //   resolve("/", findingCourse.course_img)
        // );
        // const deleteUnWantedImage2 = await deleteFile(
        //   resolve("/", findingCourse.detailed_img)
        // );

        const addingResult = await Courses.update(
          {
            name: courseName,
            price: coursePrice,
            course_img: courseImg.path,
            detailed_img: detailedImg.path,
            description: courseDescription,
            ar_course_name: courseArName,
            course_thumbnail: courseThumbnail,
            course_rank: courseRank,
          },
          { where: { course_id: courseId } }
        );

        if (addingResult[0] === 1 && uploadingFirstImg && uploadingSecondImg) {
          return res.redirect("/dashboard/courses");
        } else {
          res.render("dashboard/courses_forms", {
            title: "Update Course",
            path: "/dashboard/courses",
            editMode: "true",
            course: findingCourse,
            errorMessage: "There is some error",
            validationError: [],
          });
        }
      }
    }
  } catch (e) {
    errorRaiser(e, next);
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
