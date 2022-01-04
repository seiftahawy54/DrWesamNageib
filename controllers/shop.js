exports.getShoppingCart = (req, res, next) => {
  const courseOptions = {
    courseName: "CPHQ Course",
    coursePrice: 300,
    courseDescription: "This is a preparation for the CPHQ Test",
    courseDate: new Date("12-22-2021").toISOString(),
  };

  res.render("shopping/index", {
    title: "Shopping Cart",
    path: "/cart",
    cart: {
      courses: [courseOptions, courseOptions],
      totalPrice: 399,
    },
  });
};

exports.getHomePage = (req, res, next) => {
  res.render("home/home.ejs", {
    title: "Homepage",
    path: "/",
  });
};

exports.getAboutPage = (req, res, next) => {
  res.render("about/index", {
    title: "Who am i",
    path: "/aboutme",
  });
};

exports.getContactPage = (req, res, next) => {
  res.render("contactus/index", {
    title: "Contact Us",
    path: "/contact",
  });
};
