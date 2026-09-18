import Link from "next/link";
import { redirect } from "next/navigation";
import { CarFront, Check } from "lucide-react";
import { getCurrentPrincipal } from "@/lib/auth/current-principal";
import { getCurrentCompany } from "@/lib/company/current-company";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const principal = await getCurrentPrincipal();

  if (!principal) redirect("/login");

  const company = await getCurrentCompany();
  if (company) redirect("/dashboard");

  return (
    <main className="setup-v2-page">
      <header className="setup-v2-header">
        <Link href="/" className="marketing-brand">
          <span className="marketing-brand-mark"><CarFront size={19} /></span>
          <span><strong>AutoParts</strong><small>CRM</small></span>
        </Link>
        <span>Configuração inicial</span>
      </header>

      <div className="setup-v2-shell">
        <aside className="setup-v2-progress">
          <span className="setup-v2-kicker">Etapa 2 de 2</span>
          <h1>Prepare a operação.</h1>
          <p>Esses dados definem o workspace principal. Tudo poderá ser ajustado depois em Configurações.</p>
          <div className="setup-v2-steps">
            <div className="done"><i><Check size={12} /></i><div><strong>Conta criada</strong><span>Acesso autenticado.</span></div></div>
            <div className="current"><i>2</i><div><strong>Empresa e operação</strong><span>Filial, fuso e tipo de venda.</span></div></div>
            <div><i>3</i><div><strong>Começar a operar</strong><span>Catálogo, clientes e canais.</span></div></div>
          </div>
          <div className="setup-v2-note">
            <strong>O que será criado</strong>
            <span>Matriz, horário comercial, estoque principal e permissões do proprietário.</span>
          </div>
        </aside>

        <section className="setup-v2-main">
          <div className="setup-v2-title">
            <span className="overline-v2">Workspace</span>
            <h2>Dados da empresa</h2>
            <p>Complete somente o necessário para começar.</p>
          </div>
          <OnboardingForm defaultEmail={principal.email ?? ""} />
        </section>
      </div>
    </main>
  );
}
