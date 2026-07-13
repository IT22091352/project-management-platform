const prisma = require("../config/prisma");
const AppError = require("../utils/app-error");
const notificationsService = require("./notifications.service");

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  projectId: true,
  assignedTo: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      title: true,
      managerId: true,
    },
  },
  assignee: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  comments: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      comment: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  },
};

const canManageProject = (project, currentUser) => {
  if (currentUser.role === "ADMIN") {
    return true;
  }

  return project.managerId === currentUser.id;
};

const hasProjectMembership = async (projectId, userId) => {
  const member = await prisma.projectMember.findFirst({
    where: { projectId, userId },
    select: { id: true },
  });

  return Boolean(member);
};

const listTasks = async (currentUser) => {
  let where = {};

  if (currentUser.role === "PROJECT_MANAGER") {
    where = {
      project: {
        managerId: currentUser.id,
      },
    };
  } else if (currentUser.role === "TEAM_MEMBER") {
    where = { assignedTo: currentUser.id };
  }

  return prisma.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: taskSelect,
  });
};

const getMyTasks = async (currentUser) => {
  return prisma.task.findMany({
    where: { assignedTo: currentUser.id },
    orderBy: { createdAt: "desc" },
    select: taskSelect,
  });
};

const getTaskById = async (currentUser, id) => {
  const task = await prisma.task.findUnique({
    where: { id },
    select: taskSelect,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (currentUser.role === "PROJECT_MANAGER" && task.project.managerId !== currentUser.id) {
    throw new AppError("Forbidden", 403);
  }

  if (currentUser.role === "TEAM_MEMBER" && task.assignedTo !== currentUser.id) {
    const allowed = await hasProjectMembership(task.projectId, currentUser.id);

    if (!allowed) {
      throw new AppError("Forbidden", 403);
    }
  }

  return task;
};

const ensureProjectMember = async (projectId, userId) => {
  const member = await hasProjectMembership(projectId, userId);

  if (!member) {
    throw new AppError("Assigned user must be a project member", 400);
  }
};

const createTask = async (currentUser, payload) => {
  if (!payload.title || !payload.projectId || !payload.assignedTo) {
    throw new AppError("Title, projectId, and assignedTo are required", 400);
  }

  const projectId = Number(payload.projectId);
  const assignedTo = Number(payload.assignedTo);

  if (!Number.isInteger(projectId) || projectId <= 0 || !Number.isInteger(assignedTo) || assignedTo <= 0) {
    throw new AppError("Invalid projectId or assignedTo", 400);
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (!canManageProject(project, currentUser)) {
    throw new AppError("Forbidden", 403);
  }

  const assignee = await prisma.user.findUnique({ where: { id: assignedTo } });

  if (!assignee) {
    throw new AppError("Assigned user not found", 404);
  }

  // Business rule: tasks can only be assigned to TEAM_MEMBER users
  if (assignee.role !== "TEAM_MEMBER") {
    throw new AppError("Tasks can only be assigned to team members.", 400);
  }

  if (assignee.id !== project.managerId) {
    await ensureProjectMember(projectId, assignedTo);
  }

  const createdTask = await prisma.task.create({
    data: {
      title: payload.title.trim(),
      description: payload.description ? payload.description.trim() : null,
      status: payload.status || undefined,
      priority: payload.priority || undefined,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
      projectId,
      assignedTo,
    },
    select: taskSelect,
  });

  await notificationsService.createNotification({
    userId: assignedTo,
    actorId: currentUser.id,
    title: "Task Assigned",
    message: `You have been assigned to task: ${createdTask.title}`,
    type: "TASK_ASSIGNED",
    priority: "HIGH",
    referenceId: createdTask.id,
    referenceType: "Task",
    route: `/tasks`,
  });

  return createdTask;
};

const updateTask = async (currentUser, id, payload) => {
  const task = await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      projectId: true,
      project: {
        select: { managerId: true },
      },
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (!canManageProject(task.project, currentUser)) {
    throw new AppError("Forbidden", 403);
  }

  const data = {};

  if (payload.title !== undefined) {
    data.title = payload.title.trim();
  }

  if (payload.description !== undefined) {
    data.description = payload.description ? payload.description.trim() : null;
  }

  if (payload.status !== undefined) {
    data.status = payload.status;
  }

  if (payload.priority !== undefined) {
    data.priority = payload.priority;
  }

  if (payload.dueDate !== undefined) {
    data.dueDate = payload.dueDate ? new Date(payload.dueDate) : null;
  }

  if (payload.assignedTo !== undefined) {
    const assignedTo = Number(payload.assignedTo);

    if (!Number.isInteger(assignedTo) || assignedTo <= 0) {
      throw new AppError("Invalid assignedTo", 400);
    }

    const assignee = await prisma.user.findUnique({ where: { id: assignedTo } });

    if (!assignee) {
      throw new AppError("Assigned user not found", 404);
    }

    // Business rule: tasks can only be assigned to TEAM_MEMBER users
    if (assignee.role !== "TEAM_MEMBER") {
      throw new AppError("Tasks can only be assigned to team members.", 400);
    }

    if (assignee.id !== task.project.managerId) {
      await ensureProjectMember(task.projectId, assignedTo);
    }

    data.assignedTo = assignedTo;
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data,
    select: taskSelect,
  });

  const notifyUserId = data.assignedTo || task.assignedTo;
  if (notifyUserId) {
    await notificationsService.createNotification({
      userId: notifyUserId,
      actorId: currentUser.id,
      title: "Task Updated",
      message: `Task ${updatedTask.title} has been updated.`,
      type: "TASK_UPDATED",
      priority: "LOW",
      referenceId: id,
      referenceType: "Task",
      route: `/tasks`,
    });
  }

  return updatedTask;
};

const deleteTask = async (currentUser, id) => {
  const task = await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      project: {
        select: { managerId: true },
      },
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (!canManageProject(task.project, currentUser)) {
    throw new AppError("Forbidden", 403);
  }

  await prisma.task.delete({ where: { id } });

  return true;
};

const assignTask = async (currentUser, id, assignedTo) => {
  const task = await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      projectId: true,
      project: {
        select: { managerId: true },
      },
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (!canManageProject(task.project, currentUser)) {
    throw new AppError("Forbidden", 403);
  }

  const assigneeId = Number(assignedTo);

  if (!Number.isInteger(assigneeId) || assigneeId <= 0) {
    throw new AppError("Invalid assignedTo", 400);
  }

  const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });

  if (!assignee) {
    throw new AppError("Assigned user not found", 404);
  }

  if (assignee.id !== task.project.managerId) {
    await ensureProjectMember(task.projectId, assigneeId);
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: { assignedTo: assigneeId },
    select: taskSelect,
  });

  await notificationsService.createNotification({
    userId: assigneeId,
    actorId: currentUser.id,
    title: "Task Assigned",
    message: `You have been assigned to task: ${updatedTask.title}`,
    type: "TASK_ASSIGNED",
    priority: "HIGH",
    referenceId: id,
    referenceType: "Task",
    route: `/tasks`,
  });

  return updatedTask;
};

