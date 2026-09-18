import Link from "next/link";
import { CarFront, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";

export default function LoginPage(){
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
          <div className="preview-result"><span>Match 94%</span><strong>GIA-4721 · R$ 329,90</strong></div>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-card">
          <div className="mobile-auth-brand"><div className="brand-mark"><CarFront size={20}/></div><strong>AutoParts CRM AI</strong></div>
          <h2>Bem-vindo de volta</h2>
          <p>Acesse sua central de atendimento.</p>
          <form>
            <div className="form-field"><label>E-mail</label><input type="email" placeholder="voce@empresa.com.br"/></div>
            <div className="form-field"><label>Senha</label><input type="password" placeholder="Sua senha"/></div>
            <div className="auth-row"><label className="checkbox-label"><input type="checkbox"/> Manter conectado</label><a href="#">Esqueci minha senha</a></div>
            <Link href="/dashboard" className="button primary auth-submit"><LockKeyhole size={15}/> Entrar no CRM</Link>
          </form>
          <div className="auth-divider"><span>ou</span></div>
          <button className="oauth-button">G <span>Continuar com Google</span></button>
          <p className="auth-footer">Primeiro acesso? <Link href="/onboarding">Criar empresa</Link></p>
        </div>
      </section>
    </main>
  );
}
