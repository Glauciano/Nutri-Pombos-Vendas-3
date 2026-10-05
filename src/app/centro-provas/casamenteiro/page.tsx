"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type Pombo = { id: number; anilha: string; nome: string | null; sexo: string; paiId: number | null; maeId: number | null };
type Objetivo = "fixar" | "vigor";

/* ══════════ NÚCLEO MATEMÁTICO (Wright — igual ao da Genética 75%) ══════════ */
function contarAncestrais(p: Pombo | undefined, mapa: Map<number, Pombo>, prof: number, acc: Map<number, number>): void {
  if (!p || prof <= 0) return;
  for (const pai of [p.paiId, p.maeId]) {
    if (pai == null) continue;
    acc.set(pai, (acc.get(pai) || 0) + 1);
    const av = mapa.get(pai);
    if (av) contarAncestrais(av, mapa, prof - 1, acc);
  }
}

function ancestraisDe(p: Pombo, mapa: Map<number, Pombo>): Map<number, number> {
  const acc = new Map<number, number>();
  contarAncestrais(p, mapa, 6, acc);
  return acc;
}

/** fração média de genes compartilhados entre dois pombos (0 a 1) */
function parentesco(a: Pombo, b: Pombo, mapa: Map<number, Pombo>): number {
  const ancA = ancestraisDe(a, mapa);
  const ancB = ancestraisDe(b, mapa);
  let soma = 0, pathsA = 0, pathsB = 0;
  ancA.forEach((n) => (pathsA += n));
  ancB.forEach((n) => (pathsB += n));
  ancA.forEach((nA, id) => {
    const nB = ancB.get(id);
    if (nB) soma += Math.min(pathsA ? nA / pathsA : 0, pathsB ? nB / pathsB : 0);
  });
  if (ancB.has(a.id)) soma = Math.max(soma, (ancB.get(a.id) || 1) / (pathsB || 1));
  if (ancA.has(b.id)) soma = Math.max(soma, (ancA.get(b.id) || 1) / (pathsA || 1));
  return Math.min(1, soma * 2);
}

/** ancestrais em comum (pra explicar a ligação de sangue) */
function ligacoes(a: Pombo, b: Pombo, mapa: Map<number, Pombo>): string[] {
  const ancA = ancestraisDe(a, mapa);
  const ancB = ancestraisDe(b, mapa);
  const nomes: string[] = [];
  ancA.forEach((_, id) => {
    if (ancB.has(id)) {
      const p = mapa.get(id);
      if (p) nomes.push(p.nome || p.anilha);
    }
  });
  return nomes.slice(0, 4);
}

function faixa(pct: number) {
  if (pct < 6.25) return { cor: "#39e58c", selo: "🟢 SANGUE NOVO (outcross)", nota: "Cruzamento sem parentesco relevante: máximo de vigor híbrido. Ideal pra renovar a força do plantel." };
  if (pct < 20) return { cor: "#55a3ff", selo: "🔵 LINEBREEDING leve", nota: "Parentesco moderado: fixa o tipo do campeão mantendo boa parte do vigor. Faixa clássica dos campeões belgas." };
  if (pct < 35) return { cor: "#f7bd00", selo: "🟡 CONSANGUINIDADE moderada", nota: "Fixa MUITO o tipo, mas exige seleção dura: os ruins aparecem junto com os bons. Pro selectivo." };
  return { cor: "#ff5d62", selo: "🔴 CONSANGUINIDADE ALTA", nota: "Cruzamento fechado (ex: 75%): só com plano claro de fixação e descartando rigorosamente. «A consanguinidade não é crime — ela descobre o crime.» (Lush)" };
}

const nomeDe = (p: Pombo) => p.nome || p.anilha;

