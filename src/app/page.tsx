import { db, isDbConfigured } from "@/db";
import { alimentacoes, pombos, racoes, saude } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import {
  Activity, ArrowRight, Bird, CalendarDays, ChevronRight, CloudSun,
  HeartPulse, Leaf, Map, Radio, ShieldCheck, Sparkles, Target, Trophy,
} from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface DashboardData {
  total: number;
  ativos: number;
  racoes: number;
  saude: number;
  alimentacoesRecentes: { id: number; anilha: string | null; nome: string | null; racao: string | null; quantidade: number | null; data: Date | null }[];
}

const fallbackData: DashboardData = {
  total: 0, ativos: 0, racoes: 0, saude: 0, alimentacoesRecentes: [],
};

async function getDashboardData(): Promise<DashboardData> {
  if (!isDbConfigured()) return fallbackData;
  try {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(pombos);
    const [ativos] = await db.select({ count: sql<number>`count(*)` }).from(pombos).where(eq(pombos.status, "ativo"));
    const [totalRacoes] = await db.select({ count: sql<number>`count(*)` }).from(racoes);
    const [totalSaude] = await db.select({ count: sql<number>`count(*)` }).from(saude);

    const alimentacoesRecentes = await db.select({
      id: alimentacoes.id,
      anilha: pombos.anilha,
      nome: pombos.nome,
      racao: racoes.nome,
      quantidade: alimentacoes.quantidadeG,
      data: alimentacoes.data,
    }).from(alimentacoes)
      .leftJoin(pombos, eq(alimentacoes.pomboId, pombos.id))
      .leftJoin(racoes, eq(alimentacoes.racaoId, racoes.id))
      .orderBy(desc(alimentacoes.data))
      .limit(4);

    return {
      total: Number(total?.count || 0),
      ativos: Number(ativos?.count || 0),
      racoes: Number(totalRacoes?.count || 0),
      saude: Number(totalSaude?.count || 0),
      alimentacoesRecentes,
    };
  } catch {
    return fallbackData;
  }
}

const highlights = [
  { icon: CalendarDays, title: "Calendário integrado", text: "Temporada, provas e protocolos organizados em uma única visão.", color: "#fbbf24" },
  { icon: CloudSun, title: "Clima em tempo real", text: "Temperatura, chuva, direção e velocidade do vento para cada soltura.", color: "#34d399" },
  { icon: Activity, title: "Performance", text: "Histórico, velocidade, evolução e preparação do plantel.", color: "#60a5fa" },
];

const modules = [
  { href: "/centro-provas/dia-prova", icon: Target, title: "Dia da Prova", text: "Chegadas e constatação", color: "text-rose-300", bg: "bg-rose-400/10" },
  { href: "/centro-provas/gerenciar-calendario", icon: CalendarDays, title: "Calendário", text: "Etapas e planejamento", color: "text-amber-300", bg: "bg-amber-400/10" },
  { href: "/centro-provas/treinamentos", icon: Trophy, title: "Treinamentos", text: "Distância e evolução", color: "text-blue-300", bg: "bg-blue-400/10" },
  { href: "/centro-provas/controle-sanitario", icon: HeartPulse, title: "Saúde", text: "Controle sanitário", color: "text-emerald-300", bg: "bg-emerald-400/10" },
  { href: "/centro-provas/gps-chip", icon: Radio, title: "GPS & Chip", text: "ETS e registros", color: "text-cyan-300", bg: "bg-cyan-400/10" },
  { href: "/centro-provas/performance", icon: Sparkles, title: "Performance", text: "Índices do plantel", color: "text-violet-300", bg: "bg-violet-400/10" },
];

