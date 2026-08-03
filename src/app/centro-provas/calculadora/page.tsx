"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";
import { loadConfig } from "../config";

export const DISTRIBUICAO: Record<string, Record<string, { sementes: number; mix: number; obs: string }>> = {
  Velocidade: {
    Domingo: { sementes: 28, mix: 2, obs: "Recuperação pós-prova" },
    Segunda: { sementes: 28, mix: 2, obs: "Limpeza e depuração" },
    Terça: { sementes: 27, mix: 3, obs: "Treino explosivo" },
    Quarta: { sementes: 26, mix: 4, obs: "Treino técnico" },
    Quinta: { sementes: 25, mix: 5, obs: "Carga energética ⚗️ MIX" },
    Sexta: { sementes: 27, mix: 3, obs: "Encestamento — leve" },
    Sábado: { sementes: 30, mix: 0, obs: "⭐ DIA DA PROVA" },
  },
  "Meio Fundo": {
    Domingo: { sementes: 27, mix: 3, obs: "Recuperação pós-prova" },
    Segunda: { sementes: 27, mix: 3, obs: "Recuperação ativa" },
    Terça: { sementes: 26, mix: 4, obs: "Treino resistência" },
    Quarta: { sementes: 25, mix: 5, obs: "Treino longo" },
    Quinta: { sementes: 24, mix: 6, obs: "Descanso + carga ⚗️ MIX" },
    Sexta: { sementes: 25, mix: 5, obs: "Carga pesada ⚗️ MIX" },
    Sábado: { sementes: 28, mix: 2, obs: "Encestamento" },
    Domingo2: { sementes: 30, mix: 0, obs: "⭐ DIA DA PROVA" },
  },
  Fundo: {
    Domingo: { sementes: 26, mix: 4, obs: "Recuperação total" },
    Segunda: { sementes: 26, mix: 4, obs: "Recuperação ativa" },
    Terça: { sementes: 25, mix: 5, obs: "Treino médio" },
    Quarta: { sementes: 24, mix: 6, obs: "Treino longo" },
    Quinta: { sementes: 23, mix: 7, obs: "Carga energética ⚗️ MIX MÁXIMO" },
    Sexta: { sementes: 24, mix: 6, obs: "Carga máxima" },
    Sábado: { sementes: 26, mix: 4, obs: "Encestamento" },
    Domingo2: { sementes: 30, mix: 0, obs: "⭐ DIA DA PROVA" },
  },
};

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const CATS = ["Velocidade", "Meio Fundo", "Fundo"];

type Tab = "dia" | "semana";

function escalar(base: number, consumo: number): number {
  return Math.round((base / 30) * consumo * 10) / 10;
}

function ajustar(sementes: number, condicao: string): number {
  if (condicao === "Magro") return Math.round(sementes * 1.05 * 10) / 10;
  if (condicao === "Pesado") return Math.round(sementes * 0.95 * 10) / 10;
  return sementes;
}

