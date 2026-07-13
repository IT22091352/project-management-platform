const prisma = require("../config/prisma");
const AppError = require("../utils/app-error");
const notificationsService = require("./notifications.service");

const commentSelect = {
  id: true,
  comment: true,
  createdAt: true,
  task: {
    select: {
      id: true,
      title: true,
      projectId: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
};

const canViewTask = async (currentUser, task) => {
  if (currentUser.role === "ADMIN") {
    return true;
  }

  if (currentUser.role === "PROJECT_MANAGER") {
    return task.project.managerId === currentUser.id;
  }

  if (task.assignedTo === currentUser.id) {
    return true;
  }

  const membership = await prisma.projectMember.findFirst({
    where: {
      projectId: task.projectId,
      userId: currentUser.id,
    },
    select: { id: true },
  });

  return Boolean(membership);
};

const createComment = async (currentUser, payload) => {
  const taskId = Number(payload.taskId);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    throw new AppError("taskId is required", 400);
  }

  if (!payload.comment || !payload.comment.trim()) {
    throw new AppError("Comment is required", 400);
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      assignedTo: true,
      projectId: true,
      project: {
        select: {
          managerId: true,
        },
      },
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const allowed = await canViewTask(currentUser, task);

  if (!allowed) {
    throw new AppError("Forbidden", 403);
  }

  const createdComment = await prisma.comment.create({
    data: {
      comment: payload.comment.trim(),
      taskId,
      userId: currentUser.id,
    },
    select: commentSelect,
  });

  // Notify Assignee
  if (task.assignedTo) {
    await notificationsService.createNotification({
      userId: task.assignedTo,
      actorId: currentUser.id,
      title: "New Comment",
      message: `New comment on task: ${task.project ? 'task' : 'task'}`, // We don't have task.title, just task id
      type: "COMMENT_ADDED",
      priority: "LOW",
      referenceId: taskId,
      referenceType: "Task",
      route: `/tasks`,
    });
  }

  // Notify Project Manager
  if (task.project && task.project.managerId) {
    await notificationsService.createNotification({
      userId: task.project.managerId,
      actorId: currentUser.id,
      title: "New Comment",
      message: `New comment on task`,
      type: "COMMENT_ADDED",
      priority: "LOW",
      referenceId: taskId,
      referenceType: "Task",
      route: `/tasks`,
    });
  }

  return createdComment;
};

const listCommentsByTask = async (currentUser, taskId) => {
  const id = Number(taskId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid task id", 400);
  }

  const task = await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      assignedTo: true,
      projectId: true,
      project: {
        select: {
          managerId: true,
        },
      },
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const allowed = await canViewTask(currentUser, task);

  if (!allowed) {
    throw new AppError("Forbidden", 403);
  }

  return prisma.comment.findMany({
    where: { taskId: id },
    orderBy: { createdAt: "asc" },
    select: commentSelect,
  });
};

const deleteComment = async (currentUser, commentId) => {
  const id = Number(commentId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid comment id", 400);
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      task: {
        select: {
          id: true,
          assignedTo: true,
          projectId: true,
          project: {
            select: {
              managerId: true,
            },
          },
        },
      },
    },
  });

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  const isOwner = comment.userId === currentUser.id;
  const isAdmin = currentUser.role === "ADMIN";
  const isManager = currentUser.role === "PROJECT_MANAGER" && comment.task.project.managerId === currentUser.id;

  if (!isOwner && !isAdmin && !isManager) {
    throw new AppError("Forbidden", 403);
  }

  await prisma.comment.delete({ where: { id } });

  return true;
};

module.exports = {
  createComment,
  listCommentsByTask,
  deleteComment,
};