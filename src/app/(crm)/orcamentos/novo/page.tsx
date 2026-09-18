import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { QuoteBuilder } from "./quote-builder";

export default async function NovoOrcamentoPage(){
  const workspace=await getWorkspaceContext();
  if(!workspace) return null;
  const supabase=await createClient();

  let customersQuery=supabase.from("customers").select("id,name,branch_id").eq("company_id",workspace.company.id).eq("active",true).order("name");
  if(workspace.branch?.id) customersQuery=customersQuery.or(`branch_id.eq.${workspace.branch.id},branch_id.is.null`);

  const [{data:customers},{data:products},{data:prices}]=await Promise.all([
    customersQuery,
    supabase.from("products").select("id,sku,name").eq("company_id",workspace.company.id).eq("active",true).order("name").limit(300),
    supabase.from("product_prices").select("product_id,branch_id,price,valid_from").eq("company_id",workspace.company.id).order("valid_from",{ascending:false}),
  ]);

  const branchId=workspace.branch?.id??null;
  const priceMap=new Map<string,{price:number;priority:number}>();
  for(const row of prices??[]){
    const priority=row.branch_id===branchId?2:row.branch_id===null?1:0;
    const current=priceMap.get(row.product_id);
    if(priority>0&&(!current||priority>current.priority)) priceMap.set(row.product_id,{price:Number(row.price),priority});
  }

  return <div>
    <div className="page-heading-v2"><div><span className="overline-v2">Comercial</span><h1>Novo orçamento</h1><p>Selecione cliente e produtos da filial atual.</p></div><Link href="/orcamentos" className="button-v2 secondary"><ArrowLeft size={14}/> Voltar</Link></div>
    <QuoteBuilder
      companyId={workspace.company.id}
      customers={customers??[]}
      products={(products??[]).map(p=>({...p,price:priceMap.get(p.id)?.price??null}))}
    />
  </div>;
}
