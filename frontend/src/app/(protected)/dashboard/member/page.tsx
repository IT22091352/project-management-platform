"use client";

import { Card, Loader, PriorityBadge, StatusBadge } from "@/components/ui";
import { useDashboard } from "@/hooks/use-dashboard";

const STAT_LABELS: Record<string, string> = {
  assignedTasks: "Assigned Tasks",
  completed: "Completed",
  pending: "Pending",
};

export default function MemberDashboardPage() {
  const { data, loading, error } = useDashboard("/dashboard/member");

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-semibold text-white">My Dashboard</h1>

      {loading ? <Loader /> : null}
      {error ? <Card className="p-4 text-rose-300">{error}</Card> : null}

      {data ? (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(data.stats ?? {}).map(([key, value]) => (
              <Card key={key} className="p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {STAT_LABELS[key] ?? key}
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">{String(value)}</div>
              </Card>
            ))}
          </div>

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
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent Comments */}
          {(data.recentComments?.length ?? 0) > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">My Recent Comments</h2>
              <div className="space-y-3">
                {data.recentComments!.map((c) => (
                  <Card key={c.id} className="p-4">
                    <div className="flex items-center gap-2">
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
