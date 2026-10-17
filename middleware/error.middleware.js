const errorMiddleware = (err, req, res, next) => {
  const body = {
    success: false,
    message: err.message || "Server Error",
  };

  if (err.ownerFirstName) body.ownerFirstName = err.ownerFirstName;
  if (err.socials) body.socials = err.socials;

  return res.status(err.statusCode || 500).json(body);
};

module.exports = errorMiddleware;