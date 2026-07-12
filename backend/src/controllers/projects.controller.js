const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/response");
const projectService = require("../services/projects.service");
const parseId = require("../utils/parse-id");

const listProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.listProjects(req.user);
  return sendSuccess(res, 200, "Projects fetched successfully", { projects });
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.user, parseId(req.params.id, "project id"));
  return sendSuccess(res, 200, "Project fetched successfully", { project });
});

const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.user, req.body);
  return sendSuccess(res, 201, "Project created successfully", { project });
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.user, parseId(req.params.id, "project id"), req.body);
  return sendSuccess(res, 200, "Project updated successfully", { project });
});

const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.user, parseId(req.params.id, "project id"));
  return sendSuccess(res, 200, "Project deleted successfully", {});
});

const assignMembers = asyncHandler(async (req, res) => {
  const project = await projectService.assignMembers(req.user, parseId(req.params.id, "project id"), req.body.memberIds);
  return sendSuccess(res, 200, "Members assigned successfully", { project });
});

const removeMember = asyncHandler(async (req, res) => {
  await projectService.removeMember(
    req.user,
    parseId(req.params.id, "project id"),
    parseId(req.params.userId, "user id")
  );
  return sendSuccess(res, 200, "Member removed successfully", {});
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.user, parseId(req.params.id, "project id"));
  return sendSuccess(res, 200, "Project members fetched successfully", { members: project.members || [] });
});

module.exports = {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignMembers,
  removeMember,
  getProjectMembers,
};