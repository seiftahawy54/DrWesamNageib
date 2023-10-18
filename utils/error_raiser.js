import Errors from "../models/errors.js";
import logger from "./logger.js";

/**
 * @param {Error} err
 * @param {function} next
 * @param {'API' | ''} type
 */
export const errorRaiser = async (err, next, type = "API") => {
  console.log(`received error ${err.message}`)
  err.httpStatusCode = 500;
  err.errorType = type;
  err.message = err.message;
  logger.error(err);
  return next(err);
};
