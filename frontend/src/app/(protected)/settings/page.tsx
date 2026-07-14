"use client";
 
import { useState } from "react";
import { Button, Card, Input, CustomSelect } from "@/components/ui";
import { Shield, Settings, Lock, Eye, Bell, Trash, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
 
export default function SettingsPage() {
  const [theme, setTheme] = useState("dark");
  const [density, setDensity] = useState("default");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
 
  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully.`);
  };
 
  return (
    <section className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-xs md:text-sm text-slate-400">Configure global workspace options, alert thresholds, layout views, and session security.</p>
      </div>
 
      <div className="space-y-6">
        {/* Account Settings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Settings className="h-5 w-5 text-blue-500" />
            <h3 className="text-base font-semibold text-white">Account Settings</h3>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace Name</label>
              <Input placeholder="Enter workspace name" defaultValue="Operations Center" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace Slug</label>
              <Input placeholder="workspace-slug" defaultValue="operations-hub" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Configure your organization's display settings and base access domain paths.</p>
          <div className="flex justify-end pt-2">
            <Button onClick={() => handleSave("Account")} className="w-full sm:w-auto">Save Changes</Button>
          </div>
        </Card>
 
        {/* Security Settings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="h-5 w-5 text-blue-500" />
            <h3 className="text-base font-semibold text-white">Security Settings</h3>
          </div>
          <div className="space-y-3.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/40">
              <div>
                <h4 className="text-sm font-semibold text-white">Two-Factor Authentication (2FA)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Secure your administrator and project manager roles with TOTP verification tokens.</p>
              </div>
              <Button variant="secondary" className="px-3 py-1.5 text-xs w-full sm:w-auto shrink-0">Enable</Button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/40">
              <div>
                <h4 className="text-sm font-semibold text-white">API Keys</h4>
                <p className="text-xs text-slate-500 mt-0.5">Provision secure programmatic read/write access tokens for this project platform.</p>
              </div>
              <Button variant="secondary" className="px-3 py-1.5 text-xs w-full sm:w-auto shrink-0">Manage</Button>
            </div>
          </div>
        </Card>
 
        {/* Appearance Settings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Eye className="h-5 w-5 text-blue-500" />
            <h3 className="text-base font-semibold text-white">Appearance</h3>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Display Theme</label>
              <CustomSelect
                options={[
                  { value: "dark", label: "Midnight Dark" },
                  { value: "light", label: "Vibrant Light" },
                  { value: "system", label: "Match System" },
                ]}
                value={theme}
                onChange={(v) => setTheme(String(v))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Display Density</label>
              <CustomSelect
                options={[
                  { value: "default", label: "Default Spacing" },
                  { value: "compact", label: "Compact List Layout" },
                ]}
                value={density}
                onChange={(v) => setDensity(String(v))}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => handleSave("Appearance")} className="w-full sm:w-auto">Save Changes</Button>
          </div>
        </Card>
 
        {/* Notifications Settings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="h-5 w-5 text-blue-500" />
            <h3 className="text-base font-semibold text-white">Notifications Settings</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-slate-200 block">Email Alerts</span>
                <span className="text-xs text-slate-500 mt-0.5">Send a digest when you are added to a project workspace.</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-blue-500 outline-none focus:ring-1 focus:ring-blue-500/50 shrink-0"
              />
            </div>
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-800/60">
              <div>
                <span className="font-semibold text-slate-200 block">Task Assignment Alerts</span>
                <span className="text-xs text-slate-500 mt-0.5">Send push alerts when a project manager assigns a task list item.</span>
              </div>
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={(e) => setPushAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-blue-500 outline-none focus:ring-1 focus:ring-blue-500/50 shrink-0"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => handleSave("Notifications")} className="w-full sm:w-auto">Save Changes</Button>
          </div>
        </Card>
 
        {/* Danger Zone */}
        <Card className="p-6 border border-red-950 bg-red-950/10 hover:border-red-900 space-y-4">
          <div className="flex items-center gap-2 border-b border-red-950 pb-3">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <h3 className="text-base font-semibold text-red-400">Danger Zone</h3>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Delete Workspace Data</h4>
              <p className="text-xs text-slate-500 mt-0.5">Permanently delete all projects, active tasks, team member lists, and communication history.</p>
            </div>
            <Button variant="danger" className="shrink-0 w-full sm:w-auto" onClick={() => toast.error("Please contact customer support to initiate workspace deletion.")}>
              Delete Workspace
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
