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
    <div className="min-h-screen bg-slate-955 text-slate-100 font-sans">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-900 p-6 lg:flex lg:flex-col">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Project Hub</p>
              <h1 className="text-base font-bold text-white">Operations Center</h1>
            </div>
          </div>
          <nav className="flex-1 space-y-1.5">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition ${pathname === item.href ? "bg-blue-500 text-white shadow-sm shadow-blue-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Card className="mt-6 p-4 border border-slate-800 bg-slate-950/40">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Signed in as</div>
            <div className="mt-1 font-semibold text-white truncate">{user?.name || "Guest"}</div>
            <div className="text-xs text-slate-400 capitalize mt-0.5">{user?.role ? user.role.toLowerCase().replace("_", " ") : "-"}</div>
          </Card>
        </aside>
 
        <div className="flex min-w-0 flex-1 flex-col bg-slate-950">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-3 lg:hidden">
                <Button variant="ghost" onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <div className="text-xs text-slate-500">Operations Hub</div>
                  <div className="text-sm font-bold text-white">Dashboard</div>
                </div>
              </div>
 
              <div className="hidden items-center gap-3 lg:flex">
                <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-400 tracking-wide uppercase">
                  {pathname.split("/").filter(Boolean).join("  /  ") || "Dashboard"}
                </div>
              </div>
 
              <div className="ml-auto flex items-center gap-4">
                <NotificationsDropdown />
                <div className="relative">
                  <button onClick={() => setMenuOpen((value) => !value)} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-left transition hover:bg-slate-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 font-bold text-sm">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-semibold text-white leading-tight">{user?.name}</div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">{user?.role}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-200" />
                  </button>
                  {menuOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl z-50">
                      <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link href="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition">
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                      <div className="h-px bg-slate-800 my-1" />
                      <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </header>
 
          <main className="flex-1 p-8 overflow-y-auto">{children}</main>
 
          <footer className="border-t border-slate-800 px-8 py-5 text-[11px] font-semibold text-slate-600 tracking-wider uppercase">
            Project Platform · Next.js 15 · Tailwind CSS · MySQL · Prisma ORM
          </footer>
        </div>
      </div>
 
      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 lg:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-80 bg-slate-900 p-6 shadow-2xl border-r border-slate-800" onClick={(event) => event.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Project Platform</div>
                <div className="text-lg font-bold text-white mt-1">Menu</div>
              </div>
              <Button variant="ghost" onClick={() => setDrawerOpen(false)} className="p-1">Close</Button>
            </div>
            <nav className="space-y-1.5">
              {visibleNavItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${pathname === item.href ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
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
