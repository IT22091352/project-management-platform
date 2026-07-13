"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type Project = {
  id: number;
  title: string;
  description?: string | null;
  managerId?: number | null;
  createdBy?: number | null;
  manager?: { id?: number; name?: string | null; email?: string | null } | null;
  members?: { id: number; user: { id: number; name: string; email: string; role: string } }[];
  _count?: { tasks?: number; members?: number };
  createdAt?: string;
};

export function useProjects() {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/projects");
      setData((response.data.data.projects || []) as Project[]);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const response = await api.get("/projects");
        if (!active) return;
        setData((response.data.data.projects || []) as Project[]);
        setError("");
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    return () => { active = false; };
  }, []);

  return { data, loading, error, refetch: load };
}
