import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/lib/company/current-company";
import { createClient } from "@/lib/supabase/server";
import { CatalogImportForm } from "./catalog-import-form";

export default async function CatalogImportPage() {
  const company = await getCurrentCompany();
  if (!company) redirect("/onboarding");

  const supabase = await createClient();
  const { data: source } = await supabase
    .from("catalog_sources")
    .select("id,name,provider,source_url")
    .eq("company_id", company.id)
    .eq("active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <CatalogImportForm
      companyId={company.id}
      sourceId={source?.id}
      sourceName={source?.name}
      sourceUrl={source?.source_url}
    />
  );
}
