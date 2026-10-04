"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type Pombo = { id: number; anilha: string; nome: string | null; sexo: string; paiId: number | null; maeId: number | null };
type Modo = "explicar" | "calculadora" | "plantel";

/* ══════════════════════════════════════════════════════════════
   NÚCLEO MATEMÁTICO — coeficiente de parentesco (Wright)
   ══════════════════════════════════════════════════════════════ */

/** todos os ancestrais de um pombo: Map<idDoAncestral, nº de caminhos> */
function contarAncestrais(p: Pombo | undefined, mapa: Map<number, Pombo>, prof: number, acc: Map<number, number>): void {
  if (!p || prof <= 0) return;
  for (const pai of [p.paiId, p.maeId]) {
    if (pai == null) continue;
    acc.set(pai, (acc.get(pai) || 0) + 1);
    const av = mapa.get(pai);
    if (av) contarAncestrais(av, mapa, prof - 1, acc);
  }
}

/**
 * Parentesco (coeficiente de Wright simplificado até 6 gerações):
 * fração média de genes compartilhados entre dois pombos.
 * Pai/filho ou irmãos completos = 50%; avô/neto = 25%...
 */
function parentesco(a: Pombo, b: Pombo, mapa: Map<number, Pombo>): number {
  const ancA = new Map<number, number>();
  contarAncestrais(a, mapa, 6, ancA);
  const ancB = new Map<number, number>();
  contarAncestrais(b, mapa, 6, ancB);
  let soma = 0;
  let pathsA = 0;
  ancA.forEach((n, id) => pathsA += n);
  let pathsB = 0;
  ancB.forEach((n, id) => pathsB += n);
  // ancestral comum: contribui proporcional aos caminhos
  ancA.forEach((nA, id) => {
    const nB = ancB.get(id);
    if (nB) {
      const pa = pathsA ? nA / pathsA : 0;
      const pb = pathsB ? nB / pathsB : 0;
      soma += Math.min(pa, pb);
    }
  });
  // o próprio A como ancestral de B (ou vice-versa) = linha direta
  if (ancB.has(a.id)) soma = Math.max(soma, (ancB.get(a.id) || 1) / (pathsB || 1));
  if (ancA.has(b.id)) soma = Math.max(soma, (ancA.get(b.id) || 1) / (pathsA || 1));
  return Math.min(1, soma * 2); // dobro: cada caminho carrega 50% do gene
}

/* ══════════════════════════════════════════════════════════════
   ILUSTRAÇÃO 75% — árvore SVG clássica do 3/4
   ══════════════════════════════════════════════════════════════ */

