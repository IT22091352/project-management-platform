"use client";
 
import { useMemo, useState } from "react";
import { useUsers } from "@/hooks/use-users";
import { useAuthContext } from "@/context/auth-context";
import { api, getErrorMessage } from "@/lib/api";
import { Button, Card, CustomSelect, Input, RoleBadge, SkeletonCard, Spinner, StatusBadge, Dropdown, ConfirmDialog, type SelectOption } from "@/components/ui";
import toast from "react-hot-toast";
import { Trash, ShieldAlert, UserPlus, Search, Filter, Shield } from "lucide-react";
 
const ROLE_FILTER_OPTIONS: SelectOption[] = [
  { value: "", label: "All Roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "TEAM_MEMBER", label: "Team Member" },
];
 
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
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Users</h1>
          <p className="mt-1 text-xs md:text-sm text-slate-400">View platform members, assign directory access, and audit role accounts.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row w-full lg:w-auto">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full sm:w-56"
          />
          <CustomSelect
            options={ROLE_FILTER_OPTIONS}
            value={roleFilter}
            onChange={(v) => setRoleFilter(String(v))}
            placeholder="Filter by role"
            className="w-full sm:w-48"
          />
        </div>
      </div>
 
      {loading ? (
        <Card className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-800 animate-pulse rounded-xl" />
            ))}
          </div>
        </Card>
      ) : null}
      {error ? <Card className="p-4 text-red-400 bg-red-950/20 border-red-900/50">{error}</Card> : null}
 
      {/* Modern SaaS Users Table */}
      {!loading && filtered.length > 0 && (
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-md">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((user) => {
                const isSelf = currentUser?.id === user.id;
                const initials = user.name.slice(0, 2).toUpperCase();
 
                const actionItems = isSelf
                  ? []
                  : [
                      {
                        label: "Delete User",
                        icon: <Trash className="h-3.5 w-3.5 text-red-400" />,
                        variant: "danger" as const,
                        onClick: () => setConfirmId(user.id),
                      },
                    ];
 
                return (
                  <tr key={user.id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap min-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-xs font-bold text-blue-400 shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white flex items-center gap-1.5 leading-tight max-w-[160px] sm:max-w-[200px] truncate" title={user.name}>
                            <span className="truncate">{user.name}</span>
                            {isSelf && (
                              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase shrink-0">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300 max-w-[180px] sm:max-w-[240px] truncate" title={user.email}>
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status="COMPLETED" /> {/* Mock active status as "Completed" (green) */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {!isSelf ? (
                        <Dropdown items={actionItems} />
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mr-2">Owner</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
 
      {!loading && filtered.length === 0 && (
        <Card className="p-8 text-center text-sm text-slate-400 bg-slate-900/50">No platform users match your filters.</Card>
      )}
 
      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={confirmId !== null}
        title="Delete User Account"
        description="Are you sure you want to permanently delete this user? All workspace permissions will be immediately revoked. This action is final and cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
