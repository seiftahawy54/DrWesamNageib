export default (req, res, next) => {
  res.render("404", {
    title: "There's an error!",
    path: "",
  });
}