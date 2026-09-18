import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { getCurrentPrincipal } from "@/lib/auth/current-principal";
import { getCurrentCompany } from "@/lib/company/current-company";

export default async function LoginPage() {
  const principal = await getCurrentPrincipal();

  if (principal) {
    const company = await getCurrentCompany();
    redirect(company ? "/dashboard" : "/onboarding");
  }

  return (
    <AuthShell
      mode="login"
      title="Entrar no workspace"
      description="Use seu e-mail e senha para acessar a operação."
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
