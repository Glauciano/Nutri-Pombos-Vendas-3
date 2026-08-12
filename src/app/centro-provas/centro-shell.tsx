"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity, Bell, Bird, Bot, Calculator, CalendarDays, ChevronDown,
  CloudSun, Dna, HeartPulse, LayoutDashboard, Map, Menu, PackageOpen,
  Radio, Search, Settings, ShieldCheck, Sparkles, Target, Trophy,
  UtensilsCrossed, X, LogOut,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: typeof Activity };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "Visão geral",
    items: [
      { href: "/centro-provas", label: "Painel principal", icon: LayoutDashboard },
      { href: "/centro-provas/alertas", label: "Central de alertas", icon: Bell },
      { href: "/centro-provas/performance", label: "Performance", icon: Activity },
      { href: "/centro-provas/pombo-as", label: "Pombo Ás Oficial (FCI)", icon: Trophy },
    ],
  },
  {
    label: "Provas",
    items: [
      { href: "/centro-provas/gerenciar-calendario", label: "Calendário de provas", icon: CalendarDays },
      { href: "/centro-provas/geomagnetico", label: "Radar Geomagnético Kp", icon: Radio },
      { href: "/centro-provas/clima-avancado", label: "Radar Aero-Clima & Pressão", icon: CloudSun },
      { href: "/centro-provas/dia-prova", label: "Dia da prova", icon: Target },
      { href: "/centro-provas/gps-chip", label: "GPS e chip", icon: Radio },
      { href: "/centro-provas/historico", label: "Histórico", icon: Trophy },
      { href: "/centro-provas/treinamentos", label: "Treinamentos", icon: Activity },
      { href: "/centro-provas/treinamento-orientacao", label: "Orientação", icon: Map },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { href: "/centro-provas/calculadora", label: "Calculadora do plantel", icon: Calculator },
      { href: "/centro-provas/planejamento-anual", label: "Planejamento anual", icon: CalendarDays },
      { href: "/centro-provas/calendario-anual", label: "Calendário nutricional", icon: CalendarDays },
      { href: "/centro-provas/configuracao", label: "Configuração", icon: Settings },
      { href: "/centro-provas/simulador-vento", label: "Simulador de Vento", icon: CloudSun },
      { href: "/centro-provas/geodesica", label: "Geodésica e Relevo", icon: Map },
      { href: "/centro-provas/fotoperiodo", label: "Fotoperíodo (Darkness)", icon: CloudSun },
      { href: "/centro-provas/custos", label: "Custos e ROI", icon: Calculator },
    ],
  },
  {
    label: "Protocolos",
    items: [
      { href: "/centro-provas/protocolos", label: "Protocolos gerais", icon: Trophy },
      { href: "/centro-provas/velocidade-extrema", label: "Velocidade", icon: Sparkles },
      { href: "/centro-provas/meio-fundo", label: "Meio fundo", icon: Target },
      { href: "/centro-provas/fundo-extremo", label: "Fundo extremo", icon: Bird },
      { href: "/centro-provas/viuvez", label: "Sistema de viuvez", icon: Dna },
    ],
  },
  {
    label: "Plantel",
    items: [
      { href: "/centro-provas/pombos", label: "Pombos e Pedigree", icon: Bird },
      { href: "/centro-provas/classificacao", label: "Classificação por Km", icon: Trophy },
      { href: "/centro-provas/simulador-cruzamento", label: "Simulador Genético", icon: Dna },
      { href: "/centro-provas/olho", label: "Análise de Olho (Eye-Sign)", icon: Search },
      { href: "/centro-provas/asa", label: "Índice da Asa e Muda", icon: Activity },
      { href: "/centro-provas/certificado", label: "Certificado de Leilão", icon: Trophy },
    ],
  },
  {
    label: "Nutrição e saúde",
    items: [
      { href: "/centro-provas/receitas", label: "Receitas", icon: UtensilsCrossed },
      { href: "/centro-provas/suplementacao", label: "Suplementação", icon: PackageOpen },
      { href: "/centro-provas/carbo-lipideo", label: "Abastecimento Carbo-Lipídeo", icon: PackageOpen },
      { href: "/centro-provas/osmolaridade", label: "Hidratação & Osmolaridade", icon: HeartPulse },
      { href: "/centro-provas/recuperacao", label: "Recuperação Cardiorrespiratória", icon: Activity },
      { href: "/centro-provas/controle-sanitario", label: "Controle sanitário", icon: ShieldCheck },
      { href: "/centro-provas/guia-terapeutico", label: "Guia terapêutico", icon: HeartPulse },
      { href: "/centro-provas/resgate", label: "Resgate e Triagem", icon: HeartPulse },
    ],
  },
  {
    label: "Assistentes",
    items: [
      { href: "/centro-provas/nutribot", label: "NutriBot offline", icon: Sparkles },
    ],
  },
];

