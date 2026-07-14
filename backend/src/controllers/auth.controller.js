const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/response");
const authService = require("../services/auth.service");

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setAuthCookie = (res, token) => {
  res.cookie("token", token, cookieOptions);
};

const register = asyncHandler(async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    setAuthCookie(res, result.token);
    return sendSuccess(res, 201, "User registered successfully", result);
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
      stack: error.stack,
    });
  }
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  setAuthCookie(res, result.token);

  return sendSuccess(res, 200, "Login successful", result);
});


const profile = asyncHandler(async (req, res) => {
  const user = await authService.profile(req.user.id);

  return sendSuccess(res, 200, "Profile fetched successfully", { user });
});

module.exports = {
  register,
  login,
  profile,
};