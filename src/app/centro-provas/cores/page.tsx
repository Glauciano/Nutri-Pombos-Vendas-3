"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * 🎨 Cores dos Filhotes — calculadora de genética de cor da pena do pombo-correio.
 * Sistemas calculados (os 4 principais):
 *  - COR BASE (ligada ao sexo, no cromossomo Z): vermelho cinza (A) > azul (B) > marrom (b)
 *    ♂ tem 2 Z (pode carregar cor escondida) · ♀ tem 1 Z (nunca carrega — mostra o que tem!)
 *  - DILUIÇÃO (ligada ao sexo, recessiva): azul→prata · vermelho→palha · marrom→khaki
 *  - PADRÃO (autossômico): xadrez escuro T > xadrez > barra > sem barra
 *  - ESPALHADO (autossômico dominante): azul→preto · etc.
 * Percentagens = probabilidade estatística (pais assumidos puros, exceto o que marcar).
 */
type AleloCor = "A" | "B" | "b";
type Padrao = "T" | "C" | "+" | "l";
type Z = { cor: AleloCor; dil: "D" | "d" };

const DOM_COR: Record<AleloCor, number> = { A: 3, B: 2, b: 1 };
const DOM_PAD: Record<Padrao, number> = { T: 4, C: 3, "+": 2, l: 1 };

const COR_NOME: Record<AleloCor, string> = { A: "Vermelho cinza (ash-red)", B: "Azul", b: "Marrom / chocolate" };
const COR_DIL: Record<AleloCor, string> = { A: "Palha / amarelo", B: "Prata", b: "Khaki" };
const PAD_NOME: Record<Padrao, string> = { T: "xadrez escuro (T)", C: "xadrez", "+": "barra", l: "sem barra" };

type Selecao = {
  cor: AleloCor; padrao: Padrao; diluido: boolean; espalhado: boolean;
  carrega: "nenhum" | "azul" | "marrom"; carregaDil: boolean;
};

const PADRAO_INICIAL: Selecao = { cor: "B", padrao: "+", diluido: false, espalhado: false, carrega: "nenhum", carregaDil: false };

const PRESETS: { nome: string; s: Partial<Selecao> }[] = [
  { nome: "Azul barra", s: { cor: "B", padrao: "+", diluido: false, espalhado: false } },
  { nome: "Azul xadrez", s: { cor: "B", padrao: "C", diluido: false, espalhado: false } },
  { nome: "Sem barra", s: { cor: "B", padrao: "l", diluido: false, espalhado: false } },
  { nome: "Preto (espalhado)", s: { cor: "B", padrao: "+", diluido: false, espalhado: true } },
  { nome: "Prata barra", s: { cor: "B", padrao: "+", diluido: true, espalhado: false } },
  { nome: "Vermelho barra", s: { cor: "A", padrao: "+", diluido: false, espalhado: false } },
  { nome: "Vermelho xadrez", s: { cor: "A", padrao: "C", diluido: false, espalhado: false } },
  { nome: "Palha", s: { cor: "A", padrao: "+", diluido: true, espalhado: false } },
  { nome: "Marrom barra", s: { cor: "b", padrao: "+", diluido: false, espalhado: false } },
];

/** genótipo do macho: 2 cromossomos Z */
function zsDoMacho(s: Selecao): [Z, Z] {
  const cor2: AleloCor = s.carrega === "azul" ? "B" : s.carrega === "marrom" ? "b" : s.cor;
  const z1: Z = { cor: s.cor, dil: s.diluido ? "d" : "D" };
  const z2: Z = { cor: cor2, dil: s.diluido ? "d" : s.carregaDil ? "d" : "D" };
  return [z1, z2];
}

/** nome visível (fenótipo) de um filhote */
function fenotipo(corTop: AleloCor, dil: boolean, padTop: Padrao, espalhado: boolean): string {
  const base = dil ? COR_DIL[corTop] : COR_NOME[corTop];
  if (espalhado) {
    if (corTop === "B" && !dil) return "Preto (azul espalhado)";
    if (corTop === "B" && dil) return "Dun (preto diluído)";
    return `${base.split(" (")[0]} espalhado (sólido)`;
  }
  return `${base} ${PAD_NOME[padTop]}`;
}

type Resultado = { machos: [string, number][]; femeas: [string, number][] };

