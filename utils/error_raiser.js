import Errors from "../models/errors.js";
import logger from "./logger.js";

/**
 * @param {Error} err
 * @param {function} next
 * @param {'API' | ''} type
 */
export const errorRaiser = async (err, next, type = "API") => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  error.errorType = type;
  logger.error(err);
  console.log(err)
  return next(error);
};
