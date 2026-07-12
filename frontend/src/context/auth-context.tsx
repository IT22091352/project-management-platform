"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchProfile, logout as logoutService } from "@/services/auth.service";
import { storage, StoredUser } from "@/lib/storage";

type AuthContextValue = {
  user: StoredUser | null;
  token: string;
  isLoading: boolean;
  setSession: (token: string, user: StoredUser) => void;
  clearSession: () => void;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(() => storage.getUser());
  const [token, setToken] = useState(() => storage.getToken() || "");
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = () => {
    setUser(null);
    setToken("");
    logoutService();
  };

  const setSession = (nextToken: string, nextUser: StoredUser) => {
    setToken(nextToken);
    setUser(nextUser);
    storage.setToken(nextToken);
    storage.setUser(nextUser);
  };

  const refreshSession = async () => {
    const savedToken = storage.getToken();
    const savedUser = storage.getUser();

    if (!savedToken || !savedUser) {
      storage.clearAll();
      await Promise.resolve();
      setUser(null);
      setToken("");
      setIsLoading(false);
      return;
    }

    setToken(savedToken);
    setUser(savedUser);

    try {
      const profile = await fetchProfile();
      setUser(profile);
      storage.setUser(profile);
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      const savedToken = storage.getToken();
      const savedUser = storage.getUser();

      if (!savedToken || !savedUser) {
        storage.clearAll();
        if (active) {
          setUser(null);
          setToken("");
          setIsLoading(false);
        }
        return;
      }

      try {
        const profile = await fetchProfile();
        if (!active) return;
        setUser(profile);
        storage.setUser(profile);
      } catch {
        if (!active) return;
        storage.clearAll();
        setUser(null);
        setToken("");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void initialize();
    return () => {
      active = false;
    };
  }, []);

  return <AuthContext.Provider value={{ user, token, isLoading, setSession, clearSession, refreshSession }}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
