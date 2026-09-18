import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CustomerForm } from "@/components/customer-form";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export default async function EditarClientePage({params}:{params:Promise<{id:string}>}) {
  const workspace=await getWorkspaceContext();
  if(!workspace) return null;
  const {id}=await params;
  const supabase=await createClient();
  const [{data:customer},{data:timezones}] = await Promise.all([
    supabase.from("customers").select("id,name,email,phone,whatsapp,document,notes,timezone,branch_id,active").eq("company_id",workspace.company.id).eq("id",id).maybeSingle(),
    supabase.from("supported_timezones").select("name,label,utc_label,region_hint").eq("active",true).order("sort_order"),
  ]);
  if(!customer) notFound();

  return <div>
    <div className="page-heading-v2"><div><span className="overline-v2">Clientes</span><h1>Editar cliente</h1><p>{customer.name}</p></div><Link href={`/clientes/${id}`} className="button-v2 secondary"><ArrowLeft size={14}/> Voltar</Link></div>
    <CustomerForm
      initial={{id:customer.id,name:customer.name,email:customer.email??"",phone:customer.phone??"",whatsapp:customer.whatsapp??"",document:customer.document??"",notes:customer.notes??"",timezone:customer.timezone??"",branchId:customer.branch_id??"",active:customer.active}}
      branches={workspace.branches.map(b=>({id:b.id,name:b.name}))}
      timezones={timezones??[]}
    />
  </div>;
}
