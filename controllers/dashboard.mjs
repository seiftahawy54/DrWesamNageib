const getOverview = (req, res, next) => {
  res.render("dashboard/overview", {
    title: "Over View Page",
    path: "/overview",
  });
};

export { getOverview };
