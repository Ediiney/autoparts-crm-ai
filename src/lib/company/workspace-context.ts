import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "./current-company";

const BRANCH_COOKIE = "autoparts_branch";

export async function getWorkspaceContext() {
  const company = await getCurrentCompany();
  if (!company) return null;

  const supabase = await createClient();
  const cookieStore = await cookies();

  const [{ data: branches }, { data: profile }] = await Promise.all([
    supabase
      .from("branches")
      .select("id,name,code,timezone,city,state,is_headquarters,active")
      .eq("company_id", company.id)
      .eq("active", true)
      .order("is_headquarters", { ascending: false })
      .order("name"),
    supabase
      .from("profiles")
      .select("timezone")
      .eq("id", company.user.id)
      .maybeSingle(),
  ]);

  const available = branches ?? [];
  const requested = cookieStore.get(BRANCH_COOKIE)?.value;
  const preferredId = requested || company.memberBranchId || undefined;
  const branch =
    available.find((item) => item.id === preferredId) ||
    available.find((item) => item.is_headquarters) ||
    available[0] ||
    null;

  const timezone = profile?.timezone || branch?.timezone || company.timezone || "America/Sao_Paulo";

  return {
    company,
    branches: available,
    branch,
    timezone,
  };
}

export const workspaceBranchCookie = BRANCH_COOKIE;
