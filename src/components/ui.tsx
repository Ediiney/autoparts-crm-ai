import type { ReactNode } from "react";

export function Button({
  children,
  variant = "primary",
  icon,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: ReactNode;
}) {
  return <button className={`button ${variant}`}>{icon}{children}</button>;
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "purple";
}) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}

export function Avatar({ initials, tone = "green" }: { initials: string; tone?: string }) {
  return <div className={`avatar avatar-${tone}`}>{initials}</div>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`surface-card ${className}`}>{children}</section>;
}
