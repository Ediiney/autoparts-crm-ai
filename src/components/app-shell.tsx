"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Boxes,
  CarFront,
  ChevronRight,
  FileText,
  Gauge,
  LogOut,
  MessageSquareText,
  PackageSearch,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { WorkspaceToolbar } from "./workspace-toolbar";
import { GlobalSearch } from "./global-search";

const navItems = [
  { group: "Workspace", href: "/dashboard", label: "Visão geral", icon: Gauge, mobile: true },
  { group: "Atendimento", href: "/conversas", label: "Conversas", icon: MessageSquareText, mobile: true },
  { group: "Atendimento", href: "/clientes", label: "Clientes", icon: Users },
  { group: "Atendimento", href: "/veiculos", label: "Veículos", icon: CarFront },
  { group: "Comercial", href: "/orcamentos", label: "Orçamentos", icon: FileText, mobile: true },
  { group: "Comercial", href: "/pedidos", label: "Pedidos", icon: ShoppingCart, mobile: true },
  { group: "Operação", href: "/catalogo", label: "Catálogo de peças", icon: PackageSearch, mobile: true },
  { group: "Operação", href: "/estoque", label: "Estoque", icon: Boxes },
  { group: "Gestão", href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { group: "Gestão", href: "/configuracoes", label: "Configurações", icon: Settings },
];

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "AP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts.at(-1)![0]).toUpperCase();
}

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  manager: "Gerente",
  agent: "Atendente",
  viewer: "Visualizador",
};

export function AppShell({
  children,
  companyName,
  userName,
  role,
  branches,
  branchId,
  timezone,
}: {
  children: ReactNode;
  companyName: string;
  userName: string;
  role: string;
  branches: Array<{ id: string; name: string; code: string | null; timezone: string }>;
  branchId?: string;
  timezone: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  let lastGroup = "";

  function warmRoute(href: string) {
    if (href !== pathname) router.prefetch(href);
  }

  return (
    <div className="shell-v2 shell-v3">
      <aside className="sidebar-v2 sidebar-v3">
        <div className="sidebar-v2-head">
          <Link href="/dashboard" prefetch={false} onPointerEnter={() => warmRoute("/dashboard")} className="brand-v2 brand-v3">
            <div className="brand-v2-mark brand-v3-mark"><CarFront size={19} strokeWidth={2.2} /></div>
            <div>
              <strong>AutoParts</strong>
              <span>CRM</span>
            </div>
          </Link>

          <div className="company-v2 company-v3">
            <div className="company-v2-avatar">{initials(companyName)}</div>
            <div className="company-v2-copy">
              <span>Empresa atual</span>
              <strong>{companyName}</strong>
            </div>
            <ChevronRight size={14} />
          </div>
        </div>

        <nav className="nav-v2 nav-v3" aria-label="Navegação principal">
          {navItems.map(({ group, href, label, icon: Icon, mobile }) => {
            const showGroup = group !== lastGroup;
            lastGroup = group;
            const active = pathname === href || pathname.startsWith(href + "/");

            return (
              <Fragment key={href}>
                {showGroup ? <span className="nav-v3-group">{group}</span> : null}
                <Link
                  className={active ? "nav-v2-item active" : "nav-v2-item"}
                  href={href}
                  prefetch={false}
                  data-mobile={mobile ? "true" : "false"}
                  onPointerEnter={() => warmRoute(href)}
                  onFocus={() => warmRoute(href)}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                  {active ? <ChevronRight size={13} className="nav-v2-arrow" /> : null}
                </Link>
              </Fragment>
            );
          })}
        </nav>

        <div className="sidebar-v2-foot">
          <div className="system-v2-status system-v3-status">
            <span className="status-v2-dot" />
            <div><strong>Operação online</strong><span>Dados sincronizados</span></div>
          </div>

          <div className="user-v2 user-v3">
            <div className="user-v2-avatar">{initials(userName)}</div>
            <div className="user-v2-copy">
              <strong>{userName}</strong>
              <span>{roleLabels[role] ?? role}</span>
            </div>
            <form action="/api/auth/logout" method="post">
              <button className="user-v2-action" type="submit" aria-label="Sair"><LogOut size={15}/></button>
            </form>
          </div>
        </div>
      </aside>

      <main className="main-v2">
        <header className="topbar-v2 topbar-v3">
          <WorkspaceToolbar branches={branches} branchId={branchId} timezone={timezone} />
          <div className="topbar-v2-actions">
            <GlobalSearch />
            <button className="icon-v2 topbar-icon-v3" aria-label="Notificações"><Bell size={18}/><span /></button>
          </div>
        </header>
        <div className="content-v2 content-v3">{children}</div>
      </main>
    </div>
  );
}
