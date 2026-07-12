const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const tasksController = require("../controllers/tasks.controller");

router.use(authMiddleware);

router.get("/", tasksController.listTasks);
router.get("/my-tasks", tasksController.getMyTasks);
router.post("/", authorizeRoles("PROJECT_MANAGER", "ADMIN"), tasksController.createTask);
router.put("/:id", authorizeRoles("PROJECT_MANAGER", "ADMIN"), tasksController.updateTask);
router.delete("/:id", authorizeRoles("PROJECT_MANAGER", "ADMIN"), tasksController.deleteTask);
router.patch("/:id/assign", authorizeRoles("PROJECT_MANAGER", "ADMIN"), tasksController.assignTask);
router.patch("/:id/status", authorizeRoles("TEAM_MEMBER", "PROJECT_MANAGER", "ADMIN"), tasksController.updateStatus);
router.post("/:id/comments", authorizeRoles("TEAM_MEMBER", "PROJECT_MANAGER", "ADMIN"), tasksController.addComment);
router.get("/:id", tasksController.getTaskById);

module.exports = router;