export function isAuthenticated(req, res, next) {
  if (!req.session.isAuthenticated) {
    res.redirect("/");
  } else {
    next();
  }
}
