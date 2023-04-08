export default (error, req, res, next) => {
  return res.status(error.httpStatusCode).json({ error });
};
