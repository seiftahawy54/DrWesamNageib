import { Courses, Rounds, Users } from "../../models/index.js";
import { validationResult } from "express-validator";
import {
  constructError,
  deleteFile,
  extractError,
  extractErrorMessages,
  sortCourses,
} from "../../utils/general_helper.js";
import { resolve } from "path";
import { errorRaiser } from "../../utils/error_raiser.js";
import { uploadFile } from "../../utils/aws.js";
import moment from "moment";
import logger from "../../utils/logger.js";

const getCourses = async (req, res, next) => {
  try {
    const findingAllCourses = await Courses.findAll({
      where: {
        isDeleted: false,
      },
      order: [
        ["course_rank", "ASC"],
        ["updatedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
    return res.status(200).json({
      courses: findingAllCourses,
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

const getAddNewCourse = (req, res, next) => {
  res.render("dashboard/courses_forms", {
    title: "New Course",
    path: "/dashboard/courses",
    editMode: false,
    course: {},
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
    const specialCourse = req.body.special_course;
    const courseCategory = req.body.course_category;
    const courseImg = req.files[0];
    const detailedImg = req.files[1];
    const courseImage = req.files[0].path;
    const detailedImage = req.files[1].path;
    const courseTotalHours = req.body.total_hours;
    // const imgUrl = courseImage.path;
    // const detailedImage = courseImage.path;
    const courseArName = req.body.arabic_name;
    const errors = validationResult(req);

    // console.log("course name: ", courseName);
    // console.log(errors.array().find((e) => e.param === "price"));
    // console.log(`detailed image: `, );

    if (!errors.isEmpty()) {
      return res.status(400).json(extractErrorMessages(errors.array()));
    }

    const addingResult = await Courses.create({
      name: courseName,
      price: coursePrice,
      course_img: courseImage,
      detailed_img: detailedImage,
      description: courseDescription,
      ar_course_name: courseArName,
      course_thumbnail: courseThumbnail,
      course_rank: courseRank,
      special_course: specialCourse,
      course_category: courseCategory,
      total_hours: courseTotalHours,
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
      return res.status(200).json({
        message: "Course added successfully",
      });
    }
    return res.status(500).json({
      message: "Server error",
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

const postDeleteCourse = async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Courses.findByPk(courseId);
  if (!course) {
    return res.status(400).json(constructError("courseId", "Wrong course id"));
  }

  const deleteResult = course.update(
    { isDeleted: true },
    { where: { course_id: courseId } }
  );

  logger.info(`delete result ${deleteResult}`);

  if (deleteResult) {
    return res.status(200).json({ message: "Course deleted successfully" });
  }
  return res.status(400).json({ message: "Server error" });
};

const getEditCourse = async (req, res, next) => {
  try {
    const editMode = req.query.edit;
    if (editMode === "false") return res.redirect("/dashboard/courses");

    const courseId = req.params.courseId;

    const findingCourse = await Courses.findByPk(courseId);

    console.log(findingCourse.total_hours);

    res.render("dashboard/courses_forms", {
      title: findingCourse.name,
      path: "/dashboard/courses",
      editMode: true,
      course: findingCourse,
      validationErrors: [],
    });
  } catch (e) {
    await errorRaiser(e, next);
  }
};

const postUpdateCourse = async (req, res, next) => {
  const editMode = req.query.edit;
  if (editMode === false) return res.redirect("/dashboard/courses");
  const courseId = req.body.courseId;

  const courseName = req.body.name;
  const coursePrice = req.body.price;
  const courseImg = req.files[0];
  const detailedImg = req.files[1];
  const courseDescription = req.body.description;
  const courseArName = req.body.arabic_name;
  const courseThumbnail = req.body.thumbnail;
  const courseRank = req.body.course_rank;
  let specialCourse = req.body.special_course;
  const totalHours = req.body.total_hours;
  const courseCategory = req.body.course_category;

  if (typeof specialCourse === "undefined") {
    specialCourse = false;
  }

  try {
    const errors = validationResult(req);

    const findingCourse = await Courses.findByPk(courseId);

    if (!errors.isEmpty()) {
      return res.status(400).json(extractErrorMessages(errors.array()));
    }

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
          special_course: specialCourse,
          total_hours: totalHours,
          course_category: courseCategory,
        },
        { where: { course_id: courseId } }
      );

      if (addingResult[0] === 1) {
        return res.status(200).json({
          message: "Course updated successfully",
        });
      }

      return res.status(500).json({ message: "Server error" });
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
          special_course: specialCourse,
          total_hours: totalHours,
          course_category: courseCategory,
        },
        { where: { course_id: courseId } }
      );

      // console.log(addingResult);

      console.log(`course id `, findingCourse.course_id);

      if (addingResult[0] === 1) {
        return res.status(200).json({
          message: "Course updated successfully",
        });
      }
      return res.status(500).json({ message: "Server error" });
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
          special_course: specialCourse,
          total_hours: totalHours,
          course_category: courseCategory,
        },
        { where: { course_id: courseId } }
      );

      if (addingResult[0] === 1) {
        return res.status(200).json({
          message: "Course updated successfully",
        });
      }

      return res.status(500).json({ message: "Server error" });
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
          special_course: specialCourse,
          total_hours: totalHours,
          course_category: courseCategory,
        },
        { where: { course_id: courseId } }
      );

      if (addingResult[0] === 1) {
        return res.status(200).json({
          message: "Course updated successfully"
        });
      }
      return res.status(500).json({message: "Server error"})
    }
  } catch (e) {
    await errorRaiser(e, next)
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
