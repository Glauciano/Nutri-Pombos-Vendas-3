"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { alternarTema, temaAtual, EVENTO_TEMA } from "./theme";
import { traduz } from "./lib/traducao";
import {
  Activity, Bell, Bird, Bot, Calculator, CalendarDays, ChevronDown, Tv,
  CloudSun, Dna, HeartPulse, LayoutDashboard, Map, Menu, PackageOpen,
  Radio, Search, Settings, ShieldCheck, Sparkles, Target, TrendingUp, Trophy,
  UtensilsCrossed, X, LogOut,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: typeof Activity };
type NavGroup = { label: string; items: NavItem[] };


const TRAD: Record<string, Record<string, string>> = {
  pt: {},
  es: { "Visão geral": "General", "Provas": "Pruebas", "Buscar módulo...": "Buscar módulo...", "📤 Compartilhar app": "📤 Compartir app", "Centro de Provas": "Centro de Competencias", "🌙 Ir p/ escuro": "🌙 Cambiar a oscuro", "☀️ Ir p/ claro": "☀️ Cambiar a claro" },
  en: { "Visão geral": "Overview", "Provas": "Races", "Buscar módulo...": "Search module...", "📤 Compartilhar app": "📤 Share app", "Centro de Provas": "Racing Center", "🌙 Ir p/ escuro": "🌙 Switch to dark", "☀️ Ir p/ claro": "☀️ Switch to light" },
};

