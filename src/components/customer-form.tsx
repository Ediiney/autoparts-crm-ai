"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Save } from "lucide-react";

type Branch = { id: string; name: string };
type Timezone = { name: string; label: string; utc_label: string; region_hint: string | null };

type CustomerInput = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  document: string;
  notes: string;
  timezone: string;
  branchId: string;
  active?: boolean;
};

export function CustomerForm({
  initial,
  branches,
  timezones,
}: {
  initial: CustomerInput;
  branches: Branch[];
  timezones: Timezone[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const editing = Boolean(initial.id);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const response = await fetch(editing ? `/api/customers/${initial.id}` : "/api/customers", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value.name,
          email: value.email,
          phone: value.phone,
          whatsapp: value.whatsapp,
          document: value.document,
          notes: value.notes,
          timezone: value.timezone || null,
          branchId: value.branchId || null,
          active: value.active,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível salvar.");

      setNotice({ type: "success", text: "Cliente salvo com sucesso." });
      const id = payload.customer?.id || initial.id;
      if (id) window.setTimeout(() => router.push(`/clientes/${id}`), 350);
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Falha ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="product-form-v2" onSubmit={submit}>
      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Dados do cliente</h2><p>Contato e identificação.</p></div></div>
        <div className="form-v2-grid">
          <label className="field-v2 wide"><span>Nome *</span><input required value={value.name} onChange={(e)=>setValue({...value,name:e.target.value})}/></label>
          <label className="field-v2"><span>E-mail</span><input type="email" value={value.email} onChange={(e)=>setValue({...value,email:e.target.value})}/></label>
          <label className="field-v2"><span>CPF / CNPJ</span><input value={value.document} onChange={(e)=>setValue({...value,document:e.target.value})}/></label>
          <label className="field-v2"><span>Telefone</span><input value={value.phone} onChange={(e)=>setValue({...value,phone:e.target.value})}/></label>
          <label className="field-v2"><span>WhatsApp</span><input value={value.whatsapp} onChange={(e)=>setValue({...value,whatsapp:e.target.value})}/></label>
          <label className="field-v2"><span>Filial</span>
            <select value={value.branchId} onChange={(e)=>setValue({...value,branchId:e.target.value})}>
              <option value="">Sem filial específica</option>
              {branches.map((branch)=><option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
          </label>
          <label className="field-v2"><span>Fuso do cliente</span>
            <select value={value.timezone} onChange={(e)=>setValue({...value,timezone:e.target.value})}>
              <option value="">Herdar da filial/empresa</option>
              {timezones.map((tz)=><option key={tz.name} value={tz.name}>{tz.label} · {tz.utc_label} · {tz.region_hint}</option>)}
            </select>
          </label>
          <label className="field-v2 wide"><span>Observações</span><textarea rows={4} value={value.notes} onChange={(e)=>setValue({...value,notes:e.target.value})}/></label>
        </div>
      </section>

      {notice ? <div className={`notice-v2 ${notice.type}`}>{notice.type === "success" ? <Check size={14}/> : null}{notice.text}</div> : null}
      <div className="product-form-v2-footer"><button className="button-v2 primary" disabled={saving}><Save size={14}/>{saving ? "Salvando..." : "Salvar cliente"}</button></div>
    </form>
  );
}
