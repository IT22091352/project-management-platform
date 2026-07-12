const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const AppError = require("../utils/app-error");
const { generateToken } = require("../utils/jwt");

const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildAuthPayload = (user) => {
  const token = generateToken(user);

  return {
    token,
    user: safeUser(user),
  };
};

const register = async ({ name, email, password, role }) => {
  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters long", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const allowedRoles = ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"];
  const allowedRole = role && allowedRoles.includes(role) ? role : "TEAM_MEMBER";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: allowedRole,
    },
  });

  return buildAuthPayload(user);
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  return buildAuthPayload(user);
};

const profile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

module.exports = {
  register,
  login,
  profile,
};