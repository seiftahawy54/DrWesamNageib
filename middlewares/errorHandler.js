import logger from "../utils/logger.js";

export default (error, req, res, next) => {
  console.log(`this error from error middleware handler ${JSON.stringify(error)}`)
  return res.status(error.httpStatusCode).json(error);
};
