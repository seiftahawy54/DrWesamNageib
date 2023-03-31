import {
  getIndex,
  singleCourse,
  addCourseToCart,
  getCoursesCategories,
  getAllCoursesData,
} from "../controllers/courses.js";
import { Router } from "express";
import { isUserAuthenticated } from "../middlewares/user-auth.js";
import { body } from "express-validator";
import { getShoppingCart, postDeleteFromCart } from "../controllers/shop.js";

const coursesRoutes = Router();

coursesRoutes
  .get("/", getAllCoursesData)
  .get("/courses-categories", getCoursesCategories)
  .get("/:courseId", singleCourse)
  .post(
    "/addToCart",
    [body("selected_round").notEmpty()],
    isUserAuthenticated,
    addCourseToCart
  )
  .post("/delete_from_cart", isUserAuthenticated, postDeleteFromCart)
  .get("/cart", isUserAuthenticated, getShoppingCart);

const router = Router().use("/", coursesRoutes);
export default router;
