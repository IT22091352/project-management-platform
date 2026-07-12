import { RoleGuard } from "@/components/guards";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard roles={["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"]}>{children}</RoleGuard>;
}
