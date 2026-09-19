"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type Pombo = { id: number; anilha: string; nome: string | null; sexo: string; paiId: number | null; maeId: number | null };
type Olho = "amarelo" | "perola" | "outro";

const KEY_OLHOS = "nutripombos-olhos-v1";

function lerOlhos(): Record<string, Olho> {
  try { return JSON.parse(localStorage.getItem(KEY_OLHOS) || "{}"); } catch { return {}; }
}
function gravarOlhos(o: Record<string, Olho>) {
  try { localStorage.setItem(KEY_OLHOS, JSON.stringify(o)); } catch { /* ignora */ }
}

/** ancestors até 3 gerações (inclui o próprio) */
function ancestrais(p: Pombo | undefined, mapa: Map<number, Pombo>, prof = 3): Set<number> {
  const s = new Set<number>();
  if (!p || prof < 0) return s;
  s.add(p.id);
  for (const a of [p.paiId, p.maeId]) {
    if (a == null) continue;
    const av = mapa.get(a);
    if (av) for (const x of ancestrais(av, mapa, prof - 1)) s.add(x);
  }
  return s;
}

function consanguinidade(a: Pombo, b: Pombo, mapa: Map<number, Pombo>): { nivel: "alta" | "media" | "baixa"; comuns: number; txt: string } {
  const aa = ancestrais(a, mapa, 2); // até avós
  const ab = ancestrais(b, mapa, 2);
  let comuns = 0;
  aa.forEach((x) => { if (ab.has(x)) comuns++; });
  if (comuns > 0) return { nivel: "alta", comuns, txt: `${comuns} ancestral(is) comum(ns) até avós` };
  const aa3 = ancestrais(a, mapa, 3);
  const ab3 = ancestrais(b, mapa, 3);
  comuns = 0;
  aa3.forEach((x) => { if (ab3.has(x)) comuns++; });
  if (comuns > 0) return { nivel: "media", comuns, txt: `${comuns} ancestral(is) comum(ns) em bisavós` };
  return { nivel: "baixa", comuns: 0, txt: "nenhum ancestral comum em 3 gerações" };
}

function vereditoOlho(a: Olho | undefined, b: Olho | undefined): { nota: string; cor: string; pontos: number } {
  if (!a || !b || a === "outro" || b === "outro") return { nota: "eye-sign não informado (ou outro) — neutro", cor: T.dim, pontos: 0 };
  if (a === "amarelo" && b === "perola") return { nota: "✅ Amarelo × Pérola — a aposta de Barkel: velocidade + resistência + homing", cor: T.green, pontos: 12 };
  if (a === "perola" && b === "amarelo") return { nota: "✅ Pérola × Amarelo — a aposta de Barkel: velocidade + resistência + homing", cor: T.green, pontos: 12 };
  if (a === "perola" && b === "perola") return { nota: "🚫 Pérola × Pérola — Barkel evita: velocidade e vitalidade à custa do homing", cor: T.red, pontos: -22 };
  return { nota: "🚫 Amarelo × Amarelo — Barkel evita: lentos e teimosos (muita resistência, pouca vitalidade)", cor: T.red, pontos: -22 };
}

