"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "./ui";
import { ROLE_ROUTES, UserRole } from "@/lib/constants";
import { useAuthContext } from "@/context/auth-context";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) return <Loader />;
  return <>{children}</>;
}

export function RoleGuard({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && user && !roles.includes(user.role)) {
      router.replace(ROLE_ROUTES[user.role]);
    }
  }, [isLoading, user, roles, router]);

  if (isLoading || !user) return <Loader />;
  if (!roles.includes(user.role)) return null;
  return <>{children}</>;
}
