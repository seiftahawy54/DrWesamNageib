import Errors from "../models/errors.js";
import logger from "./logger.js";

/**
 * @param {Error} err
 * @param {function} next
 * @param {'API' | ''} type
 */
export const errorRaiser = async (err, next, type = "API") => {
  console.log(`received error ${JSON.stringify(err.message)}`)
  console.error(err)
  err.httpStatusCode = 500;
  err.errorType = type;
  err.message = err.message;
  logger.info(err);
  return next(err);
};
