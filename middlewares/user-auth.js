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
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded;
  } catch (e) {
    return res.status(401).json({ error: true, message: "Invalid token!" });
  }

  return next();
};