export default function CentroShell({ children, user }: { children: ReactNode; user: { nome: string; email: string; plano: string } }) {
  const pathname = usePathname();
  const [idioma, setIdioma] = useState<"pt" | "es" | "en">("pt");
  useEffect(() => {
    try { const salvo = localStorage.getItem("nutripombos-idioma"); if (salvo === "es" || salvo === "en" || salvo === "pt") setIdioma(salvo); } catch { /* ignora */ }
  }, []);
  const t = (txt: string) => traduz(txt, idioma) || (TRAD[idioma] && TRAD[idioma][txt]) || txt;

  const groups: NavGroup[] = [
    {
      label: t("Visão geral"),
      items: [
        { href: "/centro-provas", label: t("Painel principal"), icon: LayoutDashboard },
        { href: "/centro-provas/alertas", label: t("Central de alertas"), icon: Bell },
        { href: "/centro-provas/performance", label: t("Performance"), icon: Activity },
        { href: "/centro-provas/clima-desempenho", label: t("Clima × Desempenho"), icon: TrendingUp },
        { href: "/centro-provas/graficos", label: t("Gráficos da temporada"), icon: Activity },
        { href: "/centro-provas/cronicas", label: t("Crônicas da temporada"), icon: Trophy },
        { href: "/centro-provas/telao", label: t("Modo Telão (clube)"), icon: Tv },
        { href: "/centro-provas/equipe", label: t("Seleção de equipe"), icon: Bird },
        { href: "/centro-provas/primeiros-passos", label: t("🎓 Primeiros passos"), icon: Sparkles },
        { href: "/centro-provas/ranking", label: t("Ranking do plantel"), icon: Trophy },
        { href: "/centro-provas/cartao-campeao", label: t("Cartão do campeão"), icon: Sparkles },
        { href: "/centro-provas/relatorio-temporada", label: t("Relatório da temporada"), icon: Activity },
        { href: "/centro-provas/pombo-as", label: t("Pombo Ás Oficial (FCI)"), icon: Trophy },
      ],
    },
    {
      label: t("Provas"),
      items: [
        { href: "/centro-provas/gerenciar-calendario", label: t("Calendário de provas"), icon: CalendarDays },
        { href: "/centro-provas/rota", label: t("Rota da prova (cidades)"), icon: Map },
        { href: "/centro-provas/geomagnetico", label: t("Radar Geomagnético Kp"), icon: Radio },
        { href: "/centro-provas/clima-avancado", label: t("Radar Aero-Clima & Pressão"), icon: CloudSun },
        { href: "/centro-provas/dia-prova", label: t("Dia da prova"), icon: Target },
        { href: "/centro-provas/checklist", label: t("Checklist de encestamento"), icon: ShieldCheck },
        { href: "/centro-provas/gps-chip", label: t("GPS e chip"), icon: Radio },
        { href: "/centro-provas/historico", label: t("Histórico"), icon: Trophy },
        { href: "/centro-provas/treinamentos", label: t("Treinamentos"), icon: Activity },
        { href: "/centro-provas/treinamento-orientacao", label: t("Orientação"), icon: Map },
      ],
    },
    {
      label: t("Ferramentas"),
      items: [
        { href: "/centro-provas/calculadora", label: t("Calculadora do plantel"), icon: Calculator },
        { href: "/centro-provas/mistura-semanal", label: t("Mistura semanal (16 sementes)"), icon: UtensilsCrossed },
        { href: "/centro-provas/mix-energetico", label: t("Mix energético (lote)"), icon: Sparkles },
        { href: "/centro-provas/planejamento-anual", label: t("Planejamento anual"), icon: CalendarDays },
        { href: "/centro-provas/calendario-anual", label: t("Calendário nutricional"), icon: CalendarDays },
        { href: "/centro-provas/configuracao", label: t("Configuração"), icon: Settings },
        { href: "/centro-provas/simulador-vento", label: t("Simulador de Vento"), icon: CloudSun },
        { href: "/centro-provas/geodesica", label: t("Geodésica e Relevo"), icon: Map },
        { href: "/centro-provas/fotoperiodo", label: t("Fotoperíodo (Darkness)"), icon: CloudSun },
        { href: "/centro-provas/custos", label: t("Custos e ROI"), icon: Calculator },
        { href: "/centro-provas/vendas", label: t("Vendas de pombos"), icon: PackageOpen },
        { href: "/centro-provas/acasalamento", label: t("Assistente de acasalamento"), icon: HeartPulse },
        { href: "/centro-provas/comparador", label: t("Comparador de pombos"), icon: Activity },
        { href: "/centro-provas/ficha-pombo", label: t("Ficha de avaliação"), icon: ShieldCheck },
      ],
    },
    {
      label: t("Protocolos"),
      items: [
        { href: "/centro-provas/protocolos", label: t("Protocolos gerais"), icon: Trophy },
        { href: "/centro-provas/velocidade-extrema", label: t("Velocidade"), icon: Sparkles },
        { href: "/centro-provas/meio-fundo", label: t("Meio fundo"), icon: Target },
        { href: "/centro-provas/fundo-extremo", label: t("Fundo extremo"), icon: Bird },
        { href: "/centro-provas/viuvez", label: t("Sistema de viuvez"), icon: Dna },
      ],
    },
    {
      label: t("Plantel"),
      items: [
        { href: "/centro-provas/pombos", label: t("Pombos e Pedigree"), icon: Bird },
        { href: "/centro-provas/classificacao", label: t("Classificação por Km"), icon: Trophy },
        { href: "/centro-provas/simulador-cruzamento", label: t("Simulador Genético"), icon: Dna },
        { href: "/centro-provas/olho", label: t("Análise de Olho (Eye-Sign)"), icon: Search },
        { href: "/centro-provas/anatomia", label: t("Triângulo de Ouro Anatômico"), icon: Activity },
        { href: "/centro-provas/asa", label: t("Índice da Asa e Muda"), icon: Activity },
        { href: "/centro-provas/certificado", label: t("Certificado de Leilão"), icon: Trophy },
      ],
    },
    {
      label: t("Nutrição e saúde"),
      items: [
        { href: "/centro-provas/receitas", label: t("Receitas"), icon: UtensilsCrossed },
        { href: "/centro-provas/suplementacao", label: t("Suplementação"), icon: PackageOpen },
        { href: "/centro-provas/carbo-lipideo", label: t("Abastecimento Carbo-Lipídeo"), icon: PackageOpen },
        { href: "/centro-provas/osmolaridade", label: t("Hidratação & Osmolaridade"), icon: HeartPulse },
        { href: "/centro-provas/recuperacao", label: t("Recuperação Cardiorrespiratória"), icon: Activity },
        { href: "/centro-provas/controle-sanitario", label: t("Controle sanitário"), icon: ShieldCheck },
        { href: "/centro-provas/guia-terapeutico", label: t("Guia terapêutico"), icon: HeartPulse },
        { href: "/centro-provas/resgate", label: t("Resgate e Triagem"), icon: HeartPulse },
      ],
    },
    {
      label: t("Assistentes"),
      items: [
        { href: "/centro-provas/nutribot", label: t("NutriBot offline"), icon: Sparkles },
      ],
    },
    {
      label: t("Ajuda"),
      items: [
        { href: "/centro-provas/sobre", label: t("Sobre o app e fontes"), icon: ShieldCheck },
      ],
    },
  ];
  
  const allItems = groups.flatMap((group) => group.items);

  const [tema, setTema] = useState<"escuro" | "claro">("escuro");
  useEffect(() => {
    setTema(temaAtual());
    const att = () => setTema(temaAtual());
    window.addEventListener(EVENTO_TEMA, att);
    return () => window.removeEventListener(EVENTO_TEMA, att);
  }, []);
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
  }, [search, idioma]);

  const navigation = (
    <>
      <div className="border-b border-white/8 px-5 py-5">
        <Link href="/" className="flex items-center gap-3 text-white no-underline">
          <span className="grid size-10 place-items-center rounded-xl bg-amber-400 text-slate-950 shadow-[0_8px_24px_rgba(250,204,21,.18)]">
            <Bird size={21} strokeWidth={2.3} />
          </span>
          <span>
            <strong className="block text-[15px] leading-tight tracking-tight">Nutri Pombos</strong>
            <small className="mt-1 block text-[9px] font-bold uppercase tracking-[.18em] text-amber-400">{t("Centro de Provas")}</small>
          </span>
        </Link>
      </div>

      <div className="px-4 pt-4">
        <label className="flex h-10 items-center gap-2 rounded-xl border border-white/8 bg-white/[.035] px-3 text-slate-400 focus-within:border-amber-400/40 focus-within:bg-white/[.055]">
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("Buscar módulo...")}
            className="min-w-0 flex-1 border-0 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
          />
        </label>
        <button
          type="button"
          onClick={alternarTema}
          title={tema === "claro" ? "Mudar para o tema escuro" : "Mudar para o tema claro (sol do pombal)"}
          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[.035] text-[11px] font-bold text-slate-400 transition hover:border-amber-400/40 hover:text-amber-400"
        >
          {t(tema === "claro" ? "🌙 Ir p/ escuro" : "☀️ Ir p/ claro")} <small style={{ opacity: 0.6 }}>({tema === "claro" ? "claro ativo" : "escuro ativo"})</small>
        </button>
        <button
          type="button"
          onClick={() => { const prox: "pt" | "es" | "en" = idioma === "pt" ? "es" : idioma === "es" ? "en" : "pt"; setIdioma(prox); try { localStorage.setItem("nutripombos-idioma", prox); } catch { /* ignora */ } window.location.reload(); }}
          title="Idioma / Language / Idioma"
          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[.035] text-[11px] font-bold text-slate-400 transition hover:border-amber-400/40 hover:text-amber-400"
        >
          🌐 {idioma === "pt" ? "Português" : idioma === "es" ? "Español" : "English"}
        </button>
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
        <button
          type="button"
          onClick={async () => {
            const url = "https://nutri-pombos-vendas-3.vercel.app";
            const dados = { title: "🕊️ Nutri Pombos — Centro de Provas", text: "Rota da prova, clima, radar de chuva, nutrição e mais — app do columbófilo!", url };
            const avisar = (m: string) => { const el = document.getElementById("share-aviso"); if (el) { el.textContent = m; el.style.display = "block"; window.setTimeout(() => { el.style.display = "none"; }, 4000); } };
            // 1) compartilhador nativo
            try {
              if (navigator.share) { await navigator.share(dados); return; }
            } catch (e) {
              // usuário cancelou (AbortError) ou o share falhou — segue pro plano B
              if (e instanceof Error && e.name === "AbortError") return;
            }
            // 2) copiar pro clipboard
            try {
              await navigator.clipboard.writeText(url);
              avisar("✅ Link copiado! Cole no WhatsApp ou onde quiser");
              return;
            } catch { /* clipboard bloqueado — plano C */ }
            // 3) método antigo de cópia (funciona em mais lugares)
            try {
              const ta = document.createElement("textarea");
              ta.value = url;
              ta.style.position = "fixed"; ta.style.opacity = "0";
              document.body.appendChild(ta);
              ta.select();
              document.execCommand("copy");
              document.body.removeChild(ta);
              avisar("✅ Link copiado! Cole no WhatsApp ou onde quiser");
              return;
            } catch { /* nada funciona — plano D */ }
            // 4) último recurso: mostra o link pra copiar na mão
            avisar("Copie o link: " + url);
          }}
          className="mb-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/10 text-[11px] font-bold text-emerald-300 transition hover:bg-emerald-500/20"
        >
          {t("📤 Compartilhar app")}
        </button>
        <div id="share-aviso" style={{ display: "none", margin: "0 0 8px", padding: "8px 10px", borderRadius: 8, fontSize: 11, background: "rgba(16,185,129,.15)", color: "#6ee7b7", textAlign: "center" }} />
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
