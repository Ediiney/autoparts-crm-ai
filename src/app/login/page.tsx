import { redirect } from "next/navigation";
import { CarFront, CheckCircle2, Sparkles } from "lucide-react";
import { LoginForm } from "./login-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/company/current-company";

export default async function LoginPage(){
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const company = await getCurrentCompany();
    redirect(company ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="auth-brand"><div className="brand-mark"><CarFront size={22}/></div><div><strong>AutoParts</strong><span>CRM AI</span></div></div>
        <div className="auth-hero">
          <div className="eyebrow light">Atendimento inteligente para autopeças</div>
          <h1>Da mensagem do cliente à peça correta, sem chute.</h1>
          <p>Centralize conversas, veículos, catálogo, preços, estoque e orçamentos em um único CRM com IA.</p>
          <div className="auth-benefits">
            <div><CheckCircle2 size={17}/><span>IA pergunta somente os dados que faltam.</span></div>
            <div><CheckCircle2 size={17}/><span>Compatibilidade validada pelo seu catálogo.</span></div>
            <div><CheckCircle2 size={17}/><span>Preço e estoque nunca são inventados.</span></div>
          </div>
        </div>
        <div className="auth-preview-card">
          <div className="preview-message customer">Quanto está a bandeja do Civic?</div>
          <div className="preview-ai"><Sparkles size={15}/><div><strong>AutoParts AI</strong><p>Qual é o ano do Civic e o lado da peça?</p></div></div>
          <div className="preview-message customer small">2008, esquerda.</div>
          <div className="preview-result"><span>Fluxo seguro</span><strong>Catálogo → preço → resposta</strong></div>
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-card">
          <div className="mobile-auth-brand"><div className="brand-mark"><CarFront size={20}/></div><strong>AutoParts CRM AI</strong></div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