function cruzar(m: Selecao, f: Selecao): Resultado {
  const zsM = zsDoMacho(m);
  const zF: Z = { cor: f.cor, dil: f.diluido ? "d" : "D" }; // fêmea: 1 Z único (nunca carrega!)
  const padM: [Padrao, Padrao] = [m.padrao, m.padrao]; // assumimos pais puros no padrão visível
  const padF: [Padrao, Padrao] = [f.padrao, f.padrao];

  const accM = new Map<string, number>();
  const accF = new Map<string, number>();

  for (const zp of zsM) { // 50% cada Z do pai
    for (const p1 of padM) for (const p2 of padF) {
      for (const spPai of [false, true]) for (const spMae of [false, true]) {
        const espalhado = (m.espalhado && spPai) || (f.espalhado && spMae);
        const padTop = DOM_PAD[p1] >= DOM_PAD[p2] ? p1 : p2;
        // FILHO ♂: Z da mãe + Z do pai
        const corM = DOM_COR[zF.cor] >= DOM_COR[zp.cor] ? zF.cor : zp.cor;
        const dilM = zF.dil === "d" && zp.dil === "d";
        const kM = fenotipo(corM, dilM, padTop, espalhado);
        accM.set(kM, (accM.get(kM) || 0) + 1);
        // FILHA ♀: Z do pai + W (cor e diluição vêm SÓ do pai!)
        const dilF = zp.dil === "d";
        const kF = fenotipo(zp.cor, dilF, padTop, espalhado);
        accF.set(kF, (accF.get(kF) || 0) + 1);
      }
    }
  }
  const ordenar = (mp: Map<string, number>) => {
    const total = 32; // 2 Z do pai × 2 padrões × 2 spread pai × 2 spread mãe... contagem por mapa
    return [...mp.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]): [string, number] => [k, Math.round((v / total) * 100)]);
  };
  return { machos: ordenar(accM), femeas: ordenar(accF) };
}

