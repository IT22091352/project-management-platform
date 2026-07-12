const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/response");
const userService = require("../services/users.service");
const parseId = require("../utils/parse-id");
const AppError = require("../utils/app-error");

const listUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const users = await userService.listUsers(role);
  return sendSuccess(res, 200, "Users fetched successfully", { users });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(parseId(req.params.id, "user id"));
  return sendSuccess(res, 200, "User fetched successfully", { user });
});

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return sendSuccess(res, 201, "User created successfully", { user });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const targetId = parseId(req.params.id, "user id");

  // Prevent any user from changing their own role
  if (req.body.role !== undefined && req.user.id === targetId) {
    return next(new AppError("You cannot change your own role.", 400));
  }

  const user = await userService.updateUser(targetId, req.body);
  return sendSuccess(res, 200, "User updated successfully", { user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const targetId = parseId(req.params.id, "user id");

  // Prevent self-deletion — enforced at the controller level, cannot be bypassed
  if (req.user.id === targetId) {
    return res.status(400).json({
      success: false,
      message: "You cannot delete your own account.",
    });
  }

  await userService.deleteUser(targetId);
  return sendSuccess(res, 200, "User deleted successfully", {});
});

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};