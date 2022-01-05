export function getLogin (req, res, next) {
  res.render("auth/login", {
    title: "Login",
    path: "/login",
  });
}

// exports.postLogin = (req, res, next) => {
//
// }

export function getRegister (req, res, next) {
  res.render("auth/register", {
    title: "Register",
    path: "/register",
  });
}