function CardPai({ titulo, emoji, s, set, macho }: { titulo: string; emoji: string; s: Selecao; set: (n: Selecao) => void; macho: boolean }) {
  const input = { ...T.btnGhost, padding: "9px 11px", textAlign: "left" as const, fontWeight: 600, fontSize: 12.5, width: "100%" };
  const lbl = { ...T.small, fontSize: 10, marginBottom: 4, color: T.dim };
  return (
    <div style={{ ...T.card, marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>{emoji} {titulo}</div>
      <div style={{ display: "grid", gap: 8 }}>
        <div>
          <div style={lbl}>🎨 Cor de pena</div>
          <select value={s.cor} onChange={(e) => set({ ...s, cor: e.target.value as AleloCor, carrega: "nenhum" })} style={input}>
            <option value="B">Azul (clássica)</option>
            <option value="A">Vermelho cinza (ash-red)</option>
            <option value="b">Marrom / chocolate</option>
          </select>
        </div>
        <div>
          <div style={lbl}>🔲 Padrão das asas</div>
          <select value={s.padrao} onChange={(e) => set({ ...s, padrao: e.target.value as Padrao })} style={input}>
            <option value="+">Barra clássica</option>
            <option value="C">Xadrez</option>
            <option value="T">Xadrez escuro (T)</option>
            <option value="l">Sem barra (barless)</option>
          </select>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={s.diluido} onChange={(e) => set({ ...s, diluido: e.target.checked })} />
          💧 Diluído ({s.cor === "A" ? "palha" : s.cor === "B" ? "prata" : "khaki"})
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={s.espalhado} onChange={(e) => set({ ...s, espalhado: e.target.checked })} />
          🖤 Espalhado (cor sólida — azul vira preto)
        </label>
        {macho && (
          <>
            <div>
              <div style={lbl}>🫥 Gene escondido no 2º cromossomo (só o macho carrega)</div>
              <select value={s.carrega} onChange={(e) => set({ ...s, carrega: e.target.value as Selecao["carrega"] })} style={input} disabled={s.cor === "b"}>
                <option value="nenhum">Nenhum — puro ({s.cor}/{s.cor})</option>
                {s.cor === "A" && <option value="azul">Carrega AZUL escondido</option>}
                <option value="marrom" disabled={s.cor === "b"}>Carrega MARROM escondido</option>
              </select>
            </div>
            {!s.diluido && (
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={s.carregaDil} onChange={(e) => set({ ...s, carregaDil: e.target.checked })} />
                🫥 Carrega diluição escondida (D/d)
              </label>
            )}
          </>
        )}
        {!macho && <div style={{ ...T.small, fontSize: 10, color: T.dim2 }}>♀ A fêmea tem 1 só cromossomo Z: nunca esconde cor — o que tem, aparece!</div>}
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 10, paddingTop: 10 }}>
        <div style={{ ...T.small, fontSize: 10, color: T.dim, marginBottom: 6 }}>⚡ Prontos (toque pra preencher):</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {PRESETS.map((p) => (
            <button key={p.nome} onClick={() => set({ ...PADRAO_INICIAL, ...p.s, carrega: "nenhum" })} style={{ padding: "5px 10px", borderRadius: 999, cursor: "pointer", fontSize: 10.5, fontWeight: 700, border: `1px solid ${T.border}`, background: T.bgInput, color: T.dim }}>
              {p.nome}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CoresFilhotes() {
  const [macho, setMacho] = useState<Selecao>(PADRAO_INICIAL);
  const [femea, setFemea] = useState<Selecao>({ ...PADRAO_INICIAL, cor: "A" });

  const r = useMemo(() => cruzar(macho, femea), [macho, femea]);

  const Barra = ({ nome, pct, cor }: { nome: string; pct: number; cor: string }) => (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
        <b>{nome}</b>
        <span style={{ color: cor, fontWeight: 900 }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 5, background: "#ffffff12" }}>
        <div style={{ height: "100%", borderRadius: 5, background: cor, width: `${pct}%`, transition: "width .3s" }} />
      </div>
    </div>
  );

  const painel = (titulo: string, dados: [string, number][], cor: string) => (
    <div style={{ ...T.card, flex: 1, minWidth: 240 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: cor, marginBottom: 10 }}>{titulo}</div>
      {dados.map(([nome, pct]) => <Barra key={nome} nome={nome} pct={pct} cor={cor} />)}
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🎨 Cores dos Filhotes</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Cruzou azul com vermelho? Qual cor pode nascer? Calculadora de genética da pena — com o truque clássico: <b>as filhas herdiam a cor do pai</b>.</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}><CardPai titulo="PAI (macho)" emoji="♂️" s={macho} set={setMacho} macho /></div>
          <div style={{ flex: 1, minWidth: 260 }}><CardPai titulo="MÃE (fêmea)" emoji="♀️" s={femea} set={setFemea} macho={false} /></div>
        </div>

        {/* RESULTADO AO VIVO */}
        <div style={{ ...T.card, borderColor: `${T.green}55`, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.green, marginBottom: 4 }}>🔬 Resultado do cruzamento (ao vivo — mude as opções acima e veja na hora)</div>
          <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 12 }}>
            ♂ {fenotipoSimples(macho)} × ♀ {fenotipoSimples(femea)}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {painel("👦 FILHOS (machos)", r.machos, "#55a3ff")}
            {painel("👧 FILHAS (fêmeas)", r.femeas, "#ff8fa3")}
          </div>
        </div>

        {/* A ESCOLA DOS CRIADORES */}
        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📖 Como a cor viaja no sangue do pombo</div>
          <div style={{ ...T.small, fontSize: 12, lineHeight: 1.85, color: T.dim }}>
            <b style={{ color: T.white }}>1. A cor mora no cromossomo do sexo.</b> O pombo é diferente da gente: o macho tem dois cromossomos Z e a fêmea tem um Z + um W. A cor de base (azul, vermelho cinza, marrom) viaja no Z — <b style={{ color: T.white }}>por isso a fêmea nunca carrega cor escondida</b>, e <b style={{ color: T.white }}>as filhas pegam a cor do pai</b>. É o truque clássico dos criadores pra conferir linhagem: azul × vermelho pode gerar filha azul de mãe vermelha!
            <br /><br />
            <b style={{ color: T.white }}>2. Dominância:</b> vermelho cinza (ash-red) &gt; azul &gt; marrom. O vermelho dominante "pinta por cima" do azul — mas o azul segue escondido no macho e pode reaparecer nas gerações seguintes (é o famoso "saiu azul do casal vermelho!").
            <br /><br />
            <b style={{ color: T.white }}>3. Diluição (ligada ao sexo, recessiva):</b> clareia a cor — azul vira <b>prata</b>, vermelho vira <b>palha/amarelo</b>, marrom vira <b>khaki</b>. O macho pode carregar diluição escondida; a fêmea diluída sempre mostra.
            <br /><br />
            <b style={{ color: T.white }}>4. Padrão e espalhado:</b> o padrão das asas (xadrez escuro &gt; xadrez &gt; barra &gt; sem barra) e o espalhado (azul vira preto sólido) viajam em cromossomos comuns, de qualquer dos dois lados.
            <br /><br />
            ⚠️ <b>Honestidade de criador:</b> a conta acima cobre os 4 sistemas principais e assume pais puros no que não estiver marcado. Genes extras (grizzle, pestaje/pied, branco, vermelho recessivo, almond) e combinações heterozigotas podem mudar o resultado — as percentagens são <b>probabilidade</b>, não promessa. Pra profundidade de sangue, use a <Link href="/centro-provas/genetica75" style={{ color: T.blue }}>Genética dos 75% →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

/** nome curto do pai pro resumo do cruzamento */
function fenotipoSimples(s: Selecao): string {
  const base = s.diluido ? COR_DIL[s.cor] : COR_NOME[s.cor];
  if (s.espalhado) return s.cor === "B" && !s.diluido ? "preto (esp.)" : `${base.split(" (")[0]} (esp.)`;
  return `${base.split(" (")[0]} ${PAD_NOME[s.padrao].split(" (")[0]}${s.carrega !== "nenhum" && s.cor === "A" ? " (carrega)" : ""}`;
}
