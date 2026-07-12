const prisma = require("../config/prisma");

const getAdminDashboard = async () => {
  const [totalUsers, totalProjects, totalTasks, completedTasks, pendingTasks, recentProjects, recentTasks, recentComments] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.task.count(),
    prisma.task.count({ where: { status: "DONE" } }),
    prisma.task.count({ where: { status: { not: "DONE" } } }),
    prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        manager: { select: { id: true, name: true } },
      },
    }),
    prisma.task.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        project: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true } },
      },
    }),
    prisma.comment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        comment: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    }),
  ]);

  return {
    stats: { totalUsers, totalProjects, totalTasks, completedTasks, pendingTasks },
    recentProjects,
    recentTasks,
    recentComments,
  };
};

const getManagerDashboard = async (currentUser) => {
  const [projectsManaged, tasks, completedTasks, pendingTasks, recentProjects, recentTasks, recentComments] = await Promise.all([
    prisma.project.count({ where: { managerId: currentUser.id } }),
    prisma.task.count({
      where: { project: { managerId: currentUser.id } },
    }),
    prisma.task.count({
      where: { project: { managerId: currentUser.id }, status: "DONE" },
    }),
    prisma.task.count({
      where: { project: { managerId: currentUser.id }, status: { not: "DONE" } },
    }),
    prisma.project.findMany({
      take: 5,
      where: { managerId: currentUser.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        manager: { select: { id: true, name: true } },
      },
    }),
    prisma.task.findMany({
      take: 5,
      where: { project: { managerId: currentUser.id } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        project: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true } },
      },
    }),
    prisma.comment.findMany({
      take: 5,
      where: { task: { project: { managerId: currentUser.id } } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        comment: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    }),
  ]);

  return {
    stats: { projectsManaged, tasks, completedTasks, pendingTasks },
    recentProjects,
    recentTasks,
    recentComments,
  };
};

const getMemberDashboard = async (currentUser) => {
  const [assignedTasks, completed, pending, recentTasks, recentComments] = await Promise.all([
    prisma.task.count({ where: { assignedTo: currentUser.id } }),
    prisma.task.count({ where: { assignedTo: currentUser.id, status: "DONE" } }),
    prisma.task.count({ where: { assignedTo: currentUser.id, status: { not: "DONE" } } }),
    prisma.task.findMany({
      take: 5,
      where: { assignedTo: currentUser.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        project: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true } },
      },
    }),
    prisma.comment.findMany({
      take: 5,
      where: { userId: currentUser.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        comment: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    }),
  ]);

  return {
    stats: { assignedTasks, completed, pending },
    recentTasks,
    recentComments,
  };
};

module.exports = {
  getAdminDashboard,
  getManagerDashboard,
  getMemberDashboard,
};