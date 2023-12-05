import usersController from "../controllers/user/users.js";
import {upload} from "../middlewares/multer.js";
import {Router} from "express";
import {body} from "express-validator";
import {getShoppingCart, postDeleteFromCart} from "../controllers/shop.js";

const userProfileRoutes = Router();
const examsRoutes = Router();
const certificatesRoutes = Router();
const userCartRoutes = Router()
const couponsRoutes = Router();

userProfileRoutes
    .get("/", usersController.getUserProfile)
    .post("/update-profile-img", upload().single("user_img"), usersController.postUpdateUserImg)
    .get("/update-data/:userId", usersController.getUpdateUserData)
    .put(
        "/update-data",
        [
            body("email").isEmail().notEmpty(),
            body("whatsapp_no").isMobilePhone("any").notEmpty(),
            body("specialization").isString().notEmpty(),
        ],
        usersController.postUpdateUserData
    )
    .get("/data", usersController.getAllUserData)
    .get("/payments", usersController.getBoughtCourses)
    .get("/round", usersController.getUserRound);

//-----------------------------------------------
// Certificates routes
//-----------------------------------------------
certificatesRoutes
    .get("/", usersController.getUserProfileCertificate)
    .get("/:courseId", usersController.getUserCertificate);

//-----------------------------------------------
// User exams performance routes
//-----------------------------------------------
examsRoutes
    .get("/submitted-exam", usersController.getSubmittedExam)
    .get("/grades", usersController.getUserGrades)
    .get("/:examId", usersController.getPerformExam)
    .get('/preview/:replyId', usersController.getExamPreview)
    .post(
        "/",
        [
            body("userAnswers").isArray().isLength({min: 1}),
            body("userAnswers.*").isObject(),
            body("userAnswers.*.*")
                .isNumeric({no_symbols: true})
                .optional({nullable: true}),
            body("examId").isString().isLength({min: 36, max: 36}),
        ],
        usersController.postPerformExam
    );

//-----------------------------------------------
// User Cart routes
//-----------------------------------------------
userCartRoutes.get('/', getShoppingCart)
userCartRoutes.delete('/:roundId', postDeleteFromCart)

//-----------------------------------------------
// User Coupons routes
//-----------------------------------------------
couponsRoutes.post('/', usersController.applyCoupon)

const usersRoutes = Router()
    .use("/", userProfileRoutes)
    .use("/certificates", certificatesRoutes)
    .use("/exams", examsRoutes)
    .use('/cart', userCartRoutes)
    .use('/coupons', couponsRoutes);

export default usersRoutes;
