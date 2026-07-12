"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Loader2, Search, Shield, X } from "lucide-react";

// ─── Button ────────────────────────────────────────────────────────────────
export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-950/30",
    secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/10",
    ghost: "bg-transparent text-slate-200 hover:bg-white/10",
    danger: "bg-rose-500 text-white hover:bg-rose-400",
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400/60 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Input ─────────────────────────────────────────────────────────────────
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-blue-400/70 focus:bg-white/8 ${props.className || ""}`}
    />
  );
}

// ─── Textarea ───────────────────────────────────────────────────────────────
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-blue-400/70 focus:bg-white/8 ${props.className || ""}`}
    />
  );
}

// ─── Card ───────────────────────────────────────────────────────────────────
export function Card({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-2xl shadow-black/30 ${className}`}>{children}</div>;
}

// ─── Badge ──────────────────────────────────────────────────────────────────
export function Badge({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <span className={`inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 ${className}`}>{children}</span>;
}

// ─── RoleBadge ──────────────────────────────────────────────────────────────
const roleMeta: Record<string, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className: "bg-violet-500/20 border-violet-400/30 text-violet-300",
  },
  PROJECT_MANAGER: {
    label: "Project Manager",
    className: "bg-blue-500/20 border-blue-400/30 text-blue-300",
  },
  TEAM_MEMBER: {
    label: "Team Member",
    className: "bg-emerald-500/20 border-emerald-400/30 text-emerald-300",
  },
};

export function RoleBadge({ role }: { role: string }) {
  const meta = roleMeta[role] ?? { label: role, className: "bg-white/10 border-white/10 text-slate-300" };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${meta.className}`}>
      {meta.label}
    </span>
  );
}

// ─── StatusBadge ────────────────────────────────────────────────────────────
const statusMeta: Record<string, { label: string; className: string }> = {
  TODO: { label: "Todo", className: "bg-slate-500/20 border-slate-400/30 text-slate-300" },
  IN_PROGRESS: { label: "In Progress", className: "bg-amber-500/20 border-amber-400/30 text-amber-300" },
  DONE: { label: "Done", className: "bg-emerald-500/20 border-emerald-400/30 text-emerald-300" },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta[status] ?? { label: status, className: "bg-white/10 border-white/10 text-slate-300" };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

// ─── PriorityBadge ──────────────────────────────────────────────────────────
const priorityMeta: Record<string, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-sky-500/20 border-sky-400/30 text-sky-300" },
  MEDIUM: { label: "Medium", className: "bg-amber-500/20 border-amber-400/30 text-amber-300" },
  HIGH: { label: "High", className: "bg-rose-500/20 border-rose-400/30 text-rose-300" },
};

export function PriorityBadge({ priority }: { priority: string }) {
  const meta = priorityMeta[priority] ?? { label: priority, className: "bg-white/10 border-white/10 text-slate-300" };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

// ─── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`h-5 w-5 animate-spin ${className}`} />;
}

// ─── Loader ─────────────────────────────────────────────────────────────────
export function Loader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-slate-200 shadow-xl backdrop-blur-xl">
        <span className="inline-flex items-center gap-3"><Spinner /> Loading...</span>
      </div>
    </div>
  );
}

// ─── SkeletonCard ────────────────────────────────────────────────────────────
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-2xl shadow-black/30 animate-pulse">
      <div className="mb-3 h-5 w-2/3 rounded-xl bg-white/10" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className="mt-2 h-3 rounded-xl bg-white/8" style={{ width: `${85 - i * 15}%` }} />
      ))}
    </div>
  );
}

// ─── SearchBar ───────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-400/70"
      />
    </div>
  );
}

// ─── CustomSelect ────────────────────────────────────────────────────────────
export type SelectOption = { value: string | number; label: string };

interface CustomSelectProps {
  options: SelectOption[];
  value: string | number | null | undefined;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  id?: string;
}

export function CustomSelect({ options, value, onChange, placeholder = "Select…", disabled, loading, className = "", id }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`} id={id}>
      <button
        type="button"
        onClick={() => !disabled && !loading && setOpen((v) => !v)}
        disabled={disabled || loading}
        className="flex w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-left transition focus:outline-none focus:border-blue-400/70 disabled:cursor-not-allowed disabled:opacity-60 hover:border-white/20"
      >
        <span className={selected ? "text-slate-100" : "text-slate-400"}>
          {loading ? "Loading…" : (selected?.label ?? placeholder)}
        </span>
        {loading ? <Spinner className="h-4 w-4 text-slate-400" /> : <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 py-1 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            {options.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400">No options</li>
            ) : (
              options.map((option) => (
                <li key={String(option.value)}>
                  <button
                    type="button"
                    onClick={() => { onChange(option.value); setOpen(false); }}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left transition hover:bg-white/8 ${String(option.value) === String(value) ? "text-blue-300 bg-blue-500/10" : "text-slate-200"}`}
                  >
                    {String(option.value) === String(value) && <Check className="h-3.5 w-3.5 shrink-0" />}
                    <span className={String(option.value) === String(value) ? "" : "pl-[18px]"}>{option.label}</span>
                  </button>
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MultiSelect ─────────────────────────────────────────────────────────────
interface MultiSelectProps {
  options: SelectOption[];
  value: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  id?: string;
}

export function MultiSelect({ options, value, onChange, placeholder = "Select…", disabled, loading, className = "", id }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabels = options.filter((o) => value.map(String).includes(String(o.value))).map((o) => o.label);

  const toggle = (optionValue: string | number) => {
    const str = String(optionValue);
    const current = value.map(String);
    if (current.includes(str)) {
      onChange(value.filter((v) => String(v) !== str));
    } else {
      onChange([...value, optionValue]);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`} id={id}>
      <button
        type="button"
        onClick={() => !disabled && !loading && setOpen((v) => !v)}
        disabled={disabled || loading}
        className="flex min-h-[46px] w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-left transition focus:outline-none focus:border-blue-400/70 disabled:cursor-not-allowed disabled:opacity-60 hover:border-white/20"
      >
        <span className="flex flex-1 flex-wrap gap-1">
          {loading ? (
            <span className="text-slate-400">Loading…</span>
          ) : selectedLabels.length > 0 ? (
            selectedLabels.map((label) => (
              <span key={label} className="inline-flex items-center gap-1 rounded-xl bg-blue-500/20 border border-blue-400/20 px-2 py-0.5 text-xs text-blue-300">
                {label}
              </span>
            ))
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        {loading ? <Spinner className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 py-1 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            {options.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400">No options</li>
            ) : (
              options.map((option) => {
                const checked = value.map(String).includes(String(option.value));
                return (
                  <li key={String(option.value)}>
                    <button
                      type="button"
                      onClick={() => toggle(option.value)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left transition hover:bg-white/8 ${checked ? "text-blue-300" : "text-slate-200"}`}
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition ${checked ? "border-blue-400 bg-blue-500/30" : "border-white/20 bg-white/5"}`}>
                        {checked && <Check className="h-2.5 w-2.5 text-blue-300" />}
                      </span>
                      {option.label}
                    </button>
                  </li>
                );
              })
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, title, children, onClose }: React.PropsWithChildren<{ open: boolean; title: string; onClose: () => void }>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="rounded-full p-2 text-slate-300 transition hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

// ─── ConfirmDialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({ open, title, description, onCancel, onConfirm }: { open: boolean; title: string; description: string; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/50">
        <div className="mb-3 flex items-center gap-3 text-white">
          <Shield className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm leading-6 text-slate-300">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
