"use client";
 
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTasks, type Task } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useAuthContext } from "@/context/auth-context";
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
  Dropdown,
  type SelectOption,
} from "@/components/ui";
import { Edit, Trash, Calendar, Folder, User, Clock, AlertCircle } from "lucide-react";
 
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
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Title *</label>
        <Input
          placeholder="Task title"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>
 
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
        <Textarea
          placeholder="Describe the objective of this task..."
          rows={3}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>
 
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Project *</label>
        <CustomSelect
          options={projectOptions}
          value={form.projectId}
          onChange={(v) => {
            onChange({ projectId: Number(v), assignedTo: null });
          }}
          placeholder="Select project"
          loading={loadingProjects}
        />
      </div>
 
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Assign To *</label>
        <CustomSelect
          options={memberOptions}
          value={form.assignedTo}
          onChange={(v) => onChange({ assignedTo: Number(v) })}
          placeholder={
            !form.projectId
              ? "Select project first"
              : noTeamMembers
              ? "No members available"
              : "Select member"
          }
          loading={loadingMembers}
          disabled={!form.projectId || noTeamMembers}
        />
        {noTeamMembers && (
          <p className="mt-1.5 text-xs text-amber-400 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" /> No members assigned to this project workspace.
          </p>
        )}
      </div>
 
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</label>
        <CustomSelect
          options={PRIORITY_OPTIONS}
          value={form.priority}
          onChange={(v) => onChange({ priority: String(v) })}
          placeholder="Priority"
        />
      </div>
 
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
        <CustomSelect
          options={STATUS_OPTIONS}
          value={form.status}
          onChange={(v) => onChange({ status: String(v) })}
          placeholder="Status"
        />
      </div>
 
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Due Date</label>
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
 
function UpdateStatusForm({
  currentStatus,
  onSubmit,
  submitting,
}: {
  currentStatus: string;
  onSubmit: (status: string) => void;
  submitting: boolean;
}) {
  const [status, setStatus] = useState(currentStatus);
  const canSubmit = status !== currentStatus && !submitting;
 
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
        <CustomSelect
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => setStatus(String(v))}
          placeholder="Select status"
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="button" onClick={() => onSubmit(status)} disabled={!canSubmit}>
          {submitting ? <><Spinner className="h-4 w-4" /> Saving…</> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
 
export default function TasksPage() {
  const { data, loading, error, refetch } = useTasks();
  const { data: projects, loading: loadingProjects } = useProjects();
  const { user } = useAuthContext();
 
  const isTeamMember = user?.role === "TEAM_MEMBER";
  const canManageTasks = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";
 
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<TaskFormValues>(emptyForm());
  const { data: createMembers, loading: loadingCreateMembers } = useProjectMembers(createForm.projectId);
 
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<TaskFormValues>(emptyForm());
  const { data: editMembers, loading: loadingEditMembers } = useProjectMembers(editForm.projectId);
 
  const [statusTask, setStatusTask] = useState<Task | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
 
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
 
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
 
  const buildMemberOptions = (members: typeof createMembers): SelectOption[] =>
    members
      .filter((m) => m.user.role === "TEAM_MEMBER")
      .map((m) => ({ value: m.user.id, label: m.user.name }));
 
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
 
  const handleStatusUpdate = async (newStatus: string) => {
    if (!statusTask) return;
    setStatusSubmitting(true);
    try {
      await api.patch(`/tasks/${statusTask.id}/status`, { status: newStatus });
      toast.success("Status updated");
      setStatusTask(null);
      await refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setStatusSubmitting(false);
    }
  };
 
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
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Tasks</h1>
          <p className="mt-1 text-sm text-slate-400">
            {isTeamMember
              ? "Track your assigned task lists and submit progress updates."
              : "Manage task creation, assignments, due dates, priorities, and workflow statuses."}
          </p>
        </div>
        {canManageTasks && (
          <Button onClick={() => setCreateOpen(true)}>Create Task</Button>
        )}
      </div>
 
      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks..."
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      ) : null}
      {error ? <Card className="p-4 text-red-400 bg-red-950/20 border-red-900/50">{error}</Card> : null}
 
      {/* Task cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((task) => {
          // Action Dropdown Items
          const actionItems = [
            {
              label: "Update Status",
              icon: <Clock className="h-3.5 w-3.5 text-slate-400" />,
              onClick: () => setStatusTask(task),
            },
            ...(canManageTasks
              ? [
                  {
                    label: "Edit Details",
                    icon: <Edit className="h-3.5 w-3.5 text-slate-400" />,
                    onClick: () => openEdit(task),
                  },
                  {
                    label: "Delete Task",
                    icon: <Trash className="h-3.5 w-3.5 text-red-400" />,
                    variant: "danger" as const,
                    onClick: () => setConfirmId(task.id),
                  },
                ]
              : []),
          ];
 
          return (
            <Card key={task.id} className="p-6 flex flex-col justify-between h-full hover:bg-slate-800/40">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-white tracking-tight leading-snug">{task.title}</h3>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <StatusBadge status={task.status} />
                    <Dropdown items={actionItems} />
                  </div>
                </div>
 
                {task.description && (
                  <p className="mt-3 text-sm text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>
                )}
              </div>
 
              <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider">Priority</span>
                  <PriorityBadge priority={task.priority} />
                </div>
                {task.project?.title && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider">Project</span>
                    <span className="font-semibold text-slate-200 flex items-center gap-1"><Folder className="h-3 w-3 text-slate-400" /> {task.project.title}</span>
                  </div>
                )}
                {task.assignee?.name && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider">Assignee</span>
                    <span className="font-semibold text-slate-200 flex items-center gap-1"><User className="h-3 w-3 text-slate-400" /> {task.assignee.name}</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider">Due Date</span>
                    <span className="font-semibold text-slate-200 flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-400" /> {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
 
      {!loading && filtered.length === 0 && (
        <Card className="p-8 text-center text-sm text-slate-400 bg-slate-900/50">No tasks found matching current filters.</Card>
      )}
 
      {/* Create modal — ADMIN / PROJECT_MANAGER only */}
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
 
      {/* Full edit modal — ADMIN / PROJECT_MANAGER only */}
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
 
      {/* Status-only modal — TEAM_MEMBER only */}
      <Modal
        open={statusTask !== null}
        title="Update Status"
        onClose={() => setStatusTask(null)}
      >
        {statusTask && (
          <UpdateStatusForm
            key={statusTask.id}
            currentStatus={statusTask.status}
            onSubmit={handleStatusUpdate}
            submitting={statusSubmitting}
          />
        )}
      </Modal>
 
      {/* Delete confirmation — ADMIN / PROJECT_MANAGER only */}
      <ConfirmDialog
        open={confirmId !== null}
        title="Delete task"
        description="Are you sure you want to permanently delete this task? This action cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
