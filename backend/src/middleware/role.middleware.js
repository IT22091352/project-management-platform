const AppError = require("../utils/app-error");

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (req.user.role === "ADMIN") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }

    return next();
  };
};

module.exports = authorizeRoles;