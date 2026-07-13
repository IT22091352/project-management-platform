"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, ChevronDown, LayoutDashboard, LogOut, Menu, Settings, User } from "lucide-react";
import { useAuthContext } from "@/context/auth-context";
import { logout as logoutService } from "@/services/auth.service";
import { Button, Card } from "./ui";
import { NotificationsDropdown } from "./NotificationsDropdown";

const navItems = [
  { href: "/dashboard/admin", label: "Dashboard", roles: ["ADMIN"] },
  { href: "/dashboard/manager", label: "Dashboard", roles: ["PROJECT_MANAGER"] },
  { href: "/dashboard/member", label: "Dashboard", roles: ["TEAM_MEMBER"] },
  { href: "/projects", label: "Projects", roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
  { href: "/tasks", label: "Tasks", roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
  { href: "/comments", label: "Comments", roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
  { href: "/users", label: "Users", roles: ["ADMIN"] },
  { href: "/profile", label: "Profile", roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
  { href: "/settings", label: "Settings", roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthContext();

  const visibleNavItems = navItems.filter((item) => !user || item.roles.includes(user.role));

  const handleLogout = () => {
    logoutService();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.22),_transparent_32%),linear-gradient(180deg,#07111f_0%,#050a14_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 shadow-lg shadow-blue-950/30">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Project Platform</p>
              <h1 className="text-lg font-semibold text-white">Operations Hub</h1>
            </div>
          </div>
          <nav className="flex-1 space-y-2">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition ${pathname === item.href ? "bg-blue-500 text-white shadow-lg shadow-blue-950/30" : "text-slate-300 hover:bg-white/8 hover:text-white"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Card className="mt-6 p-4">
            <div className="text-sm text-slate-300">Signed in as</div>
            <div className="mt-1 font-semibold text-white">{user?.name || "Guest"}</div>
            <div className="text-xs text-slate-400">{user?.role || "-"}</div>
          </Card>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/55 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-6">
              <div className="flex items-center gap-3 lg:hidden">
                <Button variant="ghost" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <div className="text-xs text-slate-400">Project Platform</div>
                  <div className="text-sm font-semibold text-white">Operations Hub</div>
                </div>
              </div>

              <div className="hidden items-center gap-3 lg:flex">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  {pathname}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <NotificationsDropdown />
                <div className="relative">
                  <button onClick={() => setMenuOpen((value) => !value)} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-semibold text-white">{user?.name}</div>
                      <div className="text-xs text-slate-400">{user?.role}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                  {menuOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-3 w-56 rounded-3xl border border-white/10 bg-slate-950 p-2 shadow-2xl shadow-black/50">
                      <Link href="/profile" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10">
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-rose-300 hover:bg-rose-500/10">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-6">{children}</main>

          <footer className="border-t border-white/10 px-4 py-4 text-xs text-slate-500 lg:px-6">
            Project Management Platform · Next.js 15 · Tailwind CSS
          </footer>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 lg:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-80 bg-slate-950 p-5 shadow-2xl shadow-black/50" onClick={(event) => event.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Project Platform</div>
                <div className="text-lg font-semibold text-white">Menu</div>
              </div>
              <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Close</Button>
            </div>
            <nav className="space-y-2">
              {visibleNavItems.map((item) => (
                <Link key={item.href} href={item.href} className={`block rounded-2xl px-4 py-3 text-sm font-medium ${pathname === item.href ? "bg-blue-500 text-white" : "bg-white/5 text-slate-300"}`}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