export default async function HomePage() {
  const [data, user] = await Promise.all([getDashboardData(), getCurrentUser()]);
  const percentualAtivos = data.total ? Math.round((data.ativos / data.total) * 100) : 0;

  return (
    <main className="min-h-screen overflow-hidden bg-[#07101f] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_5%,rgba(16,185,129,.15),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(245,158,11,.12),transparent_25%),linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:auto,auto,44px_44px,44px_44px]" />

      <header className="relative z-20 border-b border-white/[.07] bg-[#07101f]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-300 to-emerald-500 text-[#07101f] shadow-[0_10px_32px_rgba(52,211,153,.2)]">
              <Bird size={23} strokeWidth={2.4} />
            </span>
            <span>
              <strong className="block text-lg tracking-[-.025em] text-white">Nutri Pombos</strong>
              <small className="block text-[9px] font-extrabold uppercase tracking-[.22em] text-emerald-400">Columbofilia inteligente</small>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/planos" className="hidden px-3 py-2 text-xs font-bold text-slate-400 no-underline hover:text-white sm:block">Planos</Link>
            {user ? <Link href="/centro-provas" className="rounded-xl bg-amber-300 px-4 py-2.5 text-xs font-extrabold text-slate-950 no-underline">Abrir painel</Link> : <><Link href="/login" className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-300 no-underline hover:text-white">Entrar</Link><Link href="/cadastro" className="hidden rounded-xl bg-amber-300 px-4 py-2.5 text-xs font-extrabold text-slate-950 no-underline sm:block">Teste grátis</Link></>}
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.12fr_.88fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/[.06] px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-300">
              <Leaf size={13} /> Gestão completa do plantel
            </div>
            <h1 className="max-w-3xl text-[clamp(3rem,7vw,6.4rem)] font-semibold leading-[.91] tracking-[-.065em] text-white">
              Precisão em cada <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-amber-300 bg-clip-text text-transparent">voo.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 md:text-lg md:leading-8">
              Planeje a temporada, acompanhe provas, analise o clima e cuide da preparação do seu plantel em uma plataforma feita para a columbofilia moderna.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href={user ? "/centro-provas" : "/cadastro"} className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-300 to-amber-400 px-6 py-4 text-sm font-extrabold text-[#111827] no-underline shadow-[0_15px_45px_rgba(245,158,11,.16)] transition hover:-translate-y-0.5">
                {user ? "Entrar no Centro de Provas" : "Começar teste grátis"}
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <span className="text-xs leading-5 text-slate-500">32 módulos integrados<br />em uma única experiência</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-emerald-400/10 to-amber-300/5 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/[.09] bg-white/[.035] p-5 shadow-[0_30px_90px_rgba(0,0,0,.28)] backdrop-blur-xl md:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-slate-500">Visão do plantel</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">Estado geral</h2>
                </div>
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><ShieldCheck size={20} /></span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Metric value={data.total} label="Pombos cadastrados" color="text-white" />
                <Metric value={`${percentualAtivos}%`} label="Plantel ativo" color="text-emerald-300" />
                <Metric value={data.racoes} label="Rações registradas" color="text-amber-300" />
                <Metric value={data.saude} label="Registros de saúde" color="text-blue-300" />
              </div>
              <div className="mt-5 rounded-2xl border border-white/[.07] bg-black/10 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Atividade do plantel</span>
                  <span className="text-emerald-300">{data.ativos} ativos</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[.06]">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300" style={{ width: `${percentualAtivos}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/[.06] bg-white/[.018]">
        <div className="mx-auto grid max-w-7xl gap-px px-5 md:grid-cols-3 md:px-8">
          {highlights.map(({ icon: Icon, title, text, color }) => (
            <div key={title} className="flex gap-4 border-b border-white/[.06] py-7 md:border-b-0 md:border-r md:px-7 first:pl-0 last:border-r-0 last:pr-0">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ color, backgroundColor: `${color}14` }}><Icon size={19} /></span>
              <div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1.5 text-xs leading-5 text-slate-500">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-amber-300">Acesso rápido</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.035em]">Ferramentas essenciais</h2></div>
          <Link href="/centro-provas" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 no-underline hover:text-amber-300">Ver todos os módulos <ArrowRight size={14} /></Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(({ href, icon: Icon, title, text, color, bg }) => (
            <Link key={href} href={href} className="group flex min-h-28 items-center gap-4 rounded-2xl border border-white/[.07] bg-white/[.028] p-5 no-underline transition hover:-translate-y-0.5 hover:border-white/[.14] hover:bg-white/[.045]">
              <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${bg} ${color}`}><Icon size={20} /></span>
              <span className="flex-1"><strong className="block text-sm text-white">{title}</strong><small className="mt-1 block text-[11px] text-slate-500">{text}</small></span>
              <ChevronRight size={16} className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-slate-300" />
            </Link>
          ))}
        </div>
      </section>

      {data.alimentacoesRecentes.length > 0 && (
        <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 md:px-8">
          <div className="rounded-[2rem] border border-white/[.07] bg-white/[.025] p-5 md:p-7">
            <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-slate-500">Atividade recente</p><h2 className="mt-1 text-lg font-semibold">Últimos registros</h2></div><Map size={19} className="text-slate-600" /></div>
            <div className="grid gap-2 md:grid-cols-2">
              {data.alimentacoesRecentes.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/[.05] bg-black/10 px-4 py-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300"><Bird size={16} /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{item.nome || item.anilha || "Pombo"}</p><p className="truncate text-[10px] text-slate-500">{item.racao || "Ração"}</p></div>
                  <span className="text-xs font-extrabold text-amber-300">{item.quantidade}g</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="relative z-10 border-t border-white/[.06] px-5 py-8 text-center text-[10px] text-slate-600">
        Nutri Pombos • Gestão inteligente para columbofilia
      </footer>
    </main>
  );
}

function Metric({ value, label, color }: { value: string | number; label: string; color: string }) {
  return <div className="rounded-2xl border border-white/[.06] bg-black/10 p-4"><strong className={`block text-3xl font-semibold tracking-[-.045em] ${color}`}>{value}</strong><span className="mt-1 block text-[10px] text-slate-500">{label}</span></div>;
}
