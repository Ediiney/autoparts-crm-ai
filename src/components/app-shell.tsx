"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  CarFront,
  ChartNoAxesCombined,
  FileText,
  Gauge,
  MessageCircleMore,
  PackageSearch,
  Settings,
  Users,
  Sparkles,
  Bell,
  Search,
  ChevronDown,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/conversas", label: "Conversas", icon: MessageCircleMore, badge: "7" },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/veiculos", label: "Veículos", icon: CarFront },
  { href: "/catalogo", label: "Catálogo", icon: PackageSearch },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/relatorios", label: "Relatórios", icon: ChartNoAxesCombined },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><CarFront size={22} strokeWidth={2.2} /></div>
          <div>
            <strong>AutoParts</strong>
            <span>CRM AI</span>
          </div>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">AP</div>
          <div className="workspace-copy">
            <span>Empresa</span>
            <strong>Auto Peças Exemplo</strong>
          </div>
          <ChevronDown size={16} />
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          <div className="nav-section-label">Operação</div>
          {navItems.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link className={active ? "nav-item active" : "nav-item"} href={href} key={href}>
                <Icon size={18} strokeWidth={1.9} />
                <span>{label}</span>
                {badge ? <span className="nav-badge">{badge}</span> : null}
              </Link>
            );
          })}

          <div className="nav-section-label secondary">Sistema</div>
          <Link className={pathname.startsWith("/configuracoes") ? "nav-item active" : "nav-item"} href="/configuracoes">
            <Settings size={18} strokeWidth={1.9} />
            <span>Configurações</span>
          </Link>
        </nav>

        <div className="sidebar-ai-card">
          <div className="ai-card-icon"><Sparkles size={18} /></div>
          <div>
            <strong>IA ativa</strong>
            <p>Catálogo protegido por regras anti-alucinação.</p>
          </div>
          <span className="live-dot" />
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">EA</div>
          <div>
            <strong>Ediney Andrade</strong>
            <span>Administrador</span>
          </div>
          <ChevronDown size={16} />
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
            <div className="ai-status-pill"><span className="live-dot" /> IA online</div>
            <button className="icon-button" aria-label="Notificações"><Bell size={19} /></button>
          </div>
        </header>
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
