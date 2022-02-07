export const getUserProfile = (req, res, next) => {
  console.log(`from User profile`, req.user);
  res.render("users/profile", {
    title: req.user.name,
    path: "/profile",
  });
};
