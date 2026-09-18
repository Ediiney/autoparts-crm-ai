import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { createClient } from "@/lib/supabase/server";
import { CatalogImportForm } from "./catalog-import-form";

export default async function CatalogImportPage() {
  const workspace=await getWorkspaceContext();
  if(!workspace) redirect("/onboarding");

  const supabase=await createClient();
  const {data:source}=await supabase.from("catalog_sources").select("id,name,provider,source_url").eq("company_id",workspace.company.id).eq("active",true).order("created_at",{ascending:true}).limit(1).maybeSingle();

  return <CatalogImportForm companyId={workspace.company.id} sourceId={source?.id} sourceName={source?.name} sourceUrl={source?.source_url}/>;
}
