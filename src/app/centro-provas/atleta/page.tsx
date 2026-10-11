"use client";

import { useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * 📖 O POMBO ATLETA — o guia-mestre de condição, forma, anatomia e aerodinâmica.
 * Versão interativa: as 4 forças do voo clicáveis, o ciclo da forma e o
 * checklist do mestre — tudo em português de criador.
 */

/* ═══════ 1. AS QUATRO FORÇAS (interativo) ═══════ */
type Forca = "sustentacao" | "peso" | "empuxo" | "arrasto";
const FORCAS: Record<Forca, { nome: string; cor: string; texto: string }> = {
  sustentacao: { nome: "SUSTENTAÇÃO ↑", cor: "#39e58c", texto: "O ar que passa por CIMA da asa curvada corre mais rápido e 'suga' o pombo pra cima. Nasce da asa inclinada em movimento — a mesma física da asa do avião. Na planada, sai de graça: a altura ganha no batido paga a conta." },
  peso: { nome: "PESO ↓", cor: "#ff5d62", texto: "A gravidade puxando tudo pra baixo — cada grama conta: por isso pombo gordo voa devagar, e a balança é ferramenta de prova. O esqueleto oco (ossos pneumáticos) é a fábrica poupando peso." },
  empuxo: { nome: "EMPUXO →", cor: "#f7bd00", texto: "O motor: peitorais (¼ a ⅓ da massa do pombo!) girando a hélice das 10 primárias. O batido pra baixo do peitoral maior empurra o ar pra trás e o pombo pra frente." },
  arrasto: { nome: "ARRASTO ←", cor: "#f97316", texto: "O atrito com o ar — e cresce com o QUADRADO da velocidade: dobrou a velocidade, QUADRUPLICOU a resistência. Penugem solta, barriga gorda, postura desengonçada: tudo é 'lâmpada acesa no capô'." },
};

function ForcasVoo() {
  const [sel, setSel] = useState<Forca>("empuxo");
  const f = FORCAS[sel];
  const dim = (k: Forca) => (sel === k ? 1 : 0.35);
  const seta = (x1: number, y1: number, x2: number, y2: number, cor: string, on: boolean, k: Forca) => {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const hx = x2 - 9 * Math.cos(ang), hy = y2 - 9 * Math.sin(ang);
    return (
      <g onClick={() => setSel(k)} style={{ cursor: "pointer" }} opacity={on ? 1 : 0.35}>
        <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={cor} strokeWidth={on ? 6 : 4} strokeLinecap="round" />
        <polygon points={`${x2},${y2} ${hx + 7 * Math.cos(ang + 1.9)},${hy + 7 * Math.sin(ang + 1.9)} ${hx + 7 * Math.cos(ang - 1.9)},${hy + 7 * Math.sin(ang - 1.9)}`} fill={cor} />
        <line x1={x1} y1={y1} x2={x1} y2={y1} stroke="transparent" strokeWidth="18" />
      </g>
    );
  };
  return (
    <section style={T.card}>
      <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 4 }}>✈️ As 4 forças do voo — toque nas setas!</div>
      <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 8, lineHeight: 1.5 }}>
        Faça o teste agora: estenda a mão pela janela de um carro em movimento e incline a palma pra cima — você acabou de SENTIR a sustentação e o arrasto. No pombo é a mesma física.
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <svg viewBox="0 0 320 210" style={{ width: 300, height: "auto", flexShrink: 0 }} role="img" aria-label="Diagrama das quatro forças do voo">
          {/* pombo (de perfil, pra direita) */}
          <g opacity="0.95">
            <ellipse cx="160" cy="110" rx="42" ry="20" fill="#7e9bc4" />
            <circle cx="196" cy="94" r="14" fill="#7e9bc4" />
            <path d="M208 92 L224 97 L208 100 Z" fill="#3a3f47" />
            <ellipse cx="150" cy="104" rx="34" ry="11" fill="#9db8dc" transform="rotate(-6 150 104)" />
            <path d="M124 104 L84 112 L86 118 L124 112 Z" fill="#6e8cb3" />
            <path d="M150 122 Q170 132 190 122 Q172 140 150 128 Z" fill="#41546f" />
          </g>
          {/* as 4 setas */}
          {seta(160, 76, 160, 26, FORCAS.sustentacao.cor, sel === "sustentacao", "sustentacao")}
          {seta(160, 144, 160, 194, FORCAS.peso.cor, sel === "peso", "peso")}
          {seta(212, 110, 292, 110, FORCAS.empuxo.cor, sel === "empuxo", "empuxo")}
          {seta(108, 110, 28, 110, FORCAS.arrasto.cor, sel === "arrasto", "arrasto")}
          <text x="160" y="205" textAnchor="middle" fontSize="8.5" fill="#64748b">toque numa seta</text>
        </svg>
        <div style={{ flex: 1, minWidth: 210 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 10 }}>
            {(Object.keys(FORCAS) as Forca[]).map((k) => (
              <button key={k} type="button" onClick={() => setSel(k)} style={{ padding: "8px 6px", borderRadius: 9, cursor: "pointer", fontSize: 11, fontWeight: 900, border: `1.5px solid ${sel === k ? FORCAS[k].cor : T.border}`, background: sel === k ? `${FORCAS[k].cor}22` : T.bgInput, color: sel === k ? FORCAS[k].cor : T.dim }}>
                {FORCAS[k].nome}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: f.cor }}>{f.nome}</div>
          <div style={{ ...T.small, fontSize: 12, lineHeight: 1.75, marginTop: 6 }}>{f.texto}</div>
        </div>
      </div>
      <div style={{ ...T.small, fontSize: 11.5, marginTop: 10, padding: "9px 12px", borderRadius: 10, background: "#ffffff08", lineHeight: 1.7 }}>
        💡 <b style={{ color: T.white }}>O segredo da economia:</b> o pombo alterna batidos potentes com PLANADAS — desce suave gastando quase nada, como carro que desliga o motor morro abaixo. Boa parte da prova é planada &quot;grátis&quot;: quem planeia melhor, chega com tanque.
      </div>
    </section>
  );
}

