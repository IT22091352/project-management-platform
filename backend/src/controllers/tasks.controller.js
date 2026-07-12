const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/response");
const taskService = require("../services/tasks.service");
const parseId = require("../utils/parse-id");

const listTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.listTasks(req.user);
  return sendSuccess(res, 200, "Tasks fetched successfully", { tasks });
});

const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getMyTasks(req.user);
  return sendSuccess(res, 200, "My tasks fetched successfully", { tasks });
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.user, parseId(req.params.id, "task id"));
  return sendSuccess(res, 200, "Task fetched successfully", { task });
});

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user, req.body);
  return sendSuccess(res, 201, "Task created successfully", { task });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.user, parseId(req.params.id, "task id"), req.body);
  return sendSuccess(res, 200, "Task updated successfully", { task });
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.user, parseId(req.params.id, "task id"));
  return sendSuccess(res, 200, "Task deleted successfully", {});
});

const assignTask = asyncHandler(async (req, res) => {
  const task = await taskService.assignTask(req.user, parseId(req.params.id, "task id"), req.body.assignedTo);
  return sendSuccess(res, 200, "Task assigned successfully", { task });
});

const updateStatus = asyncHandler(async (req, res) => {
  const task = await taskService.updateStatus(req.user, parseId(req.params.id, "task id"), req.body.status);
  return sendSuccess(res, 200, "Task status updated successfully", { task });
});

const addComment = asyncHandler(async (req, res) => {
  const comment = await taskService.addComment(req.user, parseId(req.params.id, "task id"), req.body.comment);
  return sendSuccess(res, 201, "Comment added successfully", { comment });
});

module.exports = {
  listTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  updateStatus,
  addComment,
};