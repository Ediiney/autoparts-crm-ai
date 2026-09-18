import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentPrincipal } from "@/lib/auth/current-principal";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export default async function CrmLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/login");

  const workspace = await getWorkspaceContext();
  if (!workspace) redirect("/onboarding");

  const userName =
    (principal.user_metadata.full_name as string | undefined) ||
    principal.email?.split("@")[0] ||
    "Usuário";

  return (
    <AppShell
      companyName={workspace.company.name}
      userName={userName}
      role={workspace.company.role}
      branches={workspace.branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        code: branch.code,
        timezone: branch.timezone,
      }))}
      branchId={workspace.branch?.id}
      timezone={workspace.timezone}
    >
      {children}
    </AppShell>
  );
}
