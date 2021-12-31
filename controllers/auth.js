exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    title: "Login",
    path: "/login"
  });
}

exports.getRegister = (req, res, next) => {
  res.render("auth/register", {
    title: "Register",
    path: "/register"
  })
}