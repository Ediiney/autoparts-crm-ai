"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, Check, ChevronRight, PackageSearch, Sparkles, Users } from "lucide-react";
import { BRAZIL_TIMEZONES } from "@/lib/timezones";

export function OnboardingForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [businessType, setBusinessType] = useState<"retail" | "distributor">("retail");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Informe o nome da empresa.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/onboarding/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, document, phone, email, businessType, timezone }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Não foi possível criar a empresa.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="onboarding-layout" onSubmit={submit}>
      <section className="surface-card onboarding-form">
        <div className="onboarding-section-title">
          <div className="stat-icon"><Building2 size={18} /></div>
          <div><h2>Dados da empresa</h2><p>Informações básicas do negócio e da localização operacional.</p></div>
        </div>

        <div className="form-grid">
          <div className="form-field full"><label>Nome da empresa</label><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Auto Peças Central" /></div>
          <div className="form-field"><label>CNPJ</label><input value={document} onChange={(event) => setDocument(event.target.value)} placeholder="00.000.000/0001-00" /></div>
          <div className="form-field"><label>WhatsApp comercial</label><input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(11) 99999-9999" /></div>
          <div className="form-field full"><label>E-mail</label><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="vendas@empresa.com.br" /></div>
          <div className="form-field full">
            <label>Fuso horário principal</label>
            <select value={timezone} onChange={(event) => setTimezone(event.target.value)}>
              {BRAZIL_TIMEZONES.map((item) => (
                <option key={item.value} value={item.value}>{item.label} · {item.offset} · {item.region}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="onboarding-section-title separated">
          <div className="stat-icon blue"><PackageSearch size={18} /></div>
          <div><h2>Como você vende?</h2><p>A configuração inicial se adapta ao tipo de operação.</p></div>
        </div>

        <div className="choice-grid">
          <button type="button" onClick={() => setBusinessType("retail")} className={businessType === "retail" ? "choice-card selected" : "choice-card"}>
            {businessType === "retail" ? <div className="choice-check"><Check size={12} /></div> : null}
            <PackageSearch size={20} /><strong>Loja de autopeças</strong><span>Venda direta para consumidores e oficinas.</span>
          </button>
          <button type="button" onClick={() => setBusinessType("distributor")} className={businessType === "distributor" ? "choice-card selected" : "choice-card"}>
            {businessType === "distributor" ? <div className="choice-check"><Check size={12} /></div> : null}
            <Users size={20} /><strong>Distribuidora</strong><span>Atacado, múltiplas filiais e vendedores.</span>
          </button>
        </div>

        {error ? <div className="auth-message error onboarding-error">{error}</div> : null}
        <div className="onboarding-actions">
          <button className="button primary" type="submit" disabled={loading}>
            {loading ? "Criando empresa..." : "Criar empresa"} {!loading ? <ChevronRight size={14} /> : null}
          </button>
        </div>
      </section>

      <aside className="onboarding-side">
        <div className="onboarding-tip"><Sparkles size={18} /><div><strong>Configuração inicial</strong><p>O sistema cria a Matriz, horário comercial, estoque principal e permissões automaticamente.</p></div></div>
        <div className="setup-list">
          <div className="done"><span><Check size={12} /></span><div><strong>Conta criada</strong><p>Acesso autenticado.</p></div></div>
          <div className="current"><span>2</span><div><strong>Empresa e fuso</strong><p>Estamos aqui.</p></div></div>
          <div><span>3</span><div><strong>Catálogo e equipe</strong><p>Dentro do CRM.</p></div></div>
        </div>
      </aside>
    </form>
  );
}
