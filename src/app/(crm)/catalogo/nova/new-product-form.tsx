"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, PackagePlus, Save } from "lucide-react";

export function NewProductForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const data = new FormData(event.currentTarget);
    const number = (name: string) => {
      const value = String(data.get(name) || "").replace(",", ".");
      return value ? Number(value) : undefined;
    };

    try {
      const response = await fetch("/api/catalog/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: data.get("sku"),
          name: data.get("name"),
          category: data.get("category"),
          manufacturer: data.get("manufacturer"),
          brand: data.get("brand"),
          originalCode: data.get("originalCode"),
          barcode: data.get("barcode"),
          description: data.get("description"),
          price: number("price"),
          stock: number("stock"),
          application: {
            brand: data.get("vehicleBrand"),
            model: data.get("vehicleModel"),
            yearStart: number("yearStart"),
            yearEnd: number("yearEnd"),
            engine: data.get("engine"),
            version: data.get("version"),
            side: data.get("side") || undefined,
            axle: data.get("axle") || undefined,
            position: data.get("position"),
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setMessage({ type: "error", text: payload.error || "Não foi possível salvar." });
        return;
      }

      setMessage({ type: "success", text: "Peça cadastrada com sucesso." });
      window.setTimeout(() => router.push(`/catalogo/${payload.product.id}`), 450);
    } catch {
      setMessage({ type: "error", text: "Falha de conexão ao salvar a peça." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="product-form-v2" onSubmit={submit}>
      <section className="panel-v2">
        <div className="panel-v2-title"><PackagePlus size={17} /><div><h2>Identificação</h2><p>Informações comerciais e de catálogo.</p></div></div>
        <div className="form-v2-grid">
          <label className="field-v2"><span>SKU *</span><input name="sku" required placeholder="GIA-4721" /></label>
          <label className="field-v2"><span>Nome *</span><input name="name" required placeholder="Bandeja de suspensão" /></label>
          <label className="field-v2"><span>Categoria</span><input name="category" placeholder="Suspensão" /></label>
          <label className="field-v2"><span>Fabricante</span><input name="manufacturer" placeholder="Fabricante" /></label>
          <label className="field-v2"><span>Marca da peça</span><input name="brand" placeholder="Marca" /></label>
          <label className="field-v2"><span>Código original</span><input name="originalCode" placeholder="OEM / original" /></label>
          <label className="field-v2"><span>Código de barras</span><input name="barcode" /></label>
          <label className="field-v2 wide"><span>Descrição</span><textarea name="description" rows={3} /></label>
        </div>
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Preço e estoque inicial</h2><p>Vinculados à filial atual.</p></div></div>
        <div className="form-v2-grid">
          <label className="field-v2"><span>Preço de venda</span><input name="price" inputMode="decimal" placeholder="329,90" /></label>
          <label className="field-v2"><span>Quantidade</span><input name="stock" inputMode="decimal" placeholder="10" /></label>
        </div>
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Aplicação veicular</h2><p>Opcional. Cadastre a primeira compatibilidade do produto.</p></div></div>
        <div className="form-v2-grid">
          <label className="field-v2"><span>Montadora</span><input name="vehicleBrand" placeholder="Honda" /></label>
          <label className="field-v2"><span>Modelo</span><input name="vehicleModel" placeholder="Civic" /></label>
          <label className="field-v2"><span>Ano inicial</span><input name="yearStart" inputMode="numeric" placeholder="2007" /></label>
          <label className="field-v2"><span>Ano final</span><input name="yearEnd" inputMode="numeric" placeholder="2011" /></label>
          <label className="field-v2"><span>Motor</span><input name="engine" placeholder="1.8" /></label>
          <label className="field-v2"><span>Versão</span><input name="version" /></label>
          <label className="field-v2"><span>Lado</span><select name="side"><option value="">Não se aplica</option><option value="left">Esquerdo</option><option value="right">Direito</option><option value="both">Ambos</option><option value="center">Central</option></select></label>
          <label className="field-v2"><span>Eixo</span><select name="axle"><option value="">Não se aplica</option><option value="front">Dianteiro</option><option value="rear">Traseiro</option><option value="both">Ambos</option></select></label>
          <label className="field-v2 wide"><span>Posição</span><input name="position" /></label>
        </div>
      </section>

      {message ? <div className={`notice-v2 ${message.type}`}>{message.type === "success" ? <Check size={14} /> : null}{message.text}</div> : null}
      <div className="product-form-v2-footer"><button className="button-v2 primary" disabled={saving}><Save size={14} />{saving ? "Salvando..." : "Salvar peça"}</button></div>
    </form>
  );
}
