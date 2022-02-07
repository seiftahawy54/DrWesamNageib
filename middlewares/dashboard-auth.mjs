export function isAuthenticated(req, res, next) {
  if (!req.session.isAuthenticated || !req.session.userIsAuthenticated) {
    res.redirect("/");
  } else {
    next();
  }
}
