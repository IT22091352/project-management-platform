"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useComments } from "@/hooks/use-comments";
import { useTasks } from "@/hooks/use-tasks";
import { api, getErrorMessage } from "@/lib/api";
import {
  Button,
  Card,
  ConfirmDialog,
  CustomSelect,
  Loader,
  Modal,
  SkeletonCard,
  Spinner,
  Textarea,
  type SelectOption,
} from "@/components/ui";

export default function CommentsPage() {
  const { data: tasks, loading: loadingTasks } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined);
  const { data, loading, error, refetch } = useComments(selectedTaskId);

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Create form state
  const [commentTaskId, setCommentTaskId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");

  const taskOptions: SelectOption[] = tasks.map((t) => ({
    value: t.id,
    label: t.title + (t.project?.title ? ` (${t.project.title})` : ""),
  }));

  const canSubmit = commentTaskId !== null && commentText.trim().length > 0 && !submitting;

  const handleCreate = async () => {
    if (!commentTaskId || !commentText.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/comments", { taskId: commentTaskId, comment: commentText.trim() });
      toast.success("Comment added");
      setCommentText("");
      setCommentTaskId(null);
      setOpen(false);
      setSelectedTaskId(commentTaskId);
      await refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await api.delete(`/comments/${confirmId}`);
      toast.success("Comment deleted");
      setConfirmId(null);
      await refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Comments</h1>
          <p className="mt-1 text-sm text-slate-400">Chat-style task discussion with timestamps and delete actions.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Add Comment</Button>
      </div>

      {/* Task selector to load comments */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Filter by Task</label>
        <CustomSelect
          options={[{ value: "", label: "All / Select a task…" }, ...taskOptions]}
          value={selectedTaskId ?? ""}
          onChange={(v) => setSelectedTaskId(v === "" ? undefined : Number(v))}
          placeholder="Select a task to view its comments…"
          loading={loadingTasks}
          className="max-w-md"
        />
      </div>

      {loading ? <Loader /> : null}
      {error ? <Card className="p-4 text-rose-300">{error}</Card> : null}

      {/* Comment list */}
      <div className="space-y-3">
        {data.map((comment) => (
          <Card key={comment.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white">{comment.user?.name}</div>
                <div className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString()}</div>
              </div>
              <Button variant="danger" onClick={() => setConfirmId(comment.id)}>Delete</Button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-200">{comment.comment}</p>
          </Card>
        ))}
        {!loading && data.length === 0 && selectedTaskId && (
          <Card className="p-6 text-center text-sm text-slate-400">No comments for this task yet.</Card>
        )}
      </div>

      {/* Create comment modal */}
      <Modal open={open} title="Add Comment" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Task *</label>
            <CustomSelect
              options={taskOptions}
              value={commentTaskId}
              onChange={(v) => setCommentTaskId(Number(v))}
              placeholder="Select a task…"
              loading={loadingTasks}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Comment *</label>
            <Textarea
              placeholder="Write your comment…"
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={handleCreate} disabled={!canSubmit}>
              {submitting ? <><Spinner className="h-4 w-4" /> Submitting…</> : "Submit"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete comment"
        description="This will permanently remove the comment."
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
