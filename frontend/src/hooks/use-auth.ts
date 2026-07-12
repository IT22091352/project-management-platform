"use client";

import { useState } from "react";
import { login, logout, register } from "@/services/auth.service";
import { useAuthContext } from "@/context/auth-context";
import { StoredUser } from "@/lib/storage";

export function useAuth() {
  const { user, isLoading, setSession, clearSession } = useAuthContext();
  const [submitting, setSubmitting] = useState(false);

  const loginUser = async (payload: { email: string; password: string }) => {
    setSubmitting(true);
    try {
      const data = await login(payload);
      setSession(data.token, data.user);
      return data.user;
    } finally {
      setSubmitting(false);
    }
  };

  const registerUser = async (payload: { name: string; email: string; password: string; role?: StoredUser["role"] }) => {
    setSubmitting(true);
    try {
      const data = await register(payload);
      setSession(data.token, data.user);
      return data.user;
    } finally {
      setSubmitting(false);
    }
  };

  const logoutUser = () => {
    logout();
    clearSession();
  };

  return { user, isLoading, submitting, loginUser, registerUser, logoutUser };
}
