import jwt from "jsonwebtoken";

export const notRepeatedForUser = (req, res, next) => {
  if (req.session.userIsAuthenticated) {
    res.redirect("/profile");
  } else {
    next();
  }
};

export const isUserAuthenticated = async (req, res, next) => {
  let token = req.get("Authorization");

  if (!token) {
    return res.status(403).json({ error: true, message: "Invalid token!" });
  }

  token = token.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: true, message: "Invalid token!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    req.user = decoded;
  } catch (e) {
    return res.status(401).json({ error: true, message: "Invalid token!" });
  }

  return next();
};

export const isAdminAuthenticated = async (req, res, next) => {
  if (req.user.role === "admin" && req.user.type >= 4) {
    return next();
  }
  return res
    .status(403)
    .json({ error: true, message: "Your're not authorized!" });
};

export const isModeratorAuthenticated = async (req, res, next) => {
  if (req.user.role === "moderator" && req.user.type >= 3) {
    return next();
  }

  return res
    .status(403)
    .json({ error: true, message: "Your're not authorized!" });
};

export const isInstructorAuthenticated = async (req, res, next) => {
  if (req.user.role === "instructor" && req.user.type >= 2) {
    return next();
  }

  return res
    .status(403)
    .json({ error: true, message: "Your're not authorized!" });
};
