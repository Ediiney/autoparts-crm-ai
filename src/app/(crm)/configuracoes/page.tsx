import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { SettingsConsole } from "./settings-console";

export default async function ConfiguracoesPage() {
  const workspace = await getWorkspaceContext();
  if (!workspace) redirect("/onboarding");

  const supabase = await createClient();

  const [
    companyResult,
    settingsResult,
    profileResult,
    hoursResult,
    integrationsResult,
    timezonesResult,
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("id,name,legal_name,document,phone,email,timezone,business_type,currency")
      .eq("id", workspace.company.id)
      .single(),
    supabase
      .from("company_settings")
      .select("ai_enabled,ai_auto_reply,minimum_match_confidence,default_price_type,settings")
      .eq("company_id", workspace.company.id)
      .single(),
    supabase
      .from("profiles")
      .select("timezone")
      .eq("id", workspace.company.user.id)
      .maybeSingle(),
    supabase
      .from("branch_business_hours")
      .select("branch_id,day_of_week,enabled,opens_at,closes_at,break_starts_at,break_ends_at")
      .eq("company_id", workspace.company.id)
      .order("day_of_week"),
    supabase
      .from("integration_connections")
      .select("id,provider,name,status,branch_id,last_sync_at,last_error,active")
      .eq("company_id", workspace.company.id)
      .order("created_at"),
    supabase
      .from("supported_timezones")
      .select("name,label,utc_label,region_hint")
      .eq("active", true)
      .order("sort_order"),
  ]);

  if (companyResult.error) throw companyResult.error;

  return (
    <SettingsConsole
      company={companyResult.data}
      settings={settingsResult.data}
      profileTimezone={profileResult.data?.timezone ?? null}
      branches={workspace.branches}
      currentBranchId={workspace.branch?.id ?? null}
      hours={hoursResult.data ?? []}
      integrations={integrationsResult.data ?? []}
      timezones={timezonesResult.data ?? []}
    />
  );
}
