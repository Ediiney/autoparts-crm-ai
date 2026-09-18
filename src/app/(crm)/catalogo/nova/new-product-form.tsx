"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ExternalLink,
  PackagePlus,
  Search,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import styles from "./new-product-form.module.css";

type ReferenceApplication = {
  brand?: string;
  model?: string;
  yearStart?: number;
  yearEnd?: number;
  engine?: string;
  version?: string;
};

type ReferenceItem = {
  id: string;
  provider: string;
  code: string;
  name: string;
  category?: string | null;
  manufacturer?: string | null;
  originalCode?: string | null;
  applicationText?: string | null;
  applications?: ReferenceApplication[];
  sourceUrl?: string | null;
};

type Fields = {
  sku: string;
  name: string;
  category: string;
  manufacturer: string;
  brand: string;
  originalCode: string;
  barcode: string;
  description: string;
  price: string;
  stock: string;
  vehicleBrand: string;
  vehicleModel: string;
  yearStart: string;
  yearEnd: string;
  engine: string;
  version: string;
  side: string;
  axle: string;
  position: string;
};

const emptyFields: Fields = {
  sku: "",
  name: "",
  category: "",
  manufacturer: "",
  brand: "",
  originalCode: "",
  barcode: "",
  description: "",
  price: "",
  stock: "",
  vehicleBrand: "",
  vehicleModel: "",
  yearStart: "",
  yearEnd: "",
  engine: "",
  version: "",
  side: "",
  axle: "",
  position: "",
};

