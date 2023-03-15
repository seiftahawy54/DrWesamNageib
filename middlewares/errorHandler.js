export default (error, req, res, next) => {
  console.log(error);
  return res.status(error.httpStatusCode).json({ error: error.message });
}