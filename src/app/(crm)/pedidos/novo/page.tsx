import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { OrderBuilder } from "./order-builder";

type BuilderData={
  customers?:Array<{id:string;name:string;whatsapp:string|null;phone:string|null;email:string|null}>;
  products?:Array<{
    id:string;sku:string;name:string;original_code:string|null;source:string|null;
    price:number|null;cost:number|null;price_source:string|null;available:number|null;
    application_label:string|null;
  }>;
};

export default async function NovoPedidoPage(){
  const workspace=await getWorkspaceContext();
  if(!workspace)return null;
  const supabase=await createClient();
  const {data,error}=await supabase.rpc("get_quote_builder_data",{
    p_branch_id:workspace.branch?.id??undefined,
    p_product_limit:500,
  });
  if(error)throw error;
  const payload=(data??{}) as unknown as BuilderData;

  return <div>
    <div className="page-heading-v2">
      <div><span className="overline-v2">Comercial</span><h1>Novo pedido</h1><p>Venda direta com preço negociado, entrega e pagamento.</p></div>
      <Link href="/pedidos" className="button-v2 secondary"><ArrowLeft size={14}/> Voltar</Link>
    </div>
    <OrderBuilder customers={payload.customers??[]} products={payload.products??[]}/>
  </div>;
}
