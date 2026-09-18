"use client";

import { useState } from "react";
import { LockKeyhole, UserPlus } from "lucide-react";

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login"
            ? { email, password, remember }
            : { name, email, password },
        ),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage({ tone: "error", text: result.error ?? "Não foi possível continuar." });
        return;
      }

      if (mode === "signup" && result.requiresEmailConfirmation) {
        setMessage({
          tone: "success",
          text: "Conta criada. Confirme seu e-mail e depois faça login.",
        });
        setMode("login");
        return;
      }

      window.location.href = mode === "signup" ? "/onboarding" : "/dashboard";
    } catch {
      setMessage({ tone: "error", text: "Falha de conexão. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="auth-mode-switch">
        <button
          className={mode === "login" ? "active" : ""}
          type="button"
          onClick={() => { setMode("login"); setMessage(null); }}
        >
          Entrar
        </button>
        <button
          className={mode === "signup" ? "active" : ""}
          type="button"
          onClick={() => { setMode("signup"); setMessage(null); }}
        >
          Criar conta
        </button>
      </div>

      <h2>{mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}</h2>
      <p>
        {mode === "login"
          ? "Acesse sua central de atendimento."
          : "Comece configurando sua operação de autopeças."}
      </p>

      <form onSubmit={submit}>
        {mode === "signup" ? (
          <div className="form-field">
            <label>Seu nome</label>
            <input
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Seu nome completo"
            />
          </div>
        ) : null}

        <div className="form-field">
          <label>E-mail</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@empresa.com.br"
          />
        </div>

        <div className="form-field">
          <label>Senha</label>
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={mode === "login" ? "Sua senha" : "Mínimo de 8 caracteres"}
          />
        </div>

        {mode === "login" ? (
          <div className="auth-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />{" "}
              Manter conectado
            </label>
            <span>Conta protegida pelo Supabase</span>
          </div>
        ) : null}

        {message ? (
          <div className={`auth-message ${message.tone}`}>{message.text}</div>
        ) : null}

        <button className="button primary auth-submit" type="submit" disabled={loading}>
          {mode === "login" ? <LockKeyhole size={15} /> : <UserPlus size={15} />}
          {loading
            ? "Processando..."
            : mode === "login"
              ? "Entrar no CRM"
              : "Criar conta"}
        </button>
      </form>
    </>
  );
}
