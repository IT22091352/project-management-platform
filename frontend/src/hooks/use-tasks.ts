"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  projectId?: number;
  assignedTo?: number;
  project?: { id?: number; title?: string | null } | null;
  assignee?: { id?: number; name?: string | null; email?: string | null } | null;
  createdAt?: string;
};

export function useTasks() {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/tasks");
      setData((response.data.data.tasks || []) as Task[]);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const response = await api.get("/tasks");
        if (!active) return;
        setData((response.data.data.tasks || []) as Task[]);
        setError("");
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    return () => { active = false; };
  }, []);

  return { data, loading, error, refetch: load };
}