export default function Casamenteiro() {
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [sel, setSel] = useState<Pombo | null>(null);
  const [objetivo, setObjetivo] = useState<Objetivo>("fixar");

  useEffect(() => {
    fetch("/api/pombos")
      .then(async (r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setPombos(Array.isArray(d) ? d : []))
      .catch(() => setPombos([]))
      .finally(() => setCarregando(false));
  }, []);

  const mapa = useMemo(() => {
    const m = new Map<number, Pombo>();
    pombos.forEach((p) => m.set(p.id, p));
    return m;
  }, [pombos]);

  const comPedigree = useMemo(() => pombos.filter((p) => p.paiId || p.maeId).length, [pombos]);

  /** ranking de parceiros do pombo selecionado */
  const ranking = useMemo(() => {
    if (!sel) return [];
    const alvo = sel.sexo === "macho" ? "femea" : "macho";
    return pombos
      .filter((p) => p.id !== sel.id && p.sexo === alvo)
      .map((p) => {
        const pct = parentesco(sel, p, mapa) * 100;
        return { pombo: p, pct, lig: ligacoes(sel, p, mapa) };
      })
      .sort((a, b) => (objetivo === "fixar" ? b.pct - a.pct : a.pct - b.pct));
  }, [sel, pombos, mapa, objetivo]);

  const semGenealogia = sel && !sel.paiId && !sel.maeId && !pombos.some((p) => p.paiId === sel.id || p.maeId === sel.id);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>💘 Casamenteiro Inteligente</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Escolha um pombo e veja o ranking dos melhores pares do plantel — pelo parentesco real do pedigree (matemática de Wright, 6 gerações).</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {carregando && <div style={T.card}>⏳ Carregando plantel...</div>}

        {!carregando && pombos.length === 0 && (
          <div style={T.card}>
            Nenhum pombo cadastrado ainda. <Link href="/centro-provas/pombos" style={{ color: T.blue }}>Cadastre seus pombos →</Link> (e os pais deles, pro cálculo ficar preciso!)
          </div>
        )}

        {!carregando && pombos.length > 0 && comPedigree === 0 && (
          <div style={{ ...T.card, borderColor: `${T.orange}55`, background: `${T.orange}0d`, marginBottom: 14 }}>
            ⚠️ <b>O Casamenteiro vive de pedigree:</b> nenhum pombo do plantel tem pai/mãe cadastrado ainda.
            Edite seus pombos em <Link href="/centro-provas/pombos" style={{ color: T.blue }}>Pombos e Pedigree →</Link> e informe os pais — aí o ranking aparece com o parentesco de verdade.
          </div>
        )}

        {pombos.length > 0 && (
          <>
            {/* OBJETIVO */}
            <section style={{ ...T.card, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 8 }}>🎯 Qual é seu objetivo com este acasalamento?</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => setObjetivo("fixar")} style={{ padding: "9px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 12, border: `1.5px solid ${objetivo === "fixar" ? T.gold : T.border}`, background: objetivo === "fixar" ? T.gold : T.bgInput, color: objetivo === "fixar" ? T.bg : T.white }}>
                  🏆 Fixar o sangue do campeão
                </button>
                <button onClick={() => setObjetivo("vigor")} style={{ padding: "9px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 12, border: `1.5px solid ${objetivo === "vigor" ? T.gold : T.border}`, background: objetivo === "vigor" ? T.gold : T.bgInput, color: objetivo === "vigor" ? T.bg : T.white }}>
                  💪 Renovar vigor (sangue novo)
                </button>
              </div>
              <div style={{ ...T.small, fontSize: 11, marginTop: 8, lineHeight: 1.6 }}>
                {objetivo === "fixar"
                  ? "Recomendo primeiro os pombos MAIS APARENTADOS com o seu — pra concentrar os genes do campeão (é a lógica dos 75%)."
                  : "Recomendo primeiro os pombos MENOS APARENTADOS — cruzamento aberto pra trazer vigor híbrido de volta."}
              </div>
            </section>

            {/* SELEÇÃO */}
            <section style={{ ...T.card, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🐦 Escolha o pombo</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }}>
                {pombos.map((p) => (
                  <button key={p.id} onClick={() => setSel(p)} style={{ padding: "10px 11px", borderRadius: 10, cursor: "pointer", textAlign: "left", border: `1.5px solid ${sel?.id === p.id ? T.gold : T.border}`, background: sel?.id === p.id ? `${T.gold}1a` : T.bgInput }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800 }}>{p.sexo === "macho" ? "♂" : "♀"} {nomeDe(p)}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 10.5, color: T.dim }}>{p.anilha}</div>
                  </button>
                ))}
              </div>
            </section>

            {sel && (
              <section style={{ ...T.card, borderColor: `${T.gold}55` }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>
                  💘 Pares para: {sel.sexo === "macho" ? "♂" : "♀"} <b>{nomeDe(sel)}</b> <span style={{ fontFamily: "monospace", color: T.dim }}>({sel.anilha})</span>
                </div>

                {semGenealogia && (
                  <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: `${T.orange}12`, border: `1px solid ${T.orange}44`, ...T.small, fontSize: 12, lineHeight: 1.6 }}>
                    ⚠️ Este pombo (e os candidatos) não têm genealogia cadastrada — o parentesco vai dar 0% pra todos. Edite os pombos e informe <b>pai e mãe</b> pra liberar o ranking de verdade.
                  </div>
                )}

                {ranking.length === 0 && <div style={{ ...T.small, marginTop: 10 }}>Não há pombos do sexo oposto no plantel.</div>}

                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                  {ranking.slice(0, 10).map((r, i) => {
                    const f = faixa(r.pct);
                    return (
                      <div key={r.pombo.id} style={{ padding: 13, borderRadius: 12, background: "#ffffff08", border: `1px solid ${f.cor}44` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                          <div>
                            {i === 0 && <span style={{ padding: "2px 8px", borderRadius: 8, fontSize: 9.5, fontWeight: 900, background: T.gold, color: T.bg, marginRight: 6 }}>MELHOR OPÇÃO</span>}
                            <b style={{ fontSize: 14 }}>{r.pombo.sexo === "macho" ? "♂" : "♀"} {nomeDe(r.pombo)}</b>
                            <span style={{ fontFamily: "monospace", fontSize: 11, color: T.dim, marginLeft: 8 }}>{r.pombo.anilha}</span>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 21, fontWeight: 900, color: f.cor }}>{r.pct.toFixed(1)}%</div>
                            <div style={{ fontSize: 9, color: T.dim }}>de parentesco</div>
                          </div>
                        </div>
                        <div style={{ marginTop: 7, fontSize: 11.5, fontWeight: 800, color: f.cor }}>{f.selo}</div>
                        <div style={{ ...T.small, fontSize: 11, lineHeight: 1.6, marginTop: 4 }}>{f.nota}</div>
                        {r.lig.length > 0 && (
                          <div style={{ ...T.small, fontSize: 10.5, marginTop: 6, color: T.dim }}>
                            🩸 Ligação de sangue: {r.lig.join(", ")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {ranking.length > 10 && <div style={{ ...T.small, fontSize: 10.5, marginTop: 10, textAlign: "center", color: T.dim }}>+ {ranking.length - 10} outros candidatos (mostrando os 10 primeiros)</div>}

                <div style={{ ...T.small, fontSize: 10, marginTop: 12, color: T.dim2, lineHeight: 1.6 }}>
                  📖 Referências de parentesco: pai×filha ou irmãos completos = 50% · campeão×neta = 62,5% · meio-irmãos = 25% · sem parentesco = 0%.
                  Combine com o <Link href="/centro-provas/olho" style={{ color: T.blue }}>eye-sign</Link> e a <Link href="/centro-provas/anatomia" style={{ color: T.blue }}>anatomia</Link> pra fechar a decisão.
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
