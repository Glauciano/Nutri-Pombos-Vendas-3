"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadConfig } from "../config";
import { T } from "../theme";

type Classe = "energia" | "proteina" | "gordura" | "fibra";
type Semente = { nome: string; emoji: string; classe: Classe; papel: string; cor: string };

const SEMENTES: Record<string, Semente> = {
  milho: { nome: "Milho amarelo", emoji: "🌽", classe: "energia", papel: "Energia rápida de liberação — combustível do voo", cor: "#EAB308" },
  trigo: { nome: "Trigo", emoji: "🌾", classe: "energia", papel: "Energia média + complexo B para o sistema nervoso", cor: "#D9B34A" },
  sorgo: { nome: "Sorgo (kafir)", emoji: "🔸", classe: "energia", papel: "Energia de liberação lenta — sustenta o fundo", cor: "#B45309" },
  aveia: { nome: "Aveia descascada", emoji: "🥣", classe: "energia", papel: "Energia lenta + B1 — fôlego e resistência", cor: "#A1A1AA" },
  ervilha: { nome: "Ervilha verde", emoji: "🟢", classe: "proteina", papel: "Proteína principal — reconstrução muscular", cor: "#22C55E" },
  maple: { nome: "Ervilha maple", emoji: "🟤", classe: "proteina", papel: "Proteína densa — pós-esforço", cor: "#A16207" },
  vagem: { nome: "Vagem", emoji: "🫛", classe: "proteina", papel: "Proteína + fibra — flora intestinal", cor: "#4ADE80" },
  lentilha: { nome: "Lentilha", emoji: "🔴", classe: "proteina", papel: "Proteína + ferro — hemoglobina e oxigenação", cor: "#EF4444" },
  girassol: { nome: "Girassol", emoji: "🌻", classe: "gordura", papel: "Gordura boa — energia de longa duração", cor: "#F97316" },
  amendoim: { nome: "Amendoim", emoji: "🥜", classe: "gordura", papel: "Gordura + proteína — reserva de fundo", cor: "#FB923C" },
  linhaça: { nome: "Linhaça", emoji: "🟣", classe: "gordura", papel: "Ômega-3 — anti-inflamatório e penas brilhantes", cor: "#A78BFA" },
  cartamo: { nome: "Cártamo", emoji: "🟡", classe: "gordura", papel: "Gordura de fácil metabolização — qualidade de pena", cor: "#FACC15" },
  colza: { nome: "Colza (canola)", emoji: "🟠", classe: "gordura", papel: "Palatabilidade + ômega — small seed que encanta", cor: "#FDBA74" },
  niger: { nome: "Níger", emoji: "⚫", classe: "gordura", papel: "Óleo altamente digestível — pequena e valiosa", cor: "#94A3B8" },
  cevada: { nome: "Cevada", emoji: "🌱", classe: "fibra", papel: "Depurativa — descansa o intestino pós-prova", cor: "#84CC16" },
  arroz: { nome: "Arroz com casca", emoji: "🍚", classe: "fibra", papel: "Fibra leve — trânsito limpo, peso correto", cor: "#CBD5E1" },
};

type DiaSemana = { dia: string; emoji: string; objetivo: string; detalhe: string; cor: string; mix: Record<string, number> };

