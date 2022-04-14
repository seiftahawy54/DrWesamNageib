import Errors from "../models/errors.js";

export const errorRaiser = async (err, next) => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  await Errors.create({ error: JSON.stringify(err) });
  return next(error);
};
