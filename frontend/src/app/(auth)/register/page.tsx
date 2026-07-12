"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_ROUTES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/api";
import { Button, Card, Input } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const { user, registerUser, submitting } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<{ name: string; email: string; password: string; role?: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER" }>();

  useEffect(() => {
    if (user) {
      router.replace(ROLE_ROUTES[user.role]);
    }
  }, [user, router]);

  const onSubmit = async (values: { name: string; email: string; password: string; role?: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER" }) => {
    try {
      const currentUser = await registerUser(values);
      toast.success("Account created");
      router.replace(ROLE_ROUTES[currentUser.role]);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_28%),linear-gradient(180deg,#07111f_0%,#050a14_100%)] px-4 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-white">Create account</h1>
        <p className="mt-2 text-sm text-slate-300">Set up a role-specific account.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input placeholder="Name" {...register("name", { required: "Name is required" })} />
          {errors.name && <p className="text-xs text-rose-300">{errors.name.message}</p>}
          <Input type="email" placeholder="Email" {...register("email", { required: "Email is required" })} />
          {errors.email && <p className="text-xs text-rose-300">{errors.email.message}</p>}
          <Input type="password" placeholder="Password" {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })} />
          {errors.password && <p className="text-xs text-rose-300">{errors.password.message}</p>}
          <select {...register("role")} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
            <option value="TEAM_MEMBER">TEAM_MEMBER</option>
            <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Creating..." : "Register"}</Button>
        </form>
        <p className="mt-6 text-sm text-slate-400">Already registered? <a href="/login" className="text-blue-400 hover:text-blue-300">Login</a></p>
      </Card>
    </main>
  );
}
