"use client";

import { useMemo, useState } from "react";
import { useUsers } from "@/hooks/use-users";
import { useAuthContext } from "@/context/auth-context";
import { api, getErrorMessage } from "@/lib/api";
import { Button, Card, CustomSelect, Input, RoleBadge, SkeletonCard, Spinner, type SelectOption } from "@/components/ui";
import toast from "react-hot-toast";

const ROLE_FILTER_OPTIONS: SelectOption[] = [
  { value: "", label: "All Roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "TEAM_MEMBER", label: "Team Member" },
];

// ── Inline confirmation modal (re-uses theme, does not import ConfirmDialog
//    so we can customise the description copy per requirements) ────────────────
function DeleteConfirmModal({
  open,
  onCancel,
  onConfirm,
  deleting,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/50">
        <h3 className="text-lg font-semibold text-white">Delete User</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Are you sure you want to delete this user?
          <br />
          <span className="text-rose-400">This action cannot be undone.</span>
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner className="h-4 w-4" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { data, loading, error, refetch } = useUsers();
  const { user: currentUser } = useAuthContext();

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.filter((u) => {
      const matchText =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q);
      const matchRole = roleFilter ? u.role === roleFilter : true;
      return matchText && matchRole;
    });
  }, [data, query, roleFilter]);

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${confirmId}`);
      toast.success("User deleted successfully.");
      setConfirmId(null);
      await refetch();
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.toLowerCase().includes("own account")) {
        toast.error("Cannot delete your own account.");
      } else if (msg) {
        toast.error(msg);
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-400">Manage platform users and their roles.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, role…"
            className="min-w-56"
          />
          <CustomSelect
            options={ROLE_FILTER_OPTIONS}
            value={roleFilter}
            onChange={(v) => setRoleFilter(String(v))}
            placeholder="Filter by role"
            className="min-w-48"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : null}
      {error ? <Card className="p-4 text-rose-300">{error}</Card> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((user) => {
          const isSelf = currentUser?.id === user.id;
          return (
            <Card key={user.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-semibold text-white">
                    {user.name}
                    {isSelf && (
                      <span className="ml-2 text-xs font-normal text-blue-400">(you)</span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-sm text-slate-400">{user.email}</div>
                </div>
                <RoleBadge role={user.role} />
              </div>
              <div className="mt-4 flex justify-end">
                {isSelf ? (
                  // Current user — show a disabled "Current User" badge instead of Delete
                  <span className="inline-flex cursor-not-allowed items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-500 opacity-60 select-none">
                    Current User
                  </span>
                ) : (
                  <Button
                    variant="danger"
                    onClick={() => setConfirmId(user.id)}
                    disabled={deleting && confirmId === user.id}
                  >
                    {deleting && confirmId === user.id ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Deleting…
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <Card className="p-6 text-center text-sm text-slate-400">No users match your search.</Card>
      )}

      {/* Custom confirmation modal */}
      <DeleteConfirmModal
        open={confirmId !== null}
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </section>
  );
}
