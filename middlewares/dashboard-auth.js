export const isAuthenticated = (req, res, next) => {
  if (!req.session.isAuthenticatedAdmin) {
    req.flash("error", "You're not allowed!");
    res.redirect("/");
  } else {
    next();
  }
};
