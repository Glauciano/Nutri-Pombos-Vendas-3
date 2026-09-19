"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RadarChart, PolarAngleAxis, PolarGrid, Radar, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { T } from "../theme";

const HIST_KEY = "nutripombos-historico-provas-v1";

type Pombo = { id: number; anilha: string; nome: string | null };
type Hist = { data: string; distancia?: number; colocacao?: number; velocidade?: number; observacoes?: string; pomboId?: string };
type Metricas = { anilha: string; nome: string; provas: number; velMedia: number; reg: number; fundo: number; colScore: number };

const CORES = ["#f7bd00", "#55a3ff", "#39e58c", "#f97316"];

export default function ComparadorPombos() {
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [hist, setHist] = useState<Hist[]>([]);
  const [selecionados, setSelecionados] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/pombos").then((r) => r.json()).then((v) => setPombos(Array.isArray(v) ? v : [])).catch(() => setPombos([]));
    try { setHist(JSON.parse(localStorage.getItem(HIST_KEY) || "[]")); } catch { /* ignora */ }
  }, []);

  const disponiveis = useMemo(() => {
    const m = new Map<string, { nome: string; provas: number }>();
    hist.forEach((h) => {
      const anilhaObs = (h.observacoes || "").match(/anilha ([A-Z0-9-]+)/i)?.[1];
      let anilha = anilhaObs || "";
      if (!anilha && h.pomboId) {
        const p = pombos.find((x) => String(x.id) === String(h.pomboId));
        if (p) anilha = p.anilha;
      }
      if (!anilha) return;
      const p = pombos.find((x) => x.anilha.replace(/\s/g, "") === anilha.replace(/\s/g, ""));
      const nome = p?.nome || anilha;
      const atual = m.get(anilha);
      m.set(anilha, { nome, provas: (atual?.provas || 0) + 1 });
    });
    return Array.from(m.entries()).map(([anilha, v]) => ({ anilha, ...v })).sort((a, b) => b.provas - a.provas);
  }, [hist, pombos]);

  const metricas = useMemo<Metricas[]>(() => {
    return selecionados.map((anilha) => {
      const meus = hist.filter((h) => {
        const obs = (h.observacoes || "").match(/anilha ([A-Z0-9-]+)/i)?.[1];
        const porId = h.pomboId ? pombos.find((x) => String(x.id) === String(h.pomboId))?.anilha : null;
        const alvo = obs || porId || "";
        return alvo && alvo.replace(/\s/g, "") === anilha.replace(/\s/g, "");
      });
      const vels = meus.map((h) => h.velocidade || 0).filter(Boolean);
      const dists = meus.map((h) => h.distancia || 0).filter(Boolean);
      const cols = meus.map((h) => h.colocacao || 999).filter((c) => c < 999);
      const velMedia = vels.length ? vels.reduce((a, b) => a + b, 0) / vels.length : 0;
      const desvio = vels.length > 1 ? Math.sqrt(vels.reduce((s, v) => s + (v - velMedia) ** 2, 0) / vels.length) : 0;
      const reg = vels.length > 1 ? Math.max(0, 100 - (desvio / (velMedia || 1)) * 100) : 50;
      const colMedia = cols.length ? cols.reduce((a, b) => a + b, 0) / cols.length : 0;
      const p = pombos.find((x) => x.anilha === anilha);
      return {
        anilha, nome: p?.nome || anilha,
        provas: meus.length,
        velMedia: Math.round(velMedia),
        reg: Math.round(reg),
        fundo: dists.length ? Math.round(dists.reduce((a, b) => a + b, 0) / dists.length) : 0,
        colScore: cols.length ? Math.max(0, Math.round(100 - (colMedia - 1) * 8)) : 0,
      };
    });
  }, [selecionados, hist, pombos]);

  const dadosGrafico = useMemo(() => {
    const eixos: { eixo: string; get: (m: Metricas) => number; max: number }[] = [
      { eixo: "⚡ Velocidade", get: (m) => m.velMedia, max: 1400 },
      { eixo: "🎯 Regularidade", get: (m) => m.reg, max: 100 },
      { eixo: "📊 Provas", get: (m) => m.provas, max: Math.max(6, ...metricas.map((m) => m.provas)) },
      { eixo: "🦅 Fundo (km méd.)", get: (m) => m.fundo, max: 800 },
      { eixo: "🥇 Colocações", get: (m) => m.colScore, max: 100 },
    ];
    return eixos.map(({ eixo, get, max }) => {
      const linha: Record<string, number | string> = { eixo };
      metricas.forEach((m) => { linha[m.anilha] = Math.round(Math.min(100, (get(m) / max) * 100)); });
      return linha;
    });
  }, [metricas]);

  const toggle = (anilha: string) => setSelecionados((s) => s.includes(anilha) ? s.filter((x) => x !== anilha) : s.length >= 4 ? s : [...s, anilha]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🕸️ Comparador de Pombos</h1>
            <p style={{ ...T.small, marginTop: 4 }}>O scouting visual do plantel: compare até 4 pombos em 5 atributos (dados do seu Histórico)</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>Escolha até 4 pombos com resultados registrados</div>
          {disponiveis.length === 0 && <div style={{ ...T.small }}>Nenhum pombo com resultados no Histórico ainda — registre provas (na mão ou pelo 📥 importador) pra comparar.</div>}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {disponiveis.map((p) => {
              const sel = selecionados.includes(p.anilha);
              const cor = CORES[selecionados.indexOf(p.anilha) % 4];
              return (
                <button key={p.anilha} type="button" onClick={() => toggle(p.anilha)} style={{ padding: "7px 11px", borderRadius: 20, fontSize: 11, fontWeight: 800, cursor: "pointer", color: sel ? "#0b1426" : T.dim, background: sel ? cor : T.bgInput, border: `1px solid ${sel ? cor : T.border}` }}>
                  {sel && "● "}{p.nome} ({p.provas})
                </button>
              );
            })}
          </div>
        </section>

        {metricas.length >= 2 && (
          <>
            <section style={T.card}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🕸️ Perfil comparado (0–100 por eixo)</div>
              <div style={{ height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={dadosGrafico} outerRadius="72%">
                    <PolarGrid stroke="#31415a88" />
                    <PolarAngleAxis dataKey="eixo" tick={{ fill: "#9aa8bc", fontSize: 11 }} />
                    {metricas.map((m, i) => (
                      <Radar key={m.anilha} name={m.nome} dataKey={m.anilha} stroke={CORES[i % 4]} fill={CORES[i % 4]} fillOpacity={0.18} strokeWidth={2} />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#1b283c", border: "1px solid #31415a", borderRadius: 9, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section style={T.card}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📋 Números reais</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Pombo", "Provas", "Vel. média", "Regularidade", "Fundo méd.", "Colocações"].map((h) => (
                        <th key={h} style={{ padding: "7px 9px", textAlign: "left", color: T.dim, borderBottom: `1px solid ${T.border}`, fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metricas.map((m, i) => (
                      <tr key={m.anilha}>
                        <td style={{ padding: "7px 9px", borderBottom: `1px solid ${T.border}` }}><b style={{ color: CORES[i % 4] }}>● {m.nome}</b></td>
                        <td style={{ padding: "7px 9px", borderBottom: `1px solid ${T.border}` }}>{m.provas}</td>
                        <td style={{ padding: "7px 9px", borderBottom: `1px solid ${T.border}` }}>{m.velMedia} m/min</td>
                        <td style={{ padding: "7px 9px", borderBottom: `1px solid ${T.border}` }}>{m.reg}%</td>
                        <td style={{ padding: "7px 9px", borderBottom: `1px solid ${T.border}` }}>{m.fundo} km</td>
                        <td style={{ padding: "7px 9px", borderBottom: `1px solid ${T.border}` }}>{m.colScore}/100</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