export default function AssistenteAcasalamento() {
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [olhos, setOlhos] = useState<Record<string, Olho>>({});
  const [macho, setMacho] = useState<Pombo | null>(null);
  const [femea, setFemea] = useState<Pombo | null>(null);

  useEffect(() => {
    fetch("/api/pombos").then((r) => r.json()).then((v) => setPombos(Array.isArray(v) ? v : [])).catch(() => setPombos([]));
    setOlhos(lerOlhos());
  }, []);

  const mapa = useMemo(() => new Map(pombos.map((p) => [p.id, p])), [pombos]);
  const machos = pombos.filter((p) => p.sexo === "macho");
  const femeas = pombos.filter((p) => p.sexo === "femea");

  const salvarOlho = (anilha: string, o: Olho) => {
    const novo = { ...olhos, [anilha]: o };
    setOlhos(novo); gravarOlhos(novo);
  };

  const analise = useMemo(() => {
    if (!macho || !femea) return null;
    const cons = consanguinidade(macho, femea, mapa);
    const olho = vereditoOlho(olhos[macho.anilha], olhos[femea.anilha]);
    let score = 70;
    if (cons.nivel === "alta") score -= 45;
    else if (cons.nivel === "media") score -= 20;
    else score += 10;
    score += olho.pontos;
    score = Math.max(0, Math.min(100, score));
    const veredito = score >= 70 ? "CASAL RECOMENDADO" : score >= 45 ? "CAUTELA" : "NÃO RECOMENDADO";
    return { cons, olho, score, veredito };
  }, [macho, femea, mapa, olhos]);

  const sugestoes = useMemo(() => {
    const lista: { m: Pombo; f: Pombo; score: number; cons: ReturnType<typeof consanguinidade>; olho: ReturnType<typeof vereditoOlho> }[] = [];
    for (const m of machos) for (const f of femeas) {
      if (m.id === f.id) continue;
      const cons = consanguinidade(m, f, mapa);
      const olho = vereditoOlho(olhos[m.anilha], olhos[f.anilha]);
      let score = 70;
      score += cons.nivel === "alta" ? -45 : cons.nivel === "media" ? -20 : 10;
      score += olho.pontos;
      lista.push({ m, f, score, cons, olho });
    }
    return lista.sort((a, b) => b.score - a.score).slice(0, 6);
  }, [machos, femeas, mapa, olhos]);

  const SeletorOlho = ({ p }: { p: Pombo | null }) => !p ? null : (
    <div style={{ marginTop: 8 }}>
      <div style={{ ...T.label, marginBottom: 4 }}>👁️ Olho (eye-sign de {p.nome || p.anilha})</div>
      <div style={{ display: "flex", gap: 5 }}>
        {(["amarelo", "perola", "outro"] as Olho[]).map((o) => (
          <button key={o} type="button" onClick={() => salvarOlho(p.anilha, o)} style={{ flex: 1, padding: "7px 4px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer", color: olhos[p.anilha] === o ? T.bg : T.dim, background: olhos[p.anilha] === o ? (o === "amarelo" ? "#EAB308" : o === "perola" ? "#cbd5e1" : T.gold) : T.bgInput, border: `1px solid ${T.border}` }}>
            {o === "amarelo" ? "🟡 Amarelo" : o === "perola" ? "⚪ Pérola" : "🔵 Outro"}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>💘 Assistente de Acasalamento</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Sugestões de casais por consanguinidade (pedigree) + eye-sign (regras clássicas de Barkel)</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={T.card}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <div>
              <label style={T.label}>♂ MACHO</label>
              <select value={macho?.id ?? ""} onChange={(e) => setMacho(pombos.find((p) => String(p.id) === e.target.value) || null)} style={T.input}>
                <option value="">— escolher —</option>
                {machos.map((p) => <option key={p.id} value={p.id}>{p.nome || p.anilha} ({p.anilha})</option>)}
              </select>
              <SeletorOlho p={macho} />
            </div>
            <div>
              <label style={T.label}>♀ FÊMEA</label>
              <select value={femea?.id ?? ""} onChange={(e) => setFemea(pombos.find((p) => String(p.id) === e.target.value) || null)} style={T.input}>
                <option value="">— escolher —</option>
                {femeas.map((p) => <option key={p.id} value={p.id}>{p.nome || p.anilha} ({p.anilha})</option>)}
              </select>
              <SeletorOlho p={femea} />
            </div>
          </div>
          {pombos.length === 0 && <div style={{ ...T.small, marginTop: 10 }}>Cadastre seus pombos (com pai/mãe no pedigree) na página 🐦 Pombos — o assistente usa essas informações.</div>}
        </section>

        {analise && macho && femea && (
          <section style={{ ...T.card, border: `2px solid ${analise.score >= 70 ? T.green : analise.score >= 45 ? "#fbbf24" : T.red}55`, background: `${analise.score >= 70 ? T.green : analise.score >= 45 ? "#fbbf24" : T.red}0d` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <b style={{ fontSize: 15 }}>{macho.nome || macho.anilha} × {femea.nome || femea.anilha}</b>
              <b style={{ fontSize: 20, color: analise.score >= 70 ? T.green : analise.score >= 45 ? "#fbbf24" : T.red }}>{analise.score}/100</b>
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, margin: "8px 0", color: analise.score >= 70 ? T.green : analise.score >= 45 ? "#fbbf24" : T.red }}>
              {analise.score >= 70 ? "✅" : analise.score >= 45 ? "⚠️" : "🚫"} {analise.veredito}
            </div>
            <div style={{ padding: "9px 12px", borderRadius: 9, background: "#ffffff08", fontSize: 12, marginBottom: 6, lineHeight: 1.6 }}>
              🧬 <b>Consanguinidade:</b> {analise.cons.txt} — {analise.cons.nivel === "alta" ? "risco alto de fixar defeitos" : analise.cons.nivel === "media" ? "aceitável com seleção" : "sangue aberto ✓"}
            </div>
            <div style={{ padding: "9px 12px", borderRadius: 9, background: "#ffffff08", fontSize: 12, lineHeight: 1.6, color: analise.olho.cor }}>
              👁️ <b>Eye-sign:</b> {analise.olho.nota}
            </div>
          </section>
        )}

        {sugestoes.length > 0 && (
          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🎯 Melhores casais sugeridos (do seu plantel)</div>
            {sugestoes.map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "9px 0", borderBottom: `1px solid ${T.border}`, flexWrap: "wrap", cursor: "pointer" }} onClick={() => { setMacho(s.m); setFemea(s.f); window.scrollTo({ top: 0 }); }}>
                <div>
                  <b style={{ fontSize: 13 }}>♂ {s.m.nome || s.m.anilha} × ♀ {s.f.nome || s.f.anilha}</b>
                  <div style={{ ...T.small, fontSize: 11 }}>
                    🧬 {s.cons.nivel === "baixa" ? "sangue aberto" : s.cons.nivel === "media" ? "consanguinidade média" : "consanguinidade alta"} · 👁️ {s.olho.pontos > 0 ? "olhos complementares" : s.olho.pontos < 0 ? "olhos iguais (evitar)" : "neutro"}
                  </div>
                </div>
                <b style={{ color: s.score >= 70 ? T.green : s.score >= 45 ? "#fbbf24" : T.red, fontSize: 15 }}>{s.score}</b>
              </div>
            ))}
            <div style={{ ...T.small, fontSize: 10, marginTop: 8 }}>Sugestões automáticas: priorizam sangue aberto e olhos complementares (amarelo × pérola). A decisão final é sempre do criador 😉</div>
          </section>
        )}
      </div>
    </main>
  );
}
