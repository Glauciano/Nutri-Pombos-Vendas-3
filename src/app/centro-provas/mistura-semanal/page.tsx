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
  { dia: "Domingo", emoji: "💙", objetivo: "Recuperação & Depuração", cor: "#55a3ff", detalhe: "Dia pós-prova: intestino em repouso, mistura leve e fibrosa. Nada de ração pesada — o corpo se recupera com pouco.", mix: { cevada: 22, arroz: 16, trigo: 16, sorgo: 14, milho: 12, ervilha: 10, colza: 5, linhaça: 5 } },
  { dia: "Segunda", emoji: "🟢", objetivo: "Reconstrução Muscular", cor: "#39e58c", detalhe: "Proteína em alta: o músculo destruído pela prova/treino se refaz. Ervilhas e lentilha dominam a tigela.", mix: { ervilha: 26, maple: 12, vagem: 10, lentilha: 8, trigo: 14, milho: 14, colza: 8, girassol: 8 } },
  { dia: "Terça", emoji: "🟡", objetivo: "Treino Equilibrado", cor: "#fbbf24", detalhe: "Balanceada pra voltar ao ar: energia média, proteína de manutenção e gordura moderada.", mix: { milho: 20, trigo: 16, sorgo: 14, ervilha: 16, girassol: 10, cevada: 8, colza: 8, linhaça: 8 } },
  { dia: "Quarta", emoji: "🔵", objetivo: "Resistência (gordura média)", cor: "#55a3ff", detalhe: "Sobe a gordura boa: girassol, amendoim e linhaça constroem a reserva aeróbica do fundista.", mix: { milho: 20, girassol: 16, trigo: 12, amendoim: 10, ervilha: 10, sorgo: 10, linhaça: 8, colza: 8, cartamo: 6 } },
  { dia: "Quinta", emoji: "🟠", objetivo: "Carga Energética Máxima", cor: "#f97316", detalhe: "O grande dia de carga: energia + gordura no talo pra estocar combustível. Mistura mais rica da semana.", mix: { milho: 24, girassol: 16, amendoim: 14, trigo: 12, sorgo: 10, linhaça: 8, cartamo: 6, ervilha: 6, niger: 4 } },
  { dia: "Sexta", emoji: "🟣", objetivo: "Encestamento — digestível", cor: "#a78bfa", detalhe: "Pombos viajam no cesto: sementes menores e de digestão fácil, sem peso no papo. Pequenas sementes à vontade.", mix: { trigo: 18, milho: 16, colza: 10, niger: 8, ervilha: 10, arroz: 10, sorgo: 12, linhaça: 8, girassol: 8 } },
  { dia: "Sábado", emoji: "⭐", objetivo: "Dia da Prova — energia disponível", cor: "#f7bd00", detalhe: "Combustível de uso imediato: milho pra chama rápida, girassol/amendoim pra queimar no meio, colza e níger pra começar leve. Esta é a RAÇÃO do dia — sem Mix em pó (a regra: dia de prova, energia só dos grãos).", mix: { milho: 26, trigo: 14, girassol: 12, ervilha: 10, sorgo: 10, colza: 8, amendoim: 8, linhaça: 6, niger: 6 } },
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
  const [loteKg, setLoteKg] = useState(1);
  useEffect(() => { const c = loadConfig(); setCfg({ consumoDiario: c.consumoDiario, quantidadePombos: c.quantidadePombos }); }, []);

  const dia = SEMANA.find((d) => d.dia === diaSel) || SEMANA[0];
  const mixNorm = useMemo(() => {
    const soma = Object.values(dia.mix).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(dia.mix)
      .map(([k, v]) => {
        const pct = Math.round((v / soma) * 1000) / 10;
        return { chave: k, pct, gLote: Math.round((pct / 100) * loteKg * 1000), gPlantel: Math.round((pct / 100) * cfg.consumoDiario * cfg.quantidadePombos) };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [dia, cfg, loteKg]);
  const totalPlantelDia = cfg.consumoDiario * cfg.quantidadePombos;

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
              <div style={{ fontSize: 10, color: T.dim }}>por pombo — UMA medida da mistura pronta</div>
              <div style={{ fontSize: 10, color: T.dim }}>plantel: <b style={{ color: T.gold }}>{totalPlantelDia}g/dia</b> (uma tigela)</div>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>🥣 Receita do lote de {dia.dia} ({mixNorm.length} sementes)</div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span style={{ ...T.small, fontSize: 10 }}>montar lote de:</span>
              {[1, 2, 5, 10].map((k) => (
                <button key={k} type="button" onClick={() => setLoteKg(k)} style={{ padding: "4px 9px", borderRadius: 7, fontSize: 10, fontWeight: 800, cursor: "pointer", color: loteKg === k ? "#0b1426" : T.dim, background: loteKg === k ? T.gold : T.bgInput, border: `1px solid ${loteKg === k ? T.gold : T.border}` }}>{k}kg</button>
              ))}
            </div>
          </div>
          <div style={{ ...T.small, fontSize: 11, marginBottom: 10, lineHeight: 1.5, color: T.dim }}>
            Monte o lote na balança (pese cada semente uma vez, misture num balde) e sirva <b style={{ color: T.gold }}>{cfg.consumoDiario}g por pombo</b> da mistura pronta — não pese semente por semente na hora de alimentar!
          </div>
          {mixNorm.map((m) => {
            const s = SEMENTES[m.chave];
            return (
              <div key={m.chave} style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20, width: 26, textAlign: "center" }}>{s.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <b style={{ fontSize: 13 }}>{s.nome}</b>
                      <b style={{ color: s.cor, fontSize: 13 }}>{m.gLote}g</b>
                    </div>
                    <div style={{ height: 6, background: "#ffffff12", borderRadius: 3, margin: "5px 0" }}>
                      <div style={{ height: "100%", width: `${m.pct}%`, background: s.cor, borderRadius: 3 }} />
                    </div>
                    <div style={{ ...T.small, fontSize: 10.5, lineHeight: 1.4 }}>{s.papel} • <b style={{ color: s.cor }}>{m.pct}%</b> do lote de {loteKg}kg = <b style={{ color: s.cor }}>{m.gLote}g</b> • {m.gPlantel}g no balde do plantel</div>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ ...T.small, fontSize: 11, marginTop: 10, lineHeight: 1.5 }}>
            ⚙️ Lote rende ~{Math.round((loteKg * 1000) / Math.max(1, totalPlantelDia))} dias pro plantel de {cfg.quantidadePombos} pombos ({cfg.consumoDiario}g/dia cada) — ajuste o consumo em <Link href="/centro-provas/configuracao" style={{ color: T.blue }}>Configuração</Link>.
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
