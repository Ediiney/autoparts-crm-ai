"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Check,
  Clock3,
  Link2,
  MapPin,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Store,
  UserRound,
  Wifi,
} from "lucide-react";
import { BRAZIL_TIMEZONES } from "@/lib/timezones";

type Company = {
  id: string;
  name: string;
  legal_name: string | null;
  document: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  business_type: string;
  currency: string;
};

type Branch = {
  id: string;
  name: string;
  code: string | null;
  timezone: string;
  city: string | null;
  state: string | null;
  is_headquarters: boolean;
  active: boolean;
};

type Hour = {
  branch_id: string;
  day_of_week: number;
  enabled: boolean;
  opens_at: string | null;
  closes_at: string | null;
  break_starts_at: string | null;
  break_ends_at: string | null;
};

type Integration = {
  id: string;
  provider: string;
  name: string;
  status: string;
  branch_id: string | null;
  last_sync_at: string | null;
  last_error: string | null;
  active: boolean;
};

type Timezone = {
  name: string;
  label: string;
  utc_label: string;
  region_hint: string | null;
};

const tabs = [
  { id: "company", label: "Empresa", icon: Building2 },
  { id: "branches", label: "Filiais", icon: Store },
  { id: "hours", label: "Horários", icon: Clock3 },
  { id: "automation", label: "Automação", icon: Settings2 },
  { id: "integrations", label: "Integrações", icon: Link2 },
  { id: "profile", label: "Meu perfil", icon: UserRound },
] as const;

const days = [
  ["Domingo", 0],
  ["Segunda-feira", 1],
  ["Terça-feira", 2],
  ["Quarta-feira", 3],
  ["Quinta-feira", 4],
  ["Sexta-feira", 5],
  ["Sábado", 6],
] as const;

