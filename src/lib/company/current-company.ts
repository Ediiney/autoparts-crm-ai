import { createClient } from "@/lib/supabase/server";

export async function getCurrentCompany() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id,role")
    .eq("user_id", user.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const { data: company } = await supabase
    .from("companies")
    .select("id,name,slug")
    .eq("id", membership.company_id)
    .maybeSingle();

  if (!company) return null;

  return {
    ...company,
    role: membership.role,
    user,
  };
}
