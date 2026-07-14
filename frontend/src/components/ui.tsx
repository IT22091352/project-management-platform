"use client";
 
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Loader2, Search, Shield, X, MoreVertical } from "lucide-react";
 
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
    primary: "bg-blue-500 text-white hover:bg-blue-400 shadow-sm shadow-blue-500/10 focus:ring-blue-500/50",
    secondary: "bg-slate-800 text-white hover:bg-slate-700 border border-slate-800 hover:border-slate-700",
    ghost: "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white",
    danger: "bg-red-500 text-white hover:bg-red-400 shadow-sm shadow-red-500/10",
  };
 
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 min-h-[44px] text-sm font-semibold whitespace-nowrap transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
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
      className={`w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:bg-slate-900 focus:ring-1 focus:ring-blue-500/50 ${props.className || ""}`}
    />
  );
}
 
// ─── Textarea ───────────────────────────────────────────────────────────────
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:bg-slate-900 focus:ring-1 focus:ring-blue-500/50 ${props.className || ""}`}
    />
  );
}
 
// ─── Card ───────────────────────────────────────────────────────────────────
export function Card({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900 shadow-md shadow-black/20 hover:border-slate-700/80 hover:shadow-lg transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}
 
// ─── Badge ──────────────────────────────────────────────────────────────────
export function Badge({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <span className={`inline-flex items-center rounded-full border border-slate-800 bg-slate-900/50 px-2.5 py-0.5 text-xs font-medium text-slate-300 ${className}`}>
      {children}
    </span>
  );
}
 
// ─── RoleBadge ──────────────────────────────────────────────────────────────
const roleMeta: Record<string, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  },
  PROJECT_MANAGER: {
    label: "Manager",
    className: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  },
  TEAM_MEMBER: {
    label: "Member",
    className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  },
};
 
export function RoleBadge({ role }: { role: string }) {
  const meta = roleMeta[role] ?? { label: role, className: "bg-slate-800 border-slate-800 text-slate-400" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${meta.className}`}>
      {meta.label}
    </span>
  );
}
 
// ─── StatusBadge ────────────────────────────────────────────────────────────
const statusMeta: Record<string, { label: string; className: string }> = {
  TODO: { label: "Todo", className: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  PENDING: { label: "Pending", className: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  DONE: { label: "Done", className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  COMPLETED: { label: "Completed", className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  CANCELLED: { label: "Cancelled", className: "bg-red-500/10 border-red-500/20 text-red-400" },
};
 
export function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta[status] ?? { label: status, className: "bg-slate-800 border-slate-800 text-slate-400" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}
 
// ─── PriorityBadge ──────────────────────────────────────────────────────────
const priorityMeta: Record<string, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-slate-800/80 border-slate-700/50 text-slate-400" },
  MEDIUM: { label: "Medium", className: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  HIGH: { label: "High", className: "bg-red-500/10 border-red-500/20 text-red-400" },
};
 
export function PriorityBadge({ priority }: { priority: string }) {
  const meta = priorityMeta[priority] ?? { label: priority, className: "bg-slate-800 border-slate-800 text-slate-400" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}
 
// ─── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`h-4 w-4 animate-spin ${className}`} />;
}
 
// ─── Loader ─────────────────────────────────────────────────────────────────
export function Loader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-5 text-sm text-slate-200 shadow-xl">
        <span className="inline-flex items-center gap-3"><Spinner /> Loading...</span>
      </div>
    </div>
  );
}
 
// ─── SkeletonCard ────────────────────────────────────────────────────────────
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md animate-pulse">
      <div className="mb-3 h-5 w-2/3 rounded bg-slate-800" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className="mt-2 h-3 rounded bg-slate-800" style={{ width: `${85 - i * 15}%` }} />
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
        className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:bg-slate-900 focus:ring-1 focus:ring-blue-500/50"
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
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-left transition focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-700"
      >
        <span className={selected ? "text-slate-100" : "text-slate-500"}>
          {loading ? "Loading…" : (selected?.label ?? placeholder)}
        </span>
        {loading ? <Spinner className="h-4 w-4 text-slate-400" /> : <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />}
      </button>
 
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 py-1 shadow-2xl"
          >
            {options.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400">No options</li>
            ) : (
              options.map((option) => (
                <li key={String(option.value)}>
                  <button
                    type="button"
                    onClick={() => { onChange(option.value); setOpen(false); }}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left transition hover:bg-slate-850 min-w-0 ${String(option.value) === String(value) ? "text-blue-400 bg-blue-500/5" : "text-slate-200"}`}
                  >
                    {String(option.value) === String(value) && <Check className="h-3.5 w-3.5 shrink-0" />}
                    <span className={`truncate ${String(option.value) === String(value) ? "" : "pl-[18px]"}`} title={option.label}>{option.label}</span>
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
        className="flex min-h-[42px] w-full items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm text-left transition focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-700"
      >
        <span className="flex flex-1 flex-wrap gap-1">
          {loading ? (
            <span className="text-slate-500">Loading…</span>
          ) : selectedLabels.length > 0 ? (
            selectedLabels.map((label) => (
              <span key={label} className="inline-flex items-center gap-1 rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-xs text-blue-400 max-w-[120px] truncate" title={label}>
                {label}
              </span>
            ))
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </span>
        {loading ? <Spinner className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />}
      </button>
 
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 py-1 shadow-2xl"
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
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left transition hover:bg-slate-850 min-w-0 ${checked ? "text-blue-400" : "text-slate-200"}`}
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${checked ? "border-blue-500 bg-blue-500/20" : "border-slate-800 bg-slate-950"}`}>
                        {checked && <Check className="h-2.5 w-2.5 text-blue-400" />}
                      </span>
                      <span className="truncate" title={option.label}>{option.label}</span>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-base md:text-lg font-semibold text-white truncate">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white shrink-0"><X className="h-5 w-5" /></button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-6 shadow-2xl">
        <div className="mb-3 flex items-center gap-3 text-white">
          <Shield className="h-5 w-5 text-blue-500 shrink-0" />
          <h3 className="text-base md:text-lg font-semibold truncate">{title}</h3>
        </div>
        <p className="text-xs md:text-sm leading-relaxed text-slate-400">{description}</p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} className="w-full sm:w-auto">Cancel</Button>
          <Button variant="danger" onClick={onConfirm} className="w-full sm:w-auto">Confirm</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Dropdown ────────────────────────────────────────────────────────────────
interface DropdownItem {
  label: string;
  onClick: () => void;
  variant?: "normal" | "danger";
  icon?: React.ReactNode;
}

export function Dropdown({ trigger, items }: { trigger?: React.ReactNode; items: DropdownItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">
        {trigger ?? (
          <button type="button" className="flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 z-50 mt-1 w-48 origin-top-right rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl ring-1 ring-black/5"
          >
            <div className="space-y-0.5">
              {items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    item.onClick();
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition min-w-0 ${
                    item.variant === "danger"
                      ? "text-red-400 hover:bg-red-500/10"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="truncate" title={item.label}>{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
