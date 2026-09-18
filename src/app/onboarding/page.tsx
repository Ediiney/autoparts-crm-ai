import Link from "next/link";
import { Building2, CarFront, Check, ChevronRight, PackageSearch, Sparkles, Users } from "lucide-react";

export default function OnboardingPage(){
  return (
    <main className="onboarding-page">
      <div className="onboarding-top">
        <div className="auth-brand dark"><div className="brand-mark"><CarFront size={20}/></div><div><strong>AutoParts</strong><span>CRM AI</span></div></div>
        <div className="onboarding-progress"><span className="active">1</span><i/><span>2</span><i/><span>3</span></div>
      </div>

      <div className="onboarding-content">
        <div className="onboarding-copy"><div className="eyebrow">Configuração inicial</div><h1>Vamos preparar sua operação.</h1><p>Leva poucos minutos. Depois você poderá importar o catálogo e começar os atendimentos.</p></div>
        <div className="onboarding-layout">
          <section className="surface-card onboarding-form">
            <div className="onboarding-section-title"><div className="stat-icon"><Building2 size={18}/></div><div><h2>Dados da empresa</h2><p>Informações básicas do seu negócio.</p></div></div>
            <div className="form-grid">
              <div className="form-field full"><label>Nome da empresa</label><input placeholder="Ex.: Auto Peças Central"/></div>
              <div className="form-field"><label>CNPJ</label><input placeholder="00.000.000/0001-00"/></div>
              <div className="form-field"><label>WhatsApp comercial</label><input placeholder="(11) 99999-9999"/></div>
              <div className="form-field full"><label>E-mail</label><input type="email" placeholder="vendas@empresa.com.br"/></div>
            </div>

            <div className="onboarding-section-title separated"><div className="stat-icon blue"><PackageSearch size={18}/></div><div><h2>Como você vende?</h2><p>Isso ajuda a configurar catálogo e preços iniciais.</p></div></div>
            <div className="choice-grid">
              <button className="choice-card selected"><div className="choice-check"><Check size={12}/></div><PackageSearch size={20}/><strong>Loja de autopeças</strong><span>Venda direta para consumidores e oficinas.</span></button>
              <button className="choice-card"><Users size={20}/><strong>Distribuidora</strong><span>Atacado, múltiplas tabelas e vendedores.</span></button>
            </div>

            <div className="onboarding-actions"><Link href="/login" className="button secondary">Voltar</Link><Link href="/dashboard" className="button primary">Continuar <ChevronRight size={14}/></Link></div>
          </section>

          <aside className="onboarding-side">
            <div className="onboarding-tip"><Sparkles size={18}/><div><strong>O que acontece depois?</strong><p>Você poderá importar o catálogo Giancar, cadastrar sua fonte de preços e convidar sua equipe.</p></div></div>
            <div className="setup-list">
              <div className="done"><span><Check size={12}/></span><div><strong>Conta criada</strong><p>Seu acesso já está protegido.</p></div></div>
              <div className="current"><span>2</span><div><strong>Empresa</strong><p>Estamos aqui.</p></div></div>
              <div><span>3</span><div><strong>Catálogo e equipe</strong><p>Configuração dentro do CRM.</p></div></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
