import { TOKEN_KEY, USER_KEY } from "./constants";

export type StoredUser = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";
  createdAt?: string;
  updatedAt?: string;
};

export const storage = {
  getToken(): string {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(TOKEN_KEY) || "";
  },
  setToken(token: string) {
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    window.localStorage.removeItem(TOKEN_KEY);
  },
  getUser(): StoredUser | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  },
  setUser(user: StoredUser) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearUser() {
    window.localStorage.removeItem(USER_KEY);
  },
  clearAll() {
    this.clearToken();
    this.clearUser();
  },
};