export default function Calculadora() {
  const [categoria, setCategoria] = useState("Velocidade");
  const [dia, setDia] = useState("Quinta");
  const [pombos, setPombos] = useState(30);
  const [consumo, setConsumo] = useState(30);
  const [condicao, setCondicao] = useState("Ideal");
  const [mixExtra, setMixExtra] = useState(0);
  const [tab, setTab] = useState<Tab>("dia");

  useEffect(() => {
    const config = loadConfig();
    setPombos(config.quantidadePombos);
    setConsumo(config.consumoDiario);
    setCondicao(config.condicaoCorporal);
  }, []);

  const dados = DISTRIBUICAO[categoria]?.[dia] || { sementes: 25, mix: 5, obs: "" };
  const semBase = escalar(dados.sementes, consumo);
  const semFinal = ajustar(semBase, condicao);
  const mixBase = escalar(dados.mix, consumo);
  const mixFinal = mixBase + mixExtra;
  const total = semFinal + mixFinal;
  const semPlantel = (semFinal * pombos) / 1000;
  const mixPlantel = mixFinal * pombos;
  const totalPlantel = semPlantel + mixPlantel / 1000;
  const diasCat = Object.entries(DISTRIBUICAO[categoria] || {});

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "18px 12px 48px" }}>
      <div style={{ width: "100%", maxWidth: 760, margin: "0 auto" }}>
        <Link href="/centro-provas" style={{ display: "inline-block", color: T.dim, textDecoration: "none", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px 12px", fontSize: 11, marginBottom: 18 }}>
          ← Voltar
        </Link>

        <div style={{ marginBottom: 20 }}>
          <h1 style={T.h1}>🧮 Calculadora do Plantel</h1>
          <p style={{ ...T.small, marginTop: 4 }}>Cálculo automático por categoria, dia e quantidade</p>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 14 }}>⚙️ Configuração</div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ ...T.label, marginBottom: 6 }}>🏆 Categoria</div>
            <div style={{ display: "flex", gap: 6 }}>
              {CATS.map((c) => (
                <button key={c} type="button" onClick={() => setCategoria(c)} style={{ flex: 1, padding: "10px 4px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, textAlign: "center", background: categoria === c ? T.gold : T.bgInput, color: categoria === c ? T.bg : T.dim, border: categoria === c ? `2px solid ${T.gold}` : `1px solid ${T.border}` }}>{c}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ ...T.label, marginBottom: 6 }}>📅 Dia da semana</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {DIAS.map((d) => (
                <button key={d} type="button" onClick={() => setDia(d)} style={{ flex: "1 1 74px", padding: "8px 10px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, background: dia === d ? T.gold : T.bgInput, color: dia === d ? T.bg : T.dim, border: dia === d ? `2px solid ${T.gold}` : `1px solid ${T.border}` }}>{d.slice(0, 3)}</button>
              ))}
            </div>
            {dados.obs && <div style={{ marginTop: 6, fontSize: 11, color: T.gold, padding: "5px 8px", borderRadius: 6, background: "rgba(234,179,8,0.08)" }}>📌 {dados.obs}</div>}
          </div>

          <div className="calc-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ ...T.label, marginBottom: 5 }}>🐦 Qtd. pombos</div>
              <input aria-label="Quantidade de pombos" type="number" min={1} max={500} value={pombos} onChange={(e) => setPombos(Math.max(1, Number(e.target.value)))} style={{ ...T.input, textAlign: "center", fontSize: 20, fontWeight: 700 }} />
            </div>
            <div>
              <div style={{ ...T.label, marginBottom: 5 }}>🌾 Consumo (g/dia)</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[25, 28, 30, 32, 35].map((v) => (
                  <button key={v} type="button" onClick={() => setConsumo(v)} style={{ flex: 1, padding: "8px 2px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, background: consumo === v ? T.gold : T.bgInput, color: consumo === v ? T.bg : T.dim, border: consumo === v ? `2px solid ${T.gold}` : `1px solid ${T.border}` }}>{v}</button>
                ))}
              </div>
              <input aria-label="Consumo personalizado" type="number" min={10} max={60} value={consumo} onChange={(e) => setConsumo(Math.max(0, Number(e.target.value)))} style={{ ...T.input, textAlign: "center", fontSize: 16, fontWeight: 700, marginTop: 6 }} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ ...T.label, marginBottom: 6 }}>📊 Condição corporal</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { v: "Magro", e: "⬆️", c: T.red, d: "+5% sementes" },
                { v: "Ideal", e: "✅", c: T.green, d: "Padrão" },
                { v: "Pesado", e: "⬇️", c: "#FBBF24", d: "-5% sementes" },
              ].map(({ v, e, c, d }) => (
                <button key={v} type="button" onClick={() => setCondicao(v)} style={{ flex: 1, padding: "10px 4px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, textAlign: "center", background: condicao === v ? `${c}20` : T.bgInput, color: condicao === v ? c : T.dim, border: condicao === v ? `2px solid ${c}` : `1px solid ${T.border}` }}>
                  {e} {v}<br /><span style={{ fontSize: 9, opacity: 0.7 }}>{d}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ ...T.label, marginBottom: 6 }}>⚗️ Mix Final Extra (g/pombo adicional)</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1 }}>
                {[0, 1, 2, 3, 5, 10].map((v) => (
                  <button key={v} type="button" onClick={() => setMixExtra(v)} style={{ flex: "1 1 42px", padding: "8px 9px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: mixExtra === v ? "#A78BFA" : T.bgInput, color: mixExtra === v ? T.bg : T.dim, border: mixExtra === v ? "2px solid #A78BFA" : `1px solid ${T.border}` }}>{v === 0 ? "0" : `+${v}g`}</button>
                ))}
              </div>
              <input aria-label="Mix extra personalizado" type="number" min={0} max={50} step={0.5} value={mixExtra} onChange={(e) => setMixExtra(Math.max(0, Number(e.target.value)))} style={{ ...T.input, width: 80, textAlign: "center", fontSize: 16, fontWeight: 700 }} />
            </div>
            {mixExtra > 0 && <div style={{ marginTop: 6, fontSize: 11, color: "#A78BFA", padding: "5px 8px", borderRadius: 6, background: "rgba(167,139,250,0.1)" }}>⚗️ Mix total por pombo: {mixBase}g (protocolo) + {mixExtra}g (extra) = <b>{mixFinal}g</b></div>}
          </div>
        </section>

        <section className="calc-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <ResultCard title={`${dia.toUpperCase()} • POR POMBO`} titleColor={T.gold} background="rgba(234,179,8,0.08)" border="rgba(234,179,8,0.3)" rows={[
            ["Sementes", `${semFinal} g`, T.gold], ["Mix Final", `${mixFinal} g`, "#A78BFA"], ["Total", `${total.toFixed(1)} g`, T.white],
          ]} />
          <ResultCard title={`PARA ${pombos} POMBOS`} titleColor={T.blue} background="rgba(59,130,246,0.08)" border="rgba(59,130,246,0.3)" rows={[
            ["Sementes", semPlantel >= 1 ? `${semPlantel.toFixed(2)} kg` : `${(semPlantel * 1000).toFixed(0)} g`, T.gold],
            ["Mix Final", mixPlantel >= 1000 ? `${(mixPlantel / 1000).toFixed(2)} kg` : `${mixPlantel.toFixed(0)} g`, "#A78BFA"],
            ["Total diário", `${totalPlantel.toFixed(2)} kg`, T.white],
          ]} />
        </section>

        {mixFinal > 0 && (
          <section style={T.card}>
            <div style={{ fontSize: 12, color: T.dim, marginBottom: 6 }}>Proporção sementes × Mix Final:</div>
            <div style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden" }}>
              <div style={{ flex: semFinal, background: T.gold }} title={`Sementes ${semFinal}g`} />
              <div style={{ flex: mixFinal, background: "#A78BFA" }} title={`Mix ${mixFinal}g`} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
              <span style={{ fontSize: 11, color: T.gold }}>🌾 Sementes {Math.round((semFinal / total) * 100)}%</span>
              <span style={{ fontSize: 11, color: "#A78BFA" }}>⚗️ Mix {Math.round((mixFinal / total) * 100)}%</span>
            </div>
          </section>
        )}

        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {([{ k: "dia", l: "📅 Resumo do Dia" }, { k: "semana", l: "📆 Semana Completa" }] as const).map((item) => (
            <button key={item.k} type="button" onClick={() => setTab(item.k)} style={{ flex: 1, padding: 10, borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: tab === item.k ? 800 : 500, background: tab === item.k ? T.gold : T.bgCard, color: tab === item.k ? T.bg : T.dim, border: tab === item.k ? `2px solid ${T.gold}` : `1px solid ${T.border}` }}>{item.l}</button>
          ))}
        </div>

        {tab === "semana" && (
          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 12 }}>📆 Protocolo Semanal — {categoria}</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 660 }}>
                <thead><tr style={{ background: "rgba(255,255,255,0.03)" }}>{["Dia", "Sementes/pombo", "Mix/pombo", "Total/pombo", "Total plantel", "Obs"].map((h) => <th key={h} style={{ padding: "8px 6px", textAlign: "left", color: T.dim, fontWeight: 600, whiteSpace: "nowrap", borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {diasCat.map(([diaKey, v]) => {
                    const sem = ajustar(escalar(v.sementes, consumo), condicao);
                    const mix = escalar(v.mix, consumo) + (v.mix > 0 ? mixExtra : 0);
                    const tot = sem + mix;
                    const isHoje = diaKey === dia;
                    return <tr key={diaKey} onClick={() => { setDia(diaKey); setTab("dia"); }} style={{ borderBottom: `1px solid ${T.border}`, background: isHoje ? "rgba(234,179,8,0.06)" : "transparent", cursor: "pointer" }}>
                      <td style={{ padding: "10px 6px", fontWeight: isHoje ? 800 : 600, color: isHoje ? T.gold : T.white }}>{diaKey.replace("2", "")}</td>
                      <td style={{ padding: "10px 6px", fontWeight: 700, color: T.gold }}>{sem}g</td>
                      <td style={{ padding: "10px 6px", fontWeight: 700, color: "#A78BFA" }}>{mix > 0 ? `${mix}g` : "—"}</td>
                      <td style={{ padding: "10px 6px", color: T.white }}>{tot.toFixed(1)}g</td>
                      <td style={{ padding: "10px 6px", color: T.green }}>{(tot * pombos / 1000).toFixed(2)}kg</td>
                      <td style={{ padding: "10px 6px", color: T.dim, fontSize: 10 }}>{v.obs}</td>
                    </tr>;
                  })}
                </tbody>
                <tfoot><tr style={{ background: "rgba(234,179,8,0.08)", borderTop: `2px solid ${T.gold}` }}><td colSpan={3} style={{ padding: "10px 6px", fontWeight: 800, color: T.gold }}>TOTAL SEMANAL</td><td colSpan={3} style={{ padding: "10px 6px", color: T.green, fontWeight: 800 }}>{diasCat.reduce((sum, [, v]) => sum + (ajustar(escalar(v.sementes, consumo), condicao) + escalar(v.mix, consumo) + (v.mix > 0 ? mixExtra : 0)) * pombos / 1000, 0).toFixed(2)}kg para {pombos} pombos</td></tr></tfoot>
              </table>
            </div>
          </section>
        )}

        {tab === "dia" && (
          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 10 }}>💡 Resumo — {dia}</div>
            <div style={{ fontSize: 13, color: T.dim, lineHeight: 1.8 }}>
              • <b style={{ color: T.white }}>Categoria:</b> {categoria}<br />
              • <b style={{ color: T.white }}>Consumo base:</b> {consumo}g/pombo<br />
              • <b style={{ color: T.white }}>Condição:</b> {condicao} {condicao === "Magro" ? "(+5%)" : condicao === "Pesado" ? "(-5%)" : "(sem ajuste)"}<br />
              • <b style={{ color: T.gold }}>Sementes/pombo:</b> {semFinal}g<br />
              • <b style={{ color: "#A78BFA" }}>Mix Final/pombo:</b> {mixFinal}g {mixExtra > 0 ? `(${mixBase}g protocolo + ${mixExtra}g extra)` : ""}<br />
              • <b style={{ color: T.white }}>Total/pombo:</b> {total.toFixed(1)}g<br />
              • <b style={{ color: T.green }}>Total plantel ({pombos} pombos):</b> {totalPlantel.toFixed(2)}kg
            </div>
          </section>
        )}
      </div>
      <style jsx global>{`@media (max-width: 560px) { .calc-grid { grid-template-columns: 1fr !important; } } input:focus { border-color: ${T.gold} !important; } button { font-family: inherit; }`}</style>
    </main>
  );
}

function ResultCard({ title, titleColor, background, border, rows }: { title: string; titleColor: string; background: string; border: string; rows: [string, string, string][] }) {
  return <div style={{ background, border: `1px solid ${border}`, borderRadius: 14, padding: 16 }}>
    <div style={{ fontSize: 10, fontWeight: 800, color: titleColor, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{title}</div>
    {rows.map(([label, value, color]) => <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}><span style={{ fontSize: 13, color: T.dim }}>{label}</span><span style={{ fontSize: 16, fontWeight: 900, color }}>{value}</span></div>)}
  </div>;
}