export function NewProductForm() {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReferenceItem[]>([]);
  const [selected, setSelected] = useState<ReferenceItem | null>(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (query.trim().length < 2 || selected) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/catalog/reference?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        const payload = await response.json();
        if (response.ok) setResults(payload.results ?? []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
      } finally {
        setSearching(false);
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, selected]);

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function chooseReference(item: ReferenceItem) {
    const first = item.applications?.[0];

    setSelected(item);
    setQuery(`${item.code} · ${item.name}`);
    setResults([]);
    setFields((current) => ({
      ...current,
      sku: item.code,
      name: item.name,
      category: item.category ?? "",
      manufacturer: item.manufacturer ?? "Giancar",
      brand: item.manufacturer ?? "Giancar",
      originalCode: item.originalCode ?? "",
      description: [
        item.name,
        item.applicationText ? `Aplicações Giancar: ${item.applicationText}` : "",
      ].filter(Boolean).join("\n"),
      vehicleBrand: first?.brand ?? "",
      vehicleModel: first?.model ?? "",
      yearStart: first?.yearStart ? String(first.yearStart) : "",
      yearEnd: first?.yearEnd ? String(first.yearEnd) : "",
      engine: first?.engine ?? "",
      version: first?.version ?? "",
    }));
  }

  function clearReference() {
    setSelected(null);
    setQuery("");
    setResults([]);
  }

  function number(value: string) {
    const normalized = value.replace(",", ".").trim();
    return normalized ? Number(normalized) : undefined;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/catalog/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceId: selected?.id,
          sku: fields.sku,
          name: fields.name,
          category: fields.category,
          manufacturer: fields.manufacturer,
          brand: fields.brand,
          originalCode: fields.originalCode,
          barcode: fields.barcode,
          description: fields.description,
          price: number(fields.price),
          stock: number(fields.stock),
          application: {
            brand: fields.vehicleBrand,
            model: fields.vehicleModel,
            yearStart: number(fields.yearStart),
            yearEnd: number(fields.yearEnd),
            engine: fields.engine,
            version: fields.version,
            side: fields.side || undefined,
            axle: fields.axle || undefined,
            position: fields.position,
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setMessage({ type: "error", text: payload.error || "Não foi possível salvar." });
        return;
      }

      setMessage({
        type: "success",
        text: selected
          ? "Referência Giancar vinculada ao catálogo da empresa."
          : "Peça cadastrada com sucesso.",
      });
      router.push(`/catalogo/${payload.product.id}`);
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Falha de conexão ao salvar a peça." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="product-form-v2" onSubmit={submit}>
      <section className={styles.referencePanel}>
        <div className={styles.referenceHead}>
          <div className={styles.referenceIcon}><Sparkles size={17} /></div>
          <div>
            <span>Catálogo de referência</span>
            <h2>Preencher com dados da Giancar</h2>
            <p>Busque por código, OEM, nome da peça ou aplicação veicular.</p>
          </div>
          <span className={styles.sourceBadge}>Fonte pública</span>
        </div>

        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setSelected(null);
              setQuery(nextQuery);
              if (nextQuery.trim().length < 2) setResults([]);
            }}
            placeholder="Ex.: 11230 D, 51 877 337, coxim, Grand Siena..."
          />
          {selected ? (
            <button type="button" onClick={clearReference} aria-label="Limpar referência">
              <X size={14} />
            </button>
          ) : null}
        </div>

        {searching ? <div className={styles.searchState}>Consultando referência...</div> : null}

        {!selected && results.length > 0 ? (
          <div className={styles.results}>
            {results.map((item) => (
              <button type="button" key={item.id} onClick={() => chooseReference(item)}>
                <div className={styles.resultCode}>
                  <strong>{item.code}</strong>
                  <span>{item.originalCode || "Sem OEM"}</span>
                </div>
                <div className={styles.resultCopy}>
                  <strong>{item.name}</strong>
                  <span>{item.applicationText || "Aplicação não informada"}</span>
                </div>
                <span className={styles.resultAction}>Usar</span>
              </button>
            ))}
          </div>
        ) : null}

        {selected ? (
          <div className={styles.selectedReference}>
            <div>
              <span>Referência selecionada</span>
              <strong>{selected.code} · {selected.name}</strong>
              <p>{selected.applicationText}</p>
              <small>
                {selected.applications?.length ?? 0} aplicação(ões) serão vinculadas automaticamente.
              </small>
            </div>
            {selected.sourceUrl ? (
              <a href={selected.sourceUrl} target="_blank" rel="noreferrer">
                Ver fonte <ExternalLink size={12} />
              </a>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title">
          <PackagePlus size={17} />
          <div><h2>Identificação</h2><p>Informações comerciais e de catálogo.</p></div>
        </div>
        <div className="form-v2-grid">
          <Field label="SKU *" value={fields.sku} onChange={(v) => update("sku", v)} placeholder="Código da peça" required />
          <Field label="Nome *" value={fields.name} onChange={(v) => update("name", v)} placeholder="Nome da peça" required />
          <Field label="Categoria" value={fields.category} onChange={(v) => update("category", v)} placeholder="Ex.: Coxim" />
          <Field label="Fabricante" value={fields.manufacturer} onChange={(v) => update("manufacturer", v)} placeholder="Fabricante" />
          <Field label="Marca da peça" value={fields.brand} onChange={(v) => update("brand", v)} placeholder="Marca" />
          <Field label="Código original" value={fields.originalCode} onChange={(v) => update("originalCode", v)} placeholder="OEM / original" />
          <Field label="Código de barras" value={fields.barcode} onChange={(v) => update("barcode", v)} />
          <label className="field-v2 wide">
            <span>Descrição</span>
            <textarea value={fields.description} onChange={(e) => update("description", e.target.value)} rows={3} />
          </label>
        </div>
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title">
          <div><h2>Preço e estoque inicial</h2><p>Dados internos da filial atual. A Giancar pública não informa esses valores.</p></div>
        </div>
        <div className="form-v2-grid">
          <Field label="Preço de venda" value={fields.price} onChange={(v) => update("price", v)} placeholder="329,90" inputMode="decimal" />
          <Field label="Quantidade" value={fields.stock} onChange={(v) => update("stock", v)} placeholder="10" inputMode="decimal" />
        </div>
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title">
          <div>
            <h2>Aplicação veicular</h2>
            <p>{selected ? "A primeira aplicação é exibida abaixo; todas as aplicações da referência serão salvas." : "Opcional. Cadastre a primeira compatibilidade do produto."}</p>
          </div>
        </div>
        <div className="form-v2-grid">
          <Field label="Montadora" value={fields.vehicleBrand} onChange={(v) => update("vehicleBrand", v)} placeholder="Fiat" />
          <Field label="Modelo" value={fields.vehicleModel} onChange={(v) => update("vehicleModel", v)} placeholder="Grand Siena" />
          <Field label="Ano inicial" value={fields.yearStart} onChange={(v) => update("yearStart", v)} inputMode="numeric" />
          <Field label="Ano final" value={fields.yearEnd} onChange={(v) => update("yearEnd", v)} inputMode="numeric" />
          <Field label="Motor" value={fields.engine} onChange={(v) => update("engine", v)} />
          <Field label="Versão" value={fields.version} onChange={(v) => update("version", v)} />
          <label className="field-v2"><span>Lado</span><select value={fields.side} onChange={(e) => update("side", e.target.value)}><option value="">Não se aplica</option><option value="left">Esquerdo</option><option value="right">Direito</option><option value="both">Ambos</option><option value="center">Central</option></select></label>
          <label className="field-v2"><span>Eixo</span><select value={fields.axle} onChange={(e) => update("axle", e.target.value)}><option value="">Não se aplica</option><option value="front">Dianteiro</option><option value="rear">Traseiro</option><option value="both">Ambos</option></select></label>
          <Field label="Posição" value={fields.position} onChange={(v) => update("position", v)} wide />
        </div>
      </section>

      {message ? (
        <div className={`notice-v2 ${message.type}`}>
          {message.type === "success" ? <Check size={14} /> : null}
          {message.text}
        </div>
      ) : null}

      <div className="product-form-v2-footer">
        <button className="button-v2 primary" disabled={saving}>
          <Save size={14} />{saving ? "Salvando..." : selected ? "Vincular e salvar" : "Salvar peça"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  inputMode,
  wide,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  wide?: boolean;
}) {
  return (
    <label className={`field-v2${wide ? " wide" : ""}`}>
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
      />
    </label>
  );
}
