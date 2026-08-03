import { Suspense } from "react";
import { Bird, CheckCircle2, LoaderCircle } from "lucide-react";
import Link from "next/link";
import AuthForm from "@/components/auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthPage title="Bem-vindo de volta" subtitle="Entre para acessar seu plantel e continuar a temporada." mode="login" next={next} />;
}

function AuthPage({ title, subtitle, mode, next }: { title: string; subtitle: string; mode: "login" | "cadastro"; next?: string }) {
  return <main className="min-h-screen bg-[#07101f] text-white lg:grid lg:grid-cols-[1.05fr_.95fr]">
    <section className="relative hidden overflow-hidden border-r border-white/[.07] p-12 lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_20%_15%,rgba(16,185,129,.19),transparent_35%),radial-gradient(circle_at_80%_85%,rgba(245,158,11,.12),transparent_30%)]" />
      <Link href="/" className="relative flex items-center gap-3 text-white no-underline"><span className="grid size-11 place-items-center rounded-2xl bg-emerald-400 text-slate-950"><Bird size={23}/></span><span><strong className="block">Nutri Pombos</strong><small className="text-[9px] font-bold uppercase tracking-[.2em] text-emerald-400">Columbofilia inteligente</small></span></Link>
      <div className="relative max-w-xl"><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-amber-300">Gestão profissional</p><h1 className="mt-4 text-6xl font-semibold leading-[.95] tracking-[-.06em]">Sua temporada.<br/><span className="text-emerald-300">Sob controle.</span></h1><div className="mt-10 space-y-4">{["Calendário, clima e protocolos integrados","Performance e histórico em um único painel","Acesso seguro aos dados do plantel"].map(v=><div key={v} className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 size={17} className="text-emerald-400"/>{v}</div>)}</div></div>
      <p className="relative text-[10px] text-slate-600">Nutri Pombos • Sistema de gestão para columbófilos</p>
    </section>
    <section className="flex min-h-screen items-center justify-center px-5 py-12"><div className="w-full max-w-md"><Link href="/" className="mb-10 flex items-center gap-3 text-white no-underline lg:hidden"><span className="grid size-10 place-items-center rounded-xl bg-emerald-400 text-slate-950"><Bird size={20}/></span><b>Nutri Pombos</b></Link><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-amber-300">Área do cliente</p><h2 className="mt-3 text-4xl font-semibold tracking-[-.045em]">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{subtitle}</p><Suspense fallback={<div className="mt-8 flex items-center justify-center py-8"><LoaderCircle size={20} className="animate-spin text-slate-500"/></div>}><AuthForm mode={mode} next={next}/></Suspense><div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-600"><span className="size-1.5 rounded-full bg-emerald-400"/>Conexão protegida e senha criptografada</div></div></section>
  </main>;
}
