// import { getAllCourses, getSingleCourse } from "../models/courses.js";
import {errorRaiser} from "../utils/error_raiser.js";
import {
    downloadingCoursesImages,
    extractError,
    sortCourses, validURL,
} from "../utils/general_helper.js";
import {Courses} from "../models/index.js";
import {Users} from "../models/index.js";
import {Rounds} from "../models/index.js";
import moment from "moment";
import {validationResult} from "express-validator";
import {cartIsEmpty, courseExistsInCart, filterDuplicates} from "../utils/cart_helpers.js";
import {sequelize} from "../utils/db.js";
import userPerRound from "../models/userPerRound.js";
import {Op, Sequelize} from "sequelize";
import logger from "../utils/logger.js";
import {getSingleFile} from "../utils/aws.js";

const getIndex = async (req, res, next) => {
    try {
        const courses = await sequelize.query(
            "SELECT * FROM courses ORDER BY course_rank ASC",
            {
                type: "SELECT",
            }
        );

        // await downloadingCoursesImages(fetchingResult);

        return res.render("courses/index", {
            title: "Courses",
            path: "/courses",
            courses,
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

const singleCourse = async (req, res, next) => {
    try {
        const course = await Courses.findOne({
            where: {course_id: req.params.courseId}
        });

        const roundsResult = await Rounds.findAll({
            where: {
                course_id: course.course_id,
                finished: false,
                archived: false,
            },
        });

        const numberOfCourses = await Courses.findAndCountAll();

        try {
            if (!validURL(course.course_img)) {
                course.course_img = await getSingleFile(course.course_img);
                course.course_img = await getSingleFile(course.course_img);
            }
        } catch (e) {
            logger.info(e)
        }
        // const filteredRounds = roundsResult.filter((round) => !round.finished);

        return res.status(200).json({
            course,
            numberOfCourses: numberOfCourses.count,
            rounds: roundsResult,
        })
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getAllCoursesData = async (req, res, next) => {
    try {
        const courses = await Courses.findAll();
        await downloadingCoursesImages(courses);
        return res.status(200).json({
            courses,
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getCoursesCategories = async (req, res, next) => {
    try {
        let coursesCategories = await Courses.findAll({
            attributes: ["course_category"],
        });

        coursesCategories = coursesCategories.map(
            ({course_category}) => course_category
        );
        coursesCategories = [...new Set(coursesCategories)];

        return res.status(200).json({
            coursesCategories,
        });
    } catch (e) {
        await errorRaiser(e, next);
    }
};

const addCourseToCart = async (req, res, next) => {
    try {
        const {courseId, roundDate} = req.body;
        const user = await Users.findOne({where: {id: req.user.id}});
        const round = await Rounds.findOne({
            where: {
                round_date: roundDate
            }
        })
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(422).json({message: "Please select a valid date!"});
        }

        const findingItemResult = courseExistsInCart(user.cart, courseId);

        logger.info(`Searching for cart item ${findingItemResult}`)

        if (Array.isArray(user.cart) && findingItemResult) {
            return res.status(400).json({
                message: `You've already chosen this course and added to your cart! proceed to Checkout or pay now?`
            })
        }

        user.cart = [...user.cart, {courseId: courseId, roundId: round.round_id}];

        // Filter duplicates
        user.cart = filterDuplicates(user.cart);

        logger.info(`filtered cart => ${user.cart}`)

        // filter empty items
        user.cart = user.cart.filter((cartItem) => Object.keys(cartItem).length !== 0);

        const addingResult = await Users.update(
            {cart: user.cart},
            {where: {id: req.user.id}}
        );

        logger.info(`updating cart result ${JSON.stringify(addingResult)}`)

        return res.status(201).json({message: "Course added successfully"});
    } catch (e) {
        await errorRaiser(e, next);
    }
};

const isAddedToCart = async (req, res, next) => {
    try {
        const {courseId} = req.params;
        const {cart} = await Users.findOne({where: {id: req.user.id}});

        return res.status(200).json({
            inCart: courseExistsInCart(cart, courseId),
        })

    } catch (e) {
        await errorRaiser(e, next);
    }
}

export {getIndex, addCourseToCart, singleCourse, isAddedToCart};