function Arvore75() {
  const No = ({ x, y, w, txt, pct, cor, sub }: { x: number; y: number; w: number; txt: string; pct?: number; cor: string; sub?: string }) => (
    <g>
      <rect x={x} y={y} width={w} height={46} rx={9} fill="#1b283c" stroke={cor} strokeWidth={2} />
      {pct !== undefined && (
        <rect x={x} y={y - 16} width={Math.round(w * Math.min(1, pct / 100))} height={8} rx={4} fill={cor} />
      )}
      <text x={x + w / 2} y={y + 20} textAnchor="middle" fill="#f8fafc" fontSize={10.5} fontWeight="800">{txt}</text>
      {sub && <text x={x + w / 2} y={y + 35} textAnchor="middle" fill="#9aa8bc" fontSize={8.5}>{sub}</text>}
      {pct !== undefined && <text x={x + w / 2} y={y - 22} textAnchor="middle" fill={cor} fontSize={13} fontWeight="900">{pct}%</text>}
    </g>
  );
  const Linha = ({ x1, y1, x2, y2, cor = "#f7bd0088" }: { x1: number; y1: number; x2: number; y2: number; cor?: string }) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={cor} strokeWidth={2} />
  );

  return (
    <svg viewBox="0 0 760 430" style={{ width: "100%", display: "block" }}>
      <text x={380} y={22} textAnchor="middle" fill="#f7bd00" fontSize={13} fontWeight={900}>GENERAÇÃO 1 — nasce a filha do campeão</text>

      <No x={140} y={45} w={160} txt="🏆 CAMPEÃO" pct={100} cor="#f7bd00" sub="o doador de sangue" />
      <No x={450} y={45} w={160} txt="Parceira" pct={0} cor="#55a3ff" sub="sangue de fora" />

      <Linha x1={300} y1={91} x2={360} y2={161} />
      <Linha x1={450} y1={91} x2={390} y2={161} />
      <No x={290} y={161} w={170} txt="Filha" pct={50} cor="#39e58c" sub="50% do campeão" />

      <text x={380} y={232} textAnchor="middle" fill="#f7bd00" fontSize={13} fontWeight={900}>GENERAÇÃO 2 — o MESMO campeão cruza com a própria filha</text>

      <No x={140} y={255} w={160} txt="🏆 CAMPEÃO" pct={100} cor="#f7bd00" sub="ele mesmo, de novo!" />
      <Linha x1={300} y1={301} x2={360} y2={325} />
      <Linha x1={375} y1={207} x2={375} y2={325} />
      <No x={270} y={325} w={210} txt="🐣 POMBO 75%" pct={75} cor="#ff5d62" sub="3/4 do sangue do campeão" />

      <text x={620} y={285} textAnchor="middle" fill="#9aa8bc" fontSize={9.5}>50% vem do pai<br />(o campeão inteiro)</text>
      <text x={620} y={345} textAnchor="middle" fill="#9aa8bc" fontSize={9.5}>25% vem da mãe<br />(a filha, metade dele)</text>

      <text x={380} y={398} textAnchor="middle" fill="#f8fafc" fontSize={11} fontWeight={700}>
        100% do campeão ÷ 2 (lado do pai) + 50% da filha ÷ 2 (lado da mãe) = 75%
      </text>
      <text x={380} y={420} textAnchor="middle" fill="#f97316" fontSize={10}>
        ⚠️ Consanguinidade real (F): 25% — concentram-se virtudes E defeitos: selecione com rigor
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   CALCULADORA — % de sangue de um pombo num produto
   ══════════════════════════════════════════════════════════════ */

function Calculadora75({ pombos, mapa }: { pombos: Pombo[]; mapa: Map<number, Pombo> }) {
  const [doadorId, setDoadorId] = useState("");
  const [paiId, setPaiId] = useState("");
  const [maeId, setMaeId] = useState("");

  const doador = pombos.find((p) => String(p.id) === doadorId);
  const pai = pombos.find((p) => String(p.id) === paiId);
  const mae = pombos.find((p) => String(p.id) === maeId);

  /** fração de genes do doador presentes num pombo (percorre pedigree) */
  const fracao = (p: Pombo | undefined, alvoId: number, prof = 6): number => {
    if (!p || prof < 0) return 0;
    if (p.id === alvoId) return 1;
    const paiF = p.paiId ? fracao(mapa.get(p.paiId), alvoId, prof - 1) : 0;
    const maeF = p.maeId ? fracao(mapa.get(p.maeId), alvoId, prof - 1) : 0;
    return (paiF + maeF) / 2;
  };

  const resultado = useMemo(() => {
    if (!doador || !pai || !mae) return null;
    const sanguePai = fracao(pai, doador.id);
    const sangueMae = fracao(mae, doador.id);
    const sangueFilho = (sanguePai + sangueMae) / 2;
    const consanguinidade = parentesco(pai, mae, mapa);
    return { sanguePai, sangueMae, sangueFilho, consanguinidade };
  }, [doadorId, paiId, maeId, pombos]);

  const Barra = ({ pct, cor, label }: { pct: number; cor: string; label: string }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <span>{label}</span>
        <b style={{ color: cor }}>{(pct * 100).toFixed(1)}%</b>
      </div>
      <div style={{ height: 10, background: "#ffffff12", borderRadius: 5, marginTop: 4 }}>
        <div style={{ height: "100%", width: `${Math.min(100, pct * 100)}%`, background: cor, borderRadius: 5 }} />
      </div>
    </div>
  );

  return (
    <section style={T.card}>
      <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 12 }}>🧮 Calculadora de Sangue — quantos % do campeão vai pro filhote?</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
        <div>
          <label style={T.label}>🏆 POMBO DOADOR (o campeão)</label>
          <select value={doadorId} onChange={(e) => setDoadorId(e.target.value)} style={T.input}>
            <option value="">— escolher —</option>
            {pombos.map((p) => <option key={p.id} value={p.id}>{p.nome || p.anilha}</option>)}
          </select>
        </div>
        <div>
          <label style={T.label}>♂ PAI do cruzamento</label>
          <select value={paiId} onChange={(e) => setPaiId(e.target.value)} style={T.input}>
            <option value="">— escolher —</option>
            {pombos.map((p) => <option key={p.id} value={p.id}>{p.nome || p.anilha}</option>)}
          </select>
        </div>
        <div>
          <label style={T.label}>♀ MÃE do cruzamento</label>
          <select value={maeId} onChange={(e) => setMaeId(e.target.value)} style={T.input}>
            <option value="">— escolher —</option>
            {pombos.map((p) => <option key={p.id} value={p.id}>{p.nome || p.anilha}</option>)}
          </select>
        </div>
      </div>

      {resultado && (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: "#ffffff08" }}>
          <Barra pct={resultado.sanguePai} cor="#3b82f6" label={`♂ ${pai?.nome || pai?.anilha} — sangue de ${doador?.nome || doador?.anilha}`} />
          <Barra pct={resultado.sangueMae} cor="#ec4899" label={`♀ ${mae?.nome || mae?.anilha} — sangue de ${doador?.nome || doador?.anilha}`} />
          <div style={{ height: 1, background: T.border, margin: "12px 0" }} />
          <Barra pct={resultado.sangueFilho} cor="#f7bd00" label={`🐣 FILHOTE — sangue total de ${doador?.nome || doador?.anilha}`} />
          <div style={{ ...T.small, fontSize: 11, marginTop: 6, lineHeight: 1.6 }}>
            Parentesco pai × mãe (consanguinidade do cruzamento): <b style={{ color: resultado.consanguinidade > 0.4 ? "#ff5d62" : resultado.consanguinidade > 0.2 ? "#fbbf24" : "#39e58c" }}>{(resultado.consanguinidade * 100).toFixed(1)}%</b>
            {" "}({resultado.consanguinidade > 0.4 ? "ALTO — só com avaliação completa de saúde/eye-sign" : resultado.consanguinidade > 0.2 ? "moderado" : "aberto"})
          </div>
          {resultado.sangueFilho >= 0.7 && (
            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "#f7bd0015", border: "1px solid #f7bd0055", fontSize: 12, lineHeight: 1.6 }}>
              🏆 <b>Cruzamento ~75%!</b> O filhote carrega {(resultado.sangueFilho * 100).toFixed(0)}% do sangue de {doador?.nome || doador?.anilha} — a clássica "duplicação do campeão". Lembre: junto vão os genes bons E os ruins — selecione rigorosamente.
            </div>
          )}
        </div>
      )}
      {!resultado && <div style={{ ...T.small, fontSize: 11, marginTop: 12 }}>Escolha o doador, o pai e a mãe — o app percorre o pedigree (até 6 gerações) e calcula o % de sangue.</div>}
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA
   ══════════════════════════════════════════════════════════════ */

