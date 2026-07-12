"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export function useUsers(role?: string) {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = role ? `/users?role=${role}` : "/users";
      const response = await api.get(url);
      setData((response.data.data.users || []) as User[]);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const run = async () => {
      try {
        const url = role ? `/users?role=${role}` : "/users";
        const response = await api.get(url);
        if (!active) return;
        setData((response.data.data.users || []) as User[]);
        setError("");
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    return () => { active = false; };
  }, [role]);

  return { data, loading, error, refetch: load };
}
