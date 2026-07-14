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
  Dropdown,
  StatusBadge,
  type SelectOption,
} from "@/components/ui";
import { Eye, Edit, Users, Trash, Calendar, Folder, User as UserIcon, CheckSquare, Clock, X, AlertCircle } from "lucide-react";
 
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
  teamMembers,
  status,
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
  teamMembers: any[];
  status?: string;
}) {
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState<number | "">("");
  const canSubmit = form.title.trim().length > 0 && !submitting;
 
  // Creation layout: Simple vertical form
  if (isCreate) {
    return (
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Title *</label>
          <Input
            placeholder="Enter project title"
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
          <Textarea
            placeholder="Describe this project..."
            rows={3}
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
 
        {isAdmin && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Manager</label>
            <CustomSelect
              options={managerOptions}
              value={form.managerId}
              onChange={(v) => onChange({ managerId: Number(v) })}
              placeholder="Assign a manager"
              loading={loadingManagers}
            />
          </div>
        )}
 
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Team Members</label>
          <MultiSelect
            options={memberOptions}
            value={form.memberIds}
            onChange={(v) => onChange({ memberIds: v.map(Number) })}
            placeholder="Assign team members"
            loading={loadingMembers}
          />
        </div>
 
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
          >
            {submitting ? <><Spinner className="h-4 w-4" /> Saving…</> : "Create Project"}
          </Button>
        </div>
      </div>
    );
  }
 
  // Editing Layout: Advanced 2-column project parameters & membership workspace
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column: Project Information */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Project Information</h4>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Title *</label>
          <Input
            placeholder="Enter project title"
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
          <Textarea
            placeholder="Describe this project..."
            rows={4}
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
 
        {isAdmin && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Manager</label>
            <CustomSelect
              options={managerOptions}
              value={form.managerId}
              onChange={(v) => onChange({ managerId: Number(v) })}
              placeholder="Assign a manager"
              loading={loadingManagers}
            />
          </div>
        )}
 
        {status && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
            <StatusBadge status={status} />
          </div>
        )}
      </div>
 
      {/* Right Column: Team Members management */}
      <div className="space-y-4 flex flex-col justify-between h-full">
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Team Members</h4>
          
          {/* Search/Add User select input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Add Team Member</label>
            <div className="flex gap-2">
              <CustomSelect
                options={memberOptions.filter(opt => !form.memberIds.includes(Number(opt.value)))}
                value={selectedMemberToAdd}
                onChange={(v) => setSelectedMemberToAdd(Number(v))}
                placeholder="Select user to add"
                loading={loadingMembers}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (selectedMemberToAdd !== "") {
                    onChange({ memberIds: [...form.memberIds, Number(selectedMemberToAdd)] });
                    setSelectedMemberToAdd("");
                  }
                }}
                disabled={selectedMemberToAdd === ""}
              >
                Add
              </Button>
            </div>
          </div>
 
          {/* Current Members List */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Members ({form.memberIds.length})</label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {form.memberIds.length > 0 ? (
                form.memberIds.map(id => {
                  const matched = teamMembers.find(m => m.id === id);
                  if (!matched) return null;
                  return (
                    <div key={id} className="flex items-center justify-between p-2 rounded-xl border border-slate-800 bg-slate-950/40">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-850 border border-slate-800 text-[10px] font-bold text-slate-300 shrink-0">
                          {matched.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-slate-200 block truncate leading-tight">{matched.name}</span>
                          <span className="text-[9px] text-slate-500 block truncate">{matched.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <RoleBadge role={matched.role} />
                        <button
                          type="button"
                          onClick={() => {
                            onChange({ memberIds: form.memberIds.filter(mid => mid !== id) });
                          }}
                          className="text-slate-500 hover:text-red-400 p-1.5 transition rounded-lg hover:bg-slate-800"
                          title="Remove member"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic py-2">No team members assigned.</p>
              )}
            </div>
          </div>
        </div>
 
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" onClick={onSubmit} disabled={!canSubmit}>
            {submitting ? <><Spinner className="h-4 w-4" /> Saving…</> : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
 
export default function ProjectsPage() {
  const { data, loading, error, refetch } = useProjects();
  const { user } = useAuthContext();
  const isAdmin = user?.role === "ADMIN";
  const canManageProjects = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";
 
  const { data: managers, loading: loadingManagers } = useUsers(isAdmin ? "PROJECT_MANAGER" : undefined);
  const { data: teamMembers, loading: loadingMembers } = useUsers(isAdmin || user?.role === "PROJECT_MANAGER" ? "TEAM_MEMBER" : undefined);
 
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<(typeof data)[0] | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
 
  // View Details Modal State
  const [viewProject, setViewProject] = useState<any | null>(null);
  const [loadingView, setLoadingView] = useState(false);
 
  const [createForm, setCreateForm] = useState<ProjectFormValues>(emptyForm());
  const [editForm, setEditForm] = useState<ProjectFormValues>(emptyForm());
 
  const managerOptions: SelectOption[] = managers.map((m) => ({ value: m.id, label: m.name }));
  const memberOptions: SelectOption[] = teamMembers.map((m) => ({ value: m.id, label: m.name }));
 
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.manager?.name ?? "").toLowerCase().includes(q)
    );
  }, [data, query]);
 
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
 
  const handleViewDetails = async (project: (typeof data)[0]) => {
    setLoadingView(true);
    try {
      const res = await api.get(`/projects/${project.id}`);
      setViewProject(res.data.data.project);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingView(false);
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
 
      await api.put(`/projects/${editProject.id}`, payload);
 
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
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Projects</h1>
          <p className="mt-1 text-xs md:text-sm text-slate-400">Manage and monitor project workspaces, task distributions, and memberships.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row w-full lg:w-auto">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full sm:min-w-64"
          />
          {canManageProjects && (
            <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">Create Project</Button>
          )}
        </div>
      </div>
 
      {loading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      ) : null}
      {error ? <Card className="p-4 text-red-400 bg-red-950/20 border-red-900/50">{error}</Card> : null}
 
      {/* Project cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((project) => {
          const taskCount = project._count?.tasks ?? 0;
          const status = taskCount > 0 ? "IN_PROGRESS" : "PENDING";
          const updatedAt = (project as any).updatedAt || project.createdAt;
 
          // Dropdown Action Items
          const actionItems = [
            {
              label: "View Details",
              icon: <Eye className="h-3.5 w-3.5 text-slate-400" />,
              onClick: () => handleViewDetails(project),
            },
            ...(canManageProjects
              ? [
                  {
                    label: "Edit Project",
                    icon: <Edit className="h-3.5 w-3.5 text-slate-400" />,
                    onClick: () => openEdit(project),
                  },
                ]
              : []),
            ...(isAdmin || project.createdBy === user?.id
              ? [
                  {
                    label: "Delete Project",
                    icon: <Trash className="h-3.5 w-3.5 text-red-400" />,
                    variant: "danger" as const,
                    onClick: () => setConfirmId(project.id),
                  },
                ]
              : []),
          ];
 
          return (
            <Card key={project.id} className="p-6 flex flex-col justify-between h-full hover:bg-slate-800/40 min-w-0">
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Folder className="h-5 w-5 text-blue-500 shrink-0" />
                    <h3 className="text-lg font-semibold text-white tracking-tight leading-none truncate" title={project.title}>{project.title}</h3>
                  </div>
                  <div className="shrink-0">
                    <Dropdown items={actionItems} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-400 line-clamp-3 leading-relaxed min-h-[60px]" title={project.description || "No description provided."}>
                  {project.description || "No description provided."}
                </p>
              </div>
 
              <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3.5 min-w-0">
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider shrink-0">Manager</span>
                  <span className="font-semibold text-slate-200 max-w-[150px] truncate text-right block" title={project.manager?.name || "Unassigned"}>
                    {project.manager?.name || "Unassigned"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider">Tasks</span>
                  <span className="font-semibold text-slate-200">{taskCount} active</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider">Status</span>
                  <StatusBadge status={status} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Updated</span>
                  <span>{updatedAt ? new Date(updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "-"}</span>
                </div>
              </div>
            </Card>
          );
        })}
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
          teamMembers={teamMembers}
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
          teamMembers={teamMembers}
          status={editProject ? (editProject._count?.tasks ?? 0) > 0 ? "IN_PROGRESS" : "PENDING" : undefined}
        />
      </Modal>
 
      {/* View Details Modal */}
      <Modal open={viewProject !== null} title="Project Details" onClose={() => setViewProject(null)}>
        {viewProject && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-bold text-white">{viewProject.title}</h4>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{viewProject.description || "No description provided."}</p>
            </div>
            <div className="grid gap-4 border-t border-slate-800 pt-5 grid-cols-1 sm:grid-cols-2 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Manager</span>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-500/10 text-xs font-bold text-blue-400 flex items-center justify-center">
                    {viewProject.manager?.name?.slice(0,2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-200">{viewProject.manager?.name || "None"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Tasks</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1.5"><CheckSquare className="h-4 w-4 text-slate-400" /> {viewProject._count?.tasks ?? 0} total tasks</span>
              </div>
            </div>
 
            <div className="border-t border-slate-800 pt-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">Team Members ({viewProject.members?.length ?? 0})</span>
              {viewProject.members && viewProject.members.length > 0 ? (
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                  {viewProject.members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-950/40">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center">
                          {member.user?.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-200 block leading-tight">{member.user?.name}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{member.user?.email}</span>
                        </div>
                      </div>
                      <RoleBadge role={member.user?.role} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No team members assigned to this project.</p>
              )}
            </div>
 
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button variant="secondary" onClick={() => setViewProject(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
 
      <ConfirmDialog
        open={confirmId !== null}
        title="Delete project"
        description="Are you sure you want to delete this project? This will permanently remove the project workspace and all of its associated tasks. This action cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
