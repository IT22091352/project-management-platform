export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const TOKEN_KEY = "pm_platform_token";
export const USER_KEY = "pm_platform_user";
export const ROLE_ROUTES = {
  ADMIN: "/dashboard/admin",
  PROJECT_MANAGER: "/dashboard/manager",
  TEAM_MEMBER: "/dashboard/member",
} as const;

export type UserRole = keyof typeof ROLE_ROUTES;
