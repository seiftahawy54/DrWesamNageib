export const isUserAuthenticated = (req, res, next) => {
  if (!req.session.userIsAuthenticated) {
    req.flash(
      "error",
      "You are not logged in!, please login <a href='/login'>login</a>"
    );
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
