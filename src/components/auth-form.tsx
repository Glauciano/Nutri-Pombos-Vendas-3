"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";

export default function AuthForm({ mode, next }: { mode: "login" | "cadastro"; next?: string }) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cadastro = mode === "cadastro";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível continuar.");

      // Store user info in localStorage for when DB is not available
      if (result.nome) {
        localStorage.setItem("nutripombos_user", JSON.stringify({
          nome: result.nome,
          email: email,
          plano: result.plano || "admin",
        }));
      }

      const redirectTo = next?.startsWith("/") ? next : "/centro-provas";
      router.replace(redirectTo);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Erro inesperado.");
    } finally { setLoading(false); }
  }

  return <form onSubmit={submit} className="mt-8 space-y-4">
    {cadastro && <Field icon={UserRound} label="Seu nome"><input required minLength={2} value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" /></Field>}
    <Field icon={Mail} label="Email"><input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" /></Field>
    <Field icon={LockKeyhole} label="Senha"><input required minLength={8} type={showPassword ? "text" : "password"} autoComplete={cadastro ? "new-password" : "current-password"} value={senha} onChange={e => setSenha(e.target.value)} placeholder={cadastro ? "Mínimo de 8 caracteres" : "Sua senha"} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" /><button type="button" onClick={() => setShowPassword(v => !v)} className="text-slate-500 hover:text-white" aria-label="Mostrar senha">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button></Field>
    {error && <div className="rounded-xl border border-rose-400/20 bg-rose-400/[.08] px-4 py-3 text-xs leading-5 text-rose-300">{error}</div>}
    <button disabled={loading} className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-400 text-sm font-extrabold text-slate-950 shadow-[0_12px_35px_rgba(245,158,11,.14)] transition hover:-translate-y-0.5 disabled:opacity-60">
      {loading ? <LoaderCircle size={17} className="animate-spin"/> : <>{cadastro ? "Criar minha conta" : "Entrar no aplicativo"}<ArrowRight size={16} className="transition-transform group-hover:translate-x-1"/></>}
    </button>
    <p className="pt-2 text-center text-xs text-slate-500">{cadastro ? "Já possui uma conta?" : "Ainda não possui uma conta?"} <Link href={cadastro ? "/login" : "/cadastro"} className="font-bold text-amber-300 no-underline hover:text-amber-200">{cadastro ? "Fazer login" : "Testar grátis"}</Link></p>
  </form>;
}

function Field({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[.13em] text-slate-500">{label}</span><span className="flex h-12 items-center gap-3 rounded-xl border border-white/[.09] bg-white/[.035] px-3.5 transition focus-within:border-amber-300/40 focus-within:bg-white/[.055]"><Icon size={16} className="shrink-0 text-slate-500"/>{children}</span></label>;
}
