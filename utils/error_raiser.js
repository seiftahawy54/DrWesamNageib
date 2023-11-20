import Errors from "../models/errors.js";
import logger from "./logger.js";

/**
 * @param {Error} err
 * @param {function} next
 * @param {'API' | ''} type
 */
export const errorRaiser = async (err, next, type = "API") => {
    console.log(`received error ${JSON.stringify(err)}`)
    console.error(JSON.stringify(err))
    const errObject = {};
    errObject.httpStatusCode = 500;
    errObject.errorType = type;
    errObject.message = err.message;
    logger.info(errObject);
    return next(errObject);
};
