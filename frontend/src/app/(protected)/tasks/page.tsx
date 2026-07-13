"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTasks, type Task } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useProjectMembers } from "@/hooks/use-project-members";
import { api, getErrorMessage } from "@/lib/api";
import {
  Button,
  Card,
  ConfirmDialog,
  CustomSelect,
  Input,
  Loader,
  Modal,
  PriorityBadge,
  SkeletonCard,
  Spinner,
  StatusBadge,
  Textarea,
  type SelectOption,
} from "@/components/ui";

type TaskFormValues = {
  title: string;
  description: string;
  projectId: number | null;
  assignedTo: number | null;
  priority: string;
  status: string;
  dueDate: string;
};

const emptyForm = (): TaskFormValues => ({
  title: "",
  description: "",
  projectId: null,
  assignedTo: null,
  priority: "MEDIUM",
  status: "TODO",
  dueDate: "",
});

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "TODO", label: "Todo" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

// ── TaskForm extracted to module level to prevent remounting on every render ──
function TaskForm({
  form,
  onChange,
  onSubmit,
  memberOptions,
  loadingMembers,
  isCreate,
  submitting,
  projectOptions,
  loadingProjects,
  hasTeamMembers,
}: {
  form: TaskFormValues;
  onChange: (patch: Partial<TaskFormValues>) => void;
  onSubmit: () => void;
  memberOptions: SelectOption[];
  loadingMembers: boolean;
  isCreate: boolean;
  submitting: boolean;
  projectOptions: SelectOption[];
  loadingProjects: boolean;
  /** true when the selected project has at least one TEAM_MEMBER */
  hasTeamMembers: boolean;
}) {
  const noTeamMembers = form.projectId !== null && !loadingMembers && !hasTeamMembers;

  const canSubmit =
    form.title.trim().length > 0 &&
    form.projectId !== null &&
    form.assignedTo !== null &&
    hasTeamMembers &&
    !submitting;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Title */}
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Title *</label>
        <Input
          placeholder="Task title"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      {/* Description */}
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Description</label>
        <Textarea
          placeholder="Task description"
          rows={3}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      {/* Project */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Project *</label>
        <CustomSelect
          options={projectOptions}
          value={form.projectId}
          onChange={(v) => {
            onChange({ projectId: Number(v), assignedTo: null });
          }}
          placeholder="Select a project…"
          loading={loadingProjects}
        />
      </div>

      {/* Assign To — only TEAM_MEMBER users are shown */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Assign To *</label>
        <CustomSelect
          options={memberOptions}
          value={form.assignedTo}
          onChange={(v) => onChange({ assignedTo: Number(v) })}
          placeholder={
            !form.projectId
              ? "Select project first"
              : noTeamMembers
              ? "No team members available"
              : "Select a member…"
          }
          loading={loadingMembers}
          disabled={!form.projectId || noTeamMembers}
        />
        {noTeamMembers && (
          <p className="mt-1.5 text-xs text-amber-400">
            No team members available for this project.
          </p>
        )}
      </div>

      {/* Priority */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Priority</label>
        <CustomSelect
          options={PRIORITY_OPTIONS}
          value={form.priority}
          onChange={(v) => onChange({ priority: String(v) })}
          placeholder="Select priority…"
        />
      </div>

      {/* Status */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Status</label>
        <CustomSelect
          options={STATUS_OPTIONS}
          value={form.status}
          onChange={(v) => onChange({ status: String(v) })}
          placeholder="Select status…"
        />
      </div>

      {/* Due Date */}
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Due Date</label>
        <Input
          type="date"
          value={form.dueDate}
          onChange={(e) => onChange({ dueDate: e.target.value })}
          className="[color-scheme:dark]"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
        <Button type="button" onClick={onSubmit} disabled={!canSubmit}>
          {submitting ? <><Spinner className="h-4 w-4" /> Saving…</> : isCreate ? "Create Task" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { data, loading, error, refetch } = useTasks();
  const { data: projects, loading: loadingProjects } = useProjects();

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<TaskFormValues>(emptyForm());
  const { data: createMembers, loading: loadingCreateMembers } = useProjectMembers(createForm.projectId);

  // Edit modal state
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<TaskFormValues>(emptyForm());
  const { data: editMembers, loading: loadingEditMembers } = useProjectMembers(editForm.projectId);

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Search / filter
  const [query, setQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.filter((t) => {
      const matchText =
        t.title.toLowerCase().includes(q) ||
        (t.project?.title ?? "").toLowerCase().includes(q) ||
        (t.assignee?.name ?? "").toLowerCase().includes(q);
      const matchPriority = filterPriority ? t.priority === filterPriority : true;
      const matchStatus = filterStatus ? t.status === filterStatus : true;
      return matchText && matchPriority && matchStatus;
    });
  }, [data, query, filterPriority, filterStatus]);

  const projectOptions: SelectOption[] = projects.map((p) => ({ value: p.id, label: p.title }));

  // Filter to TEAM_MEMBER only — business rule: tasks can only be assigned to team members
  const buildMemberOptions = (members: typeof createMembers): SelectOption[] =>
    members
      .filter((m) => m.user.role === "TEAM_MEMBER")
      .map((m) => ({ value: m.user.id, label: m.user.name }));

  // ── Create ─────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.title.trim() || !createForm.projectId || !createForm.assignedTo) return;
    setSubmitting(true);
    try {
      await api.post("/tasks", {
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        projectId: createForm.projectId,
        assignedTo: createForm.assignedTo,
        priority: createForm.priority,
        status: createForm.status,
        dueDate: createForm.dueDate || undefined,
      });
      toast.success("Task created");
      setCreateForm(emptyForm());
      setCreateOpen(false);
      await refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Open edit ──────────────────────────────────────────────────────────
  const openEdit = (task: Task) => {
    setEditForm({
      title: task.title,
      description: task.description ?? "",
      projectId: task.projectId ?? null,
      assignedTo: task.assignedTo ?? null,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
    setEditTask(task);
  };

  // ── Update ─────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!editTask || !editForm.title.trim() || !editForm.projectId || !editForm.assignedTo) return;
    setSubmitting(true);
    try {
      await api.put(`/tasks/${editTask.id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined,
        projectId: editForm.projectId,
        assignedTo: editForm.assignedTo,
        priority: editForm.priority,
        status: editForm.status,
        dueDate: editForm.dueDate || undefined,
      });
      toast.success("Task updated");
      setEditTask(null);
      await refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await api.delete(`/tasks/${confirmId}`);
      toast.success("Task deleted");
      setConfirmId(null);
      await refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Tasks</h1>
          <p className="mt-1 text-sm text-slate-400">View tasks, update status, assign work, and manage priorities.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create Task</Button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, project, assigned user…"
          className="flex-1"
        />
        <CustomSelect
          options={[{ value: "", label: "All Priorities" }, ...PRIORITY_OPTIONS]}
          value={filterPriority}
          onChange={(v) => setFilterPriority(String(v))}
          placeholder="Priority"
          className="min-w-40"
        />
        <CustomSelect
          options={[{ value: "", label: "All Statuses" }, ...STATUS_OPTIONS]}
          value={filterStatus}
          onChange={(v) => setFilterStatus(String(v))}
          placeholder="Status"
          className="min-w-40"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      ) : null}
      {error ? <Card className="p-4 text-rose-300">{error}</Card> : null}

      {/* Task cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((task) => (
          <Card key={task.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-white leading-snug">{task.title}</h3>
              <StatusBadge status={task.status} />
            </div>

            {task.description && (
              <p className="mt-2 text-sm text-slate-300 line-clamp-2">{task.description}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PriorityBadge priority={task.priority} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
              {task.project?.title && (
                <span className="col-span-2">
                  <span className="text-slate-500">Project: </span>
                  <span className="font-medium text-slate-200">{task.project.title}</span>
                </span>
              )}
              {task.assignee?.name && (
                <span className="col-span-2">
                  <span className="text-slate-500">Assigned: </span>
                  <span className="font-medium text-slate-200">{task.assignee.name}</span>
                </span>
              )}
              {task.dueDate && (
                <span className="col-span-2">
                  <span className="text-slate-500">Due: </span>
                  <span className="font-medium text-slate-200">{new Date(task.dueDate).toLocaleDateString()}</span>
                </span>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={() => openEdit(task)}>Update</Button>
              <Button variant="danger" onClick={() => setConfirmId(task.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create modal */}
      <Modal open={createOpen} title="Create Task" onClose={() => setCreateOpen(false)}>
        <TaskForm
          form={createForm}
          onChange={(patch) => setCreateForm((prev) => ({ ...prev, ...patch }))}
          onSubmit={handleCreate}
          memberOptions={buildMemberOptions(createMembers)}
          loadingMembers={loadingCreateMembers}
          isCreate
          submitting={submitting}
          projectOptions={projectOptions}
          loadingProjects={loadingProjects}
          hasTeamMembers={buildMemberOptions(createMembers).length > 0 || loadingCreateMembers}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={editTask !== null} title="Update Task" onClose={() => setEditTask(null)}>
        <TaskForm
          form={editForm}
          onChange={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
          onSubmit={handleUpdate}
          memberOptions={buildMemberOptions(editMembers)}
          loadingMembers={loadingEditMembers}
          isCreate={false}
          submitting={submitting}
          projectOptions={projectOptions}
          loadingProjects={loadingProjects}
          hasTeamMembers={buildMemberOptions(editMembers).length > 0 || loadingEditMembers}
        />
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete task"
        description="This will permanently remove the task."
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
