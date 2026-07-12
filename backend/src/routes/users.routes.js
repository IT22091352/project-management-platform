const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const usersController = require("../controllers/users.controller");

router.use(authMiddleware);

// Role-filtered list (accessible to ADMIN and PROJECT_MANAGER for dropdown population)
router.get("/", authorizeRoles("ADMIN", "PROJECT_MANAGER"), usersController.listUsers);
router.get("/:id", authorizeRoles("ADMIN"), usersController.getUserById);
router.post("/", authorizeRoles("ADMIN"), usersController.createUser);
router.put("/:id", authorizeRoles("ADMIN"), usersController.updateUser);
router.delete("/:id", authorizeRoles("ADMIN"), usersController.deleteUser);

module.exports = router;