const SEMANA: DiaSemana[] = [
  { dia: "Domingo", emoji: "💙", objetivo: "Recuperação & Depuração", cor: "#55a3ff", detalhe: "Dia pós-prova: intestino em repouso, mistura leve e fibrosa. Nada de ração pesada — o corpo se recupera com pouco.", mix: { cevada: 18, arroz: 14, trigo: 14, sorgo: 12, milho: 10, ervilha: 8, aveia: 6, vagem: 4, colza: 5, linhaça: 3, cartamo: 3, girassol: 2, niger: 1 } },
  { dia: "Segunda", emoji: "🟢", objetivo: "Reconstrução Muscular", cor: "#39e58c", detalhe: "Proteína em alta: o músculo destruído pela prova/treino se refaz. Ervilhas e lentilha dominam a tigela.", mix: { ervilha: 20, maple: 8, vagem: 10, lentilha: 6, trigo: 12, sorgo: 10, milho: 12, colza: 6, linhaça: 4, cevada: 4, arroz: 3, girassol: 3, amendoim: 2 } },
  { dia: "Terça", emoji: "🟡", objetivo: "Treino Equilibrado", cor: "#fbbf24", detalhe: "Balanceada pra voltar ao ar: energia média, proteína de manutenção e gordura moderada.", mix: { milho: 18, trigo: 14, sorgo: 12, ervilha: 14, vagem: 6, girassol: 8, colza: 6, linhaça: 4, cevada: 6, arroz: 4, aveia: 4, cartamo: 2, amendoim: 2 } },
  { dia: "Quarta", emoji: "🔵", objetivo: "Resistência (gordura média)", cor: "#55a3ff", detalhe: "Sobe a gordura boa: girassol, amendoim e linhaça constroem a reserva aeróbica do fundista.", mix: { milho: 18, trigo: 12, sorgo: 10, ervilha: 10, girassol: 12, amendoim: 8, linhaça: 6, cartamo: 6, colza: 5, niger: 3, vagem: 4, cevada: 3, arroz: 3 } },
  { dia: "Quinta", emoji: "🟠", objetivo: "Carga Energética Máxima", cor: "#f97316", detalhe: "O grande dia de carga: energia + gordura no talo pra estocar combustível. Mistura mais rica da semana.", mix: { milho: 20, girassol: 14, amendoim: 12, linhaça: 8, cartamo: 6, niger: 5, colza: 5, trigo: 10, sorgo: 8, ervilha: 6, aveia: 4, vagem: 2 } },
  { dia: "Sexta", emoji: "🟣", objetivo: "Encestamento — digestível", cor: "#a78bfa", detalhe: "Pombos viajam no cesto: sementes menores e de digestão fácil, sem peso no papo. Pequenas sementes à vontade.", mix: { trigo: 16, milho: 16, colza: 8, niger: 8, linhaça: 6, cartamo: 5, ervilha: 8, vagem: 4, arroz: 8, cevada: 5, sorgo: 8, girassol: 6, amendoim: 2 } },
  { dia: "Sábado", emoji: "⭐", objetivo: "Dia da Prova — energia disponível", cor: "#f7bd00", detalhe: "Combustível de uso imediato: milho pra chama rápida, girassol/amendoim pra queimar no meio, colza e níger pra começar leve.", mix: { milho: 22, trigo: 14, colza: 8, niger: 7, linhaça: 6, girassol: 10, amendoim: 6, cartamo: 5, ervilha: 8, sorgo: 8, arroz: 3, vagem: 3 } },
];

const CLASSE_INFO: Record<Classe, { label: string; emoji: string; cor: string }> = {
  energia: { label: "Energia", emoji: "⚡", cor: "#EAB308" },
  proteina: { label: "Proteína", emoji: "💪", cor: "#22C55E" },
  gordura: { label: "Gordura boa", emoji: "🫒", cor: "#F97316" },
  fibra: { label: "Fibra/Depurativo", emoji: "🌿", cor: "#84CC16" },
};

