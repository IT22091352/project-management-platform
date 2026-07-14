"use client";
 
import { Card, Loader, PriorityBadge, StatusBadge, Button } from "@/components/ui";
import { useDashboard } from "@/hooks/use-dashboard";
import Link from "next/link";
import { Plus, CheckSquare, MessageSquare, Activity, Folder, Calendar, ArrowRight, BarChart3, Clock } from "lucide-react";
 
const STAT_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  projectsManaged: { label: "Workspaces Managed", icon: <Folder className="h-5 w-5" />, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  tasks: { label: "Total Tasks", icon: <CheckSquare className="h-5 w-5" />, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  completedTasks: { label: "Completed Items", icon: <Activity className="h-5 w-5" />, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  pendingTasks: { label: "Pending Items", icon: <Clock className="h-5 w-5" />, color: "text-slate-500 bg-slate-800 border-slate-700/50" },
};
 
export default function ManagerDashboardPage() {
  const { data, loading, error } = useDashboard("/dashboard/manager");
 
  return (
    <section className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Manager Dashboard</h1>
        <p className="mt-1 text-xs md:text-sm text-slate-400">Workspace status overview, milestone tracking, priority queues, and task assignments.</p>
      </div>
 
      {/* Quick Actions Panel */}
      <Card className="p-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Management Actions</h3>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Link href="/projects" className="w-full sm:w-auto">
            <Button className="flex items-center justify-center gap-2 text-xs py-2 px-3.5 w-full">
              <Plus className="h-4 w-4" /> Create Workspace Project
            </Button>
          </Link>
          <Link href="/tasks" className="w-full sm:w-auto">
            <Button variant="secondary" className="flex items-center justify-center gap-2 text-xs py-2 px-3.5 w-full">
              <CheckSquare className="h-4 w-4" /> Create Team Task
            </Button>
          </Link>
          <Link href="/comments" className="w-full sm:w-auto">
            <Button variant="ghost" className="flex items-center justify-center gap-2 text-xs py-2 px-3.5 border border-slate-800 hover:border-slate-700 w-full">
              <MessageSquare className="h-4 w-4" /> Collaborative Feed
            </Button>
          </Link>
        </div>
      </Card>
 
      {loading ? <Loader /> : null}
      {error ? <Card className="p-4 text-red-400 bg-red-950/20 border-red-900/50">{error}</Card> : null}
 
      {data ? (
        <>
          {/* Metrics Summary Grid */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(data.stats ?? {}).map(([key, value]) => {
              const meta = STAT_LABELS[key] ?? { label: key, icon: <Activity className="h-5 w-5" />, color: "text-slate-400" };
              return (
                <Card key={key} className="p-6 flex items-start gap-4 min-w-0">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate" title={meta.label}>{meta.label}</span>
                    <span className="mt-1 text-3xl font-bold text-white block leading-none truncate" title={String(value)}>{String(value)}</span>
                  </div>
                </Card>
              );
            })}
          </div>
 
          {/* Charts & Timelines Grid */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {/* Visual Performance Chart Placeholder */}
            <Card className="p-6 space-y-4 md:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-slate-200">Workspace Activity Telemetry</h3>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Live 7 Days</span>
              </div>
              <div className="flex items-end gap-3 h-48 pt-4 justify-between max-w-md mx-auto">
                {[
                  { label: "Mon", height: "h-[25%]" },
                  { label: "Tue", height: "h-[45%]" },
                  { label: "Wed", height: "h-[65%]" },
                  { label: "Thu", height: "h-[55%]" },
                  { label: "Fri", height: "h-[80%]" },
                  { label: "Sat", height: "h-[40%]" },
                  { label: "Sun", height: "h-[60%]" },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className={`${bar.height} w-full rounded-t bg-gradient-to-t from-blue-500/20 to-blue-500 hover:from-blue-400 hover:to-blue-400 transition-all duration-300 relative shadow-sm`} />
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{bar.label}</span>
                  </div>
                ))}
              </div>
            </Card>
 
            {/* Recent Activity Feed / Comments Timeline */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-200">Recent Discussion</h3>
                <Link href="/comments" className="text-[10px] font-bold text-blue-400 hover:underline uppercase tracking-wider flex items-center gap-0.5">
                  Comments <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-4 max-h-[190px] overflow-y-auto pr-1">
                {(data.recentComments?.length ?? 0) > 0 ? (
                  data.recentComments!.map((c) => (
                    <div key={c.id} className="flex gap-3 text-xs leading-relaxed min-w-0">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-855 border border-slate-800 text-[10px] font-bold text-slate-300 shrink-0">
                        {c.user?.name?.slice(0, 2).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-slate-200 truncate" title={c.user?.name ?? undefined}>{c.user?.name}</span>
                          <span className="text-slate-500 text-[9px] shrink-0 font-medium">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-0.5 text-slate-400 truncate w-full" title={c.comment}>{c.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">No recent comments logged.</p>
                )}
              </div>
            </Card>
          </div>
 
          {/* Recent Projects & Tasks Lists */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* Recent Projects */}
            {data.recentProjects && data.recentProjects.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">Recent Workspaces Managed</h2>
                  <Link href="/projects" className="text-xs font-semibold text-blue-400 hover:underline uppercase tracking-wider">All projects</Link>
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {data.recentProjects.slice(0, 4).map((p) => (
                    <Card key={p.id} className="p-5 flex flex-col justify-between hover:bg-slate-800/40 h-full min-w-0">
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Project</span>
                        <h4 className="mt-1 font-semibold text-slate-200 leading-snug truncate" title={p.title}>{p.title}</h4>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 gap-3 min-w-0">
                        <span className="font-medium text-slate-500">Last Modified</span>
                        <span className="flex items-center gap-1 shrink-0"><Calendar className="h-3.5 w-3.5 text-slate-500" /> {new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
 
            {/* Recent Tasks */}
            {data.recentTasks && data.recentTasks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">Recent Tasks & Assignments</h2>
                  <Link href="/tasks" className="text-xs font-semibold text-blue-400 hover:underline uppercase tracking-wider">All tasks</Link>
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {data.recentTasks.slice(0, 4).map((t) => (
                    <Card key={t.id} className="p-5 flex flex-col justify-between hover:bg-slate-800/40 h-full min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block shrink-0">Task</span>
                          <StatusBadge status={t.status} />
                        </div>
                        <h4 className="mt-1 font-semibold text-slate-200 leading-snug truncate" title={t.title}>{t.title}</h4>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 gap-3 min-w-0">
                        <PriorityBadge priority={t.priority} />
                        <span className="text-xs text-slate-400 font-semibold truncate text-right block" title={t.assignee?.name || "Unassigned"}>{t.assignee?.name || "Unassigned"}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
