import { PageHeader } from "@/components/page-header";
import { Button, Card, StatusBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/company/current-company";
import { Boxes, Upload } from "lucide-react";

export default async function EstoquePage(){
  const company = await getCurrentCompany();
  if (!company) return null;

  const supabase = await createClient();
  const { data: inventory } = await supabase
    .from("product_inventory")
    .select("product_id,quantity,reserved,updated_at")
    .eq("company_id", company.id)
    .order("updated_at", { ascending: false })
    .limit(200);

  const productIds = [...new Set((inventory ?? []).map((row) => row.product_id))];

  const [productsResult, pricesResult] = productIds.length
    ? await Promise.all([
        supabase.from("products").select("id,sku,name").eq("company_id", company.id).in("id", productIds),
        supabase.from("product_prices").select("product_id,price,valid_from").eq("company_id", company.id).in("product_id", productIds).order("valid_from", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }];

  const productMap = new Map((productsResult.data ?? []).map((product) => [product.id, product]));
  const priceMap = new Map<string, number>();
  for (const row of pricesResult.data ?? []) {
    if (!priceMap.has(row.product_id)) priceMap.set(row.product_id, Number(row.price));
  }

  const aggregated = new Map<string, { quantity: number; reserved: number }>();
  for (const row of inventory ?? []) {
    const current = aggregated.get(row.product_id) ?? { quantity: 0, reserved: 0 };
    current.quantity += Number(row.quantity);
    current.reserved += Number(row.reserved);
    aggregated.set(row.product_id, current);
  }

  const rows = [...aggregated.entries()].map(([productId, values]) => {
    const product = productMap.get(productId);
    return {
      productId,
      sku: product?.sku ?? "—",
      name: product?.name ?? "Produto",
      quantity: values.quantity,
      reserved: values.reserved,
      available: values.quantity - values.reserved,
      price: priceMap.get(productId),
    };
  });

  const totalAvailable = rows.reduce((sum, row) => sum + row.available, 0);
  const lowStock = rows.filter((row) => row.available > 0 && row.available < 8).length;
  const outOfStock = rows.filter((row) => row.available <= 0).length;
  const estimatedValue = rows.reduce((sum, row) => sum + Math.max(0, row.available) * (row.price ?? 0), 0);
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <>
      <PageHeader eyebrow="Operação" title="Estoque" description="Disponibilidade física, saldo reservado e valor estimado." actions={<Button variant="secondary" icon={<Upload size={15}/>}>Atualizar estoque</Button>}/>

      <div className="stats-grid">
        <Card className="stat-card"><div className="stat-top"><div className="stat-icon"><Boxes size={18}/></div></div><div className="stat-value">{totalAvailable}</div><div className="stat-label">Unidades disponíveis</div><div className="stat-foot">Saldo líquido cadastrado</div></Card>
        <Card className="stat-card"><div className="stat-top"><div className="stat-icon amber"><Boxes size={18}/></div></div><div className="stat-value">{lowStock}</div><div className="stat-label">Itens com estoque baixo</div><div className="stat-foot">Menos de 8 unidades</div></Card>
        <Card className="stat-card"><div className="stat-top"><div className="stat-icon purple"><Boxes size={18}/></div></div><div className="stat-value">{outOfStock}</div><div className="stat-label">Itens esgotados</div><div className="stat-foot">Sem saldo disponível</div></Card>
        <Card className="stat-card"><div className="stat-top"><div className="stat-icon blue"><Boxes size={18}/></div></div><div className="stat-value">{money.format(estimatedValue)}</div><div className="stat-label">Valor estimado</div><div className="stat-foot">Com base no preço vigente</div></Card>
      </div>

      <Card>
        {rows.length ? (
          <div className="table-wrap"><table className="data-table">
            <thead><tr><th>SKU</th><th>Produto</th><th>Físico</th><th>Reservado</th><th>Disponível</th><th>Preço</th><th>Status</th></tr></thead>
            <tbody>{rows.map((row)=>{
              const status = row.available <= 0 ? "Esgotado" : row.available < 8 ? "Baixo" : "Normal";
              return <tr key={row.productId}><td>{row.sku}</td><td><strong>{row.name}</strong></td><td>{row.quantity}</td><td>{row.reserved}</td><td className={row.available<=0?"stock-zero":row.available<8?"stock-low":"stock-good"}>{row.available}</td><td className="money">{row.price ? money.format(row.price) : "Sem preço"}</td><td><StatusBadge tone={status==="Normal"?"success":status==="Baixo"?"warning":"danger"}>{status}</StatusBadge></td></tr>;
            })}</tbody>
          </table></div>
        ) : (
          <div className="empty-state"><Boxes size={30}/><strong>Nenhum saldo de estoque</strong><p>Carregue quantidades no catálogo para começar a acompanhar disponibilidade.</p></div>
        )}
      </Card>
    </>
  );
}
