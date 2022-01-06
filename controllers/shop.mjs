const getShoppingCart = (req, res, next) => {
  res.render("shopping/index", {
    title: "Shopping Cart",
    path: "/cart",
    cart: {
      courses: [courseOptions, courseOptions],
      totalPrice: 399,
    },
  });
};

const getHomePage = (req, res, next) => {
  res.render("home/home.ejs", {
    title: "Homepage",
    path: "/",
  });
};

const getAboutPage = (req, res, next) => {
  res.render("about/index", {
    title: "Who am i",
    path: "/aboutme",
  });
};

const getContactPage = (req, res, next) => {
  res.render("contactus/index", {
    title: "Contact Us",
    path: "/contact",
  });
};

export { getContactPage, getAboutPage, getHomePage, getShoppingCart };
