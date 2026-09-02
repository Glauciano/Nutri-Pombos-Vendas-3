"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from "recharts";
import { T } from "../theme";

const HIST_KEY = "nutripombos-historico-provas-v1";

type ProvaHistorico = { id: string; data: string; competicao?: string; distancia: number; colocacao: number; velocidade: number; observacoes?: string };

function fmtCurta(d: string) { return d.split("-").reverse().slice(0, 2).join("/"); }

export default function GraficosTemporada() {
  const [hist, setHist] = useState<ProvaHistorico[]>([]);
  useEffect(() => {
    try { setHist(JSON.parse(localStorage.getItem(HIST_KEY) || "[]")); } catch { setHist([]); }
  }, []);

  const dados = useMemo(() => [...hist].sort((a, b) => a.data.localeCompare(b.data)), [hist]);
  const linhaVel = dados.map((h, i) => ({ nome: `${fmtCurta(h.data)}${h.distancia ? ` ${h.distancia}km` : ""}`, velocidade: h.velocidade, idx: i + 1 }));
  const porDist = useMemo(() => {
    const grupos: Record<string, number[]> = {};
    dados.forEach((h) => {
      const faixa = h.distancia <= 300 ? "⚡ até 300" : h.distancia <= 600 ? "🏃 300–600" : "🦅 600+";
      (grupos[faixa] = grupos[faixa] || []).push(h.velocidade);
    });
    return Object.entries(grupos).map(([faixa, vels]) => ({ faixa, media: Math.round(vels.reduce((a, b) => a + b, 0) / vels.length), n: vels.length }));
  }, [dados]);
  const cores = ["#eab308", "#55a3ff", "#f97316"];

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>📈 Gráficos da Temporada</h1>
            <p style={{ ...T.small, marginTop: 4 }}>A evolução do plantel prova a prova — dados do seu Histórico</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {dados.length === 0 && (
          <section style={T.card}>
            <div style={{ ...T.small, lineHeight: 1.7, fontSize: 13 }}>
              Sem dados ainda. Registre resultados no <b>📜 Histórico</b> (na mão ou pelo <b>📥 Importar resultado do clube</b>) e os gráficos aparecem aqui automaticamente.
            </div>
          </section>
        )}

        {dados.length >= 2 && (
          <>
            <section style={T.card}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 12 }}>⚡ Velocidade prova a prova (m/min)</div>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={linhaVel} margin={{ top: 6, right: 10, bottom: 4, left: -14 }}>
                    <CartesianGrid stroke="#31415a33" />
                    <XAxis dataKey="idx" tick={{ fill: "#9aa8bc", fontSize: 10 }} stroke="#31415a" />
                    <YAxis tick={{ fill: "#9aa8bc", fontSize: 10 }} stroke="#31415a" domain={["dataMin - 80", "dataMax + 80"]} />
                    <Tooltip contentStyle={{ background: "#1b283c", border: "1px solid #31415a", borderRadius: 9, fontSize: 12 }} labelFormatter={(v) => linhaVel[Number(v) - 1]?.nome ?? ""} formatter={(v) => [`${v} m/min`, "Velocidade"]} />
                    <Line type="monotone" dataKey="velocidade" stroke="#f7bd00" strokeWidth={2.5} dot={{ r: 4, fill: "#f7bd00" }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section style={T.card}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 12 }}>📊 Velocidade média por distância</div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={porDist} margin={{ top: 6, right: 10, bottom: 4, left: -14 }}>
                    <CartesianGrid stroke="#31415a33" />
                    <XAxis dataKey="faixa" tick={{ fill: "#9aa8bc", fontSize: 11 }} stroke="#31415a" />
                    <YAxis tick={{ fill: "#9aa8bc", fontSize: 10 }} stroke="#31415a" />
                    <Tooltip contentStyle={{ background: "#1b283c", border: "1px solid #31415a", borderRadius: 9, fontSize: 12 }} formatter={(v, _n, item) => [`${v} m/min (${(item?.payload as { n?: number })?.n ?? "?"} provas)`, "Média"]} />
                    <Bar dataKey="media" radius={[7, 7, 0, 0]}>
                      {porDist.map((entry, i) => <Cell key={entry.faixa} fill={cores[i % cores.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section style={T.card}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🏆 Resumo</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
                {([
                  ["Provas registradas", String(dados.length)],
                  ["Velocidade média", `${Math.round(dados.reduce((s, h) => s + h.velocidade, 0) / dados.length)} m/min`],
                  ["Melhor velocidade", `${Math.max(...dados.map((h) => h.velocidade))} m/min`],
                  ["Melhor colocação", `${Math.min(...dados.map((h) => h.colocacao || 999))}º`],
                  ["Mais rápida faixa", porDist.length ? porDist.reduce((a, b) => (b.media > a.media ? b : a)).faixa : "—"],
                ] as const).map(([l, v]) => (
                  <div key={l} style={{ padding: 10, borderRadius: 9, background: "#ffffff08", textAlign: "center" }}>
                    <div style={{ ...T.small, fontSize: 10 }}>{l}</div>
                    <b style={{ color: T.gold, fontSize: 15 }}>{v}</b>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {dados.length === 1 && <section style={T.card}><div style={{ ...T.small }}>Você tem 1 prova registrada — cadastre mais uma pra os gráficos ganharem forma!</div></section>}
      </div>
    </main>
  );
}
