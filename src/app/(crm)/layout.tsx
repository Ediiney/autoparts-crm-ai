import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export default async function CrmLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspace = await getWorkspaceContext();
  if (!workspace) redirect("/onboarding");

  const userName =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
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
