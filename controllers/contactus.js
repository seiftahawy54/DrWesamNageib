exports.getIndex = (req, res, next) => {
  res.render("contactus/index", {
    title: "Contact Us",
    path: "/contact"
  })
}