import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPrincipal } from "@/lib/auth/current-principal";

async function loadCurrentCompany() {
  const principal = await getCurrentPrincipal();
  if (!principal) return null;

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id,branch_id,role")
    .eq("user_id", principal.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const { data: company } = await supabase
    .from("companies")
    .select("id,name,slug,timezone,currency,business_type")
    .eq("id", membership.company_id)
    .eq("active", true)
    .maybeSingle();

  if (!company) return null;

  return {
    ...company,
    role: membership.role,
    memberBranchId: membership.branch_id,
    user: principal,
  };
}

export const getCurrentCompany = cache(loadCurrentCompany);
