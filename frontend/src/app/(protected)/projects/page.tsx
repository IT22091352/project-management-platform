"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useProjects } from "@/hooks/use-projects";
import { useUsers } from "@/hooks/use-users";
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
  MultiSelect,
  RoleBadge,
  SkeletonCard,
  Spinner,
  Textarea,
  type SelectOption,
} from "@/components/ui";

type ProjectFormValues = {
  title: string;
  description: string;
  managerId: number | null;
  memberIds: number[];
};

const emptyForm = (): ProjectFormValues => ({
  title: "",
  description: "",
  managerId: null,
  memberIds: [],
});

// ── ProjectForm extracted to module level to prevent remounting on every render ──
function ProjectForm({
  form,
  onChange,
  onSubmit,
  isCreate,
  submitting,
  isAdmin,
  managerOptions,
  memberOptions,
  loadingManagers,
  loadingMembers,
}: {
  form: ProjectFormValues;
  onChange: (patch: Partial<ProjectFormValues>) => void;
  onSubmit: () => void;
  isCreate: boolean;
  submitting: boolean;
  isAdmin: boolean;
  managerOptions: SelectOption[];
  memberOptions: SelectOption[];
  loadingManagers: boolean;
  loadingMembers: boolean;
}) {
  const canSubmit = form.title.trim().length > 0 && !submitting;
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Title *</label>
        <Input
          placeholder="Project title"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Description</label>
        <Textarea
          placeholder="Project description"
          rows={3}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      {isAdmin && (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Manager</label>
          <CustomSelect
            options={managerOptions}
            value={form.managerId}
            onChange={(v) => onChange({ managerId: Number(v) })}
            placeholder="Select a manager…"
            loading={loadingManagers}
          />
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Team Members</label>
        <MultiSelect
          options={memberOptions}
          value={form.memberIds}
          onChange={(v) => onChange({ memberIds: v.map(Number) })}
          placeholder="Select team members…"
          loading={loadingMembers}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          {submitting ? <><Spinner className="h-4 w-4" /> Saving…</> : isCreate ? "Create Project" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { data, loading, error, refetch } = useProjects();
  const { user } = useAuthContext();
  const isAdmin = user?.role === "ADMIN";
  // TEAM_MEMBER has read-only access to projects
  const canManageProjects = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  // Role-filtered user lists for dropdowns
  const { data: managers, loading: loadingManagers } = useUsers(isAdmin ? "PROJECT_MANAGER" : undefined);
  const { data: teamMembers, loading: loadingMembers } = useUsers(isAdmin || user?.role === "PROJECT_MANAGER" ? "TEAM_MEMBER" : undefined);

  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<(typeof data)[0] | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState<ProjectFormValues>(emptyForm());
  const [editForm, setEditForm] = useState<ProjectFormValues>(emptyForm());

  // Derived dropdown options
  const managerOptions: SelectOption[] = managers.map((m) => ({ value: m.id, label: m.name }));
  const memberOptions: SelectOption[] = teamMembers.map((m) => ({ value: m.id, label: m.name }));

  // Search: by name, description, manager
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.manager?.name ?? "").toLowerCase().includes(q)
    );
  }, [data, query]);

  // ── Create ─────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.title.trim()) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        memberIds: createForm.memberIds,
      };
      if (isAdmin && createForm.managerId) payload.managerId = createForm.managerId;

      await api.post("/projects", payload);
      toast.success("Project created");
      setCreateForm(emptyForm());
      setCreateOpen(false);
      await refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Update ─────────────────────────────────────────────────────────────
  // Fetch the full project (includes members) before opening the edit modal.
  // The list endpoint uses a lean select that omits members — we need the
  // detail endpoint so memberIds are correctly pre-populated.
  const openEdit = async (project: (typeof data)[0]) => {
    setLoadingEdit(true);
    try {
      const res = await api.get(`/projects/${project.id}`);
      const full = res.data.data.project as {
        title: string;
        description?: string | null;
        managerId?: number | null;
        members?: { id: number; user: { id: number } }[];
      };
      setEditForm({
        title: full.title,
        description: full.description ?? "",
        managerId: full.managerId ?? null,
        memberIds: (full.members ?? []).map((m) => m.user.id),
      });
      setEditProject(project);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleUpdate = async () => {
    if (!editProject || !editForm.title.trim()) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined,
        memberIds: editForm.memberIds,
      };
      if (isAdmin && editForm.managerId) payload.managerId = editForm.managerId;

      console.log("[ProjectUpdate] payload:", JSON.stringify(payload, null, 2));

      await api.put(`/projects/${editProject.id}`, payload);

      // Only sync members when there is at least one id to send.
      // assignMembers endpoint rejects an empty array with 400.
      if (editForm.memberIds.length > 0) {
        await api.post(`/projects/${editProject.id}/members`, { memberIds: editForm.memberIds });
      }

      toast.success("Project updated");
      setEditProject(null);
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
      await api.delete(`/projects/${confirmId}`);
      toast.success("Project deleted");
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
          <h1 className="text-3xl font-semibold text-white">Projects</h1>
          <p className="mt-1 text-sm text-slate-400">Create, update, search, and manage project membership.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, description, manager…"
              className="min-w-64"
            />
            {canManageProjects && (
              <Button onClick={() => setCreateOpen(true)}>Create Project</Button>
            )}
          </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      ) : null}
      {error ? <Card className="p-4 text-rose-300">{error}</Card> : null}

      {/* Project cards */}
      <div className="grid gap-4">
        {filtered.map((project) => (
          <Card key={project.id} className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-white truncate">{project.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{project.description || "No description"}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  {project.manager?.name && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-500">Manager:</span>
                      <span className="font-medium text-slate-200">{project.manager.name}</span>
                    </span>
                  )}
                  {project._count?.tasks !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-500">Tasks:</span>
                      <span className="font-medium text-slate-200">{project._count.tasks}</span>
                    </span>
                  )}
                </div>
              </div>
              {canManageProjects && (
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => openEdit(project)}
                    disabled={loadingEdit}
                  >
                    {loadingEdit ? <><Spinner className="h-4 w-4" /> Loading…</> : "Update"}
                  </Button>
                  {/* Delete is only shown to ADMIN or the project's original creator */}
                  {(isAdmin || project.createdBy === user?.id) && (
                    <Button variant="danger" onClick={() => setConfirmId(project.id)}>Delete</Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Create modal */}
      <Modal open={createOpen} title="Create Project" onClose={() => setCreateOpen(false)}>
        <ProjectForm
          form={createForm}
          onChange={(patch) => setCreateForm((prev) => ({ ...prev, ...patch }))}
          onSubmit={handleCreate}
          isCreate
          submitting={submitting}
          isAdmin={isAdmin}
          managerOptions={managerOptions}
          memberOptions={memberOptions}
          loadingManagers={loadingManagers}
          loadingMembers={loadingMembers}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={editProject !== null} title="Update Project" onClose={() => setEditProject(null)}>
        <ProjectForm
          form={editForm}
          onChange={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
          onSubmit={handleUpdate}
          isCreate={false}
          submitting={submitting}
          isAdmin={isAdmin}
          managerOptions={managerOptions}
          memberOptions={memberOptions}
          loadingManagers={loadingManagers}
          loadingMembers={loadingMembers}
        />
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete project"
        description="This will remove the project and all its tasks."
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
