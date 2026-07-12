"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type ProjectMember = {
  id: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

export function useProjectMembers(projectId?: number | null) {
  const [data, setData] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/projects/${id}/members`);
      setData((response.data.data.members || []) as ProjectMember[]);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!projectId) {
      setData([]);
      return;
    }
    let active = true;
    setLoading(true);

    const run = async () => {
      try {
        const response = await api.get(`/projects/${projectId}/members`);
        if (!active) return;
        setData((response.data.data.members || []) as ProjectMember[]);
        setError("");
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load members");
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    return () => { active = false; };
  }, [projectId]);

  return { data, loading, error, load };
}
