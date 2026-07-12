const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const projectsController = require("../controllers/projects.controller");

router.use(authMiddleware);

router.get("/", projectsController.listProjects);
router.get("/:id", projectsController.getProjectById);
router.get("/:id/members", projectsController.getProjectMembers);
router.post("/", authorizeRoles("PROJECT_MANAGER", "ADMIN"), projectsController.createProject);
router.put("/:id", authorizeRoles("PROJECT_MANAGER", "ADMIN"), projectsController.updateProject);
router.delete("/:id", authorizeRoles("PROJECT_MANAGER", "ADMIN"), projectsController.deleteProject);
router.post("/:id/members", authorizeRoles("PROJECT_MANAGER", "ADMIN"), projectsController.assignMembers);
router.delete("/:id/members/:userId", authorizeRoles("PROJECT_MANAGER", "ADMIN"), projectsController.removeMember);

module.exports = router;