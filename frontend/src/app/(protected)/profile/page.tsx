"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuthContext } from "@/context/auth-context";
import { api, getErrorMessage } from "@/lib/api";
import { Button, Card, Input } from "@/components/ui";

export default function ProfilePage() {
  const { user, refreshSession } = useAuthContext();
  const { register, handleSubmit, reset } = useForm<{ name: string; email: string }>();

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email });
    }
  }, [user, reset]);

  const onSubmit = async (values: { name: string; email: string }) => {
    try {
      await api.put(`/users/${user?.id}`, values);
      toast.success("Profile updated");
      await refreshSession();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <section className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold text-white">Profile</h1>
      <Card className="p-6">
        <div className="mb-4 text-sm text-slate-400">Avatar placeholder</div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input placeholder="Name" {...register("name")} />
          <Input placeholder="Email" {...register("email")} />
          <Button type="submit">Save Profile</Button>
        </form>
      </Card>
    </section>
  );
}
