"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * 🎨 Cores dos Filhotes — calculadora de genética de cor da pena do pombo-correio.
 * Sistemas calculados:
 *  - COR BASE (ligada ao sexo, cromossomo Z): vermelho cinza (A) > azul (B) > canela/marrom (b)
 *  - DILUIÇÃO (ligada ao sexo, recessiva): azul→prata · vermelho→palha · canela→khaki
 *  - PADRÃO (autossômico): escama (T) > xadrez > barra > sem barra
 *  - ESPALHADO (autossômico dominante): azul→preto
 *  - ARDÓSIA (modificador escurecedor, dominante): azul→ardósia
 *  - PÉROLA (ópala/leitoso, recessiva): só aparece se AMBOS os lados trouxerem
 *  - MOZAICO (grizzle/pied, dominante de expressão variável): manchas brancas
 */
type AleloCor = "A" | "B" | "b";
type Padrao = "T" | "C" | "+" | "l";
type Z = { cor: AleloCor; dil: "D" | "d" };

const DOM_COR: Record<AleloCor, number> = { A: 3, B: 2, b: 1 };
const DOM_PAD: Record<Padrao, number> = { T: 4, C: 3, "+": 2, l: 1 };

const COR_NOME: Record<AleloCor, string> = { A: "Vermelho cinza", B: "Azul", b: "Canela (marrom)" };
const COR_DIL: Record<AleloCor, string> = { A: "Palha", B: "Prata", b: "Khaki (canela claro)" };
const PAD_NOME: Record<Padrao, string> = { T: "escama", C: "xadrez", "+": "barra", l: "sem barra" };

type Selecao = {
  cor: AleloCor; padrao: Padrao; diluido: boolean; espalhado: boolean;
  ardosia: boolean; perola: boolean; mozaico: boolean;
  carrega: "nenhum" | "azul" | "canela"; carregaDil: boolean;
};

const PADRAO_INICIAL: Selecao = { cor: "B", padrao: "+", diluido: false, espalhado: false, ardosia: false, perola: false, mozaico: false, carrega: "nenhum", carregaDil: false };

const PRESETS: { nome: string; s: Partial<Selecao> }[] = [
  { nome: "Azul barra", s: { cor: "B", padrao: "+" } },
  { nome: "Azul xadrez", s: { cor: "B", padrao: "C" } },
  { nome: "Azul escama", s: { cor: "B", padrao: "T" } },
  { nome: "Sem barra", s: { cor: "B", padrao: "l" } },
  { nome: "Preto", s: { cor: "B", padrao: "+", espalhado: true } },
  { nome: "Ardósia barra", s: { cor: "B", padrao: "+", ardosia: true } },
  { nome: "Prata barra", s: { cor: "B", padrao: "+", diluido: true } },
  { nome: "Prata xadrez", s: { cor: "B", padrao: "C", diluido: true } },
  { nome: "Pérola", s: { cor: "B", padrao: "+", perola: true } },
  { nome: "Mozaico azul", s: { cor: "B", padrao: "+", mozaico: true } },
  { nome: "Vermelho barra", s: { cor: "A", padrao: "+" } },
  { nome: "Vermelho xadrez", s: { cor: "A", padrao: "C" } },
  { nome: "Palha", s: { cor: "A", padrao: "+", diluido: true } },
  { nome: "Canela barra", s: { cor: "b", padrao: "+" } },
  { nome: "Canela xadrez", s: { cor: "b", padrao: "C" } },
];

/** genótipo do macho: 2 cromossomos Z */
function zsDoMacho(s: Selecao): [Z, Z] {
  const cor2: AleloCor = s.carrega === "azul" ? "B" : s.carrega === "canela" ? "b" : s.cor;
  const z1: Z = { cor: s.cor, dil: s.diluido ? "d" : "D" };
  const z2: Z = { cor: cor2, dil: s.diluido ? "d" : s.carregaDil ? "d" : "D" };
  return [z1, z2];
}

