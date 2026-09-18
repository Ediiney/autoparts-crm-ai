import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/conversas/:path*",
    "/clientes/:path*",
    "/veiculos/:path*",
    "/catalogo/:path*",
    "/estoque/:path*",
    "/orcamentos/:path*",
    "/relatorios/:path*",
    "/configuracoes/:path*",
    "/onboarding/:path*",
    "/login",
    "/cadastro",
    "/api/:path*",
  ],
};
