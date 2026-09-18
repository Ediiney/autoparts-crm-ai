import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  CarFront,
  CircleDollarSign,
  Hash,
  Package,
  Tags,
} from "lucide-react";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { createClient } from "@/lib/supabase/server";
import { ProductPriceEditor } from "@/components/product-price-editor";

function money(value:number){
  return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value);
}

export default async function ProductDetailPage({params}:{params:Promise<{id:string}>}){
  const workspace=await getWorkspaceContext();if(!workspace)return null;
  const {id}=await params;const supabase=await createClient();

  const {data:product}=await supabase.from("products")
    .select("id,sku,name,brand,manufacturer,original_code,barcode,description,source,category_id,created_at,updated_at,active")
    .eq("company_id",workspace.company.id).eq("id",id).maybeSingle();
  if(!product)notFound();

  const [categoryResult,appsResult,aliasesResult,pricesResult,inventoryResult,warehousesResult,mediaResult]=await Promise.all([
    product.category_id?supabase.from("product_categories").select("name").eq("id",product.category_id).maybeSingle():Promise.resolve({data:null}),
    supabase.from("vehicle_applications").select("id,vehicle_brand,vehicle_model,year_start,year_end,engine,version,side,axle,position,notes").eq("company_id",workspace.company.id).eq("product_id",id).order("vehicle_brand"),
    supabase.from("product_aliases").select("id,alias,source").eq("company_id",workspace.company.id).eq("product_id",id).order("alias"),
    supabase.from("product_prices").select("id,branch_id,price,price_type,cost,valid_from,valid_to,source").eq("company_id",workspace.company.id).eq("product_id",id).order("valid_from",{ascending:false}),
    supabase.from("product_inventory").select("warehouse_id,quantity,reserved,updated_at").eq("company_id",workspace.company.id).eq("product_id",id),
    supabase.from("warehouses").select("id,name,code,branch_id").eq("company_id",workspace.company.id),
    supabase.from("product_media").select("id,url,alt_text,is_primary,sort_order").eq("company_id",workspace.company.id).eq("product_id",id).eq("kind","image").order("is_primary",{ascending:false}).order("sort_order"),
  ]);

  const warehouseMap=new Map((warehousesResult.data??[]).map(w=>[w.id,w]));
  const branchId=workspace.branch?.id??null;
  const now=Date.now();
  const activePrices=(pricesResult.data??[]).filter(price=>{
    const starts=new Date(price.valid_from).getTime()<=now;
    const ends=!price.valid_to||new Date(price.valid_to).getTime()>now;
    return starts&&ends;
  });
  const currentPrice=
    activePrices.find(price=>price.branch_id===branchId) ??
    activePrices.find(price=>price.branch_id===null);

  const stockRows=(inventoryResult.data??[]).filter(item=>{
    const warehouse=warehouseMap.get(item.warehouse_id);
    return !branchId||warehouse?.branch_id===branchId;
  });
  const available=stockRows.reduce((sum,row)=>sum+Number(row.quantity)-Number(row.reserved),0);
  const primaryMedia=mediaResult.data?.[0];

  return <div className="product-detail-v2">
    <div className="detail-breadcrumb-v2"><Link href="/catalogo"><ArrowLeft size={14}/> Catálogo</Link><span>/</span><span>{product.sku}</span></div>

    <div className="product-detail-v2-head">
      <div className="product-detail-v2-identity">
        <div className="product-detail-v2-media">
          {primaryMedia?(
            // eslint-disable-next-line @next/next/no-img-element
            <img src={primaryMedia.url} alt={primaryMedia.alt_text||product.name}/>
          ):<Package size={32}/>}
        </div>
        <div>
          <span className="overline-v2">{categoryResult.data?.name||product.source||"Produto"}</span>
          <h1>{product.name}</h1>
          <div className="detail-tags-v2">
            <span><Hash size={12}/>{product.sku}</span>
            {product.original_code?<span>OEM {product.original_code}</span>:null}
            {product.brand?<span>{product.brand}</span>:null}
          </div>
        </div>
      </div>
      <Link href={`/catalogo/${id}/editar`} className="button-v2 secondary">Editar produto</Link>
    </div>

    <div className="detail-metrics-v2">
      <Metric icon={<CircleDollarSign size={17}/>} label="Preço atual" value={currentPrice?money(Number(currentPrice.price)):"A definir"} sub={currentPrice?.source||workspace.branch?.name||"Empresa"}/>
      <Metric icon={<Boxes size={17}/>} label="Disponível" value={`${available} un.`} sub={stockRows.length?`${stockRows.length} local(is)`:"Sem saldo"}/>
      <Metric icon={<CarFront size={17}/>} label="Aplicações" value={String(appsResult.data?.length??0)} sub="Compatibilidades cadastradas"/>
      <Metric icon={<Tags size={17}/>} label="Aliases" value={String(aliasesResult.data?.length??0)} sub="Termos de busca"/>
    </div>

    <div className="detail-grid-v2">
      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Dados do produto</h2><p>Informações de identificação e catálogo.</p></div></div>
        <div className="definition-grid-v2">
          <Def label="SKU" value={product.sku}/><Def label="Código original" value={product.original_code}/>
          <Def label="Fabricante" value={product.manufacturer}/><Def label="Marca" value={product.brand}/>
          <Def label="Código de barras" value={product.barcode}/><Def label="Origem" value={product.source}/>
        </div>
        {product.description?<div className="description-v2"><span>Descrição</span><p>{product.description}</p></div>:null}
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title price-panel-head-v3">
          <div><h2>Preço comercial</h2><p>Preço vigente da filial com histórico preservado.</p></div>
          <ProductPriceEditor
            productId={product.id}
            price={currentPrice?Number(currentPrice.price):null}
            cost={currentPrice?.cost===null||currentPrice?.cost===undefined?null:Number(currentPrice.cost)}
            source={currentPrice?.source??null}
          />
        </div>
        <div className="mini-table-v2">
          {(pricesResult.data??[]).length?(pricesResult.data??[]).slice(0,8).map(price=><div className="mini-table-v2-row" key={price.id}>
            <div><strong>{money(Number(price.price))}</strong><span>{price.price_type}</span></div>
            <span>{price.branch_id===branchId?workspace.branch?.name:"Geral"}</span>
            <span>{price.valid_to?"Histórico":price.source}</span>
          </div>):<EmptyLine text="Nenhum preço cadastrado. Defina o valor de venda acima."/>}
        </div>
      </section>

      <section className="panel-v2 span-2">
        <div className="panel-v2-title"><div><h2>Aplicações veiculares</h2><p>Compatibilidades usadas pela busca operacional.</p></div></div>
        {(appsResult.data??[]).length?<div className="application-grid-v2">{(appsResult.data??[]).map(app=><div className="application-v2" key={app.id}>
          <div className="application-v2-icon"><CarFront size={16}/></div>
          <div><strong>{app.vehicle_brand} {app.vehicle_model}</strong><span>{[app.year_start&&`${app.year_start}${app.year_end&&app.year_end!==app.year_start?`–${app.year_end}`:""}`,app.engine,app.version,app.side,app.axle].filter(Boolean).join(" · ")||"Aplicação genérica"}</span></div>
        </div>)}</div>:<EmptyLine text="Nenhuma aplicação cadastrada."/>}
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Estoque</h2><p>Saldo físico e reservado.</p></div></div>
        <div className="mini-table-v2">
          {stockRows.length?stockRows.map(row=>{
            const warehouse=warehouseMap.get(row.warehouse_id);
            return <div className="mini-table-v2-row" key={row.warehouse_id}><div><strong>{warehouse?.name||"Estoque"}</strong><span>{warehouse?.code||"—"}</span></div><span>{Number(row.quantity)} físico</span><span>{Number(row.quantity)-Number(row.reserved)} disp.</span></div>;
          }):<EmptyLine text="Nenhum saldo cadastrado."/>}
        </div>
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Aliases de busca</h2><p>Termos alternativos reconhecidos.</p></div></div>
        <div className="alias-list-v2">{(aliasesResult.data??[]).length?(aliasesResult.data??[]).map(alias=><span key={alias.id}>{alias.alias}</span>):<EmptyLine text="Nenhum alias cadastrado."/ >}</div>
      </section>
    </div>
  </div>;
}

function Metric({icon,label,value,sub}:{icon:React.ReactNode;label:string;value:string;sub:string}){return <div className="metric-v2"><div className="metric-v2-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>;}
function Def({label,value}:{label:string;value:string|null}){return <div className="definition-v2"><span>{label}</span><strong>{value||"—"}</strong></div>;}
function EmptyLine({text}:{text:string}){return <div className="empty-line-v2">{text}</div>;}
