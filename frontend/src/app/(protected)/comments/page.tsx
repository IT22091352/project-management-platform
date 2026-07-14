"use client";
 
import { useState } from "react";
import toast from "react-hot-toast";
import { useComments } from "@/hooks/use-comments";
import { useTasks } from "@/hooks/use-tasks";
import { useAuthContext } from "@/context/auth-context";
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
import { Trash, MessageSquare, Plus, Clock, FileText } from "lucide-react";
 
export default function CommentsPage() {
  const { data: tasks, loading: loadingTasks } = useTasks();
  const { user: currentUser } = useAuthContext();
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
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Comments</h1>
          <p className="mt-1 text-xs md:text-sm text-slate-400">Review task activity logs, post progress updates, and collaborate in chat feeds.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="flex items-center justify-center gap-2 w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4" /> Add Comment
        </Button>
      </div>
 
      {/* Task selector to load comments */}
      <Card className="p-6">
        <div className="max-w-md space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Filter by Task</label>
          <CustomSelect
            options={[{ value: "", label: "All / Select a task…" }, ...taskOptions]}
            value={selectedTaskId ?? ""}
            onChange={(v) => setSelectedTaskId(v === "" ? undefined : Number(v))}
            placeholder="Select a task to view comments"
            loading={loadingTasks}
          />
        </div>
      </Card>
 
      {loading ? <Loader /> : null}
      {error ? <Card className="p-4 text-red-400 bg-red-950/20 border-red-900/50">{error}</Card> : null}
 
      {/* Comment Conversation Flow */}
      {!loading && data.length > 0 && (
        <Card className="p-6 bg-slate-900/40 space-y-6">
          {data.map((comment) => {
            const initials = comment.user?.name?.slice(0, 2).toUpperCase() || "?";
            const dateStr = new Date(comment.createdAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
 
            const isOwner = comment.user?.id === currentUser?.id;
            const canDelete =
              isOwner || currentUser?.role === "ADMIN" || currentUser?.role === "PROJECT_MANAGER";
 
            return (
              <div key={comment.id} className="flex items-start gap-4">
                {/* User Avatar Circle */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold shrink-0 ${isOwner ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-300"}`}>
                  {initials}
                </div>
 
                {/* Conversation Bubble */}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-xs font-bold text-slate-200 truncate max-w-[150px]" title={comment.user?.name ?? undefined}>{comment.user?.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 shrink-0"><Clock className="h-3 w-3" /> {dateStr}</span>
                  </div>
                  <div className="group relative flex items-start gap-2 max-w-2xl min-w-0">
                    <div className="rounded-xl rounded-tl-none border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-200 leading-relaxed shadow-sm break-words whitespace-pre-wrap max-w-full">
                      {comment.comment}
                    </div>
 
                    {canDelete && (
                      <button
                        onClick={() => setConfirmId(comment.id)}
                        className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition duration-150 p-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-red-400 shrink-0 self-center"
                        title="Delete comment"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}
 
      {!loading && data.length === 0 && selectedTaskId && (
        <Card className="p-8 text-center text-sm text-slate-500 bg-slate-900/50">No updates or comments logged for this task yet.</Card>
      )}
 
      {!loading && !selectedTaskId && (
        <Card className="p-8 text-center text-sm text-slate-500 bg-slate-900/50 flex flex-col items-center gap-2">
          <MessageSquare className="h-8 w-8 text-slate-600" />
          <span>Please select a project task above to view its activity logs.</span>
        </Card>
      )}
 
      {/* Create comment modal */}
      <Modal open={open} title="Add Comment" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Task *</label>
            <CustomSelect
              options={taskOptions}
              value={commentTaskId}
              onChange={(v) => setCommentTaskId(Number(v))}
              placeholder="Select a task"
              loading={loadingTasks}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Comment *</label>
            <Textarea
              placeholder="Post a comment or task status update..."
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
        description="Are you sure you want to delete this comment? This action cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