export function SettingsConsole({
  company: initialCompany,
  settings: initialSettings,
  profileTimezone,
  branches: initialBranches,
  currentBranchId,
  hours: initialHours,
  integrations,
  timezones,
}: {
  company: Company;
  settings: {
    ai_enabled: boolean;
    ai_auto_reply: boolean;
    minimum_match_confidence: number;
    default_price_type: string;
    settings: unknown;
  } | null;
  profileTimezone: string | null;
  branches: Branch[];
  currentBranchId: string | null;
  hours: Hour[];
  integrations: Integration[];
  timezones: Timezone[];
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("company");
  const [company, setCompany] = useState(initialCompany);
  const [branches, setBranches] = useState(initialBranches);
  const [selectedBranchId, setSelectedBranchId] = useState(currentBranchId || initialBranches[0]?.id || "");
  const [allHours, setAllHours] = useState(initialHours);
  const [automation, setAutomation] = useState({
    enabled: initialSettings?.ai_enabled ?? true,
    autoReply: initialSettings?.ai_auto_reply ?? false,
    confidence: Number(initialSettings?.minimum_match_confidence ?? 0.85),
  });
  const [personalTimezone, setPersonalTimezone] = useState(profileTimezone || "");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const timezoneOptions = timezones.length ? timezones : BRAZIL_TIMEZONES.map((item) => ({
    name: item.value,
    label: item.label,
    utc_label: item.offset,
    region_hint: item.region,
  }));

  const branchHours = useMemo(() => {
    return days.map(([label, day]) => {
      const found = allHours.find((item) => item.branch_id === selectedBranchId && item.day_of_week === day);
      return {
        label,
        day,
        enabled: found?.enabled ?? false,
        opensAt: found?.opens_at?.slice(0, 5) ?? "08:00",
        closesAt: found?.closes_at?.slice(0, 5) ?? "18:00",
      };
    });
  }, [allHours, selectedBranchId]);

  async function request(path: string, method: string, body: unknown) {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível salvar.");
      setNotice({ type: "success", text: "Alterações salvas com sucesso." });
      return payload;
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Erro ao salvar." });
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function saveCompany() {
    const payload = await request("/api/settings/company", "PATCH", {
      name: company.name,
      legalName: company.legal_name,
      document: company.document,
      phone: company.phone,
      email: company.email,
      timezone: company.timezone,
      businessType: company.business_type,
    });
    if (payload?.company) setCompany((current) => ({ ...current, ...payload.company }));
  }

  async function saveAutomation() {
    await request("/api/settings/automation", "PATCH", {
      enabled: automation.enabled,
      autoReply: automation.autoReply,
      minimumConfidence: automation.confidence,
    });
  }

  async function saveProfileTimezone() {
    await request("/api/settings/profile", "PATCH", {
      timezone: personalTimezone || null,
    });
  }

  async function saveHours() {
    const hours = branchHours.map((item) => ({
      dayOfWeek: item.day,
      enabled: item.enabled,
      opensAt: item.opensAt,
      closesAt: item.closesAt,
    }));
    await request("/api/settings/hours", "PUT", { branchId: selectedBranchId, hours });
  }

  async function createBranch(form: HTMLFormElement) {
    const data = new FormData(form);
    const payload = await request("/api/settings/branches", "POST", {
      name: data.get("name"),
      code: data.get("code"),
      city: data.get("city"),
      state: data.get("state"),
      timezone: data.get("timezone"),
    });
    if (payload?.branch) {
      setBranches((current) => [...current, { ...payload.branch, active: true }]);
      form.reset();
    }
  }

  function updateHour(day: number, field: "enabled" | "opens_at" | "closes_at", value: boolean | string) {
    setAllHours((current) => {
      const index = current.findIndex((item) => item.branch_id === selectedBranchId && item.day_of_week === day);
      const next = [...current];

      if (index >= 0) {
        next[index] = { ...next[index], [field]: value };
      } else {
        next.push({
          branch_id: selectedBranchId,
          day_of_week: day,
          enabled: field === "enabled" ? Boolean(value) : true,
          opens_at: field === "opens_at" ? String(value) : "08:00",
          closes_at: field === "closes_at" ? String(value) : "18:00",
          break_starts_at: null,
          break_ends_at: null,
        });
      }
      return next;
    });
  }

  return (
    <div className="settings-v2">
      <div className="page-heading-v2">
        <div>
          <span className="overline-v2">Administração</span>
          <h1>Configurações</h1>
          <p>Controle empresa, filiais, fuso horário, operação e conexões em um único lugar.</p>
        </div>
        <div className="settings-v2-security"><ShieldCheck size={15}/><span>RLS e isolamento por empresa ativos</span></div>
      </div>

      <div className="settings-v2-layout">
        <aside className="settings-v2-nav">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} className={tab === id ? "active" : ""} onClick={() => { setTab(id); setNotice(null); }}>
              <Icon size={16}/><span>{label}</span>
            </button>
          ))}
        </aside>

        <section className="settings-v2-panel">
          {notice ? <div className={`notice-v2 ${notice.type}`}>{notice.type === "success" ? <Check size={15}/> : null}<span>{notice.text}</span></div> : null}

          {tab === "company" ? (
            <>
              <SectionTitle title="Dados da empresa" description="Configuração principal usada em toda a operação."/>
              <div className="form-v2-grid">
                <Field label="Nome fantasia"><input value={company.name} onChange={(e)=>setCompany({...company,name:e.target.value})}/></Field>
                <Field label="Razão social"><input value={company.legal_name ?? ""} onChange={(e)=>setCompany({...company,legal_name:e.target.value})}/></Field>
                <Field label="CNPJ"><input value={company.document ?? ""} onChange={(e)=>setCompany({...company,document:e.target.value})}/></Field>
                <Field label="Telefone"><input value={company.phone ?? ""} onChange={(e)=>setCompany({...company,phone:e.target.value})}/></Field>
                <Field label="E-mail"><input type="email" value={company.email ?? ""} onChange={(e)=>setCompany({...company,email:e.target.value})}/></Field>
                <Field label="Tipo da operação">
                  <select value={company.business_type} onChange={(e)=>setCompany({...company,business_type:e.target.value})}>
                    <option value="retail">Loja de autopeças</option>
                    <option value="distributor">Distribuidora</option>
                    <option value="wholesale">Atacado</option>
                    <option value="mixed">Operação mista</option>
                  </select>
                </Field>
                <Field label="Fuso horário padrão" wide>
                  <TimezoneSelect value={company.timezone} options={timezoneOptions} onChange={(value)=>setCompany({...company,timezone:value})}/>
                </Field>
              </div>
              <FooterAction onClick={()=>void saveCompany()} saving={saving}/>
            </>
          ) : null}

          {tab === "branches" ? (
            <>
              <SectionTitle title="Filiais" description="Cada filial pode ter fuso, estoque e horário próprios."/>
              <div className="branch-v2-list">
                {branches.map((branch)=>(
                  <div className="branch-v2-card" key={branch.id}>
                    <div className="branch-v2-icon"><Store size={17}/></div>
                    <div className="branch-v2-copy">
                      <strong>{branch.name}</strong>
                      <span>{[branch.city, branch.state].filter(Boolean).join(" · ") || "Localidade não informada"}</span>
                    </div>
                    <div className="branch-v2-meta">
                      {branch.is_headquarters ? <span className="pill-v2">Matriz</span> : null}
                      <span>{timezoneOptions.find((tz)=>tz.name===branch.timezone)?.label || branch.timezone}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider-v2"/>
              <h3 className="subheading-v2"><Plus size={15}/> Nova filial</h3>
              <form className="form-v2-grid" onSubmit={(event)=>{event.preventDefault(); void createBranch(event.currentTarget);}}>
                <Field label="Nome"><input name="name" placeholder="Ex.: Loja Cuiabá" required/></Field>
                <Field label="Código"><input name="code" placeholder="CGB01"/></Field>
                <Field label="Cidade"><input name="city" placeholder="Cuiabá"/></Field>
                <Field label="UF"><input name="state" maxLength={2} placeholder="MT"/></Field>
                <Field label="Fuso horário" wide><TimezoneSelect name="timezone" value="America/Cuiaba" options={timezoneOptions}/></Field>
                <div className="form-v2-actions wide"><button className="button-v2 primary" disabled={saving}><Plus size={14}/> Criar filial</button></div>
              </form>
            </>
          ) : null}

          {tab === "hours" ? (
            <>
              <SectionTitle title="Horário comercial" description="Usado por automações, disponibilidade e regras de atendimento."/>
              <div className="inline-control-v2">
                <label>Filial</label>
                <select value={selectedBranchId} onChange={(e)=>setSelectedBranchId(e.target.value)}>
                  {branches.map((branch)=><option key={branch.id} value={branch.id}>{branch.name}</option>)}
                </select>
              </div>
              <div className="hours-v2">
                {branchHours.map((item)=>(
                  <div className="hours-v2-row" key={item.day}>
                    <div className="hours-v2-day">
                      <button
                        className={item.enabled ? "switch-v2 on" : "switch-v2"}
                        onClick={()=>updateHour(item.day,"enabled",!item.enabled)}
                        type="button"
                        aria-label={`Ativar ${item.label}`}
                      ><span/></button>
                      <strong>{item.label}</strong>
                    </div>
                    {item.enabled ? (
                      <div className="hours-v2-times">
                        <input type="time" value={item.opensAt} onChange={(e)=>updateHour(item.day,"opens_at",e.target.value)}/>
                        <span>até</span>
                        <input type="time" value={item.closesAt} onChange={(e)=>updateHour(item.day,"closes_at",e.target.value)}/>
                      </div>
                    ) : <span className="closed-v2">Fechado</span>}
                  </div>
                ))}
              </div>
              <FooterAction onClick={()=>void saveHours()} saving={saving}/>
            </>
          ) : null}

          {tab === "automation" ? (
            <>
              <SectionTitle title="Automação assistida" description="Defina até onde o sistema pode agir sem aprovação humana."/>
              <div className="setting-v2-row">
                <div><strong>Interpretação automática</strong><span>Identifica peça, veículo e informações faltantes.</span></div>
                <button className={automation.enabled ? "switch-v2 on" : "switch-v2"} onClick={()=>setAutomation({...automation,enabled:!automation.enabled})}><span/></button>
              </div>
              <div className="setting-v2-row">
                <div><strong>Responder sem aprovação</strong><span>Somente quando o match superar a confiança mínima.</span></div>
                <button className={automation.autoReply ? "switch-v2 on" : "switch-v2"} onClick={()=>setAutomation({...automation,autoReply:!automation.autoReply})}><span/></button>
              </div>
              <div className="confidence-v2">
                <div><strong>Confiança mínima</strong><span>Consultas abaixo desse nível seguem para revisão humana.</span></div>
                <div className="confidence-v2-control">
                  <input type="range" min="0.5" max="0.99" step="0.01" value={automation.confidence} onChange={(e)=>setAutomation({...automation,confidence:Number(e.target.value)})}/>
                  <strong>{Math.round(automation.confidence*100)}%</strong>
                </div>
              </div>
              <FooterAction onClick={()=>void saveAutomation()} saving={saving}/>
            </>
          ) : null}

          {tab === "integrations" ? (
            <>
              <SectionTitle title="Integrações" description="Conectores da operação. Credenciais sensíveis nunca ficam expostas no navegador."/>
              <div className="integration-v2-grid">
                <IntegrationCard provider="whatsapp" title="WhatsApp Cloud API" description="Mensagens, templates e atendimento." rows={integrations}/>
                <IntegrationCard provider="giancar" title="Catálogo Giancar" description="Fonte de aplicações e códigos." rows={integrations}/>
                <IntegrationCard provider="erp" title="ERP / Preço / Estoque" description="Sincronização comercial." rows={integrations}/>
                <IntegrationCard provider="webhook" title="Webhooks" description="Eventos externos e automações." rows={integrations}/>
              </div>
            </>
          ) : null}

          {tab === "profile" ? (
            <>
              <SectionTitle title="Meu fuso horário" description="Opcional. Se vazio, o sistema usa o fuso da filial e depois o da empresa."/>
              <Field label="Sobrescrever fuso da operação" wide>
                <select value={personalTimezone} onChange={(e)=>setPersonalTimezone(e.target.value)}>
                  <option value="">Usar fuso da filial/empresa</option>
                  {timezoneOptions.map((tz)=><option key={tz.name} value={tz.name}>{tz.label} · {tz.utc_label} · {tz.region_hint}</option>)}
                </select>
              </Field>
              <div className="timezone-info-v2"><MapPin size={15}/><span>Para clientes do Mato Grosso, escolha <strong>Cuiabá · UTC-04:00</strong> na filial correspondente.</span></div>
              <FooterAction onClick={()=>void saveProfileTimezone()} saving={saving}/>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return <div className="section-title-v2"><h2>{title}</h2><p>{description}</p></div>;
}

function Field({ label, children, wide=false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={wide ? "field-v2 wide" : "field-v2"}><span>{label}</span>{children}</label>;
}

function TimezoneSelect({
  value,
  options,
  onChange,
  name,
}: {
  value: string;
  options: Timezone[];
  onChange?: (value: string) => void;
  name?: string;
}) {
  return (
    <select name={name} value={value} onChange={(e)=>onChange?.(e.target.value)}>
      {options.map((tz)=><option key={tz.name} value={tz.name}>{tz.label} · {tz.utc_label} · {tz.region_hint}</option>)}
    </select>
  );
}

function FooterAction({ onClick, saving }: { onClick: ()=>void; saving: boolean }) {
  return <div className="settings-v2-footer"><button className="button-v2 primary" onClick={onClick} disabled={saving}><Save size={14}/>{saving ? "Salvando..." : "Salvar alterações"}</button></div>;
}

function IntegrationCard({
  provider,
  title,
  description,
  rows,
}: {
  provider: string;
  title: string;
  description: string;
  rows: Integration[];
}) {
  const item = rows.find((row)=>row.provider===provider);
  const connected = item?.status === "connected";
  return (
    <div className="integration-v2-card">
      <div className="integration-v2-head">
        <div className="integration-v2-icon"><Wifi size={17}/></div>
        <span className={connected ? "status-v2 connected" : "status-v2"}>{connected ? "Conectado" : item?.status || "Não configurado"}</span>
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
      <button className="button-v2 secondary" type="button">{connected ? "Gerenciar" : "Configurar"}</button>
    </div>
  );
}
