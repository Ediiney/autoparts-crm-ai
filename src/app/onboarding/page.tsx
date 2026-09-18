import { redirect } from "next/navigation";
import { CarFront } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/company/current-company";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage(){
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const company = await getCurrentCompany();
  if (company) redirect("/dashboard");

  return (
    <main className="onboarding-page">
      <div className="onboarding-top">
        <div className="auth-brand dark"><div className="brand-mark"><CarFront size={20}/></div><div><strong>AutoParts</strong><span>CRM AI</span></div></div>
        <div className="onboarding-progress"><span className="active">1</span><i/><span className="active">2</span><i/><span>3</span></div>
      </div>
      <div className="onboarding-content">
        <div className="onboarding-copy"><div className="eyebrow">Configuração inicial</div><h1>Vamos preparar sua operação.</h1><p>Depois você poderá importar o catálogo, cadastrar preços e iniciar os atendimentos.</p></div>
        <OnboardingForm defaultEmail={user.email ?? ""} />
      </div>
    </main>
  );
}
