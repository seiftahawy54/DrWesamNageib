import { getSingleCourse } from "../models/courses.mjs";

const getLogin = (req, res, next) => {
  res.render("auth/login", {
    title: "Login",
    path: "/login",
  });
};

// exports.postLogin = (req, res, next) => {
//
// }
const getRegister = (req, res, next) => {
  const cookieValue = req.get("Cookie").split(";")[1].split("=")[1];
  getSingleCourse(cookieValue)
    .then((courseData) => {
      res.render("auth/register", {
        title: "Register",
        path: "/register",
        course: courseData.rows[0],
        // boughtCoruses: course
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

export { getLogin, getRegister };