/* ═══════ 2. O CICLO DA FORMA (interativo) ═══════ */
const FASES = [
  { n: 1, nome: "CONSTRUIR", cor: "#55a3ff", texto: "Treino progressivo + ração certa + descanso. O corpo responde ao esforço com SUPERCOMPENSAÇÃO: reconstrói-se ACIMA do nível anterior. Semana a semana a curva sobe." },
  { n: 2, nome: "PICO (2–3 semanas)", cor: "#39e58c", texto: "A janela de ouro: músculo cheio, pele fina, olho aceso, vontade de voar. A forma estaciona aqui por pouco tempo — e é AQUI que tem que cair o dia da prova." },
  { n: 3, nome: "AFAFAR (semana da prova)", cor: "#f7bd00", texto: "1–2 semanas antes: treino alivia, ração de prova entra. O descanso final deixa o pico CAIR em cima do domingo — o famoso tapering dos campões." },
  { n: 4, nome: "DESCANSAR", cor: "#f97316", texto: "Depois da prova (ou do pico perdido): eletrólito, ração leve, recuperação. Quem não descansa, quebra: overtraining = peso caindo, músculo duro, pombo que não sobe no soltão." },
];

function CicloForma() {
  const [fase, setFase] = useState(1);
  const f = FASES[fase - 1];
  return (
    <section style={{ ...T.card, marginTop: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 4 }}>📈 O ciclo da forma — toque nas fases</div>
      <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 8, lineHeight: 1.5 }}>
        Forma não é botão: é <b>onda</b> — constrói, estaciona no pico por 2–3 semanas e cai. A arte do campão é janelar o pico pro dia da prova.
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <svg viewBox="0 0 340 180" style={{ width: 330, height: "auto", flexShrink: 0 }} role="img" aria-label="Curva do ciclo da forma">
          {/* grade */}
          {[40, 75, 110, 145].map((y) => (
            <line key={y} x1="14" y1={y} x2="330" y2={y} stroke="#ffffff10" strokeWidth="1" strokeDasharray="3 4" />
          ))}
          {/* zonas */}
          <rect x="14" y="30" width="150" height="120" fill="#55a3ff08" />
          <rect x="164" y="30" width="80" height="120" fill="#39e58c0f" />
          <rect x="244" y="30" width="86" height="120" fill="#f9731608" />
          {/* curva da forma */}
          <path d="M 14 138 C 60 134 90 92 130 62 C 150 47 175 44 204 48 C 236 52 260 84 300 128 L 328 148" fill="none" stroke="#f7bd00" strokeWidth="4" strokeLinecap="round" />
          {/* linha da CONDIÇÃO (piso) */}
          <path d="M 14 118 L 328 118" stroke="#9aa8bc" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
          <text x="20" y="112" fontSize="8.5" fill="#9aa8bc">condição (o piso: saúde + manejo)</text>
          {/* marcador da prova */}
          <g>
            <line x1="204" y1="34" x2="204" y2="46" stroke="#f7bd00" strokeWidth="2" />
            <text x="204" y="28" textAnchor="middle" fontSize="9" fontWeight="800" fill="#f7bd00">🏁 dia da prova</text>
          </g>
          {/* botões-fase */}
          {[[1, 80, 100], [2, 204, 40], [3, 120, 152], [4, 290, 152]].map(([n, x, y]) => (
            <g key={n} onClick={() => setFase(n)} style={{ cursor: "pointer" }}>
              <circle cx={x} cy={y} r="12" fill={fase === n ? FASES[n - 1].cor : "#1b283c"} stroke={FASES[n - 1].cor} strokeWidth="2" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="900" fill={fase === n ? "#0b1426" : "#e2e8f0"}>{n}</text>
            </g>
          ))}
          <text x="80" y="174" fontSize="8.5" fill="#64748b" textAnchor="middle">semanas de treino →</text>
        </svg>
        <div style={{ flex: 1, minWidth: 210 }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
            {FASES.map((x) => (
              <button key={x.n} type="button" onClick={() => setFase(x.n)} style={{ padding: "6px 11px", borderRadius: 999, cursor: "pointer", fontSize: 10.5, fontWeight: 900, border: `1.5px solid ${fase === x.n ? x.cor : T.border}`, background: fase === x.n ? `${x.cor}22` : T.bgInput, color: fase === x.n ? x.cor : T.dim }}>
                {x.n}. {x.nome.split(" (")[0]}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: f.cor }}>{f.n}. {f.nome}</div>
          <div style={{ ...T.small, fontSize: 12, lineHeight: 1.75, marginTop: 6 }}>{f.texto}</div>
        </div>
      </div>
    </section>
  );
}

