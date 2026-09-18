"use client";

import Link from "next/link";
import { Fragment, type ReactNode, useState } from "react";
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
  { section: "Visão", href: "/dashboard", label: "Dashboard", icon: Gauge, mobile: true },
  { section: "Relacionamento", href: "/conversas", label: "Conversas", icon: MessageSquareText, mobile: true },
  { section: "Relacionamento", href: "/clientes", label: "Clientes", icon: Users },
  { section: "Relacionamento", href: "/veiculos", label: "Veículos", icon: CarFront },
  { section: "Comercial", href: "/orcamentos", label: "Orçamentos", icon: FileText, mobile: true },
  { section: "Comercial", href: "/pedidos", label: "Pedidos", icon: ShoppingCart, mobile: true },
  { section: "Operação", href: "/catalogo", label: "Catálogo", icon: PackageSearch, mobile: true },
  { section: "Operação", href: "/estoque", label: "Estoque", icon: Boxes },
  { section: "Análise", href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { section: "Sistema", href: "/configuracoes", label: "Configurações", icon: Settings },
].map((item, index, items) => ({
  ...item,
  showSection: index === 0 || items[index - 1].section !== item.section,
}));

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
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const isNavigating = pendingPath !== null && pendingPath !== pathname;

  function warmRoute(href: string) {
    if (href !== pathname) router.prefetch(href);
  }

  return (
    <>
      <style jsx global>{`
        .crm-shell{min-height:100vh;display:grid;grid-template-columns:258px minmax(0,1fr);background:#f6f7f9}
        .crm-sidebar{height:100vh;position:sticky;top:0;display:flex;flex-direction:column;background:#111827;color:#d0d5dd;padding:16px 14px 14px;z-index:40;border-right:1px solid #1f2937}
        .crm-main{min-width:0}
        .crm-topbar{height:68px;position:sticky;top:0;z-index:35;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 30px;background:rgba(255,255,255,.96);backdrop-filter:blur(16px);border-bottom:1px solid #e4e7ec}
        .crm-content{max-width:1680px;margin:0 auto;padding:28px 32px 64px}
        .crm-nav{display:flex;flex-direction:column;gap:2px;margin-top:17px;min-height:0;overflow:auto}
        .crm-nav-item{height:39px;display:grid;grid-template-columns:22px 1fr auto;align-items:center;gap:7px;padding:0 10px;border-radius:7px;color:#b7c0cd;text-decoration:none;font-size:12px;font-weight:550}
        .crm-nav-item:hover{background:#1d2939;color:#fff}.crm-nav-item.active{background:#263244;color:#fff}
        .crm-sidebar-bottom{margin-top:auto}
        @media(max-width:820px){.crm-shell{display:block}.crm-sidebar{position:fixed;left:0;right:0;top:auto;bottom:0;width:100%;height:68px;padding:6px;z-index:60}.crm-main{padding-bottom:68px}.crm-content{padding:18px 14px 36px}}
      `}</style>

      <div className="crm-shell">
        <aside className="crm-sidebar">
          <div className="crm-sidebar-top">
            <Link
              prefetch={false}
              className="crm-brand"
              href="/dashboard"
              onPointerEnter={() => warmRoute("/dashboard")}
              onFocus={() => warmRoute("/dashboard")}
            >
              <span className="crm-brand-mark"><CarFront size={19} strokeWidth={2.2} /></span>
              <span className="crm-brand-copy"><strong>AutoParts</strong><small>CRM</small></span>
            </Link>

            <div className="crm-workspace-card">
              <div className="crm-workspace-avatar">{initials(companyName)}</div>
              <div className="crm-workspace-copy">
                <small>Workspace</small>
                <strong>{companyName}</strong>
              </div>
              <ChevronRight size={15} />
            </div>
          </div>

          <nav className="crm-nav" aria-label="Navegação principal">
            {navItems.map(({ section, href, label, icon: Icon, mobile, showSection }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Fragment key={href}>
                  {showSection ? <span className="crm-nav-section">{section}</span> : null}
                  <Link
                    prefetch={false}
                    className={active ? "crm-nav-item active" : "crm-nav-item"}
                    href={href}
                    data-mobile={mobile ? "true" : "false"}
                    onPointerEnter={() => warmRoute(href)}
                    onTouchStart={() => warmRoute(href)}
                    onFocus={() => warmRoute(href)}
                    onClick={() => { if (href !== pathname) setPendingPath(href); }}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    <span>{label}</span>
                    {active ? <i /> : null}
                  </Link>
                </Fragment>
              );
            })}
          </nav>

          <div className="crm-sidebar-bottom">
            <div className="crm-live-status">
              <span />
              <div><strong>Operação online</strong><small>Serviços conectados</small></div>
            </div>

            <div className="crm-user-card">
              <div className="crm-user-avatar">{initials(userName)}</div>
              <div className="crm-user-copy">
                <strong>{userName}</strong>
                <small>{roleLabels[role] ?? role}</small>
              </div>
              <form action="/api/auth/logout" method="post">
                <button type="submit" aria-label="Sair"><LogOut size={16} /></button>
              </form>
            </div>
          </div>
        </aside>

        <main className="crm-main" aria-busy={isNavigating}>
          <div className={isNavigating ? "crm-route-progress active" : "crm-route-progress"} aria-hidden="true"><span /></div>
          <header className="crm-topbar">
            <div className="crm-topbar-context">
              <WorkspaceToolbar branches={branches} branchId={branchId} timezone={timezone} />
            </div>
            <div className="crm-topbar-actions">
              <GlobalSearch />
              <button className="crm-icon-button" aria-label="Notificações"><Bell size={18} /><span /></button>
            </div>
          </header>
          <div className="crm-content">{children}</div>
        </main>
      </div>
    </>
  );
}
