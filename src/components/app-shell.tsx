"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Boxes,
  CarFront,
  ChartNoAxesCombined,
  ChevronDown,
  FileText,
  Gauge,
  LogOut,
  MessageCircleMore,
  PackageSearch,
  Search,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/conversas", label: "Conversas", icon: MessageCircleMore },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/veiculos", label: "Veículos", icon: CarFront },
  { href: "/catalogo", label: "Catálogo", icon: PackageSearch },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/relatorios", label: "Relatórios", icon: ChartNoAxesCombined },
];

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AP";
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
}: {
  children: ReactNode;
  companyName: string;
  userName: string;
  role: string;
}) {
  const pathname = usePathname();

  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><CarFront size={22} strokeWidth={2.2} /></div>
          <div><strong>AutoParts</strong><span>CRM AI</span></div>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">{initials(companyName)}</div>
          <div className="workspace-copy"><span>Empresa</span><strong>{companyName}</strong></div>
          <ChevronDown size={16} />
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          <div className="nav-section-label">Operação</div>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link className={active ? "nav-item active" : "nav-item"} href={href} key={href}>
                <Icon size={18} strokeWidth={1.9} /><span>{label}</span>
              </Link>
            );
          })}
          <div className="nav-section-label secondary">Sistema</div>
          <Link className={pathname.startsWith("/configuracoes") ? "nav-item active" : "nav-item"} href="/configuracoes">
            <Settings size={18} strokeWidth={1.9} /><span>Configurações</span>
          </Link>
        </nav>

        <div className="sidebar-ai-card">
          <div className="ai-card-icon"><Sparkles size={18} /></div>
          <div><strong>IA protegida</strong><p>Preço, estoque e compatibilidade sempre vêm do catálogo.</p></div>
          <span className="live-dot" />
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{initials(userName)}</div>
          <div><strong>{userName}</strong><span>{roleLabels[role] ?? role}</span></div>
          <form action="/api/auth/logout" method="post">
            <button className="sidebar-logout" type="submit" aria-label="Sair"><LogOut size={15}/></button>
          </form>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <div className="global-search">
            <Search size={18} />
            <input aria-label="Busca global" placeholder="Buscar cliente, veículo, peça ou orçamento..." />
            <kbd>⌘ K</kbd>
          </div>
          <div className="topbar-actions">
            <div className="ai-status-pill"><span className="live-dot" /> Sistema online</div>
            <button className="icon-button" aria-label="Notificações"><Bell size={19} /></button>
          </div>
        </header>
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
