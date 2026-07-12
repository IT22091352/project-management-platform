"use client";

import { Card, Loader, PriorityBadge, SkeletonCard, StatusBadge } from "@/components/ui";
import { useDashboard } from "@/hooks/use-dashboard";

const STAT_LABELS: Record<string, string> = {
  totalUsers: "Total Users",
  totalProjects: "Total Projects",
  totalTasks: "Total Tasks",
  completedTasks: "Completed Tasks",
  pendingTasks: "Pending Tasks",
};

export default function AdminDashboardPage() {
  const { data, loading, error } = useDashboard("/dashboard/admin");

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-semibold text-white">Admin Dashboard</h1>

      {loading ? <Loader /> : null}
      {error ? <Card className="p-4 text-rose-300">{error}</Card> : null}

      {data ? (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(data.stats ?? {}).map(([key, value]) => (
              <Card key={key} className="p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {STAT_LABELS[key] ?? key}
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">{String(value)}</div>
              </Card>
            ))}
          </div>

          {/* Recent Projects */}
          {(data.recentProjects?.length ?? 0) > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">Recent Projects</h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {data.recentProjects!.map((p) => (
                  <Card key={p.id} className="p-4">
                    <div className="font-semibold text-white">{p.title}</div>
                    {p.manager?.name && (
                      <div className="mt-1 text-xs text-slate-400">
                        Manager: <span className="text-slate-200">{p.manager.name}</span>
                      </div>
                    )}
                    <div className="mt-1 text-xs text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent Tasks */}
          {(data.recentTasks?.length ?? 0) > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">Recent Tasks</h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {data.recentTasks!.map((t) => (
                  <Card key={t.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-white leading-snug">{t.title}</div>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <PriorityBadge priority={t.priority} />
                    </div>
                    {t.project?.title && (
                      <div className="mt-2 text-xs text-slate-400">
                        Project: <span className="text-slate-200">{t.project.title}</span>
                      </div>
                    )}
                    {t.assignee?.name && (
                      <div className="mt-0.5 text-xs text-slate-400">
                        Assigned: <span className="text-slate-200">{t.assignee.name}</span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent Comments */}
          {(data.recentComments?.length ?? 0) > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">Recent Comments</h2>
              <div className="space-y-3">
                {data.recentComments!.map((c) => (
                  <Card key={c.id} className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{c.user?.name}</span>
                      <span className="text-slate-500">·</span>
                      {c.task?.title && (
                        <span className="text-xs text-slate-400">{c.task.title}</span>
                      )}
                      <span className="ml-auto text-xs text-slate-500">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300 line-clamp-2">{c.comment}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
