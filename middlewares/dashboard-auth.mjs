export function isAuthenticated(req, res, next) {
  if (!req.session.isAuthenticatedAdmin && !req.session.userIsAuthenticated) {
    res.redirect("/");
  } else {
    next();
  }
}
