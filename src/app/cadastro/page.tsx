import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { getCurrentPrincipal } from "@/lib/auth/current-principal";
import { getCurrentCompany } from "@/lib/company/current-company";

export default async function CadastroPage() {
  const principal = await getCurrentPrincipal();

  if (principal) {
    const company = await getCurrentCompany();
    redirect(company ? "/dashboard" : "/onboarding");
  }

  return (
    <AuthShell
      mode="signup"
      title="Criar sua conta"
      description="O próximo passo configura empresa, Matriz e fuso operacional."
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
