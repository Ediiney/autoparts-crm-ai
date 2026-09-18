"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LockKeyhole, UserPlus } from "lucide-react";
import styles from "./auth-form.module.css";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "login" ? { email, password } : { name, email, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage({ tone: "error", text: result.error ?? "Não foi possível continuar." });
        return;
      }

      if (mode === "signup" && result.requiresEmailConfirmation) {
        setMessage({ tone: "success", text: "Conta criada. Confirme o e-mail e depois entre para continuar." });
        return;
      }

      router.push(mode === "signup" ? "/onboarding" : "/dashboard");
      router.refresh();
    } catch {
      setMessage({ tone: "error", text: "Falha de conexão. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      {mode === "signup" ? (
        <label>
          <span>Seu nome</span>
          <input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" />
        </label>
      ) : null}

      <label>
        <span>E-mail</span>
        <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@empresa.com.br" />
      </label>

      <label>
        <span>Senha</span>
        <input required minLength={8} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "login" ? "Sua senha" : "Mínimo de 8 caracteres"} />
      </label>

      {message ? <div className={message.tone === "error" ? styles.error : styles.success}>{message.text}</div> : null}

      <button className={styles.submit} disabled={loading}>
        {mode === "login" ? <LockKeyhole size={15} /> : <UserPlus size={15} />}
        <span>{loading ? "Processando..." : mode === "login" ? "Entrar no CRM" : "Criar minha conta"}</span>
        {!loading ? <ArrowRight size={14} /> : null}
      </button>

      <p className={styles.switch}>
        {mode === "login" ? "Ainda não tem uma conta?" : "Já possui acesso?"}{" "}
        <Link href={mode === "login" ? "/cadastro" : "/login"}>{mode === "login" ? "Criar conta" : "Entrar"}</Link>
      </p>
    </form>
  );
}
