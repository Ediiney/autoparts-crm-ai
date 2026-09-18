import Link from "next/link";
import {
  Filter,
  Grid2X2,
  List,
  Package,
  PackagePlus,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { createClient } from "@/lib/supabase/server";

type Params = {
  q?: string;
  view?: "table" | "cards";
  stock?: "all" | "available" | "low" | "zero";
  source?: string;
};

function money(value?: number) {
  if (value === undefined) return "Sem preço";
  return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value);
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Params> }) {
  const workspace=await getWorkspaceContext();
  if(!workspace) return null;
  const params=await searchParams;
  const supabase=await createClient();
  const q=params.q?.trim()||"";
  const view=params.view==="cards"?"cards":"table";

  let productsQuery=supabase
    .from("products")
    .select("id,sku,name,brand,manufacturer,original_code,source,category_id,updated_at",{count:"exact"})
    .eq("company_id",workspace.company.id)
    .eq("active",true)
    .order("updated_at",{ascending:false})
    .limit(80);

  if(q){
    const safe=q.replaceAll(","," ");
    productsQuery=productsQuery.or(`name.ilike.%${safe}%,sku.ilike.%${safe}%,original_code.ilike.%${safe}%`);
  }
  if(params.source) productsQuery=productsQuery.eq("source",params.source);

  const {data:products,count}=await productsQuery;
  const rows=products??[];
  const ids=rows.map(p=>p.id);

  const [pricesResult,inventoryResult,applicationsResult,mediaResult,warehousesResult,categoriesResult]=ids.length
    ? await Promise.all([
        supabase.from("product_prices").select("product_id,price,branch_id,valid_from,valid_to").eq("company_id",workspace.company.id).in("product_id",ids).order("valid_from",{ascending:false}),
        supabase.from("product_inventory").select("product_id,warehouse_id,quantity,reserved").eq("company_id",workspace.company.id).in("product_id",ids),
        supabase.from("vehicle_applications").select("product_id,vehicle_brand,vehicle_model,year_start,year_end,engine,side,axle").eq("company_id",workspace.company.id).in("product_id",ids),
        supabase.from("product_media").select("product_id,url,alt_text,is_primary,sort_order").eq("company_id",workspace.company.id).in("product_id",ids).eq("kind","image").order("is_primary",{ascending:false}).order("sort_order"),
        supabase.from("warehouses").select("id,branch_id").eq("company_id",workspace.company.id).eq("active",true),
        supabase.from("product_categories").select("id,name").eq("company_id",workspace.company.id),
      ])
    : [{data:[]},{data:[]},{data:[]},{data:[]},{data:[]},{data:[]}];

  const branchId=workspace.branch?.id??null;
  const prices=new Map<string,number>();
  const pricePriority=new Map<string,number>();
  for(const row of pricesResult.data??[]){
    if(row.valid_to && new Date(row.valid_to).getTime()<Date.now()) continue;
    const priority=row.branch_id===branchId?2:row.branch_id===null?1:0;
    if(priority>0 && priority>(pricePriority.get(row.product_id)??-1)){
      prices.set(row.product_id,Number(row.price));
      pricePriority.set(row.product_id,priority);
    }
  }

  const allowedWarehouseIds=new Set(
    (warehousesResult.data??[])
      .filter(w=>!branchId || w.branch_id===branchId)
      .map(w=>w.id)
  );
  const stock=new Map<string,number>();
  for(const row of inventoryResult.data??[]){
    if(branchId && !allowedWarehouseIds.has(row.warehouse_id)) continue;
    stock.set(row.product_id,(stock.get(row.product_id)??0)+Number(row.quantity)-Number(row.reserved));
  }

  const applications=new Map<string,string>();
  for(const app of applicationsResult.data??[]){
    if(applications.has(app.product_id)) continue;
    const years=app.year_start||app.year_end
      ? `${app.year_start??""}${app.year_end&&app.year_end!==app.year_start?`–${app.year_end}`:""}`
      : "";
    applications.set(app.product_id,[app.vehicle_brand,app.vehicle_model,years,app.engine].filter(Boolean).join(" · "));
  }

  const media=new Map<string,{url:string;alt:string|null}>();
  for(const item of mediaResult.data??[]){
    if(!media.has(item.product_id)) media.set(item.product_id,{url:item.url,alt:item.alt_text});
  }

  const categories=new Map((categoriesResult.data??[]).map(item=>[item.id,item.name]));
  const sourceOptions=[...new Set(rows.map(item=>item.source).filter(Boolean))] as string[];

  const filtered=rows.filter(product=>{
    const qty=stock.get(product.id)??0;
    if(params.stock==="available") return qty>0;
    if(params.stock==="low") return qty>0&&qty<8;
    if(params.stock==="zero") return qty<=0;
    return true;
  });

  return (
    <div className="catalog-v2">
      <div className="page-heading-v2">
        <div>
          <span className="overline-v2">Catálogo</span>
          <h1>Peças e aplicações</h1>
          <p>Base operacional para busca, compatibilidade, preço e disponibilidade.</p>
        </div>
        <div className="page-heading-v2-actions">
          <Link className="button-v2 secondary" href="/catalogo/importar"><Upload size={14}/> Importar</Link>
          <Link className="button-v2 primary" href="/catalogo/nova"><PackagePlus size={14}/> Nova peça</Link>
        </div>
      </div>

      <section className="catalog-toolbar-v2">
        <form className="catalog-search-v2" method="get">
          <Search size={16}/>
          <input name="q" defaultValue={q} placeholder="Buscar por peça, SKU ou código original"/>
          <input type="hidden" name="view" value={view}/>
        </form>

        <div className="catalog-filter-v2">
          <Filter size={14}/>
          <select name="stock" defaultValue={params.stock??"all"} form="catalog-filter-form">
            <option value="all">Todos os estoques</option>
            <option value="available">Disponível</option>
            <option value="low">Estoque baixo</option>
            <option value="zero">Sem estoque</option>
          </select>
        </div>

        <form id="catalog-filter-form" className="catalog-filter-form-v2" method="get">
          <input type="hidden" name="q" value={q}/>
          <input type="hidden" name="view" value={view}/>
          <select name="source" defaultValue={params.source??""}>
            <option value="">Todas as fontes</option>
            {sourceOptions.map(source=><option key={source} value={source}>{source}</option>)}
          </select>
          <button className="button-v2 secondary" type="submit"><SlidersHorizontal size={14}/> Aplicar</button>
        </form>

        <div className="view-toggle-v2">
          <Link className={view==="table"?"active":""} href={`/catalogo?q=${encodeURIComponent(q)}&stock=${params.stock??"all"}&source=${params.source??""}&view=table`}><List size={15}/></Link>
          <Link className={view==="cards"?"active":""} href={`/catalogo?q=${encodeURIComponent(q)}&stock=${params.stock??"all"}&source=${params.source??""}&view=cards`}><Grid2X2 size={15}/></Link>
        </div>
      </section>

      <div className="catalog-summary-v2">
        <span><strong>{count??0}</strong> produtos ativos</span>
        <span>{workspace.branch ? `Estoque: ${workspace.branch.name}` : "Estoque consolidado"}</span>
      </div>

      {filtered.length===0 ? (
        <div className="empty-v2">
          <div className="empty-v2-icon"><Package size={22}/></div>
          <h2>Nenhuma peça encontrada</h2>
          <p>Ajuste os filtros ou cadastre um novo produto.</p>
          <Link href="/catalogo/nova" className="button-v2 primary"><PackagePlus size={14}/> Nova peça</Link>
        </div>
      ) : view==="cards" ? (
        <div className="catalog-card-grid-v2">
          {filtered.map(product=>{
            const qty=stock.get(product.id)??0;
            const image=media.get(product.id);
            return (
              <Link href={`/catalogo/${product.id}`} className="product-card-v2" key={product.id}>
                <div className="product-card-v2-media">
                  {image ? <img src={image.url} alt={image.alt||product.name}/> : <Package size={26}/>}
                  <span className="product-source-v2">{product.source||"manual"}</span>
                </div>
                <div className="product-card-v2-body">
                  <div className="product-card-v2-code">{product.sku}</div>
                  <h3>{product.name}</h3>
                  <p>{applications.get(product.id)||categories.get(product.category_id??"")||"Aplicação não cadastrada"}</p>
                  <div className="product-card-v2-footer">
                    <strong>{money(prices.get(product.id))}</strong>
                    <span className={qty<=0?"stock-v2 zero":qty<8?"stock-v2 low":"stock-v2"}>{qty} un.</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="table-v2-wrap">
          <table className="table-v2">
            <thead><tr><th>Produto</th><th>SKU / original</th><th>Aplicação</th><th>Preço</th><th>Disponível</th><th>Origem</th><th></th></tr></thead>
            <tbody>
              {filtered.map(product=>{
                const qty=stock.get(product.id)??0;
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell-v2">
                        <div className="product-cell-v2-icon"><Package size={16}/></div>
                        <div><strong>{product.name}</strong><span>{categories.get(product.category_id??"")||product.brand||product.manufacturer||"Sem categoria"}</span></div>
                      </div>
                    </td>
                    <td><strong>{product.sku}</strong><span className="table-v2-muted">{product.original_code||"—"}</span></td>
                    <td>{applications.get(product.id)||"Sem aplicação"}</td>
                    <td className="price-v2">{money(prices.get(product.id))}</td>
                    <td><span className={qty<=0?"stock-v2 zero":qty<8?"stock-v2 low":"stock-v2"}>{qty} un.</span></td>
                    <td><span className="source-pill-v2">{product.source||"manual"}</span></td>
                    <td><Link className="row-action-v2" href={`/catalogo/${product.id}`}>Detalhes</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
