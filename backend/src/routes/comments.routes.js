const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const commentsController = require("../controllers/comments.controller");

router.use(authMiddleware);

router.post("/", authorizeRoles("TEAM_MEMBER", "PROJECT_MANAGER", "ADMIN"), commentsController.createComment);
router.get("/task/:taskId", commentsController.listCommentsByTask);
router.delete("/:id", authorizeRoles("TEAM_MEMBER", "PROJECT_MANAGER", "ADMIN"), commentsController.deleteComment);

module.exports = router;