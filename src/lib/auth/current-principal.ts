import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CurrentPrincipal = {
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown>;
};

async function loadCurrentPrincipal(): Promise<CurrentPrincipal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims as Record<string, unknown> | undefined;

  if (error || !claims || typeof claims.sub !== "string") {
    return null;
  }

  const metadata =
    claims.user_metadata &&
    typeof claims.user_metadata === "object" &&
    !Array.isArray(claims.user_metadata)
      ? (claims.user_metadata as Record<string, unknown>)
      : {};

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    user_metadata: metadata,
  };
}

export const getCurrentPrincipal = cache(loadCurrentPrincipal);
