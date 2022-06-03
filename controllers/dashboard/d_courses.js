import { Courses, Rounds, Users } from "../../models/index.js";
import { validationResult } from "express-validator";
import {
  deleteFile,
  extractError,
  sortCourses,
} from "../../utils/general_helper.js";
import { resolve } from "path";
import { errorRaiser } from "../../utils/error_raiser.js";
import { uploadFile } from "../../utils/aws.js";
import moment from "moment";

const getCourses = async (req, res, next) => {
  try {
    const findingAllCourses = await Courses.findAll({
      order: [
        ["course_rank", "ASC"],
        ["updatedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
    const allPrimaryKeys = [];

    let data = await Promise.all(
      await findingAllCourses.map(
        async ({ course_id, course_rank, name, price, description }) => {
          allPrimaryKeys.push(course_id);

          return {
            course_rank,
            name,
            price,
            description,
          };
        }
      )
    );

    data = Object.entries(data).map(([key, value], index) => {
      return {
        item: value,
        entry: key,
      };
    });

    let finalData = [];

    data.forEach((value, key) => {
      finalData.push({
        data: data[key],
        primaryKey: allPrimaryKeys[key],
        updateInputName: "courseId",
      });
    });

    return res.render("dashboard/rounds/rounds_modified", {
      title: "Course",
      path: "/dashboard/courses",
      tableName: "courses",
      addingNewLink: "course",
      singleTableName: "course",
      tableHead: [
        {
          title: "#",
          name: "course-numbers",
        },
        {
          title: "Course Rank",
          name: "course-rank",
        },
        {
          title: "Course Name",
          name: "course-name",
        },
        {
          title: "Price",
          name: "price",
        },
        {
          title: "Description",
          name: "course-description",
        },
        {
          title: "Update Course",
          name: "update-course",
        },
        {
          title: "Delete Course",
          name: "delete-course",
        },
      ],
      tableRows: finalData,
      customStuff: {},
    });

    /*const allCourses = await Courses.findAll();

    const sortedCourses = sortCourses(allCourses);

    res.render("dashboard/courses", {
      title: "Courses page",
      path: "/dashboard/courses",
      courses: sortedCourses,
    });*/
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
      req.flash("error", errors.array()[0].msg);
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
          special_course: specialCourse,
          course_category: courseCategory,
          total_hours: courseTotalHours,
        },
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
        res.status(201).redirect("/dashboard/courses");
      } else {
        res.redirect("/dashboard/add-new-course");
      }
    }
  } catch (e) {
    await errorRaiser(e, next);
  }
};

const postDeleteCourse = async (req, res, next) => {
  const courseId = req.body.courseId;
  const deletingResult = await (await Courses.findByPk(courseId)).destroy();
  console.log(deletingResult);
  if (deletingResult) {
    req.flash("success", "Course Delete Successfully");
    res.redirect("/dashboard/courses");
  } else {
    res.status(422).redirect("/dashboard/courses");
  }
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
  const specialCourse = req.body.special_course;
  const totalHours = req.body.total_hours;
  const courseCategory = req.body.course_category;

  try {
    const errors = validationResult(req);

    console.log(errors.array());

    const findingCourse = await Courses.findByPk(courseId);

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      res.render("dashboard/courses_forms", {
        title: "Update Course",
        path: "/dashboard/courses",
        editMode: true,
        course: findingCourse,
        validationErrors: errors.array(),
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
            special_course: specialCourse,
            total_hours: totalHours,
            course_category: courseCategory,
          },
          { where: { course_id: courseId } }
        );

        if (addingResult[0] === 1) {
          res.redirect("/dashboard/courses");
        } else {
          res.render("dashboard/courses_forms", {
            title: "Update Course",
            path: "/dashboard/courses",
            editMode: true,
            course: findingCourse,
            validationErrors: errors.array(),
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
            special_course: specialCourse,
            total_hours: totalHours,
            course_category: courseCategory,
          },
          { where: { course_id: courseId } }
        );

        // console.log(addingResult);

        console.log(`course id `, findingCourse.course_id);

        if (addingResult[0] === 1) {
          return res.redirect("/dashboard/courses");
        } else {
          return res.render("dashboard/courses_forms", {
            title: "Update Course",
            path: "/dashboard/courses",
            editMode: true,
            course: findingCourse,
            validationErrors: errors.array(),
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
            special_course: specialCourse,
            total_hours: totalHours,
            course_category: courseCategory,
          },
          { where: { course_id: courseId } }
        );

        if (addingResult[0] === 1) {
          return res.redirect("/dashboard/courses");
        } else {
          res.render("dashboard/courses_forms", {
            title: "Update Course",
            path: "/dashboard/courses",
            editMode: true,
            course: findingCourse,
            validationErrors: errors.array(),
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
            special_course: specialCourse,
            total_hours: totalHours,
            course_category: courseCategory,
          },
          { where: { course_id: courseId } }
        );

        if (addingResult[0] === 1) {
          return res.redirect("/dashboard/courses");
        } else {
          res.render("dashboard/courses_forms", {
            title: "Update Course",
            path: "/dashboard/courses",
            editMode: true,
            course: findingCourse,
            errorMessage: "There is some error",
            validationErrors: errors.array(),
          });
        }
      }
    }
  } catch (e) {
    const errorsArray = Object.keys(e.fields).map((key) => {
      return {
        param: key,
        value: e.fields[key],
      };
    });

    console.log(`Error Message ===>  `, e);

    req.flash("error", e.errors[0].message);
    return res.render("dashboard/courses_forms", {
      title: "Update Course",
      path: "/dashboard/courses",
      editMode: true,
      course: {
        name: courseName,
        price: coursePrice,
        course_description: courseDescription,
        ar_course_name: courseArName,
        thumbnail: courseThumbnail,
        course_rank: courseRank,
        special_course: specialCourse,
        total_hours: totalHours,
        course_category: courseCategory,
      },
      validationErrors: errorsArray,
    });
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
