const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/response");
const userService = require("../services/users.service");
const parseId = require("../utils/parse-id");

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

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(parseId(req.params.id, "user id"), req.body);
  return sendSuccess(res, 200, "User updated successfully", { user });
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(parseId(req.params.id, "user id"));
  return sendSuccess(res, 200, "User deleted successfully", {});
});

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};