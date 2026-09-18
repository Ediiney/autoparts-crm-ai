"use client";

import Link from "next/link";
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
  Search,
  Settings,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { WorkspaceToolbar } from "./workspace-toolbar";

const navItems = [
  { href: "/dashboard", label: "Visão geral", icon: Gauge },
  { href: "/conversas", label: "Conversas", icon: MessageSquareText },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/veiculos", label: "Veículos", icon: CarFront },
  { href: "/catalogo", label: "Catálogo", icon: PackageSearch },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
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

  function warmRoute(href: string) {
    if (href !== pathname) router.prefetch(href);
  }

  return (
    <div className="shell-v2">
      <aside className="sidebar-v2">
        <div className="sidebar-v2-head">
          <Link href="/dashboard" prefetch={false} onPointerEnter={() => warmRoute("/dashboard")} className="brand-v2">
            <div className="brand-v2-mark"><CarFront size={19} strokeWidth={2.25} /></div>
            <div><strong>AutoParts</strong><span>CRM</span></div>
          </Link>

          <div className="company-v2">
            <div className="company-v2-avatar">{initials(companyName)}</div>
            <div className="company-v2-copy">
              <span>Workspace</span>
              <strong>{companyName}</strong>
            </div>
          </div>
        </div>

        <nav className="nav-v2" aria-label="Navegação principal">
          <span className="nav-v2-label">Menu</span>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                className={active ? "nav-v2-item active" : "nav-v2-item"}
                href={href}
                key={href}
                prefetch={false}
                onPointerEnter={() => warmRoute(href)}
                onFocus={() => warmRoute(href)}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
                {active ? <ChevronRight size={13} className="nav-v2-arrow" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-v2-foot">
          <div className="system-v2-status">
            <span className="status-v2-dot" />
            <div><strong>Sistema operacional</strong><span>Serviços conectados</span></div>
          </div>

          <div className="user-v2">
            <div className="user-v2-avatar">{initials(userName)}</div>
            <div className="user-v2-copy"><strong>{userName}</strong><span>{roleLabels[role] ?? role}</span></div>
            <form action="/api/auth/logout" method="post">
              <button className="user-v2-action" type="submit" aria-label="Sair"><LogOut size={15}/></button>
            </form>
          </div>
        </div>
      </aside>

      <main className="main-v2">
        <header className="topbar-v2">
          <WorkspaceToolbar branches={branches} branchId={branchId} timezone={timezone} />
          <div className="topbar-v2-actions">
            <label className="search-v2">
              <Search size={16} />
              <input placeholder="Buscar cliente, peça, placa ou orçamento..." />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-v2" aria-label="Notificações"><Bell size={17}/></button>
          </div>
        </header>
        <div className="content-v2">{children}</div>
      </main>
    </div>
  );
}