/* ═══════ 3. O CHECKLIST DO MESTRE (clicável) ═══════ */
const SINAIS: { emoji: string; titulo: string; texto: string }[] = [
  { emoji: "🫀", titulo: "Peito", texto: "Músculo cheio e elástico cobrindo a quilha — \"carne por cima do osso\". Nem peito de faca, nem músculo duro e seco de desgaste." },
  { emoji: "🌸", titulo: "Pele", texto: "Fina, quase transparente, rosada — e a penugem solta SOME quando a forma vem (a \"poeira\" das costas)." },
  { emoji: "👁️", titulo: "Olho", texto: "Brilhante e vivo, os círculos vibrando — o eye-sign inteiro parece ACENDER na forma." },
  { emoji: "🧻", titulo: "Cera (nariz)", texto: "Branca e seca, como giz. Amarela ou úmida = atenção no manejo." },
  { emoji: "🪶", titulo: "Pena", texto: "Sedosa, brilhante, fechada, impermeável (borrifo escorre sem molhar). Em forma, o pombo parece MENOR na mão — pena assentada como terno de alfaiataria." },
  { emoji: "⚡", titulo: "Comportamento", texto: "O sinal que não mente: inquieto, dono do pombal, bate asa no poleiro, briga pelo lugar — e no soltão SOBE E SOME." },
  { emoji: "💩", titulo: "Fezes", texto: "Pequenas, firmes, escuras com pontinha branca — intestino de atleta." },
  { emoji: "⚖️", titulo: "Balança", texto: "Peso estável na faixa ideal DAQUELE pombo (anote após uma boa temporada). Na forma o peso cai um pouco e o músculo enche: o \"peso de prova\"." },
];

