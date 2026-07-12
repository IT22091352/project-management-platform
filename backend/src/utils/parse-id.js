const AppError = require("./app-error");

const parseId = (value, fieldName = "id") => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }

  return parsed;
};

module.exports = parseId;