import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentCompany } from "@/lib/company/current-company";
import { createClient } from "@/lib/supabase/server";

export default async function CrmLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const company = await getCurrentCompany();
  if (!company) redirect("/onboarding");

  const userName =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Usuário";

  return (
    <AppShell companyName={company.name} userName={userName} role={company.role}>
      {children}
    </AppShell>
  );
}
