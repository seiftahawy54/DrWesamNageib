export const isUserAuthenticated = (req, res, next) => {
  if (!req.session.userIsAuthenticated) {
    res.redirect("/");
  } else {
    next();
  }
};

export const notRepeatedForUser = (req, res, next) => {
  if (req.session.userIsAuthenticated) {
    res.redirect("/profile");
  } else {
    next();
  }
};
