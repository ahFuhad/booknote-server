function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);

  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Please check the submitted information.",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "You have already borrowed this book."
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.status ? err.message : "Something went wrong on the server."
  });
}

module.exports = { notFound, errorHandler };