export default function MisturaSemanal() {
  const [diaSel, setDiaSel] = useState(() => {
    const nomes = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return nomes[new Date().getDay()];
  });
  const [cfg, setCfg] = useState({ consumoDiario: 30, quantidadePombos: 20 });
  useEffect(() => { const c = loadConfig(); setCfg({ consumoDiario: c.consumoDiario, quantidadePombos: c.quantidadePombos }); }, []);

  const dia = SEMANA.find((d) => d.dia === diaSel) || SEMANA[0];
  const mixNorm = useMemo(() => {
    const soma = Object.values(dia.mix).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(dia.mix)
      .map(([k, v]) => ({ chave: k, pct: Math.round((v / soma) * 1000) / 10, gPombo: Math.round((v / soma) * cfg.consumoDiario * 10) / 10, kgPlantel: Math.round((v / soma) * cfg.consumoDiario * cfg.quantidadePombos) / 1000 }))
      .sort((a, b) => b.pct - a.pct);
  }, [dia, cfg]);

  const perfil = useMemo(() => {
    const acc: Record<Classe, number> = { energia: 0, proteina: 0, gordura: 0, fibra: 0 };
    mixNorm.forEach((m) => { acc[SEMENTES[m.chave].classe] += m.pct; });
    return acc;
  }, [mixNorm]);

  const compras = useMemo(() => {
    const totais: Record<string, number> = {};
    SEMANA.forEach((d) => {
      const soma = Object.values(d.mix).reduce((a, b) => a + b, 0) || 1;
      Object.entries(d.mix).forEach(([k, v]) => { totais[k] = (totais[k] || 0) + (v / soma) * cfg.consumoDiario; });
    });
    return Object.entries(totais)
      .map(([k, gSemana]) => ({ chave: k, kgSemana: Math.round(gSemana * cfg.quantidadePombos) / 1000, gPombo: Math.round(gSemana) }))
      .sort((a, b) => b.kgSemana - a.kgSemana);
  }, [cfg]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🌾 Mistura Semanal Profissional</h1>
            <p style={{ ...T.small, marginTop: 4 }}>16 sementes distribuídas pela semana columófila — do descanso à carga máxima, com gramas por pombo e lista de compras</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📅 Escolha o dia da semana</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 6 }}>
            {SEMANA.map((d) => (
              <button key={d.dia} type="button" onClick={() => setDiaSel(d.dia)} style={{ padding: "10px 4px", borderRadius: 10, cursor: "pointer", background: diaSel === d.dia ? d.cor : T.bgInput, color: diaSel === d.dia ? "#0b1426" : T.dim, border: `1.5px solid ${diaSel === d.dia ? d.cor : T.border}`, fontWeight: 800, fontSize: 11, textAlign: "center" }}>
                <div style={{ fontSize: 17 }}>{d.emoji}</div>
                {d.dia}
              </button>
            ))}
          </div>
        </section>

        <section style={{ ...T.card, border: `2px solid ${dia.cor}55`, background: `${dia.cor}0d` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: dia.cor, textTransform: "uppercase" }}>{dia.emoji} {dia.dia}</div>
              <div style={{ fontSize: 21, fontWeight: 900, marginTop: 2 }}>{dia.objetivo}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: T.gold }}>{cfg.consumoDiario}g</div>
              <div style={{ fontSize: 10, color: T.dim }}>por pombo • plantel de {cfg.quantidadePombos}</div>
            </div>
          </div>
          <div style={{ ...T.small, fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>{dia.detalhe}</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginTop: 12 }}>
            {(Object.keys(perfil) as Classe[]).map((cl) => (
              <div key={cl} style={{ padding: 9, borderRadius: 9, background: "#ffffff08" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span>{CLASSE_INFO[cl].emoji} {CLASSE_INFO[cl].label}</span>
                  <b style={{ color: CLASSE_INFO[cl].cor }}>{Math.round(perfil[cl])}%</b>
                </div>
                <div style={{ height: 5, background: "#ffffff12", borderRadius: 3, marginTop: 5 }}>
                  <div style={{ height: "100%", width: `${Math.min(100, perfil[cl])}%`, background: CLASSE_INFO[cl].cor, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🥣 A mistura de {dia.dia} ({mixNorm.length} sementes)</div>
          {mixNorm.map((m) => {
            const s = SEMENTES[m.chave];
            return (
              <div key={m.chave} style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20, width: 26, textAlign: "center" }}>{s.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <b style={{ fontSize: 13 }}>{s.nome}</b>
                      <b style={{ color: s.cor, fontSize: 13 }}>{m.gPombo}g/pombo</b>
                    </div>
                    <div style={{ height: 6, background: "#ffffff12", borderRadius: 3, margin: "5px 0" }}>
                      <div style={{ height: "100%", width: `${m.pct}%`, background: s.cor, borderRadius: 3 }} />
                    </div>
                    <div style={{ ...T.small, fontSize: 10.5, lineHeight: 1.4 }}>{s.papel} • <b style={{ color: s.cor }}>{m.pct}%</b> da mistura • {m.kgPlantel.toFixed(2)}kg pro plantel</div>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ ...T.small, fontSize: 11, marginTop: 10, lineHeight: 1.5 }}>
            ⚙️ Gramas calculadas com o consumo de <b>{cfg.consumoDiario}g/dia</b> para <b>{cfg.quantidadePombos} pombos</b> — ajuste em <Link href="/centro-provas/configuracao" style={{ color: T.blue }}>Configuração</Link>.
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🛒 Compras da semana (plantel de {cfg.quantidadePombos})</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 6 }}>
            {compras.map((c) => {
              const s = SEMENTES[c.chave];
              return (
                <div key={c.chave} style={{ padding: "8px 10px", borderRadius: 8, background: "#ffffff08", borderLeft: `3px solid ${s.cor}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{s.emoji} {s.nome}</div>
                  <div style={{ ...T.small, fontSize: 11 }}><b style={{ color: T.gold }}>{c.kgSemana.toFixed(2)} kg</b>/semana • {c.gPombo}g por pombo</div>
                </div>
              );
            })}
          </div>
          <div style={{ ...T.small, fontSize: 11, marginTop: 10 }}>Soma das 7 misturas • some ~10% de margem na compra — sempre sobra um pouco.</div>
        </section>
      </div>
    </main>
  );
}
