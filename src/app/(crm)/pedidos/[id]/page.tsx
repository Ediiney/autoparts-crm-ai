import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, ShoppingCart, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { OrderStatusActions } from "./order-status-actions";

export default async function PedidoDetailPage({params}:{params:Promise<{id:string}>}){
  const workspace=await getWorkspaceContext();if(!workspace)return null;
  const {id}=await params;const supabase=await createClient();
  const {data:order}=await supabase.from("orders").select("id,number,quote_id,customer_id,status,payment_status,subtotal,discount,shipping,total,notes,delivery_type,payment_method,delivery_address,created_at,confirmed_at,delivered_at").eq("company_id",workspace.company.id).eq("id",id).maybeSingle();
  if(!order)notFound();

  const [{data:items},{data:customer}]=await Promise.all([
    supabase.from("order_items").select("id,product_id,sku,description,quantity,unit_price,discount,total").eq("company_id",workspace.company.id).eq("order_id",id).order("created_at"),
    order.customer_id?supabase.from("customers").select("id,name,whatsapp,phone,email").eq("company_id",workspace.company.id).eq("id",order.customer_id).maybeSingle():Promise.resolve({data:null})
  ]);
  const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
  const date=new Intl.DateTimeFormat("pt-BR",{timeZone:workspace.timezone,dateStyle:"short",timeStyle:"short"});
  const statusLabels:Record<string,string>={draft:"Rascunho",confirmed:"Confirmado",picking:"Em separação",ready:"Pronto",delivered:"Entregue",cancelled:"Cancelado"};

  return <div>
    <div className="detail-breadcrumb-v2"><Link href="/pedidos"><ArrowLeft size={14}/> Pedidos</Link><span>/</span><span>#{String(order.number).padStart(5,"0")}</span></div>
    <div className="product-detail-v2-head order-detail-head-v3">
      <div className="product-detail-v2-identity">
        <div className="product-detail-v2-media"><ShoppingCart size={29}/></div>
        <div><span className="overline-v2">Pedido #{String(order.number).padStart(5,"0")}</span><h1>{customer?.name??"Cliente avulso"}</h1><div className="detail-tags-v2"><span>{statusLabels[order.status]??order.status}</span><span>{date.format(new Date(order.created_at))}</span>{order.quote_id?<span>Origem: orçamento</span>:<span>Venda direta</span>}</div></div>
      </div>
      <OrderStatusActions orderId={order.id} status={order.status} paymentStatus={order.payment_status}/>
    </div>

    <div className="detail-grid-v2">
      <section className="panel-v2 span-2">
        <div className="panel-v2-title"><div><h2>Itens do pedido</h2><p>Valores congelados no momento da confirmação da venda.</p></div></div>
        <div className="table-v2-wrap flat"><table className="table-v2"><thead><tr><th>SKU</th><th>Descrição</th><th>Qtd.</th><th>Unitário</th><th>Desconto</th><th>Total</th></tr></thead><tbody>{(items??[]).map(item=><tr key={item.id}><td><strong>{item.sku||"—"}</strong></td><td>{item.description}</td><td>{Number(item.quantity)}</td><td>{money.format(Number(item.unit_price))}</td><td>{money.format(Number(item.discount))}</td><td className="price-v2">{money.format(Number(item.total))}</td></tr>)}</tbody></table></div>
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Resumo financeiro</h2><p>Totais deste pedido.</p></div></div>
        <div className="quote-summary-v2"><div><span>Subtotal</span><strong>{money.format(Number(order.subtotal))}</strong></div><div><span>Desconto</span><strong>- {money.format(Number(order.discount))}</strong></div><div><span>Frete</span><strong>{money.format(Number(order.shipping))}</strong></div><div className="grand"><span>Total</span><strong>{money.format(Number(order.total))}</strong></div></div>
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Cliente e entrega</h2><p>Contato e condições operacionais.</p></div></div>
        {customer?<Link className="owner-card-v2" href={`/clientes/${customer.id}`}><div className="metric-v2-icon"><UserRound size={16}/></div><div><strong>{customer.name}</strong><span>{customer.whatsapp||customer.phone||customer.email||"Sem contato"}</span></div></Link>:<div className="empty-line-v2">Pedido sem cliente vinculado.</div>}
        <div className="definition-grid-v2" style={{marginTop:12}}>
          <div className="definition-v2"><span>Entrega</span><strong>{order.delivery_type==="pickup"?"Retirada":order.delivery_type==="delivery"?"Entrega local":"Transportadora"}</strong></div>
          <div className="definition-v2"><span>Pagamento</span><strong>{order.payment_method||"Não informado"}</strong></div>
          <div className="definition-v2"><span>Status pagamento</span><strong>{order.payment_status}</strong></div>
          {order.delivery_address?<div className="definition-v2"><span>Destino</span><strong>{order.delivery_address}</strong></div>:null}
        </div>
        {order.notes?<div className="description-v2"><span>Observações</span><p>{order.notes}</p></div>:null}
        {order.quote_id?<Link href={`/orcamentos/${order.quote_id}`} className="button-v2 secondary order-origin-v3"><FileText size={14}/> Abrir orçamento de origem</Link>:null}
      </section>
    </div>
  </div>;
}
