import { cache } from "react";
import { getWorkspaceBootstrap } from "./workspace-bootstrap";

async function loadCurrentCompany() {
  const bootstrap = await getWorkspaceBootstrap();
  if (!bootstrap) return null;

  return {
    ...bootstrap.company,
    role: bootstrap.membership.role,
    memberBranchId: bootstrap.membership.branch_id,
    user: bootstrap.principal,
  };
}

export const getCurrentCompany = cache(loadCurrentCompany);