const allItems = groups.flatMap((group) => group.items);

export default function CentroShell({ children, user }: { children: ReactNode; user: { nome: string; email: string; plano: string } }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const active = allItems.find((item) => item.href === pathname) ?? allItems[0];
  const filteredGroups = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    if (!query) return groups;
    return groups.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLocaleLowerCase("pt-BR").includes(query)),
    })).filter((group) => group.items.length > 0);
  }, [search]);

  const navigation = (
    <>
      <div className="border-b border-white/8 px-5 py-5">
        <Link href="/" className="flex items-center gap-3 text-white no-underline">
          <span className="grid size-10 place-items-center rounded-xl bg-amber-400 text-slate-950 shadow-[0_8px_24px_rgba(250,204,21,.18)]">
            <Bird size={21} strokeWidth={2.3} />
          </span>
          <span>
            <strong className="block text-[15px] leading-tight tracking-tight">Nutri Pombos</strong>
            <small className="mt-1 block text-[9px] font-bold uppercase tracking-[.18em] text-amber-400">Centro de Provas</small>
          </span>
        </Link>
      </div>

      <div className="px-4 pt-4">
        <label className="flex h-10 items-center gap-2 rounded-xl border border-white/8 bg-white/[.035] px-3 text-slate-400 focus-within:border-amber-400/40 focus-within:bg-white/[.055]">
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar módulo..."
            className="min-w-0 flex-1 border-0 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
          />
        </label>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
        {filteredGroups.map((group, groupIndex) => (
          <details key={group.label} open={search.length > 0 || group.items.some((item) => item.href === pathname) || groupIndex < 2} className="group mb-2">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-[9px] font-extrabold uppercase tracking-[.14em] text-slate-500 hover:text-slate-300">
              {group.label}
              <ChevronDown size={12} className="transition-transform group-open:rotate-180" />
            </summary>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const selected = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold no-underline transition ${selected ? "bg-amber-400 text-slate-950 shadow-[0_7px_20px_rgba(250,204,21,.12)]" : "text-slate-400 hover:bg-white/[.055] hover:text-white"}`}
                  >
                    <Icon size={16} strokeWidth={selected ? 2.5 : 1.8} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </details>
        ))}
        {!filteredGroups.length && <p className="px-3 py-8 text-center text-xs text-slate-500">Nenhum módulo encontrado.</p>}
      </nav>

      <div className="border-t border-white/8 p-4">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[.035] px-3 py-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-400/10 text-xs font-black uppercase text-emerald-300">{user.nome.slice(0, 1)}</span>
          <span className="min-w-0 flex-1"><strong className="block truncate text-xs text-white">{user.nome}</strong><small className="block truncate text-[9px] uppercase tracking-wider text-slate-500">Plano {user.plano}</small></span>
        </div>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-500 hover:bg-rose-400/[.07] hover:text-rose-300"><LogOut size={15}/> Sair da conta</button>
        </form>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0b1426] text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] flex-col border-r border-white/8 bg-[#091120] lg:flex">
        {navigation}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Fechar menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
          <aside className="relative flex h-full w-[290px] flex-col border-r border-white/10 bg-[#091120] shadow-2xl">
            <button aria-label="Fechar menu" onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg bg-white/5 text-slate-400">
              <X size={17} />
            </button>
            {navigation}
          </aside>
        </div>
      )}

      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/8 bg-[#0b1426]/90 px-4 backdrop-blur-xl sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 lg:hidden" aria-label="Abrir menu">
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{active.label}</p>
              <p className="truncate text-[10px] text-slate-500">Gestão profissional do seu plantel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 text-[10px] font-bold text-emerald-400 sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-400" /> Sistema online
            </span>
            <Link href="/centro-provas/alertas" className="grid size-9 place-items-center rounded-xl border border-white/8 bg-white/[.035] text-slate-400 no-underline hover:text-amber-400">
              <Bell size={16} />
            </Link>
          </div>
        </header>
        <div className="centro-content min-h-[calc(100vh-4rem)]">{children}</div>
      </div>
    </div>
  );
}
