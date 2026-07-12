"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_ROUTES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/api";
import { Button, Card, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { user, loginUser, submitting } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>();

  useEffect(() => {
    if (user) {
      router.replace(ROLE_ROUTES[user.role]);
    }
  }, [user, router]);

  const onSubmit = async (values: { email: string; password: string }) => {
    try {
      const currentUser = await loginUser(values);
      toast.success("Login successful");
      router.replace(ROLE_ROUTES[currentUser.role]);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_28%),linear-gradient(180deg,#07111f_0%,#050a14_100%)] px-4 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-300">Log in to continue to your dashboard.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Input type="email" placeholder="Email" {...register("email", { required: "Email is required" })} />
            {errors.email && <p className="mt-1 text-xs text-rose-300">{errors.email.message}</p>}
          </div>
          <div>
            <Input type="password" placeholder="Password" {...register("password", { required: "Password is required" })} />
            {errors.password && <p className="mt-1 text-xs text-rose-300">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Signing in..." : "Login"}</Button>
        </form>
        <p className="mt-6 text-sm text-slate-400">Need an account? <a href="/register" className="text-blue-400 hover:text-blue-300">Register</a></p>
      </Card>
    </main>
  );
}
