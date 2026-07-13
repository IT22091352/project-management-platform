const prisma = require("../config/prisma");
const AppError = require("../utils/app-error");

const projectSelect = {
  id: true,
  title: true,
  description: true,
  managerId: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  manager: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  creator: {
    select: {
      id: true,
      name: true,
    },
  },
  _count: {
    select: {
      tasks: true,
    },
  },
};

const loadProjectMembers = async (projectId) => {
  const members = await prisma.projectMember.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
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

  return members;
};

const hasProjectMembership = async (projectId, userId) => {
  const member = await prisma.projectMember.findFirst({
    where: { projectId, userId },
    select: { id: true },
  });

  return Boolean(member);
};

const listProjects = async (currentUser) => {
  let where = {};

  if (currentUser.role === "PROJECT_MANAGER") {
    where = { managerId: currentUser.id };
  } else if (currentUser.role === "TEAM_MEMBER") {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: currentUser.id },
      select: { projectId: true },
    });

    const projectIds = memberships.map((membership) => membership.projectId);

    if (projectIds.length === 0) {
      return [];
    }

    where = { id: { in: projectIds } };
  }

  return prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: projectSelect,
  });
};

const getProjectById = async (currentUser, id) => {
  const project = await prisma.project.findUnique({
    where: { id },
    select: projectSelect,
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (currentUser.role === "PROJECT_MANAGER" && project.managerId !== currentUser.id) {
    throw new AppError("Project not found", 404);
  }

  if (currentUser.role === "TEAM_MEMBER") {
    const allowed = await hasProjectMembership(id, currentUser.id);

    if (!allowed) {
      throw new AppError("Project not found", 404);
    }
  }

  const members = await loadProjectMembers(id);

  return {
    ...project,
    members,
    _count: {
      ...project._count,
      members: members.length,
    },
  };
};

const createProject = async (currentUser, payload) => {
  if (!payload.title) {
    throw new AppError("Project title is required", 400);
  }

  if (currentUser.role === "PROJECT_MANAGER") {
    payload.managerId = currentUser.id;
  }

  if (currentUser.role !== "ADMIN" && payload.managerId && Number(payload.managerId) !== currentUser.id) {
    throw new AppError("Forbidden", 403);
  }

  const managerId = Number(payload.managerId || currentUser.id);

  if (!Number.isInteger(managerId) || managerId <= 0) {
    throw new AppError("Invalid manager id", 400);
  }

  const manager = await prisma.user.findUnique({ where: { id: managerId } });

  if (!manager) {
    throw new AppError("Manager not found", 404);
  }

  if (!["ADMIN", "PROJECT_MANAGER"].includes(manager.role)) {
    throw new AppError("Project manager must be an admin or project manager", 400);
  }

  const createdProject = await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        title: payload.title.trim(),
        description: payload.description ? payload.description.trim() : null,
        managerId,
        // Record the original creator — never overwritten when manager changes
        createdBy: currentUser.id,
      },
    });

    await tx.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: managerId,
        },
      },
      update: {},
      create: {
        projectId: project.id,
        userId: managerId,
      },
    });

    if (Array.isArray(payload.memberIds) && payload.memberIds.length > 0) {
      const uniqueMemberIds = [...new Set(payload.memberIds.map(Number).filter(Number.isInteger))];
      const members = await tx.user.findMany({
        where: { id: { in: uniqueMemberIds } },
        select: { id: true },
      });

      if (members.length !== uniqueMemberIds.length) {
        throw new AppError("One or more member IDs are invalid", 400);
      }

      for (const userId of uniqueMemberIds) {
        if (userId !== managerId) {
          await tx.projectMember.upsert({
            where: {
              projectId_userId: {
                projectId: project.id,
                userId,
              },
            },
            update: {},
            create: {
              projectId: project.id,
              userId,
            },
          });
        }
      }
    }

    return project;
  });

  return getProjectById(currentUser, createdProject.id);
};

const updateProject = async (currentUser, id, payload) => {
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (currentUser.role !== "ADMIN" && project.managerId !== currentUser.id) {
    throw new AppError("Forbidden", 403);
  }

  const data = {};

  if (payload.title !== undefined) {
    data.title = payload.title.trim();
  }

  if (payload.description !== undefined) {
    data.description = payload.description ? payload.description.trim() : null;
  }

  if (payload.managerId !== undefined) {
    if (currentUser.role !== "ADMIN") {
      throw new AppError("Only admin can reassign the manager", 403);
    }

    const managerId = Number(payload.managerId);

    if (!Number.isInteger(managerId) || managerId <= 0) {
      throw new AppError("Invalid manager id", 400);
    }

    const manager = await prisma.user.findUnique({ where: { id: managerId } });

    if (!manager) {
      throw new AppError("Manager not found", 404);
    }

    if (!["ADMIN", "PROJECT_MANAGER"].includes(manager.role)) {
      throw new AppError("Project manager must be an admin or project manager", 400);
    }

    data.managerId = managerId;
  }

  await prisma.project.update({
    where: { id },
    data,
  });

  return getProjectById(currentUser, id);
};

const deleteProject = async (currentUser, id) => {
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // ADMIN can delete any project.
  // PROJECT_MANAGER can only delete projects they personally created (createdBy).
  // Being assigned as manager does NOT grant delete rights.
  if (currentUser.role !== "ADMIN" && project.createdBy !== currentUser.id) {
    throw new AppError(
      "Only the project owner or an administrator can delete this project.",
      403
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.projectMember.deleteMany({ where: { projectId: id } });
    await tx.project.delete({ where: { id } });
  });

  return true;
};

const assignMembers = async (currentUser, projectId, memberIds) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (currentUser.role !== "ADMIN" && project.managerId !== currentUser.id) {
    throw new AppError("Forbidden", 403);
  }

  const normalizedMemberIds = [...new Set((memberIds || []).map(Number).filter(Number.isInteger))];

  if (normalizedMemberIds.length === 0) {
    throw new AppError("At least one member id is required", 400);
  }

  const members = await prisma.user.findMany({
    where: { id: { in: normalizedMemberIds } },
    select: { id: true },
  });

  if (members.length !== normalizedMemberIds.length) {
    throw new AppError("One or more member IDs are invalid", 400);
  }

  for (const userId of normalizedMemberIds) {
    if (userId !== project.managerId) {
      await prisma.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
        update: {},
        create: {
          projectId,
          userId,
        },
      });
    }
  }

  return getProjectById(currentUser, projectId);
};

const removeMember = async (currentUser, projectId, userId) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (currentUser.role !== "ADMIN" && project.managerId !== currentUser.id) {
    throw new AppError("Forbidden", 403);
  }

  if (project.managerId === userId) {
    throw new AppError("Project manager cannot be removed from the project", 400);
  }

  await prisma.projectMember.deleteMany({ where: { projectId, userId } });

  return true;
};

module.exports = {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignMembers,
  removeMember,
};