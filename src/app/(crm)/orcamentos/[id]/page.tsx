import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, ShoppingCart, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { QuoteStatusActions } from "./quote-status-actions";

const statusLabels:Record<string,string>={
  draft:"Rascunho",sent:"Enviado",accepted:"Aceito",rejected:"Recusado",
  expired:"Expirado",cancelled:"Cancelado",
};

export default async function OrcamentoDetailPage({params}:{params:Promise<{id:string}>}){
  const workspace=await getWorkspaceContext();if(!workspace)return null;
  const {id}=await params;const supabase=await createClient();

  const {data:quote}=await supabase
    .from("quotes")
    .select("id,number,customer_id,status,subtotal,discount,total,notes,expires_at,created_at")
    .eq("company_id",workspace.company.id).eq("id",id).maybeSingle();
  if(!quote)notFound();

  const [{data:items},{data:customer},{data:order}]=await Promise.all([
    supabase.from("quote_items").select("id,product_id,description,quantity,unit_price,discount,total").eq("company_id",workspace.company.id).eq("quote_id",id).order("created_at"),
    quote.customer_id
      ? supabase.from("customers").select("id,name,whatsapp,phone,email").eq("company_id",workspace.company.id).eq("id",quote.customer_id).maybeSingle()
      : Promise.resolve({data:null}),
    supabase.from("orders").select("id,number,status,total").eq("company_id",workspace.company.id).eq("quote_id",id).maybeSingle(),
  ]);

  const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
  const date=new Intl.DateTimeFormat("pt-BR",{timeZone:workspace.timezone,dateStyle:"short",timeStyle:"short"});

  return <div>
    <div className="detail-breadcrumb-v2"><Link href="/orcamentos"><ArrowLeft size={14}/> Orçamentos</Link><span>/</span><span>#{String(quote.number).padStart(5,"0")}</span></div>

    <div className="product-detail-v2-head order-detail-head-v3">
      <div className="product-detail-v2-identity">
        <div className="product-detail-v2-media"><FileText size={29}/></div>
        <div>
          <span className="overline-v2">Orçamento #{String(quote.number).padStart(5,"0")}</span>
          <h1>{customer?.name??"Cliente avulso"}</h1>
          <div className="detail-tags-v2">
            <span>{statusLabels[quote.status]??quote.status}</span>
            <span>{date.format(new Date(quote.created_at))}</span>
            {quote.expires_at?<span>Válido até {date.format(new Date(quote.expires_at))}</span>:null}
          </div>
        </div>
      </div>
      {order
        ? <Link href={`/pedidos/${order.id}`} className="button-v2 primary"><ShoppingCart size={14}/> Pedido #{String(order.number).padStart(5,"0")}</Link>
        : <QuoteStatusActions quoteId={quote.id} status={quote.status}/>}
    </div>

    {order?<div className="commerce-origin-banner-v3">
      <ShoppingCart size={16}/>
      <div><strong>Este orçamento já virou pedido.</strong><span>Os preços do pedido foram congelados no momento da conversão.</span></div>
      <Link href={`/pedidos/${order.id}`}>Abrir pedido</Link>
    </div>:null}

    <div className="detail-grid-v2">
      <section className="panel-v2 span-2">
        <div className="panel-v2-title"><div><h2>Itens da proposta</h2><p>Valores negociados neste orçamento, independentes de mudanças futuras no catálogo.</p></div></div>
        <div className="table-v2-wrap flat"><table className="table-v2">
          <thead><tr><th>Descrição</th><th>Qtd.</th><th>Unitário</th><th>Desconto</th><th>Total</th></tr></thead>
          <tbody>{(items??[]).map(item=><tr key={item.id}><td><strong>{item.description}</strong></td><td>{Number(item.quantity)}</td><td>{money.format(Number(item.unit_price))}</td><td>{money.format(Number(item.discount))}</td><td className="price-v2">{money.format(Number(item.total))}</td></tr>)}</tbody>
        </table></div>
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Resumo financeiro</h2><p>Totais da proposta.</p></div></div>
        <div className="quote-summary-v2">
          <div><span>Subtotal</span><strong>{money.format(Number(quote.subtotal))}</strong></div>
          <div><span>Desconto</span><strong>- {money.format(Number(quote.discount))}</strong></div>
          <div className="grand"><span>Total</span><strong>{money.format(Number(quote.total))}</strong></div>
        </div>
        {quote.notes?<div className="description-v2"><span>Observações</span><p>{quote.notes}</p></div>:null}
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Cliente</h2><p>Contato vinculado à proposta.</p></div></div>
        {customer?<Link className="owner-card-v2" href={`/clientes/${customer.id}`}>
          <div className="metric-v2-icon"><UserRound size={16}/></div>
          <div><strong>{customer.name}</strong><span>{customer.whatsapp||customer.phone||customer.email||"Sem contato"}</span></div>
        </Link>:<div className="empty-line-v2">Orçamento sem cliente vinculado.</div>}
        <div className="definition-grid-v2" style={{marginTop:12}}>
          <div className="definition-v2"><span>Validade</span><strong>{quote.expires_at?date.format(new Date(quote.expires_at)):"Sem prazo"}</strong></div>
          <div className="definition-v2"><span>Status</span><strong>{statusLabels[quote.status]??quote.status}</strong></div>
        </div>
      </section>
    </div>
  </div>;
}
