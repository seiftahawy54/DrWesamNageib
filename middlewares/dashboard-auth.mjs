export const isAuthenticated = (req, res, next) => {
  if (!req.session.isAuthenticatedAdmin) {
    res.redirect("/");
  } else {
    next();
  }
};
