exports.getIndex = (req, res, next) => {
  res.render("about/index", {
    title: "Who am i",
    path: '/aboutme'
  });
}