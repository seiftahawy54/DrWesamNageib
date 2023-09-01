import {errorRaiser} from "./error_raiser.js";
import {Courses, Users} from "../models/index.js";

export const createEmptyCart = () => {
};

export const updateCart = async (courseId, req, newCart, next) => {
    try {
        req.user.cart = JSON.stringify(newCart);
        const updatingResult = await Users.update(
            {cart: req.user.cart},
            {where: {user_id: req.user.user_id}}
        );

        return updatingResult[0] === 1;
    } catch (e) {
        await errorRaiser(e, next);
    }
};

export const getCoursesFormCart = async (cart) => {
    const boughtCoursesPromises = await cart.map(async (course) => {
        return await Courses.findByPk(course);
    });

    const boughtCourses = [];

    for (const key of boughtCoursesPromises) {
        boughtCourses.push(await key);
    }
    return boughtCourses;
};

export const extractCart = (req) => {
    return JSON.parse(req.user.cart);
};

export const calcTotalPrice = (cart) => {
    return cart.reduce(
        (currentValue, previousValue) =>
            parseFloat(currentValue) + parseFloat(previousValue)
    );
};

export const findCartCourses = async (cart) => {
    const returnCoursesArr = [];

    const findCartCourses = cart.map(async (cartItem) => {
        return await Courses.findOne({
            where: {course_id: cartItem.courseId}
        });
    });

    for (const course of findCartCourses) {
        returnCoursesArr.push(await course);
    }

    return returnCoursesArr.some((course) => course === null) ? null : returnCoursesArr;
};

export const cartIsEmpty = (cart) => {
    let isEmpty = true;
    for (const item in cart) {
        if (cart[item].courseId) {
            isEmpty = false;
            return isEmpty;
        }
    }
    return isEmpty;
};

export const extractArrOfPrices = (courses) => {
    return courses.map((course) => course.price);
};

export const courseExistsInCart = (cart, courseId) => {
    let exists = false;

    for (const item of cart) {
        if (item.courseId === courseId) {
            exists = true;
            return exists;
        }
    }

    return exists;
};

export const filterCart = (cart, searchingItem) => {
    return cart.filter(
        ({courseId}) => courseId.localeCompare(searchingItem) !== 0
    );
};

export const filterDuplicates = (cart) => {
    const filteredCart = [];

    for (let item of cart) {
        if (filteredCart.findIndex(uniqueItem => uniqueItem.courseId === item.courseId) === -1) {
            filteredCart.push(item);
        }
    }

    return filteredCart;
}
