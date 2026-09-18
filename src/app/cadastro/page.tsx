import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CarFront, CheckCircle2 } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/company/current-company";

export default async function CadastroPage() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();

  if(user) {
    const company=await getCurrentCompany();
    redirect(company?"/dashboard":"/onboarding");
  }

  return (
    <main className="auth-v2-page signup">
      <section className="auth-v2-aside">
        <Link href="/" className="auth-v2-brand"><span><CarFront size={19}/></span><strong>AutoParts CRM</strong></Link>
        <div className="auth-v2-aside-copy">
          <span>Comece pela base certa</span>
          <h1>Configure sua operação antes de conectar automações.</h1>
          <p>A conta cria o acesso. Depois você define empresa, filial, fuso e estrutura comercial.</p>
          <div className="auth-v2-benefits">
            <div><CheckCircle2 size={15}/><span>Matriz criada automaticamente.</span></div>
            <div><CheckCircle2 size={15}/><span>Fusos brasileiros suportados.</span></div>
            <div><CheckCircle2 size={15}/><span>Catálogo e canais entram depois.</span></div>
          </div>
        </div>
        <small>Etapa 1 de 2 · Conta → Empresa</small>
      </section>

      <section className="auth-v2-main">
        <div className="auth-v2-card">
          <Link href="/" className="auth-v2-back"><ArrowLeft size={13}/> Voltar para a home</Link>
          <span className="overline-v2">Nova conta</span>
          <h2>Criar acesso</h2>
          <p>Leva poucos segundos. A empresa é configurada na próxima etapa.</p>
          <AuthForm mode="signup"/>
        </div>
      </section>
    </main>
  );
}
