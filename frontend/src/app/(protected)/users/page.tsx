"use client";

import { useMemo, useState } from "react";
import { useUsers } from "@/hooks/use-users";
import { api, getErrorMessage } from "@/lib/api";
import { Button, Card, ConfirmDialog, CustomSelect, Input, Loader, RoleBadge, SkeletonCard, type SelectOption } from "@/components/ui";
import toast from "react-hot-toast";

const ROLE_FILTER_OPTIONS: SelectOption[] = [
  { value: "", label: "All Roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "TEAM_MEMBER", label: "Team Member" },
];

export default function UsersPage() {
  const { data, loading, error, refetch } = useUsers();
  const [confirmId, setConfirmId] = useState<number | null>(null);
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
    try {
      await api.delete(`/users/${confirmId}`);
      toast.success("User deleted");
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
        {filtered.map((user) => (
          <Card key={user.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-lg font-semibold text-white">{user.name}</div>
                <div className="mt-0.5 truncate text-sm text-slate-400">{user.email}</div>
              </div>
              <RoleBadge role={user.role} />
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="danger" onClick={() => setConfirmId(user.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <Card className="p-6 text-center text-sm text-slate-400">No users match your search.</Card>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete user"
        description="This action is permanent and cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
