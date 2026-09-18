"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Building2, ChevronDown, Clock3 } from "lucide-react";
import { timezoneLabel } from "@/lib/timezones";

export function WorkspaceToolbar({
  branches,
  branchId,
  timezone,
}: {
  branches: Array<{ id: string; name: string; code: string | null; timezone: string }>;
  branchId?: string;
  timezone: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function changeBranch(nextBranchId: string) {
    const response = await fetch("/api/workspace/branch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId: nextBranchId }),
    });

    if (!response.ok) return;

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="workspace-toolbar">
      <div className="workspace-context">
        <Building2 size={15} />
        <select
          aria-label="Filial atual"
          value={branchId ?? ""}
          disabled={pending || branches.length < 2}
          onChange={(event) => void changeBranch(event.target.value)}
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}{branch.code ? ` · ${branch.code}` : ""}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="select-chevron" />
      </div>
      <div className="timezone-chip" title={timezone}>
        <Clock3 size={14} />
        <span>{timezoneLabel(timezone)}</span>
      </div>
    </div>
  );
}
