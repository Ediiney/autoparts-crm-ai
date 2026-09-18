import { cache } from "react";
import { cookies } from "next/headers";
import { getWorkspaceBootstrap } from "./workspace-bootstrap";

const BRANCH_COOKIE = "autoparts_branch";

async function loadWorkspaceContext() {
  const bootstrap = await getWorkspaceBootstrap();
  if (!bootstrap) return null;

  const cookieStore = await cookies();
  const requested = cookieStore.get(BRANCH_COOKIE)?.value;
  const preferredId = requested || bootstrap.membership.branch_id || undefined;

  const branch =
    bootstrap.branches.find((item) => item.id === preferredId) ||
    bootstrap.branches.find((item) => item.is_headquarters) ||
    bootstrap.branches[0] ||
    null;

  const timezone =
    branch?.timezone ||
    bootstrap.company.timezone ||
    "America/Sao_Paulo";

  return {
    company: {
      ...bootstrap.company,
      role: bootstrap.membership.role,
      memberBranchId: bootstrap.membership.branch_id,
      user: bootstrap.principal,
    },
    branches: bootstrap.branches,
    branch,
    timezone,
  };
}

export const getWorkspaceContext = cache(loadWorkspaceContext);
export const workspaceBranchCookie = BRANCH_COOKIE;
