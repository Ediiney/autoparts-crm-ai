"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Database, LoaderCircle, PackagePlus, Search, Sparkles } from "lucide-react";

type SmartResult = {
  sourceType: "company" | "reference";
  id: string;
  productId: string | null;
  provider: string | null;
  code: string;
  name: string;
  originalCode: string | null;
  applicationText: string | null;
  manufacturer: string | null;
  price: number | null;
  availableQuantity: number | null;
  score: number;
};

function money(value: number | null) {
  if (value === null) return "Sem preço";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function SmartCatalogSearch({
  initialQuery,
  view,
  stock,
  source,
}: {
  initialQuery: string;
  view: "table" | "cards";
  stock: string;
  source: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SmartResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/catalog/smart-search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Falha na busca.");
        setResults(payload.results ?? []);
        setOpen(true);
      } catch (requestError) {
        if ((requestError as Error).name !== "AbortError") {
          setResults([]);
          setError("Não foi possível consultar a busca inteligente.");
        }
      } finally {
        setLoading(false);
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const companyResults = useMemo(
    () => results.filter((item) => item.sourceType === "company"),
    [results],
  );
  const referenceResults = useMemo(
    () => results.filter((item) => item.sourceType === "reference"),
    [results],
  );
  const hasResults = companyResults.length > 0 || referenceResults.length > 0;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ q: query.trim(), view, stock, source });
    setOpen(false);
    router.push(`/catalogo?${params.toString()}`);
  }

  async function importReference(item: SmartResult) {
    setImportingId(item.id);
    setError(null);
    try {
      const response = await fetch("/api/catalog/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceId: item.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível adicionar a referência.");
      setOpen(false);
      router.push(`/catalogo/${payload.product.id}`);
      router.refresh();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Não foi possível adicionar a referência.");
    } finally {
      setImportingId(null);
    }
  }

  return (
    <div
      className="smart-catalog-search"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <form className="catalog-search-v2 smart-catalog-search-form" onSubmit={submit}>
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            if (next.trim().length < 2) {
              setResults([]);
              setOpen(false);
              setError(null);
            } else {
              setOpen(true);
            }
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setOpen(true);
          }}
          placeholder="Nome, código, OEM ou veículo. Ex.: bandeja Corsa, NB310, 51877337..."
          autoComplete="off"
        />
        {loading ? <LoaderCircle className="search-spin-v2" size={15} /> : null}
        <button type="submit" className="smart-search-submit" aria-label="Pesquisar">
          <ArrowRight size={14} />
        </button>
      </form>

      {open && query.trim().length >= 2 ? (
        <div className="smart-search-popover">
          <div className="smart-search-hint">
            <Sparkles size={13} />
            <span>Nome, erro de digitação, SKU, OEM, aplicação e código sem pontuação.</span>
          </div>

          {companyResults.length > 0 ? (
            <section className="smart-search-section">
              <header><div><Database size={13}/><strong>Seu catálogo</strong></div><span>{companyResults.length}</span></header>
              {companyResults.map((item) => (
                <button
                  key={`company-${item.id}`}
                  type="button"
                  className="smart-search-result"
                  onClick={() => item.productId && router.push(`/catalogo/${item.productId}`)}
                >
                  <div className="smart-search-result-code">
                    <strong>{item.code}</strong>
                    <span>{item.originalCode ? `OEM ${item.originalCode}` : "Sem OEM"}</span>
                  </div>
                  <div className="smart-search-result-copy">
                    <strong>{item.name}</strong>
                    <span>{item.applicationText || "Aplicação não cadastrada"}</span>
                  </div>
                  <div className="smart-search-result-commercial">
                    <strong>{money(item.price)}</strong>
                    <span>{item.availableQuantity === null ? "Sem estoque informado" : `${Math.max(0,item.availableQuantity)} un.`}</span>
                  </div>
                  <ArrowRight size={14}/>
                </button>
              ))}
            </section>
          ) : null}

          {referenceResults.length > 0 ? (
            <section className="smart-search-section reference">
              <header><div><Sparkles size={13}/><strong>Catálogo de referência</strong></div><span>{referenceResults.length}</span></header>
              {referenceResults.map((item) => (
                <div className="smart-search-result reference" key={`reference-${item.id}`}>
                  <div className="smart-search-result-code">
                    <strong>{item.code}</strong>
                    <span>{item.originalCode ? `OEM ${item.originalCode}` : item.provider}</span>
                  </div>
                  <div className="smart-search-result-copy">
                    <strong>{item.name}</strong>
                    <span>{item.applicationText || "Aplicação não informada"}</span>
                  </div>
                  <div className="smart-search-result-source">
                    <span>{item.provider || "referência"}</span>
                    <small>Sem preço/estoque interno</small>
                  </div>
                  <button
                    type="button"
                    className="smart-search-import"
                    disabled={importingId === item.id}
                    onClick={() => importReference(item)}
                  >
                    {importingId === item.id ? <LoaderCircle className="search-spin-v2" size={13}/> : <PackagePlus size={13}/>}
                    Adicionar
                  </button>
                </div>
              ))}
            </section>
          ) : null}

          {!loading && !hasResults ? (
            <div className="smart-search-empty">
              <Search size={18}/>
              <strong>Nenhuma correspondência segura</strong>
              <span>Tente o código, o nome da peça ou algum dado do veículo.</span>
            </div>
          ) : null}

          {error ? <div className="smart-search-error">{error}</div> : null}
          {hasResults ? <div className="smart-search-footer"><CheckCircle2 size={12}/><span>Enter aplica a busca completa na listagem.</span></div> : null}
        </div>
      ) : null}
    </div>
  );
}
