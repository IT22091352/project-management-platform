"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export type RecentProject = {
  id: number;
  title: string;
  createdAt: string;
  manager?: { id: number; name: string } | null;
};

export type RecentTask = {
  id: number;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  project?: { id: number; title: string } | null;
  assignee?: { id: number; name: string } | null;
};

export type RecentComment = {
  id: number;
  comment: string;
  createdAt: string;
  user?: { id: number; name: string } | null;
  task?: { id: number; title: string } | null;
};

export type DashboardData = {
  stats: Record<string, number>;
  recentProjects?: RecentProject[];
  recentTasks?: RecentTask[];
  recentComments?: RecentComment[];
};

export function useDashboard(path: "/dashboard/admin" | "/dashboard/manager" | "/dashboard/member") {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    api
      .get(path)
      .then((response) => {
        if (!mounted) return;
        const raw = response.data.data.dashboard as DashboardData;
        setData(raw);
        setError("");
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [path]);

  return { data, loading, error };
}
