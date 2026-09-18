import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VehicleForm } from "@/components/vehicle-form";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export default async function NovoVeiculoPage({searchParams}:{searchParams:Promise<{customerId?:string}>}) {
  const workspace=await getWorkspaceContext();
  if(!workspace) return null;
  const supabase=await createClient();
  let query=supabase.from("customers").select("id,name,branch_id").eq("company_id",workspace.company.id).eq("active",true).order("name");
  if(workspace.branch?.id) query=query.or(`branch_id.eq.${workspace.branch.id},branch_id.is.null`);
  const {data:customers}=await query;
  const params=await searchParams;

  return <div>
    <div className="page-heading-v2"><div><span className="overline-v2">Veículos</span><h1>Adicionar veículo</h1><p>Associe o veículo a um cliente da operação.</p></div><Link href="/veiculos" className="button-v2 secondary"><ArrowLeft size={14}/> Voltar</Link></div>
    <VehicleForm initial={{customerId:params.customerId??"",brand:"",model:"",year:"",modelYear:"",engine:"",version:"",transmission:"",fuel:"",plate:"",chassis:"",notes:""}} customers={customers??[]}/>
  </div>;
}
