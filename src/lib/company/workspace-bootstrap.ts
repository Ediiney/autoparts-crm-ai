import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPrincipal } from "@/lib/auth/current-principal";

export type WorkspaceBranch = {
  id: string;
  name: string;
  code: string | null;
  timezone: string;
  city: string | null;
  state: string | null;
  is_headquarters: boolean;
  active: boolean;
};

type WorkspaceBootstrapPayload = {
  company: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    currency: string;
    business_type: string;
  };
  membership: {
    role: string;
    branch_id: string | null;
  };
  branches: WorkspaceBranch[];
};

async function loadWorkspaceBootstrap() {
  const principal = await getCurrentPrincipal();
  if (!principal) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_workspace_bootstrap");

  if (error) throw error;
  if (!data) return null;

  const payload = data as unknown as WorkspaceBootstrapPayload;

  return {
    principal,
    company: payload.company,
    membership: payload.membership,
    branches: payload.branches ?? [],
  };
}

export const getWorkspaceBootstrap = cache(loadWorkspaceBootstrap);