const updateStatus = async (currentUser, id, status) => {
  const task = await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      assignedTo: true,
      project: {
        select: { managerId: true },
      },
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const isOwner = task.assignedTo === currentUser.id;
  const isManager = canManageProject(task.project, currentUser);

  if (!isOwner && !isManager && currentUser.role !== "ADMIN") {
    throw new AppError("Forbidden", 403);
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: { status },
    select: taskSelect,
  });

  // Notify Project Manager
  if (task.project.managerId) {
    await notificationsService.createNotification({
      userId: task.project.managerId,
      actorId: currentUser.id,
      title: "Task Status Changed",
      message: `Task ${updatedTask.title} status changed to ${status}`,
      type: "TASK_STATUS_CHANGED",
      priority: "LOW",
      referenceId: id,
      referenceType: "Task",
      route: `/tasks`,
    });
  }

  return updatedTask;
};

const addComment = async (currentUser, id, comment) => {
  if (!comment) {
    throw new AppError("Comment is required", 400);
  }

  const task = await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      assignedTo: true,
      projectId: true,
      project: {
        select: { managerId: true },
      },
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const isOwner = task.assignedTo === currentUser.id;
  const isManager = canManageProject(task.project, currentUser);

  if (!isOwner && !isManager && currentUser.role !== "ADMIN") {
    const allowed = await hasProjectMembership(task.projectId, currentUser.id);

    if (!allowed) {
      throw new AppError("Forbidden", 403);
    }
  }

  const createdComment = await prisma.comment.create({
    data: {
      comment: comment.trim(),
      taskId: id,
      userId: currentUser.id,
    },
    select: {
      id: true,
      comment: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  // Notify Assignee
  if (task.assignedTo) {
    await notificationsService.createNotification({
      userId: task.assignedTo,
      actorId: currentUser.id,
      title: "New Comment",
      message: `New comment on task`,
      type: "COMMENT_ADDED",
      priority: "LOW",
      referenceId: id,
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
      referenceId: id,
      referenceType: "Task",
      route: `/tasks`,
    });
  }

  return createdComment;
};

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