import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button, Card, StatusBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/company/current-company";
import { PackageSearch, Plus, Upload } from "lucide-react";

export default async function CatalogoPage(){
  const company = await getCurrentCompany();
  if (!company) return null;

  const supabase = await createClient();
  const { data: products, count } = await supabase
    .from("products")
    .select("id,sku,name,brand,source,original_code", { count: "exact" })
    .eq("company_id", company.id)
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(30);

  const rows = products ?? [];
  const ids = rows.map((product) => product.id);

  const [pricesResult, stockResult, appsResult] = ids.length
    ? await Promise.all([
        supabase.from("product_prices").select("product_id,price,valid_from").eq("company_id", company.id).in("product_id", ids).order("valid_from", { ascending: false }),
        supabase.from("product_inventory").select("product_id,quantity,reserved").eq("company_id", company.id).in("product_id", ids),
        supabase.from("vehicle_applications").select("product_id,vehicle_brand,vehicle_model,year_start,year_end").eq("company_id", company.id).in("product_id", ids),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const prices = new Map<string, number>();
  for (const row of pricesResult.data ?? []) {
    if (!prices.has(row.product_id)) prices.set(row.product_id, Number(row.price));
  }

  const stock = new Map<string, number>();
  for (const row of stockResult.data ?? []) {
    stock.set(row.product_id, (stock.get(row.product_id) ?? 0) + Number(row.quantity) - Number(row.reserved));
  }

  const apps = new Map<string, string>();
  for (const app of appsResult.data ?? []) {
    if (!apps.has(app.product_id)) {
      const years = app.year_start || app.year_end
        ? `${app.year_start ?? ""}${app.year_end && app.year_end !== app.year_start ? `–${app.year_end}` : ""}`
        : "";
      apps.set(app.product_id, [app.vehicle_brand, app.vehicle_model, years].filter(Boolean).join(" "));
    }
  }

  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <>
      <PageHeader
        eyebrow="Base de conhecimento"
        title="Catálogo de peças"
        description="Produtos, códigos, aplicações veiculares, preços e aliases usados pela IA."
        actions={<><Link className="button secondary" href="/catalogo/importar"><Upload size={15}/>Importar catálogo</Link><Button icon={<Plus size={15}/>}>Nova peça</Button></>}
      />

      <div className="toolbar">
        <div className="toolbar-right"><StatusBadge tone="success">{count ?? 0} produtos ativos</StatusBadge></div>
      </div>

      {rows.length ? (
        <div className="catalog-grid">
          {rows.map((product)=>(
            <Card className="product-card" key={product.id}>
              <div className="product-thumb"><PackageSearch/></div>
              <div className="product-meta"><StatusBadge tone="info">{product.source || "Manual"}</StatusBadge><span className="quote-number">{product.sku}</span></div>
              <div><h3>{product.name}</h3><p>{apps.get(product.id) || product.brand || product.original_code || "Aplicação ainda não cadastrada"}</p></div>
              <div className="product-bottom">
                <div>
                  <div className="product-price">{prices.has(product.id) ? money.format(prices.get(product.id)!) : "Sem preço"}</div>
                  <div className={(stock.get(product.id) ?? 0) > 0 ? "product-stock stock-good" : "product-stock stock-zero"}>
                    {stock.has(product.id) ? `${stock.get(product.id)} unidades disponíveis` : "Sem saldo cadastrado"}
                  </div>
                </div>
                <Button variant="secondary">Detalhes</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card><div className="empty-state"><PackageSearch size={30}/><strong>Seu catálogo está vazio</strong><p>Use “Importar catálogo” para carregar produtos e aplicações da sua fonte.</p></div></Card>
      )}
    </>
  );
}