export default function Genetica75() {
  const [modo, setModo] = useState<Modo>("explicar");
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [termo, setTermo] = useState("");

  useEffect(() => {
    fetch("/api/pombos").then((r) => r.json()).then((v) => setPombos(Array.isArray(v) ? v : [])).catch(() => setPombos([]));
  }, []);

  const mapa = useMemo(() => new Map(pombos.map((p) => [p.id, p])), [pombos]);

  const cruzamentos = useMemo(() => {
    if (termo.trim().length < 2) return [];
    const alvo = pombos.find((p) => (p.nome || "").toLowerCase().includes(termo.toLowerCase()) || p.anilha.toLowerCase().includes(termo.toLowerCase()));
    if (!alvo) return [];
    // para cada casal possível, calcula % de sangue do alvo no filhote
    const saida: { pai: Pombo; mae: Pombo; pct: number; cons: number }[] = [];
    const fracao = (p: Pombo | undefined, alvoId: number, prof = 5): number => {
      if (!p || prof < 0) return 0;
      if (p.id === alvoId) return 1;
      const paiF = p.paiId ? fracao(mapa.get(p.paiId), alvoId, prof - 1) : 0;
      const maeF = p.maeId ? fracao(mapa.get(p.maeId), alvoId, prof - 1) : 0;
      return (paiF + maeF) / 2;
    };
    for (const pai of pombos) {
      if (pai.sexo !== "macho" || pai.id === alvo.id) continue;
      for (const mae of pombos) {
        if (mae.sexo !== "femea" || mae.id === alvo.id || mae.id === pai.id) continue;
        const pct = (fracao(pai, alvo.id) + fracao(mae, alvo.id)) / 2;
        if (pct >= 0.5) saida.push({ pai, mae, pct, cons: parentesco(pai, mae, mapa) });
      }
    }
    return saida.sort((a, b) => b.pct - a.pct).slice(0, 10);
  }, [termo, pombos, mapa]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🧬 Genética — A Teoria dos 75%</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Duplicando o sangue do campeão: cruzamentos 3/4 ilustrados, calculados e aplicados ao SEU plantel</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, marginBottom: 14 }}>
          {([["explicar", "📖 A Teoria"], ["calculadora", "🧮 Calculadora"], ["plantel", "🐣 No meu plantel"]] as const).map(([k, lbl]) => (
            <button key={k} type="button" onClick={() => setModo(k)} style={{ padding: "11px 2px", borderRadius: 10, cursor: "pointer", fontSize: 11, fontWeight: 800, color: modo === k ? "#0b1426" : "#9aa8bc", background: modo === k ? "#f7bd00" : "#1b283c", border: `1.5px solid ${modo === k ? "#f7bd00" : "#31415a"}` }}>{lbl}</button>
          ))}
        </div>

        {modo === "explicar" && (
          <>
            <section style={T.card}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 8 }}>🏆 A ideia central</div>
              <div style={{ ...T.small, fontSize: 12.5, lineHeight: 1.8 }}>
                Um filhote recebe <b>50% dos genes do pai e 50% da mãe</b>. Quando você acasala dois pombos que <b>ambos descendem do mesmo campeão</b>, as frações se somam — e dá pra "empacotar" a maior parte do sangue do craque num só produto:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginTop: 12 }}>
                {([
                  ["50%", "Filho(a) direto do campeão × pombo sem parentesco", "#3b82f6"],
                  ["50%", "MEIO-IRMÃOS: filho × filha do campeão (pilares/pais diferentes) — soma 25%+25%", "#8f6bb8"],
                  ["62,5%", "Campeão × neta (filha do filho do campeão) — 100% + 25%", "#0ea5e9"],
                  ["75%", "CAMPEÃO × PRÓPRIO FILHO(A) — pai × filha ou mãe × filho: 100% + 50%", "#f7bd00"],
                  ["87,5%", "Campeão × filho(a) 75% (neto do campeão com o próprio campeão) — 3 gerações de retrocruzamento", "#f97316"],
                ] as const).map(([pct, txt, cor]) => (
                  <div key={pct} style={{ padding: 12, borderRadius: 10, background: `${cor}12`, border: `1px solid ${cor}44`, textAlign: "center" }}>
                    <b style={{ fontSize: 24, color: cor }}>{pct}</b>
                    <div style={{ ...T.small, fontSize: 10, marginTop: 4, lineHeight: 1.4 }}>{txt}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ ...T.card, borderColor: "#f7bd0055", background: "#f7bd000d" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🌳 O cruzamento 75% clássico, desenhado</div>
              <Arvore75 />
            </section>

            <section style={T.card}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 8 }}>⚔️ Por que os grandes criadores usam (e os riscos)</div>
              <div style={{ ...T.small, fontSize: 12, lineHeight: 1.9 }}>
                <b>O lado bom:</b> concentra os genes do campeão — muita gente jura que os "75%" reproduzem mais parecido com o avô do que os próprios filhos 50%. É a base das grandes famílias de fundo.<br />
                <b>O lado perigoso:</b> a consanguinidade NÃO escolhe — <b>junto com as virtudes vêm os defeitos</b> (vigor, fertilidade, imunidade podem cair). As regras de ouro dos mestres:<br />
                • O 75% clássico é <b>campeão × próprio filho(a)</b> (consanguinidade F=25% — alta!); a alternativa mais suave é <b>meio-irmãos</b> (F=12,5%), que dá 50% do sangue com menos risco<br />• Só cruze pombos <b>saudáveis, provados e sem defeito visível</b> — avalie olho, corpo, asa, origem<br />
                • Nunca dois cruzamentos fechados em sequência — depois do 75%, <b>abra o sangue</b> (outcross)<br />
                • Quanto mais alto o %, <b>mais rigor na seleção</b>: descarte sem dó os medianos<br />
                • O papel (75% no pedigree) não voa: <b>o cesto é o juiz final</b> 🧺
              </div>
            </section>
          </>
        )}

        {modo === "calculadora" && (
          <>
            <section style={{ ...T.card, borderColor: "#55a3ff55", background: "#55a3ff0d" }}>
              <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.6 }}>
                🧮 Escolha <b>o pombo doador</b> (o campeão cujo sangue você quer duplicar), o <b>pai</b> e a <b>mãe</b> do cruzamento. O app percorre o pedigree cadastrado (até 6 gerações) e calcula o % de sangue do doador em cada um e no futuro filhote — funciona para 50%, 62,5%, 75%, 87,5% e qualquer combinação.
              </div>
            </section>
            <Calculadora75 pombos={pombos} mapa={mapa} />
            {pombos.length === 0 && <div style={{ ...T.card, ...T.small }}>Cadastre seus pombos (com pai e mãe vinculados no pedigree) na página 🐦 Pombos — a calculadora usa essas ligações.</div>}
          </>
        )}

        {modo === "plantel" && (
          <>
            <section style={{ ...T.card, borderColor: "#55a3ff55", background: "#55a3ff0d" }}>
              <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.6 }}>
                🐣 Digite o nome/anilha do seu campeão — o app varre TODOS os casais possíveis do plantel e lista os que mais concentram o sangue dele (≥50%).
              </div>
            </section>
            <section style={T.card}>
              <input value={termo} onChange={(e) => setTermo(e.target.value)} placeholder="Nome ou anilha do pombo doador (ex.: Trovão)" style={{ ...T.input, fontSize: 14 }} />
              {termo.trim().length < 2 && <div style={{ ...T.small, fontSize: 11, marginTop: 8 }}>Digite pelo menos 2 letras.</div>}
              {termo.trim().length >= 2 && cruzamentos.length === 0 && <div style={{ ...T.small, fontSize: 11, marginTop: 8 }}>Nenhum casal ≥50% encontrado — verifique se o pedigree (pai/mãe) está cadastrado, ou tente outro nome.</div>}
              {cruzamentos.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "11px 0", borderBottom: `1px solid ${T.border}`, flexWrap: "wrap", alignItems: "center" }}>
                  <div>
                    <b style={{ fontSize: 13 }}>♂ {c.pai.nome || c.pai.anilha} × ♀ {c.mae.nome || c.mae.anilha}</b>
                    <div style={{ ...T.small, fontSize: 10.5 }}>consanguinidade do casal: {(c.cons * 100).toFixed(0)}% {c.cons > 0.4 ? "⚠️" : ""}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <b style={{ fontSize: 18, color: c.pct >= 0.7 ? "#f7bd00" : "#39e58c" }}>{(c.pct * 100).toFixed(1)}%</b>
                    <div style={{ ...T.small, fontSize: 9 }}>{c.pct >= 0.7 ? "cruzamento 75% 🏆" : "sangue do doador"}</div>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
