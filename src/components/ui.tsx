import type { ReactNode } from "react";

export function Button({children,variant="primary",icon}:{children:ReactNode;variant?:"primary"|"secondary"|"ghost"|"danger";icon?:ReactNode}) {
  const mapped=variant==="primary"?"primary":variant==="danger"?"secondary danger":"secondary";
  return <button type="button" className={`button-v2 ${mapped}`}>{icon}{children}</button>;
}
export function StatusBadge({children,tone="neutral"}:{children:ReactNode;tone?:"neutral"|"success"|"warning"|"danger"|"info"|"purple"}) {
  return <span className={`badge-v2 ${tone}`}>{children}</span>;
}
export function Avatar({initials,tone="green"}:{initials:string;tone?:string}) {
  return <div className={`avatar-v2 ${tone}`}>{initials}</div>;
}
export function Card({children,className=""}:{children:ReactNode;className?:string}) {
  return <section className={`panel-v2 ${className}`}>{children}</section>;
}
