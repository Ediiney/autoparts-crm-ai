import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CurrentPrincipal = {
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown>;
};

/**
 * Protected CRM requests are validated by proxy.ts with auth.getClaims().
 * Here we only read the already-refreshed session cookie to avoid a second
 * Auth network validation for every Server Component render. Data access is
 * still authorized by Supabase/Postgres RLS and by get_workspace_bootstrap().
 */
async function loadCurrentPrincipal(): Promise<CurrentPrincipal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (error || !user?.id || !data.session?.access_token) {
    return null;
  }

  const metadata =
    user.user_metadata &&
    typeof user.user_metadata === "object" &&
    !Array.isArray(user.user_metadata)
      ? (user.user_metadata as Record<string, unknown>)
      : {};

  return {
    id: user.id,
    email: user.email ?? null,
    user_metadata: metadata,
  };
}

export const getCurrentPrincipal = cache(loadCurrentPrincipal);
