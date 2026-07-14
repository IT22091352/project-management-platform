"use client";
 
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  Folder,
  CheckSquare,
  MessageSquare,
  Users,
  X,
} from "lucide-react";
import { useAuthContext } from "@/context/auth-context";
import { logout as logoutService } from "@/services/auth.service";
import { Button, Card } from "./ui";
import { NotificationsDropdown } from "./NotificationsDropdown";
 
const navItems = [
  { href: "/dashboard/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4 shrink-0" />, roles: ["ADMIN"] },
  { href: "/dashboard/manager", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4 shrink-0" />, roles: ["PROJECT_MANAGER"] },
  { href: "/dashboard/member", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4 shrink-0" />, roles: ["TEAM_MEMBER"] },
  { href: "/projects", label: "Projects", icon: <Folder className="h-4 w-4 shrink-0" />, roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
  { href: "/tasks", label: "Tasks", icon: <CheckSquare className="h-4 w-4 shrink-0" />, roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
  { href: "/comments", label: "Comments", icon: <MessageSquare className="h-4 w-4 shrink-0" />, roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
  { href: "/users", label: "Users", icon: <Users className="h-4 w-4 shrink-0" />, roles: ["ADMIN"] },
  { href: "/profile", label: "Profile", icon: <User className="h-4 w-4 shrink-0" />, roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
  { href: "/settings", label: "Settings", icon: <Settings className="h-4 w-4 shrink-0" />, roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="mx-auto flex min-h-screen max-w-[1600px] relative">
        
        {/* Sidebar: Responsive Collapsible */}
        {/* Mobile: Hidden | Tablet: Collapsed icon-only (w-20) | Desktop: Full width (w-64) */}
        <aside className="hidden md:flex md:w-20 lg:w-64 shrink-0 border-r border-slate-800 bg-slate-900 p-4 lg:p-6 flex-col justify-between">
          <div className="space-y-8">
            {/* Sidebar Logo Header */}
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div className="hidden lg:block truncate">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Project Hub</p>
                <h1 className="text-sm font-bold text-white truncate">Operations Center</h1>
              </div>
            </div>
 
            {/* Sidebar Links */}
            <nav className="space-y-1.5">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-500 text-white shadow-sm shadow-blue-500/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    } justify-center lg:justify-start`}
                  >
                    {item.icon}
                    <span className="hidden lg:inline truncate" title={item.label}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
 
          {/* User Sign in Context Card */}
          <div className="mt-auto">
            <Card className="p-3 border border-slate-800 bg-slate-950/40 flex flex-col items-center lg:items-start text-center lg:text-left gap-1">
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="h-3.5 w-3.5" />}
              </div>
              <div className="hidden lg:block w-full truncate">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Signed in</div>
                <div className="font-semibold text-white text-xs truncate mt-0.5" title={user?.name || "Guest"}>{user?.name || "Guest"}</div>
                <div className="text-[9px] text-slate-400 capitalize truncate mt-0.5" title={user?.role ? user.role.toLowerCase().replace("_", " ") : ""}>
                  {user?.role ? user.role.toLowerCase().replace("_", " ") : "-"}
                </div>
              </div>
            </Card>
          </div>
        </aside>
 
        {/* Main Content Workspace */}
        <div className="flex min-w-0 flex-1 flex-col bg-slate-950">
          
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-4">
              
              {/* Hamburger Toggle (Mobile / Tablet Drawer Trigger) */}
              <div className="flex items-center gap-3 md:hidden">
                <Button variant="ghost" onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="p-2 min-h-0 h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Operations Hub</div>
                  <div className="text-xs font-bold text-white capitalize">{pathname.split("/").pop() || "Dashboard"}</div>
                </div>
              </div>
 
              {/* Path Breadcrumbs (Desktop / Tablet) */}
              <div className="hidden md:flex items-center gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  {pathname.split("/").filter(Boolean).join("  /  ") || "Dashboard"}
                </div>
              </div>
 
              {/* Notification & User Options */}
              <div className="ml-auto flex items-center gap-3 md:gap-4">
                <NotificationsDropdown />
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((value) => !value)}
                    className="flex items-center gap-2 md:gap-3 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-2 text-left transition hover:bg-slate-800 max-w-[180px] md:max-w-xs"
                  >
                    <div className="flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 font-bold text-xs md:text-sm">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
                    </div>
                    <div className="hidden sm:block truncate text-left max-w-[120px] md:max-w-[180px]">
                      <div className="text-xs md:text-sm font-semibold text-white leading-tight truncate" title={user?.name}>{user?.name}</div>
                      <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mt-0.5" title={user?.role}>{user?.role}</div>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0 transition-transform duration-200" />
                  </button>
 
                  {/* Account Options dropdown */}
                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl z-50"
                      >
                        <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition">
                          <User className="h-4 w-4 text-slate-400" /> Profile
                        </Link>
                        <Link href="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition">
                          <Settings className="h-4 w-4 text-slate-400" /> Settings
                        </Link>
                        <div className="h-px bg-slate-800 my-1" />
                        <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition">
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>
 
          {/* Main workspace scrollable area */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
 
          {/* Footer details */}
          <footer className="border-t border-slate-800 px-4 md:px-8 py-4 text-[9px] font-bold text-slate-600 tracking-widest uppercase">
            Project Platform · Next.js · Tailwind CSS · MySQL · Prisma ORM
          </footer>
        </div>
      </div>
 
      {/* Mobile Drawer Slide-in */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 md:hidden"
            onClick={() => setDrawerOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute left-0 top-0 h-full w-72 bg-slate-900 p-5 shadow-2xl border-r border-slate-800 flex flex-col justify-between"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Operations Hub</div>
                    <div className="text-base font-bold text-white mt-0.5">Workspace Menu</div>
                  </div>
                  <Button variant="ghost" onClick={() => setDrawerOpen(false)} className="p-1 min-h-0 h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <nav className="space-y-1.5">
                  {visibleNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        pathname === item.href
                          ? "bg-blue-500 text-white"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
 
              <div className="mt-auto">
                <Card className="p-4 border border-slate-800 bg-slate-950/40 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
                  </div>
                  <div className="truncate">
                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Signed in</div>
                    <div className="font-semibold text-white text-xs truncate">{user?.name || "Guest"}</div>
                  </div>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
