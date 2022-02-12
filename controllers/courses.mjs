// import { getAllCourses, getSingleCourse } from "../models/courses.mjs";
import { errorRaiser } from "../utits/error_raiser.mjs";
import { extractError, sortCourses } from "../utits/general_helper.mjs";
import { Courses } from "../models/courses.mjs";
import { Users } from "../models/users.mjs";
import { getArray, updateCart } from "../utits/cart_helpers.mjs";

const getIndex = async (req, res, next) => {
  try {
    const fetchingResult = await Courses.findAll();
    res.render("courses/index", {
      title: "Courses",
      path: "/courses",
      courses: sortCourses(fetchingResult),
    });
  } catch (e) {
    errorRaiser(e, next);
  }
};

const singleCourse = async (req, res, next) => {
  try {
    const course = await Courses.findByPk(req.params.courseId);

    let message = req.flash("error")[0];
    console.log(`custom error message`, message);
    if (!(typeof message === "string")) {
      message = null;
    }

    res.render("courses/single_course", {
      title: course.name,
      path: "/courses",
      course,
      errorMessage: message,
    });
  } catch (e) {
    errorRaiser(e, next);
  }
};

const addCourseToCart = async (req, res, next) => {
  try {
    const courseId = req.body.courseId;
    const cart = getArray(req.user.cart);
    console.log(cart);

    // if (!req.user.cart) {
    //   req.user.cart = [{ item: courseId }];
    //   req.user.cart = JSON.stringify(req.user.cart);
    //   await Users.update(
    //     { cart: req.user.cart },
    //     { where: { user_id: req.user.user_id } }
    //   );
    //   console.log(`cart: `, req.user.cart);
    // } else {
    //   let cartJSON = JSON.parse(req.user.cart);
    //   if (cartJSON?.length === 0) {
    //     const newCart = [{ item: courseId }];
    //     const addingResult = await updateCart(courseId, req, newCart, next);
    //     if (addingResult) {
    //       return res.redirect("/cart");
    //     } else {
    //       return res.render("courses/single_course", {
    //         title: course.name,
    //         path: "/courses",
    //         course,
    //         errorMessage: `You've already chosen this course and added to your cart! proceed to <a href='/cart'>checkout</a>?`,
    //       });
    //     }
    //   } else {
    //     console.log(`cart: `, cartJSON);
    //     const findingResult = cartJSON.find((e) => {
    //       return e.item.localeCompare(courseId) === 0;
    //     });
    //     if (findingResult) {
    //       return res.render("courses/single_course", {
    //         title: course.name,
    //         path: "/courses",
    //         course,
    //         errorMessage: `You've already chosen this course and added to your cart! proceed to <a href='/cart'>checkout</a>?`,
    //       });
    //     } else {
    //       const newCart = [...cartJSON, { item: courseId }];
    //       req.user.cart = JSON.stringify(newCart);
    //       await Users.update(
    //         { cart: req.user.cart },
    //         { where: { user_id: req.user.user_id } }
    //       );
    //       console.log(req.user.cart);
    //       res.redirect("/cart");
    //     }
    //   }
    // }
  } catch (e) {
    errorRaiser(e, next);
  }
};

export { getIndex, addCourseToCart, singleCourse };
