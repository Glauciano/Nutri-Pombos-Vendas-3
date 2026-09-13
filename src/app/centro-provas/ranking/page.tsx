"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

const HIST_KEY = "nutripombos-historico-provas-v1";
const KEY_FOTOS = "nutripombos-fotos-v1";

type HistItem = { id?: string; data: string; competicao?: string; distancia: number; colocacao: number; velocidade: number; observacoes?: string; pomboId?: string };
type Pombo = { id: number; anilha: string; nome: string | null };
type Linha = { anilha: string; nome: string; provas: number; melhorCol: number; velMedia: number; velMax: number; foto: string | null };

export default function RankingPlantel() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [ordenar, setOrdenar] = useState<"velMedia" | "provas" | "melhorCol">("velMedia");

  useEffect(() => {
    let hist: HistItem[] = [];
    let pombos: Pombo[] = [];
    try { hist = JSON.parse(localStorage.getItem(HIST_KEY) || "[]"); } catch { /* ignora */ }
    let fotos: Record<string, string> = {};
    try { fotos = JSON.parse(localStorage.getItem(KEY_FOTOS) || "{}"); } catch { /* ignora */ }
    fetch("/api/pombos").then((r) => r.json()).then((v) => { pombos = Array.isArray(v) ? v : []; computar(); }).catch(() => computar());

    function computar() {
      const acc: Record<string, { vel: number[]; cols: number[]; nome: string; foto: string | null }> = {};
      hist.forEach((h) => {
        // identifica o pombo: pela anilha na observação (importador) ou pelo pomboId (Dia da Prova)
        const anilhaObs = (h.observacoes || "").match(/anilha ([A-Z0-9-]+)/i)?.[1];
        let anilha = anilhaObs || "";
        let nome = anilha;
        if (!anilha && h.pomboId) {
          const p = pombos.find((x) => String(x.id) === String(h.pomboId));
          if (p) { anilha = p.anilha; nome = p.nome || p.anilha; }
        } else if (anilha) {
          const p = pombos.find((x) => x.anilha.replace(/\s/g, "") === anilha.replace(/\s/g, ""));
          if (p) nome = p.nome || anilha;
        }
        if (!anilha) return;
        if (!acc[anilha]) acc[anilha] = { vel: [], cols: [], nome, foto: fotos[anilha] ?? null };
        if (h.velocidade) acc[anilha].vel.push(h.velocidade);
        if (h.colocacao) acc[anilha].cols.push(h.colocacao);
      });
      const lista: Linha[] = Object.entries(acc).map(([anilha, a]) => ({
        anilha,
        nome: a.nome || anilha,
        provas: a.vel.length,
        melhorCol: a.cols.length ? Math.min(...a.cols) : 999,
        velMedia: a.vel.length ? Math.round(a.vel.reduce((x, y) => x + y, 0) / a.vel.length) : 0,
        velMax: a.vel.length ? Math.max(...a.vel) : 0,
        foto: a.foto,
      })).filter((l) => l.provas > 0);
      setLinhas(lista);
    }
  }, []);

  const ordenadas = [...linhas].sort((a, b) => ordenar === "velMedia" ? b.velMedia - a.velMedia : ordenar === "provas" ? b.provas - a.provas : a.melhorCol - b.melhorCol);
  const medalha = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🏆 Ranking do Plantel</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Quem é o craque? Velocidade, provas e colocações por pombo — alimenta-se do seu Histórico</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={T.card}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ ...T.small, fontSize: 11 }}>Ordenar por:</span>
            {([["velMedia", "⚡ Velocidade média"], ["provas", "📊 Provas voadas"], ["melhorCol", "🥇 Melhor colocação"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setOrdenar(k)} type="button" style={{ padding: "7px 11px", borderRadius: 20, fontSize: 10.5, fontWeight: 800, cursor: "pointer", color: ordenar === k ? T.bg : T.dim, background: ordenar === k ? T.gold : T.bgInput, border: `1px solid ${ordenar === k ? T.gold : T.border}` }}>{l}</button>
            ))}
          </div>
        </section>

        {linhas.length === 0 && (
          <section style={T.card}>
            <div style={{ ...T.small, lineHeight: 1.8, fontSize: 13 }}>
              Ainda sem dados pra ranquear. Registre resultados no <b>📜 Histórico</b> (na mão ou pelo <b>📥 importador</b> do resultado do clube) — o ranking se monta sozinho com a anilha de cada pombo.
            </div>
          </section>
        )}

        {ordenadas.map((l, i) => (
          <section key={l.anilha} style={{ ...T.card, marginBottom: 8, borderLeft: `4px solid ${i === 0 ? T.gold : i === 1 ? "#c0c8d8" : i === 2 ? "#c88a4a" : T.border}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 22, width: 44, textAlign: "center", fontWeight: 900 }}>{medalha(i)}</div>
            {l.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={l.foto} alt={l.nome} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: `2px solid ${T.gold}66` }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: T.bgInput, display: "grid", placeItems: "center", fontSize: 19 }}>🐦</div>
            )}
            <div style={{ flex: 1, minWidth: 170 }}>
              <b style={{ fontSize: 14 }}>{l.nome}</b> <span style={{ ...T.small, fontSize: 10 }}>({l.anilha})</span>
              <div style={{ ...T.small, fontSize: 11 }}>
                📊 {l.provas} prova(s) · 🥇 melhor: {l.melhorCol < 999 ? `${l.melhorCol}º lugar` : "—"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <b style={{ fontSize: 17, color: T.gold }}>{l.velMedia} <small style={{ fontSize: 10 }}>m/min méd.</small></b>
              <div style={{ ...T.small, fontSize: 10 }}>máx: {l.velMax}</div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
