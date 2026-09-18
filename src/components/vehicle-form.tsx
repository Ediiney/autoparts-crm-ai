"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Save } from "lucide-react";

type Customer = { id: string; name: string };
type VehicleInput = {
  id?: string;
  customerId: string;
  brand: string;
  model: string;
  year: string;
  modelYear: string;
  engine: string;
  version: string;
  transmission: string;
  fuel: string;
  plate: string;
  chassis: string;
  notes: string;
};

export function VehicleForm({ initial, customers }: { initial: VehicleInput; customers: Customer[] }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const editing = Boolean(initial.id);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    const year = value.year ? Number(value.year) : null;
    const modelYear = value.modelYear ? Number(value.modelYear) : null;

    try {
      const response = await fetch(editing ? `/api/vehicles/${initial.id}` : "/api/vehicles", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: value.customerId,
          brand: value.brand,
          model: value.model,
          year,
          modelYear,
          engine: value.engine,
          version: value.version,
          transmission: value.transmission,
          fuel: value.fuel,
          plate: value.plate,
          chassis: value.chassis,
          notes: value.notes,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível salvar.");

      setNotice({ type: "success", text: "Veículo salvo com sucesso." });
      const id = payload.vehicle?.id || initial.id;
      if (id) window.setTimeout(() => router.push(`/veiculos/${id}`), 350);
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Falha ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="product-form-v2" onSubmit={submit}>
      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Veículo</h2><p>Dados usados nas buscas de compatibilidade.</p></div></div>
        <div className="form-v2-grid">
          <label className="field-v2 wide"><span>Cliente *</span><select required value={value.customerId} onChange={(e)=>setValue({...value,customerId:e.target.value})}><option value="">Selecione</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="field-v2"><span>Marca *</span><input required value={value.brand} onChange={(e)=>setValue({...value,brand:e.target.value})} placeholder="Honda"/></label>
          <label className="field-v2"><span>Modelo *</span><input required value={value.model} onChange={(e)=>setValue({...value,model:e.target.value})} placeholder="Civic"/></label>
          <label className="field-v2"><span>Ano fabricação</span><input inputMode="numeric" value={value.year} onChange={(e)=>setValue({...value,year:e.target.value})}/></label>
          <label className="field-v2"><span>Ano modelo</span><input inputMode="numeric" value={value.modelYear} onChange={(e)=>setValue({...value,modelYear:e.target.value})}/></label>
          <label className="field-v2"><span>Motor</span><input value={value.engine} onChange={(e)=>setValue({...value,engine:e.target.value})} placeholder="1.8 Flex"/></label>
          <label className="field-v2"><span>Versão</span><input value={value.version} onChange={(e)=>setValue({...value,version:e.target.value})}/></label>
          <label className="field-v2"><span>Câmbio</span><input value={value.transmission} onChange={(e)=>setValue({...value,transmission:e.target.value})}/></label>
          <label className="field-v2"><span>Combustível</span><input value={value.fuel} onChange={(e)=>setValue({...value,fuel:e.target.value})}/></label>
          <label className="field-v2"><span>Placa</span><input value={value.plate} onChange={(e)=>setValue({...value,plate:e.target.value.toUpperCase()})}/></label>
          <label className="field-v2"><span>Chassi</span><input value={value.chassis} onChange={(e)=>setValue({...value,chassis:e.target.value.toUpperCase()})}/></label>
          <label className="field-v2 wide"><span>Observações</span><textarea rows={4} value={value.notes} onChange={(e)=>setValue({...value,notes:e.target.value})}/></label>
        </div>
      </section>

      {notice ? <div className={`notice-v2 ${notice.type}`}>{notice.type === "success" ? <Check size={14}/> : null}{notice.text}</div> : null}
      <div className="product-form-v2-footer"><button className="button-v2 primary" disabled={saving}><Save size={14}/>{saving ? "Salvando..." : "Salvar veículo"}</button></div>
    </form>
  );
}
