"use client";

import { RoleGuard } from "@/components/guards";

export const dynamic = "force-dynamic";

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard roles={["ADMIN"]}>{children}</RoleGuard>;
}
