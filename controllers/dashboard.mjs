import {
  addNewCourse,
  deleteCourse,
  getAllCourses,
  getNumberOfCourses,
  getSingleCourse,
  updateSingleCourse,
} from "../models/courses.mjs";
// import {  } from "../models/rounds.mjs";
import {
  deleteUser,
  getAllUsers,
  getNumberOfUsers,
  getSingleUser,
  updateSingleUser,
} from "../models/users.mjs";
import { deleteMessage, getAllMessages } from "../models/messages.mjs";
import { validationResult } from "express-validator";

const getOverview = async (req, res, next) => {
  const numberOfUsers = await getNumberOfUsers();
  const numberOfCourses = await getNumberOfCourses();

  res.render("dashboard/overview", {
    title: "Over View Page",
    path: "/dashboard/overview",
    statsNumbers: {
      users: await numberOfUsers.rows[0].count,
      courses: await numberOfCourses.rows[0].count,
    },
  });
};

const getCourses = async (req, res, next) => {
  const allCourses = await getAllCourses();
  res.render("dashboard/courses", {
    title: "Courses page",
    path: "/dashboard/courses",
    courses: allCourses.rows,
  });
};

const getUsers = async (req, res, next) => {
  const allUsers = await getAllUsers();
  res.render("dashboard/users", {
    title: "Users page",
    path: "/dashboard/users",
    users: allUsers.rows,
  });
};

const getMessages = async (req, res, next) => {
  const allMessages = await getAllMessages();
  res.render("dashboard/messages", {
    title: "Messages page",
    path: "/dashboard/messages",
    messages: allMessages.rows,
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

const postDeleteUser = async (req, res, next) => {
  const userId = req.body.userId;
  const deletingResult = await deleteUser(userId);
  if (deletingResult.command === "DELETE") {
    res.redirect("/dashboard/users");
  } else {
    res.status(400).redirect("/dashboard/users");
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
        courseDescription
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
        courseDescription
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

const getUpdateUser = async (req, res, next) => {
  const userId = req.params.userId;

  const findingResult = await getSingleUser(userId);

  res.render("dashboard/users_forms", {
    title: "Update User",
    path: "/dashboard/users",
    user: findingResult.rows[0],
  });
};

const postUpdateUser = async (req, res, next) => {
  const userId = req.params.userId;
  const email = req.body.email;
  const name = req.body.name;
  const whatsapp_no = req.body.whatsapp_no;
  const specialization = req.body.specialization;

  const updatingSingleUser = await updateSingleUser(
    userId,
    name,
    email,
    whatsapp_no,
    specialization
  );

  if (updatingSingleUser.command === "UPDATE") {
    res.redirect("/dashboard/users");
  } else {
    const findingResult = await getSingleUser(userId);
    res.render("dashboard/users_forms", {
      title: "Update User",
      path: "/dashboard/users",
      user: findingResult.rows[0],
    });
  }
};

const postDeleteMessage = async (req, res, next) => {
  const messageId = req.body.messageId;
  const deletingResult = await deleteMessage(messageId);
  res.redirect("/dashboard/messages");
};

export {
  getOverview,
  getCourses,
  getUsers,
  getMessages,
  getAddNewCourse,
  postAddNewCourse,
  postDeleteCourse,
  postDeleteUser,
  getEditCourse,
  postUpdateCourse,
  getUpdateUser,
  postUpdateUser,
  postDeleteMessage,
};
