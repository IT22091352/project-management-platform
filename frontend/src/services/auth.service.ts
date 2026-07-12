import { api } from "@/lib/api";
import { storage, StoredUser } from "@/lib/storage";

export type AuthPayload = {
  token: string;
  user: StoredUser;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = AuthCredentials & {
  name: string;
  role?: StoredUser["role"];
};

export async function login(payload: AuthCredentials) {
  const response = await api.post("/auth/login", payload);
  const data = response.data.data as AuthPayload;
  storage.setToken(data.token);
  storage.setUser(data.user);
  return data;
}

export async function register(payload: RegisterPayload) {
  const response = await api.post("/auth/register", payload);
  const data = response.data.data as AuthPayload;
  storage.setToken(data.token);
  storage.setUser(data.user);
  return data;
}

export async function fetchProfile() {
  const response = await api.get("/auth/profile");
  return response.data.data.user as StoredUser;
}

export function logout() {
  storage.clearAll();
}
