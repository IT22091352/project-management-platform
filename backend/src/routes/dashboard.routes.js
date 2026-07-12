const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const dashboardController = require("../controllers/dashboard.controller");

router.use(authMiddleware);

router.get("/admin", authorizeRoles("ADMIN"), dashboardController.adminDashboard);
router.get("/manager", authorizeRoles("PROJECT_MANAGER"), dashboardController.managerDashboard);
router.get("/member", authorizeRoles("TEAM_MEMBER"), dashboardController.memberDashboard);

module.exports = router;