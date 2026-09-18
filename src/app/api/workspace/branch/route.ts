import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getCurrentCompany } from "@/lib/company/current-company";
import { workspaceBranchCookie } from "@/lib/company/workspace-context";

export async function POST(request: Request) {
  try {
    const { branchId } = (await request.json()) as { branchId?: string };
    const company = await getCurrentCompany();
    if (!company) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });

    const { supabase } = await requireUser();

    if (branchId) {
      const { data: branch, error } = await supabase
        .from("branches")
        .select("id")
        .eq("id", branchId)
        .eq("company_id", company.id)
        .eq("active", true)
        .maybeSingle();

      if (error || !branch) {
        return NextResponse.json({ error: "Filial inválida." }, { status: 400 });
      }
    }

    const response = NextResponse.json({ ok: true });
    if (branchId) {
      response.cookies.set(workspaceBranchCookie, branchId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    } else {
      response.cookies.delete(workspaceBranchCookie);
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Não foi possível trocar a filial." }, { status: 500 });
  }
}
