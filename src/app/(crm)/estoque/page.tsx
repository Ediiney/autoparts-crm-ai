import Link from "next/link";
import { Boxes, PackageSearch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export default async function EstoquePage() {
  const workspace=await getWorkspaceContext();
  if(!workspace) return null;
  const supabase=await createClient();

  let warehouseQuery=supabase.from("warehouses").select("id,name,code,branch_id").eq("company_id",workspace.company.id).eq("active",true);
  if(workspace.branch?.id) warehouseQuery=warehouseQuery.eq("branch_id",workspace.branch.id);
  const {data:warehouses}=await warehouseQuery;
  const warehouseIds=(warehouses??[]).map(w=>w.id);

  const {data:inventory}=warehouseIds.length
    ? await supabase.from("product_inventory").select("product_id,warehouse_id,quantity,reserved,updated_at").eq("company_id",workspace.company.id).in("warehouse_id",warehouseIds).order("updated_at",{ascending:false}).limit(500)
    : {data:[]};

  const productIds=[...new Set((inventory??[]).map(row=>row.product_id))];
  const [productsResult,pricesResult]=productIds.length
    ? await Promise.all([
        supabase.from("products").select("id,sku,name").eq("company_id",workspace.company.id).in("id",productIds),
        supabase.from("product_prices").select("product_id,price,branch_id,valid_from").eq("company_id",workspace.company.id).in("product_id",productIds).order("valid_from",{ascending:false}),
      ])
    : [{data:[]},{data:[]}];

  const productMap=new Map((productsResult.data??[]).map(p=>[p.id,p]));
  const priceMap=new Map<string,{price:number;priority:number}>();
  for(const row of pricesResult.data??[]) {
    const priority=row.branch_id===workspace.branch?.id?2:row.branch_id===null?1:0;
    const current=priceMap.get(row.product_id);
    if(priority>0&&(!current||priority>current.priority)) priceMap.set(row.product_id,{price:Number(row.price),priority});
  }

  const aggregated=new Map<string,{quantity:number;reserved:number}>();
  for(const row of inventory??[]) {
    const current=aggregated.get(row.product_id)??{quantity:0,reserved:0};
    current.quantity+=Number(row.quantity);
    current.reserved+=Number(row.reserved);
    aggregated.set(row.product_id,current);
  }

  const rows=[...aggregated.entries()].map(([productId,value])=>({
    productId,
    sku:productMap.get(productId)?.sku??"—",
    name:productMap.get(productId)?.name??"Produto",
    quantity:value.quantity,
    reserved:value.reserved,
    available:value.quantity-value.reserved,
    price:priceMap.get(productId)?.price,
  }));

  const totalAvailable=rows.reduce((sum,row)=>sum+row.available,0);
  const lowStock=rows.filter(row=>row.available>0&&row.available<8).length;
  const outOfStock=rows.filter(row=>row.available<=0).length;
  const estimatedValue=rows.reduce((sum,row)=>sum+Math.max(0,row.available)*(row.price??0),0);
  const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});

  return <div>
    <div className="page-heading-v2">
      <div><span className="overline-v2">Operação</span><h1>Estoque</h1><p>Saldo da {workspace.branch?.name??"operação"} com reservas e valor estimado.</p></div>
      <Link href="/catalogo" className="button-v2 secondary"><PackageSearch size={14}/> Abrir catálogo</Link>
    </div>

    <div className="metric-grid-v2">
      <Metric label="Disponível" value={String(totalAvailable)} sub="unidades líquidas"/>
      <Metric label="Estoque baixo" value={String(lowStock)} sub="menos de 8 unidades"/>
      <Metric label="Esgotados" value={String(outOfStock)} sub="sem saldo disponível"/>
      <Metric label="Valor estimado" value={money.format(estimatedValue)} sub="preço vigente da filial"/>
    </div>

    {rows.length?<div className="table-v2-wrap"><table className="table-v2">
      <thead><tr><th>Produto</th><th>SKU</th><th>Físico</th><th>Reservado</th><th>Disponível</th><th>Preço</th><th>Status</th></tr></thead>
      <tbody>{rows.map(row=><tr key={row.productId}>
        <td><div className="product-cell-v2"><div className="product-cell-v2-icon"><Boxes size={16}/></div><div><strong>{row.name}</strong><span>{workspace.branch?.name??"Consolidado"}</span></div></div></td>
        <td><strong>{row.sku}</strong></td><td>{row.quantity}</td><td>{row.reserved}</td>
        <td><span className={row.available<=0?"stock-v2 zero":row.available<8?"stock-v2 low":"stock-v2"}>{row.available} un.</span></td>
        <td className="price-v2">{row.price!==undefined?money.format(row.price):"Sem preço"}</td>
        <td>{row.available<=0?"Esgotado":row.available<8?"Baixo":"Normal"}</td>
      </tr>)}</tbody>
    </table></div>:<div className="empty-v2"><div className="empty-v2-icon"><Boxes size={22}/></div><h2>Sem saldo cadastrado</h2><p>Inclua estoque nos produtos da filial para acompanhar a disponibilidade.</p><Link href="/catalogo" className="button-v2 primary">Abrir catálogo</Link></div>}
  </div>;
}
function Metric({label,value,sub}:{label:string;value:string;sub:string}) {
  return <div className="metric-v2"><div className="metric-v2-icon"><Boxes size={16}/></div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>;
}