/** nome visível (fenótipo) de um filhote */
function fenotipo(corTop: AleloCor, dil: boolean, padTop: Padrao, espalhado: boolean, ardosia: boolean, perola: boolean, mozaico: boolean): string {
  const base = dil ? COR_DIL[corTop] : COR_NOME[corTop];
  let nome: string;
  if (espalhado) {
    if (corTop === "B" && !dil) nome = ardosia ? "Preto ardósia (sólido)" : "Preto (azul espalhado)";
    else if (corTop === "B" && dil) nome = "Dun (preto diluído)";
    else nome = `${base} sólido (espalhado)`;
  } else if (ardosia && corTop === "B" && !dil) {
    nome = `Ardósia ${PAD_NOME[padTop]}`;
  } else {
    nome = `${base} ${PAD_NOME[padTop]}`;
    if (ardosia) nome += " (ardósia)";
  }
  if (perola) nome += " · pérola";
  if (mozaico) nome += " · mozaico (branco)";
  return nome;
}

type Resultado = { machos: [string, number][]; femeas: [string, number][] };

function cruzar(m: Selecao, f: Selecao): Resultado {
  const zsM = zsDoMacho(m);
  const zF: Z = { cor: f.cor, dil: f.diluido ? "d" : "D" }; // fêmea: 1 Z único (nunca carrega!)
  const padM: [Padrao, Padrao] = [m.padrao, m.padrao]; // pais assumidos puros no padrão
  const padF: [Padrao, Padrao] = [f.padrao, f.padrao];

  const perolaOk = m.perola && f.perola;      // recessiva: só aparece com AMBOS os pais
  const temArdo = m.ardosia || f.ardosia;     // dominante: 50% dos filhotes se um dos pais
  const temMoza = m.mozaico || f.mozaico;     // dominante: 50% dos filhotes se um dos pais

  const accM = new Map<string, number>();
  const accF = new Map<string, number>();
  const add = (mp: Map<string, number>, k: string) => mp.set(k, (mp.get(k) || 0) + 1);

  for (const zp of zsM) for (const p1 of padM) for (const p2 of padF)
    for (const spPai of [false, true]) for (const spMae of [false, true])
      for (const ar of temArdo ? [false, true] : [false])
        for (const mz of temMoza ? [false, true] : [false]) {
          const espalhado = (m.espalhado && spPai) || (f.espalhado && spMae);
          const padTop = DOM_PAD[p1] >= DOM_PAD[p2] ? p1 : p2;
          // FILHO ♂: Z da mãe + Z do pai
          const corM = DOM_COR[zF.cor] >= DOM_COR[zp.cor] ? zF.cor : zp.cor;
          add(accM, fenotipo(corM, zF.dil === "d" && zp.dil === "d", padTop, espalhado, ar, perolaOk, mz));
          // FILHA ♀: Z do pai + W (cor e diluição vêm SÓ do pai!)
          add(accF, fenotipo(zp.cor, zp.dil === "d", padTop, espalhado, ar, perolaOk, mz));
        }

  const ordenar = (mp: Map<string, number>): [string, number][] => {
    const total = [...mp.values()].reduce((a, b) => a + b, 0) || 1;
    return [...mp.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, Math.round((v / total) * 100)]);
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
            <option value="b">Canela / marrom / chocolate</option>
          </select>
        </div>
        <div>
          <div style={lbl}>🔲 Padrão das asas</div>
          <select value={s.padrao} onChange={(e) => set({ ...s, padrao: e.target.value as Padrao })} style={input}>
            <option value="+">Barra clássica</option>
            <option value="C">Xadrez</option>
            <option value="T">Escama (xadrez fechado)</option>
            <option value="l">Sem barra (barless)</option>
          </select>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={s.diluido} onChange={(e) => set({ ...s, diluido: e.target.checked })} />
          💧 Diluído ({s.cor === "A" ? "palha" : s.cor === "B" ? "prata" : "khaki"})
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={s.espalhado} onChange={(e) => set({ ...s, espalhado: e.target.checked })} />
          🖤 Espalhado (sólido — azul vira PRETO)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={s.ardosia} onChange={(e) => set({ ...s, ardosia: e.target.checked })} />
          🪨 Ardósia (azul escurecido)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={s.perola} onChange={(e) => set({ ...s, perola: e.target.checked })} />
          ✨ Pérola (ópala / leitoso — recessiva)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={s.mozaico} onChange={(e) => set({ ...s, mozaico: e.target.checked })} />
          🤍 Mozaico (manchas brancas)
        </label>
        {macho && (
          <>
            <div>
              <div style={lbl}>🫥 Gene escondido no 2º cromossomo (só o macho carrega)</div>
              <select value={s.carrega} onChange={(e) => set({ ...s, carrega: e.target.value as Selecao["carrega"] })} style={input} disabled={s.cor === "b"}>
                <option value="nenhum">Nenhum — puro ({s.cor}/{s.cor})</option>
                {s.cor === "A" && <option value="azul">Carrega AZUL escondido</option>}
                <option value="canela" disabled={s.cor === "b"}>Carrega CANELA escondido</option>
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
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3, gap: 6 }}>
        <b>{nome}</b>
        <span style={{ color: cor, fontWeight: 900, whiteSpace: "nowrap" }}>{pct}%</span>
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
            <p style={{ ...T.small, marginTop: 4 }}>Cruzou azul com vermelho? E com prata, canela, preto, ardósia, pérola, mozaico? Calculadora de genética da pena — com o truque clássico: <b>as filhas herdiam a cor do pai</b>.</p>
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

        {/* DICIONÁRIO DO CRIADOR */}
        <section style={{ ...T.card, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📖 Dicionário do criador — nome brasileiro × genética</div>
          <div style={{ display: "grid", gap: 6 }}>
            {[
              ["Escama", "xadrez bem fechado (T-pattern) — o padrão mais escura das asas"],
              ["Prata", "AZUL diluído (o gene da diluição clareia a pena)"],
              ["Palha", "VERMELHO diluído — o amarelinho"],
              ["Khaki", "CANELA diluída — o marrom claro"],
              ["Preto", "AZUL + espalhado (a cor cobre a asa toda, sólida)"],
              ["Canela", "o marrom / chocolate — recessivo, mais raro no plantel"],
              ["Ardósia", "AZUL escurecido por modificador (tipo indigo) — aquele azul acinzentado escuro"],
              ["Pérola", "ópala / leitoso — RECESSIVA: só nasce se os DOIS lados trouxerem o gene"],
              ["Mozaico", "manchas brancas espalhadas (grizzle/pied) — DOMINANTE: basta um dos pais, mas a quantidade de branco varia de poucas penas a quase tudo"],
            ].map(([nome, desc]) => (
              <div key={nome} style={{ padding: "9px 12px", borderRadius: 10, background: "#ffffff08", fontSize: 12, lineHeight: 1.6 }}>
                <b style={{ color: T.gold }}>{nome}</b> — {desc}
              </div>
            ))}
          </div>
        </section>

        {/* A ESCOLA DOS CRIADORES */}
        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📖 Como a cor viaja no sangue do pombo</div>
          <div style={{ ...T.small, fontSize: 12, lineHeight: 1.85, color: T.dim }}>
            <b style={{ color: T.white }}>1. A cor mora no cromossomo do sexo.</b> O macho tem dois cromossomos Z e a fêmea tem um Z + um W. A cor de base (azul, vermelho cinza, canela) viaja no Z — <b style={{ color: T.white }}>por isso a fêmea nunca carrega cor escondida</b>, e <b style={{ color: T.white }}>as filhas pegam a cor do pai</b>. Truque clássico: azul × vermelho pode gerar filha azul de mãe vermelha!
            <br /><br />
            <b style={{ color: T.white }}>2. Dominância:</b> vermelho cinza &gt; azul &gt; canela. O vermelho "pinta por cima" — mas o azul segue escondido no macho e pode reaparecer depois ("saiu azul do casal vermelho!").
            <br /><br />
            <b style={{ color: T.white }}>3. Diluição (ligada ao sexo, recessiva):</b> clareia a cor — azul vira <b>prata</b>, vermelho vira <b>palha</b>, canela vira <b>khaki</b>.
            <br /><br />
            <b style={{ color: T.white }}>4. Padrão, espalhado, ardósia, pérola e mozaico:</b> viajam em cromossomos comuns, de qualquer dos dois lados. Pérola é recessiva (precisa dos dois pais); mozaico e ardósia são dominantes (um pai basta); espalhado transforma azul em preto.
            <br /><br />
            ⚠️ <b>Honestidade de criador:</b> o modelo cobre os sistemas principais e assume pais puros no que não estiver marcado. Pérola (ópala) e mozaico (grizzle/pied) têm expressão variável na vida real — a quantidade de pérola ou de branco muda de pombo pra pombo. As percentagens são <b>probabilidade</b>, não promessa. Pra profundidade de sangue, use a <Link href="/centro-provas/genetica75" style={{ color: T.blue }}>Genética dos 75% →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

/** nome curto do pai pro resumo do cruzamento */
function fenotipoSimples(s: Selecao): string {
  return fenotipo(s.cor, s.diluido, s.padrao, s.espalhado, s.ardosia, s.perola, s.mozaico);
}
