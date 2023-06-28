import logger from "../utils/logger.js";

export default (error, req, res, next) => {
  console.log(error)
  logger.error(error)
  return res.status(error.httpStatusCode).json({ error });
};