function ChecklistForma() {
  const [ok, setOk] = useState<Set<number>>(new Set());
  const alternar = (i: number) => setOk((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  return (
    <section style={{ ...T.card, marginTop: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 4 }}>✅ O checklist do mestre — passe o pombo na mão e marque</div>
      <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 10, lineHeight: 1.5 }}>
        Condição é o PISO (saúde + manejo). Forma é o TETO (o pico atlético, efêmero). Este checklist lê os dois — {ok.size}/8 sinais conferidos {ok.size >= 6 && ok.size < 8 ? "— quase um atleta pronto! 💪" : ok.size === 8 ? "— POMBO EM FORMA! 🏆" : ""}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 7 }}>
        {SINAIS.map((s, i) => (
          <button key={s.titulo} type="button" onClick={() => alternar(i)} style={{ textAlign: "left", padding: 11, borderRadius: 11, cursor: "pointer", background: ok.has(i) ? "#39e58c12" : "#ffffff08", border: `1.5px solid ${ok.has(i) ? "#39e58c66" : T.border}` }}>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: ok.has(i) ? "#39e58c" : T.white }}>
              {ok.has(i) ? "✓ " : ""}{s.emoji} {s.titulo}
            </div>
            <div style={{ ...T.small, fontSize: 10.5, lineHeight: 1.6, marginTop: 4, color: T.dim }}>{s.texto}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ═══════ 4. A MÁQUINA + NÚMEROS + SEMANA + MÓDULOS ═══════ */
const MAQUINA: { emoji: string; titulo: string; texto: string }[] = [
  { emoji: "🦴", titulo: "Esqueleto que não pesa", texto: "Só ~4–5% do peso total — ossos PNEUMÁTICOS (ocos, cheios de ar ligados à respiração). Fuselagem de tubo de alumínio oco: resistência com peso mínimo." },
  { emoji: "💪", titulo: "O motor (peitorais)", texto: "¼ a ⅓ da massa do pombo! O peitoral maior bate a asa pra BAIXO (propulsão); o interno puxa pra CIMA (recuperação). Carne escura = fibras de resistência com usinas de energia." },
  { emoji: "🌬️", titulo: "O turbo (9 sacos aéreos)", texto: "Respiração em FLUXO CONTÍNUO: o ar oxigena o pulmão na ida E na volta — e de brinde resfria o corpo (pombo não sua: o ar-condicionado é o respiro)." },
  { emoji: "❤️", titulo: "A bomba (coração)", texto: "Em voo passa de 600 batimentos/minuto, sangue rico em hemoglobina. Anemia, verminose e coccidiose atacam EXATAMENTE aqui — pombo pálido por dentro pede exame." },
  { emoji: "🪶", titulo: "As asas (hélice + aerofólio)", texto: "10 primárias = HÉLICE (empuxo). Secundárias = AEROFÓLIO (sustentação na planada). Velocista: asa curta e musculada; fundista: asa longa e cheia — ferramentas pra provas diferentes." },
  { emoji: "🧭", titulo: "A cauda e o cockpit", texto: "Cauda = leme na planada e freio no pouso. Olhos de quase 340° com foco instantâneo e as bússolas (sol, magnetismo, olfato) que transformam penas em GPS." },
];

const NUMEROS: [string, string][] = [
  ["70–90 km/h", "velocidade de cruzeiro"],
  ["1100–1400 m/min", "médias campeãs de prova"],
  [">600 bpm", "coração em pleno voo"],
  ["¼ a ⅓", "do corpo é MOTOR (peitoral)"],
];

const SEMANA: [string, string, string][] = [
  ["Segunda", "Solta leve de recuperação · ração de manutenção", "Quem chegou \"duro\", fezes, apetite"],
  ["Terça", "Treino médio (60–80 km) · começar transição de ração", "Músculo na palpação, peso"],
  ["Quarta", "Treino médio/forte ou soltão forte", "Quem subiu e sumiu (forma!)"],
  ["Quinta", "Treino leve · ração de prova (energia sobe)", "Pele/penugem, olho, cera"],
  ["Sexta", "Solta leve · ração de prova · água limpa", "Comportamento — os \"elétricos\""],
  ["Sábado", "ENCESTAMENTO: leve, hidratado, anilha e cesto conferidos", "Peso de prova"],
  ["Domingo", "Dia da prova — e confiança", "Chegada, hora, estado do retorno"],
];

const MODULOS: [string, string][] = [
  ["⚖️ Peso e Forma", "/centro-provas/peso"],
  ["⚖️ Triângulo de Ouro Anatômico", "/centro-provas/anatomia"],
  ["🪶 Índice da Asa e Muda", "/centro-provas/asa"],
  ["👁️ Análise de Olho (4 escolas)", "/centro-provas/olho"],
  ["🏁 Rota da Prova (vento real)", "/centro-provas/rota"],
  ["🍽️ Mistura Semanal", "/centro-provas/mistura-semanal"],
  ["📓 Diário do Pombal", "/centro-provas/diario"],
  ["🏅 Histórico de provas", "/centro-provas/historico"],
];

export default function PomboAtleta() {
  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>📖 O Pombo Atleta</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Condição, forma, anatomia e aerodinâmica — o guia-mestre do criador. <b>O pombo de prova é um atleta que nasce sabendo voar — mas só chega na taça quem é preparado como atleta.</b></p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {/* A MÁQUINA */}
        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🔧 Parte 1 — A MÁQUINA (anatomia)</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 8 }}>
            {MAQUINA.map((m) => (
              <div key={m.titulo} style={{ padding: 12, borderRadius: 12, background: "#ffffff08", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 20 }}>{m.emoji}</div>
                <div style={{ fontSize: 12.5, fontWeight: 900, marginTop: 4 }}>{m.titulo}</div>
                <div style={{ ...T.small, fontSize: 11, lineHeight: 1.65, marginTop: 4, color: T.dim }}>{m.texto}</div>
              </div>
            ))}
          </div>
        </section>

        {/* A FÍSICA */}
        <div style={{ marginTop: 14 }}>
          <ForcasVoo />
        </div>

        {/* NÚMEROS */}
        <section style={{ ...T.card, marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
          {NUMEROS.map(([n, d]) => (
            <div key={d} style={{ padding: 11, borderRadius: 10, background: "#ffffff08", textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: T.gold }}>{n}</div>
              <div style={{ ...T.small, fontSize: 10, marginTop: 2 }}>{d}</div>
            </div>
          ))}
        </section>

        {/* O ATLETA: condição × forma */}
        <section style={{ ...T.card, marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 8 }}>🏃 Parte 3 — Condição ≠ Forma (a distinção que separa mestres)</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220, padding: 12, borderRadius: 12, background: "#55a3ff0d", border: "1px solid #55a3ff44" }}>
              <b style={{ color: "#55a3ff" }}>🏠 CONDIÇÃO = o PISO</b>
              <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.7, marginTop: 5 }}>Saúde limpa, nutrição certa, parasitas sob controle, penas em ordem. Sem ela não existe forma — existe acidente esperando o dia da prova.</div>
            </div>
            <div style={{ flex: 1, minWidth: 220, padding: 12, borderRadius: 12, background: "#39e58c0d", border: "1px solid #39e58c44" }}>
              <b style={{ color: "#39e58c" }}>⭐ FORMA = o TETO</b>
              <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.7, marginTop: 5 }}>O pico atlético: músculo, sangue, hormônios e cabeça no ponto máximo. Efêmera — uma janela de 2–3 semanas que o campão janelas pro dia da prova.</div>
            </div>
          </div>
        </section>

        <CicloForma />
        <ChecklistForma />

        {/* ERROS CLÁSSICOS */}
        <section style={{ ...T.card, marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.red, marginBottom: 8 }}>🚫 Os 5 erros clássicos (que custam taças)</div>
          <div style={{ display: "grid", gap: 6 }}>
            {[
              "Treinar demais na semana da prova — o pico estoura antes do domingo",
              "Ração de manutenção na semana de prova (falta combustível) — e pesada demais no descanso (sobra barriga)",
              "Não pesar: achismo é o inimigo da balança",
              "Levar pombo \"meio-forma\" porque a prova é importante — prova não perdoa",
              "Confiar em UM sinal só (olho, asa, pedigree) — o atleta é a soma de TUDO",
            ].map((e, i) => (
              <div key={i} style={{ padding: "9px 12px", borderRadius: 10, background: "#ff5d6208", border: "1px solid #ff5d6233", fontSize: 12, lineHeight: 1.6 }}>
                <b style={{ color: T.red }}>{i + 1}.</b> {e}
              </div>
            ))}
          </div>
        </section>

        {/* SEMANA DE PROVA */}
        <section style={{ ...T.card, marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 8 }}>📅 A semana de prova — segunda a domingo</div>
          <div style={{ display: "grid", gap: 5 }}>
            {SEMANA.map(([dia, manejo, ver]) => (
              <div key={dia} style={{ display: "grid", gridTemplateColumns: "82px 1.4fr 1fr", gap: 8, padding: "9px 11px", borderRadius: 10, background: dia === "Sábado" ? "#f7bd0010" : "#ffffff08", fontSize: 11.5, lineHeight: 1.55 }}>
                <b style={{ color: dia === "Domingo" ? T.green : T.gold }}>{dia}</b>
                <span>{manejo}</span>
                <span style={{ color: T.dim }}>👀 {ver}</span>
              </div>
            ))}
          </div>
          <div style={{ ...T.small, fontSize: 10.5, marginTop: 8, color: T.dim2 }}>💪 Depois da prova: eletrólito na água, ração leve de recuperação, descanso — e registrar tudo no Histórico e no Diário.</div>
        </section>

        {/* MÓDULOS */}
        <section style={{ ...T.card, marginTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 8 }}>🧩 Onde cada coisa mora no app</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {MODULOS.map(([nome, href]) => (
              <Link key={href} href={href} style={{ padding: "7px 12px", borderRadius: 999, border: `1px solid ${T.border}`, background: T.bgInput, color: T.white, textDecoration: "none", fontSize: 11.5, fontWeight: 700 }}>
                {nome} →
              </Link>
            ))}
          </div>
        </section>

        {/* HONESTIDADE */}
        <section style={{ ...T.card, marginTop: 14, ...T.small, fontSize: 11, lineHeight: 1.75, color: T.dim }}>
          ⚠️ <b>Honestidade de sempre:</b> os números são faixas clássicas da literatura columófila e da fisiologia das aves — <b>referências de trabalho, não relógio suíço</b>. Cada linhagem tem sua faixa de peso e sua asa ideal: o SEU pombo no SEU pombal é o juiz final. A física do voo é ciência; a leitura de forma no olho, na pele e no comportamento é tradição afiada por gerações de campões.
        </section>
      </div>
    </main>
  );
}
