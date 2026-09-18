import type { ReactNode } from "react";

export function PageHeader({eyebrow,title,description,actions}:{eyebrow?:string;title:string;description?:string;actions?:ReactNode}) {
  return (
    <div className="page-heading-v2">
      <div>
        {eyebrow?<span className="overline-v2">{eyebrow}</span>:null}
        <h1>{title}</h1>
        {description?<p>{description}</p>:null}
      </div>
      {actions?<div className="page-heading-v2-actions">{actions}</div>:null}
    </div>
  );
}
