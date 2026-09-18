import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CustomerForm } from "@/components/customer-form";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export default async function NovoClientePage() {
  const workspace = await getWorkspaceContext();
  if (!workspace) return null;
  const supabase = await createClient();
  const { data: timezones } = await supabase.from("supported_timezones").select("name,label,utc_label,region_hint").eq("active",true).order("sort_order");

  return (
    <div>
      <div className="page-heading-v2">
        <div><span className="overline-v2">Clientes</span><h1>Novo cliente</h1><p>Cadastre contato, filial e fuso quando necessário.</p></div>
        <Link href="/clientes" className="button-v2 secondary"><ArrowLeft size={14}/> Voltar</Link>
      </div>
      <CustomerForm
        initial={{name:"",email:"",phone:"",whatsapp:"",document:"",notes:"",timezone:"",branchId:workspace.branch?.id??""}}
        branches={workspace.branches.map(b=>({id:b.id,name:b.name}))}
        timezones={timezones??[]}
      />
    </div>
  );
}
