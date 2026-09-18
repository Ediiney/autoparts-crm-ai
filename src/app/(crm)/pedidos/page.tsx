import Link from "next/link";
import { ArrowUpRight, CircleDollarSign, Clock3, PackageCheck, Plus, ShoppingCart } from "lucide-react";
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

export default async function PedidosPage({
  searchParams,
}:{
  searchParams:Promise<{status?:string}>;
}){
  const workspace=await getWorkspaceContext();
  if(!workspace)return null;
  const params=await searchParams;
  const activeTab=params.status??"all";
  const supabase=await createClient();
  const {data,error}=await supabase.rpc("get_orders_page",{
    p_branch_id:workspace.branch?.id??undefined,
    p_limit:100,
  });
  if(error)throw error;

  const rows=((data??[]) as unknown as OrderRow[]);
  const open=rows.filter(x=>!["delivered","cancelled"].includes(x.status));
  const picking=rows.filter(x=>x.status==="picking");
  const ready=rows.filter(x=>x.status==="ready");
  const delivered=rows.filter(x=>x.status==="delivered");
  const paid=rows.filter(x=>x.payment_status==="paid");
  const filtered=activeTab==="open"?open
    :activeTab==="picking"?picking
      :activeTab==="ready"?ready
        :activeTab==="delivered"?delivered
          :rows;

  const openValue=open.reduce((sum,x)=>sum+Number(x.total||0),0);
  const deliveredValue=delivered.reduce((sum,x)=>sum+Number(x.total||0),0);
  const totalValue=rows.reduce((sum,x)=>sum+Number(x.total||0),0);
  const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
  const date=new Intl.DateTimeFormat("pt-BR",{timeZone:workspace.timezone,day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});

  return <div className="commercial-page-v5">
    <div className="page-heading-v2">
      <div>
        <span className="overline-v2">Comercial</span>
        <h1>Pedidos</h1>
        <p>Venda, separação, pagamento e entrega em um fluxo único.</p>
      </div>
      <div className="page-heading-v2-actions">
        <Link href="/orcamentos" className="button-v2 secondary">Ver orçamentos</Link>
        <Link href="/pedidos/novo" className="button-v2 primary"><Plus size={14}/> Novo pedido</Link>
      </div>
    </div>

    <section className="commercial-overview-v5 orders">
      <div className="commercial-overview-main-v5">
        <span>Volume comercial</span>
        <strong>{money.format(totalValue)}</strong>
        <p>Valor total dos pedidos recentes da filial selecionada.</p>
        <div className="commercial-overview-main-footer-v5">
          <div><span>Em andamento</span><strong>{money.format(openValue)}</strong></div>
          <div><span>Entregue</span><strong>{money.format(deliveredValue)}</strong></div>
        </div>
      </div>

      <div className="commercial-overview-stats-v5">
        <Metric icon={<ShoppingCart size={17}/>} label="Em andamento" value={String(open.length)} hint="pedidos ativos"/>
        <Metric icon={<PackageCheck size={17}/>} label="Prontos/entregues" value={String(ready.length+delivered.length)} hint="fluxo concluído"/>
        <Metric icon={<CircleDollarSign size={17}/>} label="Pagos" value={String(paid.length)} hint="pagamento confirmado"/>
      </div>
    </section>

    <section className="commercial-section-v5">
      <div className="commercial-toolbar-v5">
        <div className="commercial-tabs-v5">
          <Link className={activeTab==="all"?"active":""} href="/pedidos">Todos <span>{rows.length}</span></Link>
          <Link className={activeTab==="open"?"active":""} href="/pedidos?status=open">Em andamento <span>{open.length}</span></Link>
          <Link className={activeTab==="picking"?"active":""} href="/pedidos?status=picking">Separação <span>{picking.length}</span></Link>
          <Link className={activeTab==="ready"?"active":""} href="/pedidos?status=ready">Prontos <span>{ready.length}</span></Link>
          <Link className={activeTab==="delivered"?"active":""} href="/pedidos?status=delivered">Entregues <span>{delivered.length}</span></Link>
        </div>
        <div className="commercial-toolbar-meta-v5">
          <Clock3 size={14}/><span>{filtered.length} registros</span>
        </div>
      </div>

      {filtered.length?<div className="table-v2-wrap commercial-table-v5">
        <table className="table-v2">
          <thead><tr><th>Pedido</th><th>Cliente</th><th>Itens</th><th>Total</th><th>Operação</th><th>Pagamento</th><th>Data</th><th></th></tr></thead>
          <tbody>{filtered.map(order=><tr key={order.id}>
            <td>
              <div className="document-cell-v5 order">
                <span>PED</span>
                <div><strong>#{String(order.number).padStart(5,"0")}</strong><small>{order.quote_id?"via orçamento":"pedido direto"}</small></div>
              </div>
            </td>
            <td><strong>{order.customer_name||"Cliente avulso"}</strong></td>
            <td>{order.item_count} item{order.item_count===1?"":"s"}</td>
            <td className="price-v2">{money.format(Number(order.total||0))}</td>
            <td><span className={statusClass(order.status)}>{statusLabels[order.status]??order.status}</span></td>
            <td><span className={order.payment_status==="paid"?"commerce-status-v3 success":"commerce-status-v3 neutral"}>{paymentLabels[order.payment_status]??order.payment_status}</span></td>
            <td>{date.format(new Date(order.created_at))}</td>
            <td><Link className="row-action-v2" href={`/pedidos/${order.id}`}>Abrir <ArrowUpRight size={12}/></Link></td>
          </tr>)}</tbody>
        </table>
      </div>:<div className="empty-v2 commercial-empty-v5">
        <div className="empty-v2-icon"><ShoppingCart size={22}/></div>
        <h2>{rows.length?"Nenhum pedido neste estágio":"Nenhum pedido ainda"}</h2>
        <p>{rows.length?"Escolha outro estágio operacional.":"Converta um orçamento aprovado ou registre uma venda direta."}</p>
        {!rows.length?<Link href="/pedidos/novo" className="button-v2 primary"><Plus size={14}/> Novo pedido</Link>:null}
      </div>}
    </section>
  </div>;
}

function Metric({icon,label,value,hint}:{icon:React.ReactNode;label:string;value:string;hint:string}){
  return <div className="commercial-overview-metric-v5"><i>{icon}</i><div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div></div>;
}
