import Link from "next/link";
import { ArrowLeft, CarFront, CheckCircle2, PackageSearch, ShieldCheck, Workflow } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./auth-shell.module.css";

type AuthShellProps = {
  mode: "login" | "signup";
  title: string;
  description: string;
  children: ReactNode;
};

const copy = {
  login: {
    kicker: "Bem-vindo de volta",
    heading: "Sua operação continua do mesmo ponto.",
    body: "Entre no workspace para retomar atendimentos, catálogo, estoque e propostas.",
  },
  signup: {
    kicker: "Nova operação",
    heading: "Comece com a estrutura certa.",
    body: "Crie o acesso e configure empresa, filial, fuso e catálogo na sequência.",
  },
};

export function AuthShell({ mode, title, description, children }: AuthShellProps) {
  const text = copy[mode];

  return (
    <main className={styles.page}>
      <section className={styles.visual}>
        <div className={styles.visualGrid} />
        <Link href="/" className={styles.brand}>
          <span><CarFront size={18} /></span>
          <strong>AutoParts CRM</strong>
        </Link>

        <div className={styles.visualCopy}>
          <small>{text.kicker}</small>
          <h1>{text.heading}</h1>
          <p>{text.body}</p>

          <div className={styles.benefits}>
            <div><Workflow size={15} /><span>Atendimento, veículo e venda no mesmo fluxo.</span></div>
            <div><PackageSearch size={15} /><span>Catálogo e aplicação como fonte da verdade.</span></div>
            <div><ShieldCheck size={15} /><span>Isolamento por empresa com RLS.</span></div>
          </div>
        </div>

        <div className={styles.visualFoot}>
          <CheckCircle2 size={14} />
          <span>Multi-filial · Fusos brasileiros · Supabase</span>
        </div>
      </section>

      <section className={styles.formSide}>
        <div className={styles.card}>
          <Link href="/" className={styles.back}><ArrowLeft size={13} /> Voltar para a home</Link>
          <span className={styles.kicker}>{mode === "login" ? "Acesso ao workspace" : "Criar acesso"}</span>
          <h2>{title}</h2>
          <p>{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
