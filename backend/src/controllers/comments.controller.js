const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/response");
const commentsService = require("../services/comments.service");
const parseId = require("../utils/parse-id");

const createComment = asyncHandler(async (req, res) => {
  const comment = await commentsService.createComment(req.user, req.body);
  return sendSuccess(res, 201, "Comment created successfully", { comment });
});

const listCommentsByTask = asyncHandler(async (req, res) => {
  const comments = await commentsService.listCommentsByTask(req.user, parseId(req.params.taskId, "task id"));
  return sendSuccess(res, 200, "Comments fetched successfully", { comments });
});

const deleteComment = asyncHandler(async (req, res) => {
  await commentsService.deleteComment(req.user, parseId(req.params.id, "comment id"));
  return sendSuccess(res, 200, "Comment deleted successfully", {});
});

module.exports = {
  createComment,
  listCommentsByTask,
  deleteComment,
};