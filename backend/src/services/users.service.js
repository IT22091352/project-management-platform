const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const AppError = require("../utils/app-error");

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

const normalizeRole = (role) => {
  if (!["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"].includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  return role;
};

const listUsers = async (role) => {
  const where = role ? { role } : {};
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: userSelect,
  });

  return users;
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const createUser = async ({ name, email, password, role }) => {
  if (!name || !email || !password || !role) {
    throw new AppError("Name, email, password, and role are required", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters long", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizeRole(role),
    },
    select: userSelect,
  });

  return user;
};

const updateUser = async (id, payload) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  const data = {};

  if (payload.name !== undefined) {
    data.name = payload.name.trim();
  }

  if (payload.email !== undefined) {
    const normalizedEmail = payload.email.trim().toLowerCase();

    const duplicate = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        NOT: { id },
      },
    });

    if (duplicate) {
      throw new AppError("Email already exists", 409);
    }

    data.email = normalizedEmail;
  }

  if (payload.role !== undefined) {
    data.role = normalizeRole(payload.role);
  }

  if (payload.password !== undefined) {
    if (payload.password.length < 6) {
      throw new AppError("Password must be at least 6 characters long", 400);
    }

    data.password = await bcrypt.hash(payload.password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });

  return updatedUser;
};

const deleteUser = async (id) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  await prisma.$transaction(async (tx) => {
    const managedProjects = await tx.project.findMany({
      where: { managerId: id },
      select: { id: true },
    });

    const managedProjectIds = managedProjects.map((project) => project.id);

    if (managedProjectIds.length > 0) {
      await tx.project.deleteMany({
        where: { id: { in: managedProjectIds } },
      });
    }

    await tx.comment.deleteMany({ where: { userId: id } });
    await tx.task.deleteMany({ where: { assignedTo: id } });
    await tx.projectMember.deleteMany({ where: { userId: id } });
    await tx.user.delete({ where: { id } });
  });

  return true;
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};