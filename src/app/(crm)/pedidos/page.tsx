import Link from "next/link";
import { CircleDollarSign, Clock3, PackageCheck, Plus, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

type OrderRow={
  id:string;number:number;quote_id:string|null;customer_id:string|null;status:string;
  payment_status:string;total:number;delivery_type:string;created_at:string;
  confirmed_at:string|null;delivered_at:string|null;customer_name:string;item_count:number;
};

const statusLabels:Record<string,string>={
  draft:"Rascunho",confirmed:"Confirmado",picking:"Separação",ready:"Pronto",
  delivered:"Entregue",cancelled:"Cancelado"
};
const paymentLabels:Record<string,string>={
  pending:"Pendente",partial:"Parcial",paid:"Pago",refunded:"Estornado",cancelled:"Cancelado"
};

function statusClass(status:string){
  if(status==="delivered"||status==="ready")return "commerce-status-v3 success";
  if(status==="cancelled")return "commerce-status-v3 danger";
  if(status==="picking")return "commerce-status-v3 warning";
  return "commerce-status-v3 info";
}

export default async function PedidosPage(){
  const workspace=await getWorkspaceContext();
  if(!workspace)return null;
  const supabase=await createClient();
  const {data,error}=await supabase.rpc("get_orders_page",{
    p_branch_id:workspace.branch?.id??undefined,
    p_limit:100,
  });
  if(error)throw error;
  const rows=((data??[]) as unknown as OrderRow[]);
  const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
  const date=new Intl.DateTimeFormat("pt-BR",{timeZone:workspace.timezone,day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
  const open=rows.filter(x=>!["delivered","cancelled"].includes(x.status));
  const delivered=rows.filter(x=>x.status==="delivered");
  const paid=rows.filter(x=>x.payment_status==="paid");
  const openValue=open.reduce((sum,x)=>sum+Number(x.total||0),0);

  return <div>
    <div className="page-heading-v2">
      <div>
        <span className="overline-v2">Comercial</span>
        <h1>Pedidos</h1>
        <p>Acompanhe venda, separação, pagamento e entrega em um único fluxo.</p>
      </div>
      <div className="page-heading-v2-actions">
        <Link href="/orcamentos" className="button-v2 secondary">Ver orçamentos</Link>
        <Link href="/pedidos/novo" className="button-v2 primary"><Plus size={14}/> Novo pedido</Link>
      </div>
    </div>

    <div className="commerce-metrics-v3">
      <div><span><ShoppingCart size={14}/> Em andamento</span><strong>{open.length}</strong><small>{money.format(openValue)}</small></div>
      <div><span><PackageCheck size={14}/> Entregues</span><strong>{delivered.length}</strong><small>pedidos concluídos</small></div>
      <div><span><CircleDollarSign size={14}/> Pagos</span><strong>{paid.length}</strong><small>pagamento confirmado</small></div>
      <div><span><Clock3 size={14}/> Total</span><strong>{rows.length}</strong><small>últimos pedidos</small></div>
    </div>

    <div className="commercial-tabs-v3">
      <button className="active">Todos <span>{rows.length}</span></button>
      <button>Em andamento <span>{open.length}</span></button>
      <button>Entregues <span>{delivered.length}</span></button>
    </div>

    {rows.length?<div className="table-v2-wrap commerce-table-v3">
      <table className="table-v2">
        <thead><tr><th>Pedido</th><th>Cliente</th><th>Itens</th><th>Total</th><th>Status</th><th>Pagamento</th><th>Data</th><th></th></tr></thead>
        <tbody>{rows.map(order=><tr key={order.id}>
          <td><div className="order-number-v3"><span>#{String(order.number).padStart(5,"0")}</span>{order.quote_id?<small>via orçamento</small>:<small>pedido direto</small>}</div></td>
          <td><strong>{order.customer_name||"Cliente avulso"}</strong></td>
          <td>{order.item_count} item{order.item_count===1?"":"s"}</td>
          <td className="price-v2">{money.format(Number(order.total||0))}</td>
          <td><span className={statusClass(order.status)}>{statusLabels[order.status]??order.status}</span></td>
          <td><span className={order.payment_status==="paid"?"commerce-status-v3 success":"commerce-status-v3 neutral"}>{paymentLabels[order.payment_status]??order.payment_status}</span></td>
          <td>{date.format(new Date(order.created_at))}</td>
          <td><Link prefetch={false} className="row-action-v2" href={`/pedidos/${order.id}`}>Abrir</Link></td>
        </tr>)}</tbody>
      </table>
    </div>:<div className="empty-v2">
      <div className="empty-v2-icon"><ShoppingCart size={22}/></div>
      <h2>Nenhum pedido ainda</h2>
      <p>Converta um orçamento aprovado ou registre uma venda direta.</p>
      <Link href="/pedidos/novo" className="button-v2 primary"><Plus size={14}/> Novo pedido</Link>
    </div>}
  </div>;
}
