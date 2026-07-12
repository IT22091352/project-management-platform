"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type CommentItem = {
  id: number;
  comment: string;
  createdAt: string;
  user?: { name?: string | null } | null;
};

export function useComments(taskId?: number) {
  const [data, setData] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!taskId) {
      return;
    }

    let active = true;

    const loadComments = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/comments/task/${taskId}`);
        if (!active) return;
        setData((response.data.data.comments || []) as CommentItem[]);
        setError("");
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load comments");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadComments();
    return () => {
      active = false;
    };
  }, [taskId]);

  const refetch = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const response = await api.get(`/comments/task/${taskId}`);
      setData((response.data.data.comments || []) as CommentItem[]);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}
