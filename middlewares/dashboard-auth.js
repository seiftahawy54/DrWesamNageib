export const isAuthenticated = (req, res, next) => {
  if (!req.session.isAuthenticatedAdmin) {
    req.flash("error", "You're not allowed!");
    res.redirect("/");
  } else {
    next();
  }
};

export const globalAccess = (req, res, next) => {
  console.log(`User Data => `, req.session.userIsAuthenticated);
  if (req.session.userIsAuthenticated || req.session.isAuthenticatedAdmin) {
    next();
  } else {
    req.flash("error", "You're not allowed!");
    res.redirect("/");
  }
};
