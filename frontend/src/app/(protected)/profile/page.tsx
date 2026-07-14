"use client";
 
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuthContext } from "@/context/auth-context";
import { api, getErrorMessage } from "@/lib/api";
import { Button, Card, Input, RoleBadge, Spinner } from "@/components/ui";
import { User, Mail, Shield, Lock } from "lucide-react";
 
export default function ProfilePage() {
  const { user, refreshSession } = useAuthContext();
  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile } = useForm<{ name: string; email: string }>();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword } = useForm<{ password: string; confirmPassword: string }>();
 
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
 
  useEffect(() => {
    if (user) {
      resetProfile({ name: user.name, email: user.email });
    }
  }, [user, resetProfile]);
 
  const onUpdateProfile = async (values: { name: string; email: string }) => {
    setUpdatingProfile(true);
    try {
      await api.put(`/users/${user?.id}`, values);
      toast.success("Profile updated successfully");
      await refreshSession();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingProfile(false);
    }
  };
 
  const onUpdatePassword = async (values: { password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (values.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
 
    setUpdatingPassword(true);
    try {
      await api.put(`/users/${user?.id}`, { password: values.password });
      toast.success("Password changed successfully");
      resetPassword({ password: "", confirmPassword: "" });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingPassword(false);
    }
  };
 
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "?";
 
  return (
    <section className="space-y-8 max-w-4xl">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Profile</h1>
        <p className="mt-1 text-xs md:text-sm text-slate-400">Configure your personal information, contact email, and security credentials.</p>
      </div>
 
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Left Column: Avatar & Overview */}
        <Card className="p-6 md:col-span-1 flex flex-col items-center text-center justify-center space-y-4 py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-3xl font-bold text-blue-400 shadow-sm shadow-blue-500/10">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">{user?.name}</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">{user?.email}</p>
          </div>
          <div className="pt-2">
            <RoleBadge role={user?.role || "TEAM_MEMBER"} />
          </div>
        </Card>
 
        {/* Right Column: Profile & Password Cards */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Details */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="h-5 w-5 text-blue-500" />
              <h3 className="text-base font-semibold text-white">Profile Information</h3>
            </div>
 
            <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <Input placeholder="Name" {...registerProfile("name", { required: true })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                <Input placeholder="Email" type="email" {...registerProfile("email", { required: true })} />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={updatingProfile} className="w-full sm:w-auto">
                  {updatingProfile ? <><Spinner className="h-4 w-4" /> Saving…</> : "Save Profile"}
                </Button>
              </div>
            </form>
          </Card>
 
          {/* Security Credentials */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lock className="h-5 w-5 text-blue-500" />
              <h3 className="text-base font-semibold text-white">Security & Password</h3>
            </div>
 
            <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
                <Input placeholder="Min. 6 characters" type="password" {...registerPassword("password", { required: true })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                <Input placeholder="Repeat password" type="password" {...registerPassword("confirmPassword", { required: true })} />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={updatingPassword} className="w-full sm:w-auto">
                  {updatingPassword ? <><Spinner className="h-4 w-4" /> Updating…</> : "Change Password"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}
