import {
  getIndex,
  singleCourse,
  addCourseToCart,
  getCoursesCategories,
  getAllCoursesData,
} from "../controllers/courses.js";
import express from "express";
import { isUserAuthenticated } from "../middlewares/user-auth.js";
import { body } from "express-validator";

const coursesRoutes = express.Router();

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
  .post("/delete_from_cart", postDeleteFromCart)
  .get("/cart", getShoppingCart)


const router = Router().use('/courses', router)
export default router;
