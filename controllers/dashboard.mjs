import {
  addNewCourse,
  deleteCourse,
  getAllCourses,
  getNumberOfCourses,
} from "../models/courses.mjs";
// import {  } from "../models/rounds.mjs";
import { getAllUsers, getNumberOfUsers } from "../models/users.mjs";
import { getAllMessages } from "../models/messages.mjs";
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
  });
};

const postAddNewCourse = async (req, res, next) => {
  const courseName = req.body.name;
  const coursePrice = req.body.price;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.redirect("/dashboard/add-new-course");
  } else {
    const addingResult = await addNewCourse(courseName, coursePrice);
    if (addingResult.command === "INSERT") {
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

export {
  getOverview,
  getCourses,
  getUsers,
  getMessages,
  getAddNewCourse,
  postAddNewCourse,
  postDeleteCourse,
};
