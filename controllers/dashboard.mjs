import { getAllCourses, getNumberOfCourses } from "../models/courses.mjs";
// import {  } from "../models/rounds.mjs";
import { getAllUsers, getNumberOfUsers } from "../models/users.mjs";

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

export { getOverview, getCourses, getUsers };
