import { createClient } from "@/lib/supabase/server";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
};

export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims as Record<string, unknown> | undefined;

  if (error || !claims || typeof claims.sub !== "string") {
    throw new Error("UNAUTHORIZED");
  }

  const user: AuthenticatedUser = {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
  };

  return { supabase, user };
}
