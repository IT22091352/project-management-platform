const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/response");
const dashboardService = require("../services/dashboard.service");

const adminDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getAdminDashboard();
  return sendSuccess(res, 200, "Admin dashboard fetched successfully", { dashboard });
});

const managerDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getManagerDashboard(req.user);
  return sendSuccess(res, 200, "Manager dashboard fetched successfully", { dashboard });
});

const memberDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getMemberDashboard(req.user);
  return sendSuccess(res, 200, "Member dashboard fetched successfully", { dashboard });
});

module.exports = {
  adminDashboard,
  managerDashboard,
  memberDashboard,
};