const AppError = require("../utils/app-error");

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (err.name === "PrismaClientKnownRequestError") {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Duplicate record found",
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }
  }

  return res.status(statusCode).json({
    success: false,
    message: err.isOperational ? message : "Internal server error",
  });
};

module.exports = {
  notFound,
  errorHandler,
};