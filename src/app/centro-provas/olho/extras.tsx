"use client";

import { useState } from "react";
import { T } from "../theme";

/* ══════════════════════════════════════════════════════════════
   📖 GUIA DE CAMPO — avaliação passo a passo com pontuação
   (tradição eye-sign: Barkel / Hofmann / escolas europeias)
   ══════════════════════════════════════════════════════════════ */

type Nota5 = 0 | 1 | 2 | 3 | 4 | 5;

const CRITERIOS: { chave: string; nome: string; como: string; notas: [string, string, string, string, string] }[] = [
  { chave: "pupila", nome: "1️⃣ Pupila", como: "Em luz natural, cubra a luz com a mão e solte: pupila pequena que contrai/expande rápido = sinal de vitalidade (as escolas ligam à vontade de voar).", notas: ["Grande e parada sob a luz", "Reage devagar à sombra", "Média, reage bem", "Pequena e reativa", "Pequena, contrai instantaneamente, quase vibra"] },
  { chave: "adaptacao", nome: "2️⃣ Círculo de Adaptação", como: "Anel grudado na pupila. Cor (marrom/oliva/cinza) e BORDA: serrilhada = 'sinal de corrida' valioso (Hofmann e Barkel valorizam). Larga e completa = força.", notas: ["Quase invisível", "Fina, borda lisa", "Visível, parcialmente serrilhada", "Larga e bem serrilhada", "Larga, completa, serrilhada em relevo 3D"] },
  { chave: "correlacao", nome: "3️⃣ Círculo de Correlação", como: "Faixa entre a adaptação e a íris. Barkel: VISÍVEL larga = só provas curtas; estreita/fechada = fôlego para o fundo. Compare em toda a volta.", notas: ["Extremamente larga (só velocidade)", "Larga", "Equilibrada", "Estreita", "Fechada/completa — aptidão a fundo"] },
  { chave: "iris", nome: "4️⃣ Íris (granulação)", como: "A 'carne' colorida: granulação fina, rica, em relevo e sem falhas = saúde e vitalidade. Rala, com buracos ou esticada = sinal de fraqueza.", notas: ["Rala, com falhas visíveis", "Granulação grossa e irregular", "Granulação média", "Rica e uniforme", "Densa, colorida, relevo 3D sem nenhuma falha"] },
  { chave: "perimetro", nome: "5️⃣ Perímetro (círculo da saúde)", como: "Anel externo junto à pálpebra. Barkel exigia para MATRIZ: completo em toda a volta e com a MESMA cor/largura da adaptação. É o selo do reprodutor.", notas: ["Ausente", "Aparece em trechos", "Presente na metade da volta", "Quase completo", "Anel completo, uniforme e contínuo"] },
];

export function GuiaCampo() {
  const [notas, setNotas] = useState<Record<string, Nota5>>({});
  const [vistaAnilha, setVistaAnilha] = useState("");
  const total = CRITERIOS.length;
  const feitos = CRITERIOS.filter((c) => notas[c.chave] !== undefined).length;
  const soma = CRITERIOS.reduce((acc, c) => acc + (notas[c.chave] ?? 0), 0);
  const pct = Math.round((soma / (total * 5)) * 100);
  const notaCorrida = Math.round((((notas.adaptacao ?? 0) * 2 + (notas.correlacao ?? 0) * 2 + (notas.iris ?? 0) + (notas.pupila ?? 0)) / 25) * 100);
  const notaReproducao = Math.round((((notas.perimetro ?? 0) * 3 + (notas.adaptacao ?? 0) + (notas.pupila ?? 0) + (notas.iris ?? 0)) / 30) * 100);
  const estrelas = (n: number) => "★".repeat(Math.max(1, Math.round(n / 20))) + "☆".repeat(5 - Math.max(1, Math.round(n / 20)));

  return (
    <>
      <section style={{ ...T.card, borderColor: "#55a3ff55", background: "#55a3ff0d" }}>
        <b style={{ color: "#55a3ff", fontSize: 13 }}>🔬 Como examinar (ritual clássico)</b>
        <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.7, marginTop: 6 }}>
          1. <b>Luz natural</b> (nunca sol direto nos olhos do pombo) — de preferência pela manhã, na janela do pombal<br />
          2. Use uma <b>lupa 10×</b> — aproxime devagar sem encostar<br />
          3. Cubra e descubra a luz com a mão para ver a <b>reação da pupila</b><br />
          4. Percorra os 5 círculos <b>de dentro pra fora</b>: pupila → adaptação → correlação → íris → perímetro<br />
          5. Avalie o plantel inteiro: o olho faz mais sentido comparando casais e famílias do que isolado
        </div>
      </section>

      <section style={T.card}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 4 }}>🧮 Ficha de Avaliação — pontue cada círculo de 0 a 5</div>
        <input value={vistaAnilha} onChange={(e) => setVistaAnilha(e.target.value)} placeholder="Anilha do pombo avaliado (anotação sua)" style={{ ...T.input, marginBottom: 14, fontSize: 12 }} />
        {CRITERIOS.map((c) => (
          <div key={c.chave} style={{ marginBottom: 14 }}>
            <b style={{ fontSize: 13 }}>{c.nome}</b>
            <div style={{ ...T.small, fontSize: 11, lineHeight: 1.6, margin: "5px 0 8px" }}>{c.como}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setNotas((at) => ({ ...at, [c.chave]: n as Nota5 }))}
                  style={{ padding: "9px 2px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800, color: notas[c.chave] === n ? "#0b1426" : "#9aa8bc", background: notas[c.chave] === n ? "#f7bd00" : "#0b1529", border: `1px solid ${notas[c.chave] === n ? "#f7bd00" : "#31415a"}` }}>
                  {n}
                </button>
              ))}
            </div>
            {notas[c.chave] !== undefined && (
              <div style={{ ...T.small, fontSize: 10.5, marginTop: 6, color: "#f7bd00" }}>
                {notas[c.chave]}/5 — {c.notas[notas[c.chave] as number]}
              </div>
            )}
          </div>
        ))}
      </section>

      {feitos === total && (
        <section style={{ ...T.card, borderColor: "#f7bd0055", background: "#f7bd000d" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📊 Resultado da avaliação{vistaAnilha ? ` — ${vistaAnilha}` : ""}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
            <div style={{ padding: 12, borderRadius: 10, background: "#ffffff08", textAlign: "center" }}>
              <div style={{ ...T.small, fontSize: 10 }}>OLHO GERAL</div>
              <b style={{ fontSize: 26, color: pct >= 70 ? "#39e58c" : pct >= 45 ? "#fbbf24" : "#ff5d62" }}>{pct}%</b>
              <div style={{ color: "#f7bd00", fontSize: 15 }}>{estrelas(pct)}</div>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: "#ffffff08", textAlign: "center" }}>
              <div style={{ ...T.small, fontSize: 10 }}>APTIDÃO A CORRIDA</div>
              <b style={{ fontSize: 26, color: notaCorrida >= 60 ? "#39e58c" : "#fbbf24" }}>{notaCorrida}%</b>
              <div style={{ color: "#fbbf24", fontSize: 15 }}>{estrelas(notaCorrida)}</div>
              <div style={{ ...T.small, fontSize: 9 }}>peso: adaptação + correlação</div>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: "#ffffff08", textAlign: "center" }}>
              <div style={{ ...T.small, fontSize: 10 }}>APTIDÃO A MATRIZ</div>
              <b style={{ fontSize: 26, color: notaReproducao >= 60 ? "#39e58c" : "#fbbf24" }}>{notaReproducao}%</b>
              <div style={{ color: "#a78bfa", fontSize: 15 }}>{estrelas(notaReproducao)}</div>
              <div style={{ ...T.small, fontSize: 9 }}>peso: perímetro + pupila</div>
            </div>
          </div>
          <div style={{ ...T.small, fontSize: 10.5, marginTop: 10, lineHeight: 1.6 }}>
            {pct >= 70 ? "🌟 Olho de elite pela tradição eye-sign — se corpo e resultados acompanharem, pode valer ouro." : pct >= 45 ? "👍 Olho acima da média — observe o pombo nos cestos antes de definir o papel." : "⚠️ Olho modesto pelos critérios tradicionais — lembre: eye-sign é UM filtro, nunca o veredito (há campeões com olho discreto)."}
          </div>
        </section>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   🎨 TIPOS DE OLHOS — galeria com ilustrações originais SVG
   ══════════════════════════════════════════════════════════════ */

function OlhoSVG({ corIris, corAdapt, escuro = false, granulado = true }: { corIris: string; corAdapt: string; escuro?: boolean; granulado?: boolean }) {
  const granulos = Array.from({ length: 40 }, (_, i) => i * 9);
  return (
    <svg viewBox="0 0 120 120" style={{ width: 92, height: 92 }}>
      <circle cx="60" cy="60" r="58" fill="#0b1426" stroke="#31415a" strokeWidth="2" />
      <circle cx="60" cy="60" r="52" fill="#2f2620" stroke="#1a140e" strokeWidth="2" />
      {granulado && granulos.map((a) => (
        <line key={a} x1="60" y1="22" x2="60" y2="8" stroke={corIris} strokeWidth="3" strokeLinecap="round" opacity="0.75" transform={`rotate(${a} 60 60)`} />
      ))}
      <circle cx="60" cy="60" r="30" fill={corIris} opacity={granulado ? 0.95 : 1} />
      <circle cx="60" cy="60" r="20" fill={corAdapt} stroke="#0a0a0a" strokeWidth="1.5" strokeDasharray="3 2.2" />
      <circle cx="60" cy="60" r={escuro ? 14 : 10} fill="#050505" />
    </svg>
  );
}

type TipoOlho = { id: string; nome: string; svg: React.ReactNode; aparencia: string; tradicao: string; acasalamento: string; raridade: string };

const TIPOS: TipoOlho[] = [
  { id: "amarelo", nome: "🟡 Amarelo / Ouro", svg: <OlhoSVG corIris="#d4a017" corAdapt="#8a5a2b" />,
    aparencia: "Íris em tons de amarelo/dourado, do palha ao ouro profundo — o mais comum nos plantéis.",
    tradicao: "O 'cavalo de batalha': versátil para velocidade e fundo. Escolas europeias valorizam o amarelo QUEIMADO para fundo e matrizes.",
    acasalamento: "Pela regra clássica de Barkel: acasale com PÉROLA (evite amarelo × amarelo — 'lentos e teimosos').", raridade: "Comum" },
  { id: "perola", nome: "⚪ Pérola / Branco", svg: <OlhoSVG corIris="#cfd8e3" corAdapt="#9aa8bc" />,
    aparencia: "Íris branca/prateada, cintilante — sem pigmento amarelo.",
    tradicao: "Ligada à VELOCIDADE e vitalidade pelas escolas clássicas. Para o fundo duro, a tradição pede mais estrutura nos círculos internos.",
    acasalamento: "Cruze com AMARELO pela regra clássica (pérola × pérola sacrificaria o homing, diz a tradição).", raridade: "Comum" },
  { id: "laranja", nome: "🟠 Laranja Queimado", svg: <OlhoSVG corIris="#c2570f" corAdapt="#7a3d10" />,
    aparencia: "Amarelo levado ao extremo: laranja intenso/vermelho-terra.",
    tradicao: "Para várias escolas europeias (especialmente alemãs), é o olho do FUNDO e da reprodução — sinal de 'sangue quente' e resistência.",
    acasalamento: "Combina com pérola pela regra das cores opostas; com amarelo comum, reforça o lado resistência.", raridade: "Razoável" },
  { id: "violeta", nome: "🟣 Violeta", svg: <OlhoSVG corIris="#8f6bb8" corAdapt="#5d4478" />,
    aparencia: "Tom acinzentado-arroxeado sutil (não confundir com pérola 'suja') — muda conforme a luz.",
    tradicao: "O mais romantizado: escolas europeias o chamam de 'olho de matriz' — ligado a reprodutores excepcionais. Na prática é raro de verdade.",
    acasalamento: "A tradição o reserva ao plantel de reprodução; produza com pérola ou laranja.", raridade: "Raro" },
  { id: "preto", nome: "⚫ Olho de Boi (bull)", svg: <OlhoSVG corIris="#1b283c" corAdapt="#141d2e" escuro granulado={false} />,
    aparencia: "Totalmente escuro — sem círculos visíveis a olho nu.",
    tradicao: "A teoria clássica diz que 'não há eye-sign para ler' — mas Barkel corrigiu: têm pupila reativa como qualquer outro, e ele os usou com sucesso (Rapido Whites).",
    acasalamento: "Sem regra de cor aplicável — decida por linhagem, corpo e resultados.", raridade: "Ocasional (comum em brancos)" },
];

export function TiposOlhos() {
  return (
    <>
      <section style={{ ...T.card, borderColor: "#f7bd0055", background: "#f7bd000d" }}>
        <b style={{ color: T.gold, fontSize: 13 }}>🎨 Os 5 tipos clássicos de olho</b>
        <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.6, marginTop: 6 }}>
          Ilustrações originais do app (esquemáticas). Na vida real existem tons mistos — classifique pelo tom DOMINANTE visto em luz natural.
        </div>
      </section>
      {TIPOS.map((t) => (
        <section key={t.id} style={{ ...T.card, display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            {t.svg}
            <div style={{ fontSize: 9, color: "#64748b", marginTop: 4 }}>{t.raridade}</div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <b style={{ fontSize: 14 }}>{t.nome}</b>
            <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.65, marginTop: 6 }}>
              <b>Aparência:</b> {t.aparencia}
            </div>
            <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.65, marginTop: 5 }}>
              <b>O que diz a tradição:</b> {t.tradicao}
            </div>
            <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.65, marginTop: 5, color: "#f7bd00" }}>
              💘 <b>Acasalamento:</b> {t.acasalamento}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   ⚡ SINAIS — corrida × reprodução e velocidade × fundo
   ══════════════════════════════════════════════════════════════ */

export function SinaisEyeSign() {
  return (
    <>
      <section style={T.card}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>⚡ O Sinal de Corrida (racing sign)</div>
        <div style={{ ...T.small, fontSize: 12, lineHeight: 1.8 }}>
          É um <b>acúmulo de pigmento escuro</b> sobreposto ao círculo de adaptação — como uma "mancha de tinta" grudada na borda da pupila. As escolas clássicas leem assim:<br />
          • <b>Presente e denso</b> = pombo competitivo, "quer vencer" — apto ao cesto<br />
          • <b>Ausente</b> = não desclassifica: muitos ases só mostram o sinal no auge da forma, e voadores de fundo o têm mais difuso<br />
          • <b>Regra de ouro de Barkel ao acasalar:</b> a SOMA dos sinais de corrida do casal não deve passar de 100% — dois "sinais máximos" gerariam filhos apressados e superficiais, segundo a tradição
        </div>
      </section>
      <section style={T.card}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>❤️ O Sinal de Reprodução (breeding sign)</div>
        <div style={{ ...T.small, fontSize: 12, lineHeight: 1.8 }}>
          As escolas divergem na forma, convergem no fundo — é a marca do pombo que <b>transmite</b>:<br />
          • Para Barkel: o <b>perímetro completo e uniforme</b> (igualando cor e largura da adaptação)<br />
          • Para a escola europeia: a <b>"linha interna de reprodução"</b> — estrias/raios finos na borda interna da íris, como raios de sol<br />
          • Ambas concordam: <b>pouquíssimos pombos têm olho de matriz</b> — quando aparece, guarde o pombo mesmo sem vitórias: os filhos podem pagar a conta
        </div>
      </section>
      <section style={T.card}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🏁 Olho de velocidade × olho de fundo</div>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ padding: 12, borderRadius: 10, background: "#ffffff08", lineHeight: 1.7, fontSize: 12 }}>
            <b style={{ color: "#eab308" }}>⚡ Velocidade (até ~300km):</b> círculos internos LARGOS e abertos — adaptação larga, correlação visível ampla, íris rica mas "aberta". A teoria: processa luz rápido para navegar em bando e voltar voando.
          </div>
          <div style={{ padding: 12, borderRadius: 10, background: "#ffffff08", lineHeight: 1.7, fontSize: 12 }}>
            <b style={{ color: "#f97316" }}>🦅 Fundo (600km+):</b> tudo COMPACTO e fechado — pupila pequena, adaptação colada, correlação estreita, íris densa. A teoria: navegação independente, sozinho por 10+ horas de voo.
          </div>
          <div style={{ padding: 12, borderRadius: 10, background: "#ffffff08", lineHeight: 1.7, fontSize: 12 }}>
            <b style={{ color: "#3b82f6" }}>🏃 Meio fundo:</b> o equilíbrio dos dois — por isso é a categoria mais tolerante em olhos ("todo olho decente serve", diz a tradição).
          </div>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   🇬🇧 ESCOLA INGLESA — o eye-sign segundo S.W.E. Bishop (V2 didática)
   Aula em 3 passos: os círculos (fórmula), as FORMAS do anel desenhadas
   uma a uma, e o esquema VOADOR × REPRODUTOR clicável.
   ══════════════════════════════════════════════════════════════ */

const ANEIS_EN: { chave: string; cor: string }[] = [
  { chave: "pupila", cor: "#f8fafc" },
  { chave: "adaptacao", cor: "#eab308" },
  { chave: "correlacao", cor: "#55a3ff" },
  { chave: "iris", cor: "#f97316" },
  { chave: "condicao", cor: "#39e58c" },
];

const PASSOS_EN: { chave: string; titulo: string; oQueEO: string; oQueVer: string }[] = [
  { chave: "pupila", titulo: "1. A pupila", oQueEO: "A janela central do olho — igual em todas as escolas.", oQueVer: "Pequena e REATIVA: cubra a luz com a mão e solte — no candidato a pombo de fundo inglês, ela contrai e expande rápido. Grande e preguiçosa pede passagem." },
  { chave: "adaptacao", titulo: "2. O círculo de adaptação", oQueEO: "O anel grudado na pupila — o mesmo 内线口 chinês.", oQueVer: "Borda definida e SERRILHADA — o famoso 'sinal de corrida' (repare nos dentes no desenho quando este passo acende). Pra Bishop, sem adaptação visível falta motor ao atleta." },
  { chave: "correlacao", titulo: "3. O círculo de correlação", oQueEO: "A faixa entre a adaptação e a íris — o 眼志 chinês, o coração da leitura.", oQueVer: "COMPLETE em toda a volta = aptidão ao fundo e ao reproduzir. Larga e vazada = pombo de provas curtas. É o anel que decide voador × reprodutor (Passo 3!)." },
  { chave: "iris", titulo: "4. A profundidade da íris", oQueEO: "A 'carne' colorida — os ingleses chamam de DEPTH OF COLOUR, profundidade de cor.", oQueVer: "Cor profunda, granulada, com 'montanhas e vales' em relevo — sinal de sangue rico. Íris rasa, esticada ou plana como pintura = pombo comum." },
  { chave: "condicao", titulo: "5. O anel da condição", oQueEO: "O anel externo junto à pálpebra — o 'termômetro' do momento.", oQueVer: "Completo, uniforme e brilhante = pombo EM FORMA, pronto pra prova. Pálido ou interrompido = manejo por cima, não encesta." },
];

type FormaEN = { en: string; nome: string; veredito: string; cor: string; desenho: "full" | "broad" | "narrow" | "broken" | "white" | "green" | "violet" | "racing" };

const FORMAS_EN: FormaEN[] = [
  { en: "Yellow circle", nome: "Anel AMARELO completo", veredito: "O clássico 'breeder eye' inglês: correlação amarela, fechada em 360° — o reprodutor de livro.", cor: "#eab308", desenho: "full" },
  { en: "Broad circle", nome: "Anel LARGO", veredito: "Correlação larga e completa: força de fundo — o maratonista que também serve de matriz.", cor: "#3b82f6", desenho: "broad" },
  { en: "Racing sign", nome: "SINAL DE CORRIDA", veredito: "O segmento escuro serrilhado sobre a adaptação: A MARCA do velocista. Regra de Barkel: a soma dos sinais do casal não deve passar de 100%!", cor: "#f97316", desenho: "racing" },
  { en: "White/grey circle", nome: "Anel BRANCO/CINZA", veredito: "Anel claro como névoa: leitura de VOADOR puro — velocidade antes de reprodução.", cor: "#cbd5e1", desenho: "white" },
  { en: "Green circle", nome: "Anel VERDE", veredito: "O anel esverdeado: raridade inglesa associada aos grandes reprodutores de fundo.", cor: "#22c55e", desenho: "green" },
  { en: "Narrow circle", nome: "Anel ESTREITO", veredito: "Correlação fina: velocidade pura, provas curtas — fundo não é pra ele.", cor: "#60a5fa", desenho: "narrow" },
  { en: "Broken circle", nome: "Anel QUEBRADO", veredito: "Anel interrompido, em pedaços: 'serve pra voar, não pra criar' — a MESMA regra dos chineses, do outro lado do mundo!", cor: "#94a3b8", desenho: "broken" },
  { en: "Violet circle", nome: "Anel VIOLETA", veredito: "A joia raríssima: reprodutor excepcional — a lenda se repete na Inglaterra, na Bélgica e na China.", cor: "#a78bfa", desenho: "violet" },
];

/** esquema de uma forma do anel inglês (desenho de livro) */
function EsquemaEN({ f, ativo, onClick }: { f: FormaEN; ativo: boolean; onClick: () => void }) {
  let anel: React.ReactNode;
  if (f.desenho === "full") anel = <circle cx="50" cy="50" r="33" fill="none" stroke={f.cor} strokeWidth="7" />;
  else if (f.desenho === "broad") anel = <circle cx="50" cy="50" r="33" fill="none" stroke={f.cor} strokeWidth="12" />;
  else if (f.desenho === "narrow") anel = <circle cx="50" cy="50" r="33" fill="none" stroke={f.cor} strokeWidth="3.5" />;
  else if (f.desenho === "white") anel = <circle cx="50" cy="50" r="33" fill="none" stroke={f.cor} strokeWidth="7" opacity="0.9" />;
  else if (f.desenho === "green") anel = <circle cx="50" cy="50" r="33" fill="none" stroke={f.cor} strokeWidth="7" />;
  else if (f.desenho === "broken") anel = (
    <g>
      <path d="M 50 17 A 33 33 0 0 1 68 26" fill="none" stroke={f.cor} strokeWidth="7" strokeLinecap="round" />
      <path d="M 79 45 A 33 33 0 0 1 72 66" fill="none" stroke={f.cor} strokeWidth="7" strokeLinecap="round" />
      <path d="M 28 76 A 33 33 0 0 1 18 55" fill="none" stroke={f.cor} strokeWidth="7" strokeLinecap="round" />
    </g>
  );
  else if (f.desenho === "violet") anel = <circle cx="50" cy="50" r="33" fill="none" stroke={f.cor} strokeWidth="8" strokeDasharray="6 3" />;
  else if (f.desenho === "racing") anel = (
    <g>
      <circle cx="50" cy="50" r="33" fill="none" stroke="#64748b" strokeWidth="4" opacity="0.5" />
      <path d="M 24 65 A 33 33 0 0 0 76 65" fill="none" stroke="#1b283c" strokeWidth="11" strokeLinecap="round" />
      {Array.from({ length: 7 }).map((_, i) => {
        const a = Math.PI - (i / 6) * Math.PI;
        const x1 = 50 + Math.cos(a) * 27, y1 = 50 + Math.sin(a) * 27;
        const x2 = 50 + Math.cos(a) * 42, y2 = 50 + Math.sin(a) * 42;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f97316" strokeWidth="2.6" />;
      })}
    </g>
  );
  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", maxWidth: 96, display: "block", margin: "0 auto", cursor: "pointer" }} onClick={onClick} role="img" aria-label={"Forma " + f.nome}>
      <circle cx="50" cy="50" r="46" fill="#1b283c" stroke="#31415a" strokeWidth="2" />
      <circle cx="50" cy="50" r="42" fill="#8a6a30" opacity="0.45" />
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2 + 0.2;
        const r = 39 + (i % 3) * 3;
        return <circle key={i} cx={50 + Math.cos(a) * r} cy={50 + Math.sin(a) * r} r={2.6} fill="#c2410c" opacity="0.7" />;
      })}
      {anel}
      <ellipse cx="50" cy="50" rx="10" ry="15" fill="#14161a" />
      <circle cx="47" cy="45" r="2.2" fill="#f8fafc" opacity="0.8" />
      {ativo && <circle cx="50" cy="50" r="46" fill="none" stroke={f.cor} strokeWidth="2.5" opacity="0.8" />}
    </svg>
  );
}

/** esquema grande do VOADOR ou do REPRODUTOR com legendas */
function EsquemaPerfil({ tipo }: { tipo: "voador" | "reprodutor" }) {
  const voador = tipo === "voador";
  const cor = voador ? "#f97316" : "#55a3ff";
  return (
    <svg viewBox="0 0 200 200" style={{ width: "100%", maxWidth: 210, display: "block", margin: "0 auto" }} role="img" aria-label={voador ? "Esquema do olho do voador" : "Esquema do olho do reprodutor"}>
      <circle cx="100" cy="92" r="66" fill="#0f1a2e" stroke="#31415a" strokeWidth="3" />
      <circle cx="100" cy="92" r="61" fill="#8a6a30" opacity="0.4" />
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * Math.PI * 2;
        const r = 50 + (i % 3) * 5;
        return <circle key={i} cx={100 + Math.cos(a) * r} cy={92 + Math.sin(a) * r * 0.94} r={3.4} fill="#c2410c" opacity="0.75" />;
      })}
      {/* correlação: completa (reprodutor) vs parcial tracejada (voador) */}
      {voador ? (
        <path d="M 100 52 A 40 40 0 0 1 133 105" fill="none" stroke="#55a3ff" strokeWidth="6" strokeDasharray="7 5" opacity="0.8" />
      ) : (
        <circle cx="100" cy="92" r="40" fill="none" stroke="#55a3ff" strokeWidth="8" />
      )}
      {/* adaptação */}
      <circle cx="100" cy="92" r="27" fill="none" stroke="#eab308" strokeWidth="4.5" />
      {/* sinal de corrida (só no voador): arco escuro serrilhado */}
      {voador && (
        <g>
          <path d="M 76 106 A 27 27 0 0 0 124 106" fill="none" stroke="#1b283c" strokeWidth="9" strokeLinecap="round" />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = Math.PI - (i / 5) * Math.PI;
            const x1 = 100 + Math.cos(a) * 22, y1 = 92 + Math.sin(a) * 22;
            const x2 = 100 + Math.cos(a) * 35, y2 = 92 + Math.sin(a) * 35;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f97316" strokeWidth="2.6" />;
          })}
        </g>
      )}
      <ellipse cx="100" cy="92" rx="11" ry="16" fill="#14161a" />
      <circle cx="96" cy="86" r="2.6" fill="#f8fafc" opacity="0.85" />
      {/* legendas com setas */}
      <line x1="100" y1="26" x2="100" y2="48" stroke={cor} strokeWidth="1.6" strokeDasharray="3 2" />
      <text x="100" y="18" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={cor}>{voador ? "correlação PARCIAL" : "CORRELAÇÃO COMPLETA 360°"}</text>
      {voador && (
        <>
          <line x1="160" y1="120" x2="132" y2="108" stroke="#f97316" strokeWidth="1.6" strokeDasharray="3 2" />
          <text x="168" y="124" fontSize="9.5" fontWeight="800" fill="#f97316" textAnchor="end">sinal de corrida</text>
          <text x="168" y="135" fontSize="8.5" fill="#9aa8bc" textAnchor="end">(serrilhado, em relevo)</text>
        </>
      )}
      {!voador && (
        <>
          <line x1="160" y1="128" x2="136" y2="112" stroke="#55a3ff" strokeWidth="1.6" strokeDasharray="3 2" />
          <text x="170" y="132" fontSize="9.5" fontWeight="800" fill="#55a3ff" textAnchor="end">o anel do criador</text>
          <text x="170" y="143" fontSize="8.5" fill="#9aa8bc" textAnchor="end">(escuro, largo, sem frestas)</text>
        </>
      )}
      <text x="100" y="188" textAnchor="middle" fontSize="10.5" fontWeight="900" fill={cor}>{voador ? "⚡ RACER — o atleta" : "🏆 BREEDER — a matriz"}</text>
    </svg>
  );
}

const GLOSSARIO_EN: [string, string][] = [
  ["Eye-sign", "sinal do olho"],
  ["Racer eye", "olho de voador"],
  ["Breeder eye", "olho de reprodutor"],
  ["Circle of adaptation", "círculo de adaptação"],
  ["Circle of correlation", "círculo de correlação"],
  ["Depth of colour", "profundidade de cor da íris"],
  ["Racing sign", "sinal de corrida (serrilhado)"],
  ["Condition", "condição (forma física)"],
  ["Violet eye", "olho violeta"],
  ["Pearl eye", "olho pérola"],
  ["Bull eye", "olho preto (de boi)"],
  ["Long distance", "fundo / longa distância"],
  ["Mating by eye-sign", "acasalamento pelo olho"],
  ["Formula of Recognition", "Fórmula de Reconhecimento"],
];

export function EscolaInglesa() {
  const [passo, setPasso] = useState(0);
  const [forma, setForma] = useState(0);
  const [zoom, setZoom] = useState<string | null>(null);
  const p = PASSOS_EN[passo];
  const f = FORMAS_EN[forma];
  const corDoPasso = ANEIS_EN.find((a) => a.chave === p.chave)!.cor;

  const CartaoOlho = ({ src, titulo, cor, itens }: { src: string; titulo: string; cor: string; itens: string[] }) => (
    <div style={{ flex: 1, minWidth: 240, padding: 12, borderRadius: 12, background: "#ffffff08", border: "1px solid " + cor + "44" }}>
      <div style={{ fontSize: 13.5, fontWeight: 800, color: cor, marginBottom: 8 }}>{titulo}</div>
      <img src={src} alt={titulo} onClick={() => setZoom(src)} style={{ width: "100%", borderRadius: 12, cursor: "zoom-in", border: "1.5px solid " + cor + "55", display: "block" }} />
      <div style={{ display: "grid", gap: 5, marginTop: 9 }}>
        {itens.map((t, i) => (
          <div key={i} style={{ ...T.small, fontSize: 11.5, lineHeight: 1.6 }}>• {t}</div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* INTRODUÇÃO — anuncia os passos */}
      <section style={T.card}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🇬🇧 A Escola Inglesa — o olho segundo S.W.E. Bishop</div>
        <div style={{ ...T.small, fontSize: 12, lineHeight: 1.85, color: T.dim }}>
          <b style={{ color: T.white }}>S.W.E. Bishop</b>, colunista da <i>Pigeon Racing News and Gazette</i>, publicou nos anos 1950-60 o clássico raro <b style={{ color: T.white }}>"The Secret of Eye-Sign"</b>. Enquanto Barkel e Hofmann ensinavam a <b>combinar olhos</b> no acasalamento, Bishop ensinava a <b>LER o olho pra achar o pombo de FUNDO</b>. A aula vem em 3 passos: <b style={{ color: T.white }}>1. os 5 círculos</b> (a Fórmula de Reconhecimento, toque no desenho), <b style={{ color: T.white }}>2. as 8 formas do anel</b> (cada uma desenhada), <b style={{ color: T.white }}>3. voador × reprodutor</b> (esquemas com legenda). E logo abaixo, o capítulo 2 do livro: o 🔬 mecanismo maravilhoso (anatomia) e o ✈️ olho em voo.
        </div>
      </section>

      {/* PASSO 1 — FÓRMULA DE RECONHECIMENTO */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 4 }}>🧭 Passo 1 — A Fórmula de Reconhecimento (toque nos números!)</div>
        <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 10, lineHeight: 1.5 }}>
          O roteiro de Bishop, círculo por círculo, de dentro pra fora. Cada passo acende a peça certa no desenho.
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <svg viewBox="0 0 220 220" style={{ width: 250, height: "auto", flexShrink: 0 }} role="img" aria-label="Os cinco círculos do olho com passo destacado">
            <circle cx="110" cy="110" r="102" fill="#0f1a2e" stroke="#31415a" strokeWidth="3" />
            {/* 5. anel da condição */}
            <circle cx="110" cy="110" r="97" fill="none" stroke={p.chave === "condicao" ? "#39e58c" : "#39e58c66"} strokeWidth={p.chave === "condicao" ? 7 : 4} />
            {/* 4. íris com granulação */}
            <circle cx="110" cy="110" r="90" fill="#8a6a30" opacity={p.chave === "iris" ? 0.75 : 0.4} />
            {Array.from({ length: 26 }).map((_, i) => {
              const a = (i / 26) * Math.PI * 2;
              const r = 68 + (i % 4) * 5;
              return <circle key={i} cx={110 + Math.cos(a) * r} cy={110 + Math.sin(a) * r} r={4 + (i % 3)} fill="#c2410c" opacity={p.chave === "iris" ? 1 : 0.7} stroke={p.chave === "iris" ? "#ffd9a8" : "none"} strokeWidth={p.chave === "iris" ? 1.2 : 0} />;
            })}
            {/* 3. correlação */}
            <circle cx="110" cy="110" r="62" fill="none" stroke={p.chave === "correlacao" ? "#55a3ff" : "#3d5a80"} strokeWidth={p.chave === "correlacao" ? 10 : 6} opacity={p.chave === "correlacao" ? 1 : 0.7} />
            {/* 2. adaptação + serrilhado */}
            <circle cx="110" cy="110" r="46" fill="none" stroke={p.chave === "adaptacao" ? "#eab308" : "#8a6a1e"} strokeWidth={p.chave === "adaptacao" ? 8 : 5} />
            {Array.from({ length: 18 }).map((_, i) => {
              const a = (i / 18) * Math.PI * 2;
              const x1 = 110 + Math.cos(a) * 42, y1 = 110 + Math.sin(a) * 42;
              const x2 = 110 + Math.cos(a) * 52, y2 = 110 + Math.sin(a) * 52;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={p.chave === "adaptacao" ? "#ffd76a" : "#8a6a1e"} strokeWidth="2" />;
            })}
            {/* sinal de corrida (aparece no passo 2) */}
            {p.chave === "adaptacao" && (
              <path d="M 80 132 A 46 46 0 0 0 140 132" fill="none" stroke="#1b283c" strokeWidth="13" strokeLinecap="round" />
            )}
            {/* 1. pupila */}
            <ellipse cx="110" cy="110" rx="20" ry="26" fill={p.chave === "pupila" ? "#f8fafc" : "#14161a"} stroke={p.chave === "pupila" ? "#f8fafc" : "none"} strokeWidth="2.5" />
            {p.chave === "pupila" && <text x="110" y="116" textAnchor="middle" fontSize="16" fontWeight="900" fill="#14161a">1</text>}
            {/* marcadores */}
            {([[1, "pupila", 110, 74], [2, "adaptacao", 78, 152], [3, "correlacao", 110, 178], [4, "iris", 34, 52], [5, "condicao", 110, 10]] as [number, string, number, number][]).map(([n, chave, x, y]) => {
              const on = p.chave === chave;
              return (
                <g key={n} onClick={() => setPasso(n - 1)} style={{ cursor: "pointer" }}>
                  <circle cx={x} cy={y} r="11" fill={on ? "#f7bd00" : "#1b283c"} stroke={on ? "#f7bd00" : "#64748b"} strokeWidth="2" />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="900" fill={on ? "#0b1426" : "#e2e8f0"}>{n}</text>
                </g>
              );
            })}
          </svg>
          <div style={{ flex: 1, minWidth: 230 }}>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {PASSOS_EN.map((x, i) => (
                <button key={x.chave} type="button" onClick={() => setPasso(i)} style={{ padding: "6px 10px", borderRadius: 999, cursor: "pointer", fontSize: 11, fontWeight: 800, border: "1.5px solid " + (passo === i ? ANEIS_EN.find((a) => a.chave === x.chave)!.cor : T.border), background: passo === i ? ANEIS_EN.find((a) => a.chave === x.chave)!.cor + "22" : T.bgInput, color: passo === i ? ANEIS_EN.find((a) => a.chave === x.chave)!.cor : T.dim }}>
                  {i + 1}. {x.titulo.split(". ")[1].split(" (")[0]}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 900, color: corDoPasso }}>{p.titulo}</div>
            <div style={{ ...T.small, fontSize: 12, lineHeight: 1.75, marginTop: 6 }}>{p.oQueEO}</div>
            <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.75, marginTop: 8, padding: "9px 11px", borderRadius: 10, background: "#ffffff08", border: "1px solid " + corDoPasso + "33" }}>
              👁️ <b style={{ color: T.white }}>O que procurar:</b> {p.oQueVer}
            </div>
          </div>
        </div>
      </section>

      {/* PASSO 2 — AS 8 FORMAS DO ANEL */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 4 }}>⭕ Passo 2 — As 8 formas do anel (cada uma desenhada)</div>
        <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 10, lineHeight: 1.5 }}>
          A classificação inglesa do círculo de correlação por COR, LARGURA e COMPLETUDE — é ela que separa o voador do reprodutor. Toque nos desenhos.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(128px, 1fr))", gap: 8 }}>
          {FORMAS_EN.map((x, i) => (
            <button key={x.en} type="button" onClick={() => setForma(i)} style={{ padding: 10, borderRadius: 12, cursor: "pointer", background: forma === i ? x.cor + "18" : "#ffffff08", border: "1.5px solid " + (forma === i ? x.cor : T.border), textAlign: "center" }}>
              <EsquemaEN f={x} ativo={forma === i} onClick={() => setForma(i)} />
              <div style={{ fontSize: 10.5, fontWeight: 800, color: T.dim2, marginTop: 6 }}>{x.en}</div>
              <div style={{ fontSize: 11, fontWeight: 900, color: forma === i ? x.cor : T.white, marginTop: 1 }}>{x.nome}</div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: 13, borderRadius: 12, background: "#ffffff08", border: "1px solid " + f.cor + "44" }}>
          <div style={{ fontSize: 13.5, fontWeight: 900, color: f.cor }}>{f.en} — {f.nome}</div>
          <div style={{ ...T.small, fontSize: 12, lineHeight: 1.75, marginTop: 5 }}>{f.veredito}</div>
        </div>
      </section>

      {/* PASSO 3 — VOADOR × REPRODUTOR */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>⚡×🏆 Passo 3 — Voador × Reprodutor (o esquema de cada um)</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, padding: 12, borderRadius: 12, background: "#ffffff08", border: "1px solid #f9731644" }}>
            <EsquemaPerfil tipo="voador" />
            <div style={{ ...T.small, fontSize: 11, lineHeight: 1.65, marginTop: 8, textAlign: "center", color: T.dim }}>
              Sinal de corrida serrilhado em relevo + correlação parcial: <b style={{ color: "#f97316" }}>o atleta das provas</b> — nem sempre transmite aos filhos.
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200, padding: 12, borderRadius: 12, background: "#ffffff08", border: "1px solid #55a3ff44" }}>
            <EsquemaPerfil tipo="reprodutor" />
            <div style={{ ...T.small, fontSize: 11, lineHeight: 1.65, marginTop: 8, textAlign: "center", color: T.dim }}>
              Correlação escura, larga e COMPLETA em 360°: <b style={{ color: "#55a3ff" }}>a matriz do criadouro</b> — a marca de quem gera campeões.
            </div>
          </div>
        </div>
        {/* as fotos reais ilustrando */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          <CartaoOlho
            src="/img/olho-voador.jpg" titulo="⚡ O Voador (racer eye)" cor="#f97316"
            itens={["Sinal de corrida forte: adaptação serrilhada em RELEVO", "Íris profunda e vibrante — o olho que 'quer voar'"]}
          />
          <CartaoOlho
            src="/img/olho-reprodutor.jpg" titulo="🏆 O Reprodutor (breeder eye)" cor="#55a3ff"
            itens={["Círculo de correlação ESCURO e COMPLETO em 360°", "O 'anel do criador' que Bishop e Cranstoun liam"]}
          />
        </div>
        {/* tabela comparativa */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", gap: 6, marginTop: 12, fontSize: 11 }}>
          {[["Sinal", "⚡ Voador", "🏆 Reprodutor"], ["Adaptação", "serrilhada agressiva, em relevo", "definida, mais discreta"], ["Correlação", "parcial ou estreita", "completa, 360°, escura"], ["Íris", "vibrante e profunda", "densa, rica, sem falhas"], ["Vocação", "ganhar a prova", "gerar campeões"], ["No app", "score ⚡ alto (aba Analisar)", "score 🏆 alto (aba Analisar)"]].map((linha, i) => (
            <div key={i} style={{ display: "contents" }}>
              {linha.map((cel, j) => (
                <div key={j} style={{ padding: "7px 9px", borderRadius: 8, background: i === 0 ? "#f7bd0022" : "#ffffff08", fontWeight: i === 0 ? 800 : 600, color: i === 0 ? T.gold : T.dim }}>{cel}</div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* GLOSSÁRIO */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📖 Glossário do eye-sign — inglês → português</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 6 }}>
          {GLOSSARIO_EN.map(([en, pt]) => (
            <div key={en} style={{ padding: "8px 11px", borderRadius: 9, background: "#ffffff08", fontSize: 11.5 }}>
              <b style={{ color: T.blue }}>{en}</b> <span style={{ color: T.dim }}>→ {pt}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HONESTIDADE */}
      <section style={{ ...T.card, marginTop: 14, ...T.small, fontSize: 11, lineHeight: 1.75, color: T.dim }}>
        ⚠️ <b>Honestidade de sempre:</b> eye-sign é tradição de criador, sem validação científica fechada — use como <b>mais uma</b> ferramenta, junto com pedigree, anatomia e resultados de voo. Resumo da tradição pública da escola inglesa (Bishop e Cranstoun) — não é tradução do livro, que é raro e protegido por direitos autorais.
      </section>

      {/* ZOOM */}
      {zoom && (
        <div onClick={() => setZoom(null)} style={{ position: "fixed", inset: 0, background: "rgba(4,10,20,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, cursor: "zoom-out", padding: 12 }}>
          <img src={zoom} alt="ilustração ampliada" style={{ width: "min(94vw, 900px)", borderRadius: 12 }} onClick={(e) => e.stopPropagation()} />
          <div style={{ position: "fixed", bottom: 18, color: "#9aa8bc", fontSize: 12 }}>toque fora da imagem para fechar ✕</div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   🔬 O MECANISMO MARAVILHOSO — anatomia do olho (capítulo 2 de Bishop)
   Corte esquemático interativo: toque nos números e descubra cada peça.
   + ✈️ O OLHO EM VOO — visão, foco e o "limpador de para-brisa" a 100km/h.
   ══════════════════════════════════════════════════════════════ */

const PARTES_OLHO_ANATOMIA: { n: number; x: number; y: number; nome: string; texto: string }[] = [
  { n: 1, x: 196, y: 135, nome: "1. Pupila — a janela", texto: "Não é um buraco parado: é a abertura que os músculos da íris abrem e fecham o tempo todo. Quando o criador cobre a luz com a mão e solta, está medindo a VELOCIDADE desses músculos — a famosa 'reação à luz' do eye-sign é anatomia pura funcionando." },
  { n: 2, x: 170, y: 98, nome: "2. Músculos RADIAIS da íris", texto: "Fibras dispostas como raios de roda: quando contraem, PUXAM a pupila pra fora e a DILATAM (olho abrindo no escuro). Estão escondidos sob a camada de vasos da íris." },
  { n: 3, x: 220, y: 106, nome: "3. Músculos CIRCULARES — as 'distance lines'", texto: "Fibras em volta, como cintas: contraem e ESTREITAM a pupila. Onde elas ficam mais próximas da superfície, aparecem na íris as linhas finas que os mestres chamavam de 'distance lines' — a leitura clássica da região da correlação é literalmente músculo visto através da íris!" },
  { n: 4, x: 185, y: 172, nome: "4. Cristalino — o foco instantâneo", texto: "A lente interna. Os músculos ciliares mudam a FORMA dele (não só a posição) — é por isso que o pombo refoca o relevo do terreno em pleno voo, numa fração de segundo." },
  { n: 5, x: 302, y: 192, nome: "5. Retina e fóvea — a câmera de alta resolução", texto: "A 'película' onde a imagem se forma. Na fóvea (a depressão central) está a concentração máxima de cones — o ponto de visão nítida que o pombo aponta pro horizonte e pro pombal." },
  { n: 6, x: 296, y: 138, nome: "6. Pecten — o pente (exclusivo das aves!)", texto: "Uma prega cheia de vasos que 'penteia' o interior do olho, nutrindo a retina e mantendo a oxigenação. Nenhum mamífero tem — é peça de ave de elite, e o pombo-correio tem um dos mais desenvolvidos." },
  { n: 7, x: 258, y: 48, nome: "7. Anel escleral — a armadura de OSSOS", texto: "Plaquinhas ósseas formando um anel rígido ao redor do olho. É por isso que o globo ocular NÃO deforma com a pressão do ar em alta velocidade — a lente fica sempre na distância certa. Aeroespacial de fábrica!" },
  { n: 8, x: 252, y: 78, nome: "8. A rede de vasos — o RADIADOR do cérebro", texto: "O pombo não transpira: o sangue quente do corpo passa pela malha de vasos ao redor do olho, esfria no contato com o ar... e só então segue pro cérebro. O olho é literalmente o radiador que protege o 'computador de bordo'. Íris cheia de circulação visível = sistema de refrigeração forte." },
  { n: 9, x: 140, y: 96, nome: "9. Membrana nictitante — o limpador de para-brisa", texto: "A terceira pálpebra: uma película translúcida que varre o olho de lado a lado, umedecendo e limpando poeira e insetos EM PLENO VOO — sem precisar fechar o olho nem por um segundo." },
];

const VOO_CARDS: { emoji: string; titulo: string; texto: string }[] = [
  { emoji: "🧭", titulo: "~340° de campo de visão", texto: "Olhos laterais: cada olho cobre quase um semicírculo — o pombo enxerga praticamente tudo em volta, com um cone binocular à frente (a 'mira' de chegada pro pombal)." },
  { emoji: "💨", titulo: "A 100 km/h de vento na cara", texto: "Anel de ossos firmes + pálpebras + membrana nictitante: o olho aguenta o jato de ar sem ressecar e sem deformar a imagem." },
  { emoji: "🎯", titulo: "Foco mais rápido que o piscar", texto: "Cristalino com mudança de FORMA pelos músculos ciliares: refoca o relevo, o cesto e o telhado do pombal em frações de segundo." },
  { emoji: "🧲", titulo: "Bússola solar no fundo do olho", texto: "A retina enxerga padrões de luz polarizada do céu — um dos pilares da navegação lendária de volta pra casa por território nunca visto." },
  { emoji: "🌈", titulo: "Enxerga além de nós", texto: "Cones com gotinhas de óleo filtram a luz — o pombo enxerga ultravioleta e um mundo de cores que o olho humano não alcança." },
];

export function AnatomiaOlho() {
  const [sel, setSel] = useState(1);
  const parte = PARTES_OLHO_ANATOMIA.find((p) => p.n === sel)!;

  return (
    <>
      {/* ANATOMIA INTERATIVA */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 4 }}>🔬 O Mecanismo Maravilhoso do Olho — anatomia interativa</div>
        <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 10, lineHeight: 1.5 }}>
          O capítulo 2 do livro de Bishop, em desenho: toque nos números do corte do olho (ou nos botões) e veja cada peça — e onde a tradição do eye-sign encosta na anatomia de verdade.
        </div>

        <div style={{ borderRadius: 12, background: "#0b1529", border: `1px solid ${T.border}`, padding: 4 }}>
          <svg viewBox="0 0 440 270" style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Corte esquemático do olho do pombo com 9 partes numeradas">
            {/* esclera (casca externa) */}
            <circle cx="240" cy="135" r="92" fill="#e9f0f8" stroke="#9db4cf" strokeWidth="6" />
            {/* coroide e retina (revestimento interno) */}
            <circle cx="240" cy="135" r="84" fill="none" stroke="#e58f6f" strokeWidth="3" />
            <circle cx="240" cy="135" r="79" fill="none" stroke="#f2b98a" strokeWidth="5" />
            {/* humor vítreo */}
            <circle cx="240" cy="135" r="78" fill="#f4f8fd" opacity="0.6" />
            {/* córnea (cúpula frontal) */}
            <path d="M 186 76 A 74 74 0 0 0 186 194 L 196 185 A 60 60 0 0 1 196 85 Z" fill="#cfe5f7" stroke="#7fa3c4" strokeWidth="3" />
            {/* íris (dois setores com fibras) */}
            <path d="M 186 76 Q 178 105 197 108 L 204 118 Q 176 118 172 78 Z" fill="#e8b25c" stroke="#b98634" strokeWidth="2" />
            <path d="M 186 194 Q 178 165 197 162 L 204 152 Q 176 152 172 192 Z" fill="#e8b25c" stroke="#b98634" strokeWidth="2" />
            {/* fibras radiais da íris */}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={"r" + i} x1={196 + i * 2} y1={108 + i * 0.4} x2={178 - i * 0.5} y2={80 + i * 3} stroke="#a3742b" strokeWidth="1.2" />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={"r2" + i} x1={196 + i * 2} y1={162 - i * 0.4} x2={178 - i * 0.5} y2={190 - i * 3} stroke="#a3742b" strokeWidth="1.2" />
            ))}
            {/* músculos circulares (cintas ao redor da pupila — as 'distance lines') */}
            <circle cx="205" cy="135" r="26" fill="none" stroke="#8a5f1e" strokeWidth="4" strokeDasharray="7 3" />
            {/* cristalino */}
            <ellipse cx="205" cy="135" rx="17" ry="27" fill="#bcdcee" stroke="#6f97ba" strokeWidth="3" />
            {/* pupila */}
            <ellipse cx="207" cy="135" rx="7" ry="12" fill="#14161a" />
            {/* corpo ciliar (zigzag ligando íris à esclera) */}
            <path d="M 186 76 L 196 88 L 206 80 L 214 90" fill="none" stroke="#c99a4d" strokeWidth="3" />
            <path d="M 186 194 L 196 182 L 206 190 L 214 180" fill="none" stroke="#c99a4d" strokeWidth="3" />
            {/* pecten (o pente, roxo) */}
            <path d="M 322 118 L 290 125 L 297 133 L 287 139 L 296 147 L 290 154 L 322 152 Z" fill="#7c5cbf" stroke="#5c3f9e" strokeWidth="2" />
            {/* nervo óptico */}
            <path d="M 330 126 L 372 122 L 372 148 L 330 144 Z" fill="#f0dcc8" stroke="#c9a684" strokeWidth="2.5" />
            {/* anel escleral (plaquinhas ósseas no topo) */}
            <path d="M 200 58 A 92 92 0 0 1 320 80" fill="none" stroke="#cbd5e1" strokeWidth="10" strokeDasharray="11 4" />
            {/* rede de vasos (o radiador) */}
            <path d="M 328 152 Q 300 168 262 160 Q 240 155 228 140" fill="none" stroke="#e05252" strokeWidth="2.2" />
            <path d="M 262 160 Q 250 140 240 118 Q 234 104 218 92" fill="none" stroke="#e05252" strokeWidth="2.2" />
            <path d="M 240 118 Q 226 122 210 112" fill="none" stroke="#e05252" strokeWidth="1.8" />
            <path d="M 328 152 Q 296 176 258 172 Q 244 170 236 158" fill="none" stroke="#e05252" strokeWidth="1.8" />
            {/* membrana nictitante (varredura translúcida sobre a córnea) */}
            <path d="M 148 108 Q 166 132 150 158" fill="none" stroke="#8ff0c1" strokeWidth="4" opacity="0.85" />
            {/* marcadores numerados */}
            {PARTES_OLHO_ANATOMIA.map((p) => (
              <g key={p.n} onClick={() => setSel(p.n)} style={{ cursor: "pointer" }}>
                <circle cx={p.x} cy={p.y} r="11" fill={sel === p.n ? "#f7bd00" : "#1b283c"} stroke={sel === p.n ? "#f7bd00" : "#64748b"} strokeWidth="2" />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" fontWeight="900" fill={sel === p.n ? "#0b1426" : "#e2e8f0"}>{p.n}</text>
              </g>
            ))}
            <text x="12" y="262" fontSize="9.5" fill="#64748b">corte esquemático didático do olho do pombo-correio (frente à esquerda)</text>
          </svg>
        </div>

        {/* painel da parte selecionada */}
        <div style={{ marginTop: 12, padding: 13, borderRadius: 12, background: "#ffffff08", border: `1px solid ${T.gold}44` }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>{parte.nome}</div>
          <div style={{ ...T.small, fontSize: 12, lineHeight: 1.75, marginTop: 6 }}>{parte.texto}</div>
        </div>

        {/* botões alternativos */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
          {PARTES_OLHO_ANATOMIA.map((p) => (
            <button key={p.n} type="button" onClick={() => setSel(p.n)} style={{ width: 34, height: 34, borderRadius: 99, cursor: "pointer", fontSize: 12.5, fontWeight: 900, border: `1.5px solid ${sel === p.n ? T.gold : T.border}`, background: sel === p.n ? T.gold : T.bgInput, color: sel === p.n ? T.bg : T.dim }}>
              {p.n}
            </button>
          ))}
        </div>
      </section>

      {/* O OLHO EM VOO */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>✈️ O Olho em Voo — a máquina de voar e enxergar</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(215px, 1fr))", gap: 9 }}>
          {VOO_CARDS.map((c) => (
            <div key={c.titulo} style={{ padding: 12, borderRadius: 12, background: "#ffffff08", border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 22 }}>{c.emoji}</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, marginTop: 4 }}>{c.titulo}</div>
              <div style={{ ...T.small, fontSize: 11, lineHeight: 1.65, marginTop: 4, color: T.dim }}>{c.texto}</div>
            </div>
          ))}
        </div>
        <div style={{ ...T.small, fontSize: 11.5, marginTop: 12, lineHeight: 1.8, color: T.dim, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
          🧩 <b style={{ color: T.white }}>Onde o eye-sign encosta na ciência:</b> os mestres liam "energia", "circulação" e "reação do olho" sem microscópio — e a anatomia mostra que é exatamente disso que se trata: músculos da íris, malha de vasos (o radiador!) e nutrição da retina (o pecten). A tradição não provava nada em laboratório, mas descrevia uma máquina real. Continua sendo <b>mais uma ferramenta</b> — nunca um veredito.
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   🇨🇳 ESCOLA CHINESA — 眼志 (yǎn zhì), o eye-sign do Oriente
   FEITA PRA ENSINAR: olho em camadas clicável + as 8 formas do 眼志
   desenhadas uma a uma + tipos, Yin-Yang e as areias × clima.
   ══════════════════════════════════════════════════════════════ */

/* ---------- CAMADA 1: o olho em CAMADAS (a leitura chinesa) ---------- */
const CAMADAS_CN: { n: number; nome: string; cn: string; py: string; oQueEO: string; oQueVer: string }[] = [
  {
    n: 1, nome: "Pupila", cn: "瞳孔", py: "tóng kǒng",
    oQueEO: "A janela central do olho — igual à nossa.",
    oQueVer: "Os mestres chineses observam o TREMOR: pupila que gira e vibra sem parar (活, 'viva') = pombo ligado no mundo, inteligente. Parada e morta = desatenção.",
  },
  {
    n: 2, nome: "Anel interno", cn: "内线口", py: "nèi xiàn kǒu",
    oQueEO: "Filete fininho grudado na pupila — é o nosso círculo de ADAPTAÇÃO.",
    oQueVer: "Deve ser fino, completo e bem preso à pupila, como uma cintura. Largo demais ou torto = defeito de 'fechamento' do olho.",
  },
  {
    n: 3, nome: "O círculo 眼志", cn: "眼志", py: "yǎn zhì",
    oQueEO: "A faixa entre a pupila e a areia — é O eye-sign, o mesmo círculo que o Ocidente chama de correlação.",
    oQueVer: "Aqui mora a classificação chinesa: a FORMA dele (completa? serrilhada? deitada?) decide se o pombo é 赛鸽 (voador) ou 种鸽 (reprodutor). Veja as 8 formas logo abaixo!",
  },
  {
    n: 4, nome: "Areia de superfície", cn: "面砂", py: "miàn shā",
    oQueEO: "A camada de CIMA da íris: as granulhões coloridos que a gente vê de fora (vermelhos, rosas).",
    oQueVer: "Deve ter relevo e 'flutuar' acima do fundo como que suspenso (os chineses dizem 立体感, 'efeito 3D'). Plana como pintura = olho comum. Granulha grossa onde importa, fina nas bordas.",
  },
  {
    n: 5, nome: "Areia de fundo", cn: "底砂", py: "dǐ shā",
    oQueEO: "A camada de BAIXO — o 'prato' por baixo da granulha. É ELA que dá o TIPO do olho: amarela = 黄眼, prateada = 桃花眼.",
    oQueVer: "Deve ser clara e brilhante: amarela como ouro polido (黄眼) ou branca como prata (桃花眼). Fundo escuro, sujo ou embaçado = planta fraqueza. É entre as granulhas que ela 'aparece' — olho bom deixa ver o fundo pelas frestas!",
  },
  {
    n: 6, nome: "Anel externo", cn: "外线口", py: "wài xiàn kǒu",
    oQueEO: "A borda final do olho, junto da pálpebra.",
    oQueVer: "Fina, seca e fechada — pálpebra colada (紧, 'firme'). Pálpebra frouxa, olho 'mole' = pombo sem vigor.",
  },
];

/* ---------- CAMADA 2: as 8 FORMAS do 眼志 ---------- */
type Forma = { cn: string; py: string; nome: string; veredito: string; cor: string; desenho: "full" | "wide" | "half" | "lying" | "standing" | "serrated" | "broken" | "violet" };

const FORMAS_YANZHI: Forma[] = [
  { cn: "全圈型", py: "quān quān", nome: "Volta COMPLETA", veredito: "Anel inteiro, fechado em 360° — o selo do REPRODUTOR (种鸽). É o 'olho de matriz' que Barkel exigia.", cor: "#55a3ff", desenho: "full" },
  { cn: "阔圈型", py: "kuò quān", nome: "Volta completa e LARGA", veredito: "Fechada E larga: reprodutor de elite — transmissor pesado de sangue.", cor: "#3b82f6", desenho: "wide" },
  { cn: "锯齿型", py: "jù chǐ", nome: "SERRILHADA", veredito: "Bordas em dentes-de-serra — o SINAL DE CORRIDA: o velocista puro. Quanto mais relevo nos dentes, mais garra no voo.", cor: "#f97316", desenho: "serrated" },
  { cn: "卧式", py: "wò shì", nome: "DEITADA", veredito: "Faixa larga deitada na base da pupila — sinal de VOADOR de velocidade.", cor: "#39e58c", desenho: "lying" },
  { cn: "立式", py: "lì shì", nome: "EM PÉ", veredito: "Faixa estreita em pé (vertical) — pombo misto: voa e pode criar.", cor: "#22c55e", desenho: "standing" },
  { cn: "半圈型", py: "bàn quān", nome: "MEIA volta", veredito: "Metade do círculo presente — voador; pra criar, exige mais qualidades.", cor: "#eab308", desenho: "half" },
  { cn: "不全型", py: "bù quán", nome: "INCOMPLETA", veredito: "Só pedaços espalhados — 'serve pra competir, não pra reproduzir' (regra clássica chinesa).", cor: "#94a3b8", desenho: "broken" },
  { cn: "紫罗兰型", py: "zǐ luó lán", nome: "VIOLETA", veredito: "O anel em tom lilás — raríssimo, a joia do criadouro (igual na escola inglesa!).", cor: "#a78bfa", desenho: "violet" },
];

/** desenha o esquema de uma forma do yanzhi */
function EsquemaForma({ f, ativo, onClick }: { f: Forma; ativo: boolean; onClick: () => void }) {
  // anel yanzhi base (invisível) + destaque conforme a forma
  const anel = (props: { dash?: string; w?: number; cor?: string }) => (
    <circle cx="50" cy="50" r="33" fill="none" stroke={props.cor || f.cor} strokeWidth={props.w || 7} strokeDasharray={props.dash} opacity={ativo ? 1 : 0.85} />
  );
  let extra: React.ReactNode = null;
  if (f.desenho === "full") extra = anel({});
  else if (f.desenho === "wide") extra = anel({ w: 11 });
  else if (f.desenho === "half") extra = <path d="M 50 17 A 33 33 0 0 1 50 83" fill="none" stroke={f.cor} strokeWidth="8" strokeLinecap="round" />;
  else if (f.desenho === "lying") extra = <path d="M 27 62 A 33 33 0 0 0 73 62" fill="none" stroke={f.cor} strokeWidth="11" strokeLinecap="round" />;
  else if (f.desenho === "standing") extra = <path d="M 38 28 A 33 33 0 0 1 38 72" fill="none" stroke={f.cor} strokeWidth="9" strokeLinecap="round" />;
  else if (f.desenho === "serrated") extra = (
    <g>
      <circle cx="50" cy="50" r="33" fill="none" stroke={f.cor} strokeWidth="8" />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const x1 = 50 + Math.cos(a) * 29, y1 = 50 + Math.sin(a) * 29;
        const x2 = 50 + Math.cos(a) * 40, y2 = 50 + Math.sin(a) * 40;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={f.cor} strokeWidth="2.4" />;
      })}
    </g>
  );
  else if (f.desenho === "broken") extra = (
    <g>
      <path d="M 50 17 A 33 33 0 0 1 67 25" fill="none" stroke={f.cor} strokeWidth="8" strokeLinecap="round" />
      <path d="M 78 42 A 33 33 0 0 1 74 62" fill="none" stroke={f.cor} strokeWidth="8" strokeLinecap="round" />
      <path d="M 30 74 A 33 33 0 0 1 19 58" fill="none" stroke={f.cor} strokeWidth="8" strokeLinecap="round" />
    </g>
  );
  else if (f.desenho === "violet") extra = anel({ cor: "#a78bfa", dash: "6 3", w: 8 });
  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", maxWidth: 96, display: "block", margin: "0 auto", cursor: "pointer" }} onClick={onClick} role="img" aria-label={`Forma ${f.nome}`}>
      {/* olho de fundo */}
      <circle cx="50" cy="50" r="46" fill="#1b283c" stroke="#31415a" strokeWidth="2" />
      <circle cx="50" cy="50" r="42" fill="#7a5c30" opacity="0.5" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="#e8b25c" strokeWidth="5" strokeDasharray="2 2" opacity="0.5" />
      {extra}
      <ellipse cx="50" cy="50" rx="10" ry="15" fill="#14161a" />
      {/* brilho na pupila */}
      <circle cx="47" cy="45" r="2.2" fill="#f8fafc" opacity="0.8" />
    </svg>
  );
}

/* ---------- CAMADA 3: tipos, yin-yang, areias-clima, chaves, dicionário ---------- */
const DICIONARIO_CN: [string, string, string, string][] = [
  ["眼志", "yǎn zhì", "sinal do olho", "o eye-sign inteiro"],
  ["眼砂", "yǎn shā", "areia do olho", "granulação da íris"],
  ["面砂", "miàn shā", "areia de superfície", "camada de CIMA da íris"],
  ["底砂", "dǐ shā", "areia de fundo", "camada de BAIXO (dá o tipo)"],
  ["黄眼", "huáng yǎn", "olho amarelo", "fundo dourado"],
  ["桃花眼", "táo huā yǎn", "flor de pêssego", "fundo prateado = pérola"],
  ["牛眼", "niú yǎn", "olho de boi", "olho preto"],
  ["内线口", "nèi xiàn kǒu", "anel interno", "círculo de adaptação"],
  ["种鸽", "zhǒng gē", "reprodutor", "score 🏆 do app"],
  ["赛鸽", "sài gē", "pombo de prova", "score ⚡ do app"],
  ["阴阳调和", "yīn yáng tiáo hé", "harmonia Yin-Yang", "acasalamento equilibrado"],
];

const AREIAS_CLIMA: { cn: string; py: string; clima: string; icon: string }[] = [
  { cn: "云砂", py: "yún shā", clima: "voa bem em dia NUBLADO", icon: "☁️" },
  { cn: "桃红砂", py: "táo hóng shā", clima: "dia nublado", icon: "☁️" },
  { cn: "蓝水桃花", py: "lán shuǐ táo huā", clima: "dia de SOL FORTE", icon: "☀️" },
  { cn: "黄底红砂", py: "huáng dǐ hóng", clima: "sol forte", icon: "☀️" },
  { cn: "红砂", py: "hóng shā", clima: "sol forte", icon: "☀️" },
  { cn: "紫砂", py: "zǐ shā", clima: "voo ALTO (高翔)", icon: "⛰️" },
  { cn: "粗红砂", py: "cū hóng shā", clima: "clima tropical", icon: "🌴" },
  { cn: "油眼砂", py: "yóu yǎn shā", clima: "voo de BAIXA LUZ", icon: "🌙" },
];

const CHAVES_MESTRE: { hanzi: string; pinyin: string; nome: string; texto: string }[] = [
  { hanzi: "干", pinyin: "gān", nome: "SECA", texto: "Areia seca e firme = pombo maduro que vê longe. Areia aguada/embaçada = visão turva, se perde." },
  { hanzi: "紧", pinyin: "jǐn", nome: "FIRME", texto: "Pálpebra colada, areia compacta em raios: vigor e reação rápida — perfil de velocista." },
  { hanzi: "油", pinyin: "yóu", nome: "OLEOSA", texto: "Brilho de óleo na areia: profundo sem ser escuro — a maioria dos vencedores tem (diz a lenda)." },
  { hanzi: "活", pinyin: "huó", nome: "VIVA", texto: "Pupila que gira e treme vigiando tudo, areia que 'dança': inteligência pura." },
  { hanzi: "鲜", pinyin: "xiān", nome: "BRILHANTE", texto: "Cor viva mas sóbria. Pálida = fraco; turva = sem fôlego pra longe." },
];

export function EscolaChinesa() {
  const [zoom, setZoom] = useState<string | null>(null);
  const [camada, setCamada] = useState(3); // começa no 眼志, a estrela
  const [forma, setForma] = useState(0);
  const c = CAMADAS_CN.find((x) => x.n === camada)!;
  const f = FORMAS_YANZHI[forma];

  const CartaoTipo = ({ src, cn, nome, yinYang, cor, itens }: { src: string; cn: string; nome: string; yinYang: string; cor: string; itens: string[] }) => (
    <div style={{ flex: 1, minWidth: 250, padding: 12, borderRadius: 12, background: "#ffffff08", border: `1px solid ${cor}44` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: cor }}>{cn}</div>
        <span style={{ padding: "2px 9px", borderRadius: 8, fontSize: 10, fontWeight: 900, color: cor, background: `${cor}18` }}>{yinYang}</span>
      </div>
      <div style={{ ...T.small, fontSize: 11.5, fontWeight: 700, color: T.white, marginBottom: 8 }}>{nome}</div>
      <img src={src} alt={`${nome} (${cn})`} onClick={() => setZoom(src)} style={{ width: "100%", borderRadius: 12, cursor: "zoom-in", border: `1.5px solid ${cor}55`, display: "block" }} />
      <div style={{ display: "grid", gap: 5, marginTop: 9 }}>
        {itens.map((t, i) => (
          <div key={i} style={{ ...T.small, fontSize: 11.5, lineHeight: 1.6 }}>• {t}</div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* INTRODUÇÃO CURTA */}
      <section style={T.card}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🇨🇳 A Escola Chinesa — como os chineses leem o olho</div>
        <div style={{ ...T.small, fontSize: 12, lineHeight: 1.85, color: T.dim }}>
          Na China — a maior potência da columofilia do planeta (400 mil criadores, prêmios bilionários) — a foto do olho ocupa <b style={{ color: T.white }}>metade da página</b> nos leilões. O sistema deles é <b style={{ color: T.white }}>igual ao nosso por baixo, mas com uma sacada a mais</b>: em vez de olhar só círculos, eles enxergam o olho <b style={{ color: T.white }}>em CAMADAS de areia</b> — uma de superfície (面砂) por cima de uma de fundo (底砂). Esta página ensina essa leitura em 3 passos: <b style={{ color: T.white }}>1. as camadas</b> (toque no desenho!), <b style={{ color: T.white }}>2. as 8 formas do círculo 眼志</b> (cada uma desenhada), <b style={{ color: T.white }}>3. os tipos e cruzamentos</b>. Tudo em português — os ideogramas são só o "nome de batismo" de cada coisa. 😄
        </div>
      </section>

      {/* PASSO 1 — O OLHO EM CAMADAS (INTERATIVO) */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 4 }}>🥪 Passo 1 — O olho em CAMADAS (toque nos números!)</div>
        <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 10, lineHeight: 1.5 }}>
          A visão chinesa do olho: de dentro pra fora, 6 camadas. Toque em cada número do desenho — a camada acende e explico o que ela é e o que procurar nela.
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <svg viewBox="0 0 300 200" style={{ width: 290, height: "auto", flexShrink: 0 }} role="img" aria-label="Olho em camadas com 6 partes numeradas">
            {/* VISÃO FRONTAL (esquerda) */}
            <g>
              <circle cx="105" cy="100" r="72" fill="#0f1a2e" stroke="#31415a" strokeWidth="3" />
              <circle cx="105" cy="100" r="66" fill="#8a6a30" opacity="0.35" />
              {/* 底砂 — fundo dourado/prata aparecendo */}
              <circle cx="105" cy="100" r="62" fill="#e8c96a" opacity={camada === 5 ? 0.95 : 0.55} />
              {/* 面砂 — granulha por cima (manchas) */}
              {Array.from({ length: 22 }).map((_, i) => {
                const a = (i / 22) * Math.PI * 2 + 0.3;
                const r = 46 + (i % 3) * 6;
                const x = 105 + Math.cos(a) * r, y = 100 + Math.sin(a) * r * 0.92;
                return <circle key={i} cx={x} cy={y} r={4.5 + (i % 4)} fill="#c2410c" opacity={camada === 4 ? 1 : 0.75} stroke={camada === 4 ? "#ffdba5" : "none"} strokeWidth={camada === 4 ? 1.2 : 0} />;
              })}
              {/* 眼志 — anel entre pupila e areia */}
              <circle cx="105" cy="100" r="30" fill="none" stroke={camada === 3 ? "#55a3ff" : "#3d5a80"} strokeWidth={camada === 3 ? 9 : 6} opacity={camada === 3 ? 1 : 0.7} />
              {/* 内线口 — filete interno */}
              <circle cx="105" cy="100" r="22" fill="none" stroke={camada === 2 ? "#eab308" : "#6b7280"} strokeWidth={camada === 2 ? 4 : 2.5} />
              {/* 瞳孔 */}
              <ellipse cx="105" cy="100" rx="12" ry="16" fill={camada === 1 ? "#f8fafc" : "#14161a"} stroke={camada === 1 ? "#f8fafc" : "none"} strokeWidth="2" />
              {camada === 1 && <text x="105" y="105" textAnchor="middle" fontSize="13" fontWeight="900" fill="#14161a">1</text>}
              {/* 外线口 — borda */}
              <circle cx="105" cy="100" r="71" fill="none" stroke={camada === 6 ? "#39e58c" : "#475569"} strokeWidth={camada === 6 ? 5 : 3} />
              {/* marcadores */}
              {[[1, 105, 74], [2, 84, 122], [3, 105, 134], [4, 52, 66], [5, 158, 138], [6, 105, 22]].map(([n, x, y]) => (
                <g key={n} onClick={() => setCamada(n)} style={{ cursor: "pointer" }}>
                  <circle cx={x} cy={y} r="10" fill={camada === n ? "#f7bd00" : "#1b283c"} stroke={camada === n ? "#f7bd00" : "#64748b"} strokeWidth="2" />
                  <text x={x} y={y + 3.5} textAnchor="middle" fontSize="11" fontWeight="900" fill={camada === n ? "#0b1426" : "#e2e8f0"}>{n}</text>
                </g>
              ))}
              <text x="105" y="190" textAnchor="middle" fontSize="9.5" fill="#64748b">visão de frente</text>
            </g>
            {/* CORTE LATERAL (direita) — o sanduíche */}
            <g>
              <text x="235" y="42" textAnchor="middle" fontSize="9.5" fill="#64748b">corte lateral — o sanduíche</text>
              <rect x="185" y="52" width="100" height="17" rx="4" fill={camada === 4 ? "#c2410c" : "#7c2d12"} opacity="0.9" />
              {Array.from({ length: 9 }).map((_, i) => (
                <circle key={i} cx={192 + i * 11} cy="60" r="3.6" fill="#fb923c" opacity={camada === 4 ? 1 : 0.8} />
              ))}
              <text x="245" y="64.5" textAnchor="middle" fontSize="7.5" fill="#fff" fontWeight="700">面砂 (superfície)</text>
              <rect x="185" y="72" width="100" height="17" rx="4" fill={camada === 5 ? "#e8c96a" : "#b8935a"} />
              <text x="245" y="84.5" textAnchor="middle" fontSize="7.5" fill="#3b2f0b" fontWeight="700">底砂 (fundo)</text>
              <rect x="185" y="92" width="100" height="12" rx="4" fill="#334155" />
              <text x="245" y="101.5" textAnchor="middle" fontSize="7.5" fill="#cbd5e1" fontWeight="700">retina</text>
              {/* seta 3D */}
              <path d="M 192 130 L 278 130" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="235" y="142" textAnchor="middle" fontSize="8.5" fill="#9aa8bc">a granulha deve parecer SUSPENSA</text>
              <text x="235" y="153" textAnchor="middle" fontSize="8.5" fill="#9aa8bc">em relevo acima do fundo (3D)</text>
              <text x="235" y="180" textAnchor="middle" fontSize="9" fill="#64748b">olho bom = ver o fundo</text>
              <text x="235" y="191" textAnchor="middle" fontSize="9" fill="#64748b">pelas frestas da granulha</text>
            </g>
          </svg>
          <div style={{ flex: 1, minWidth: 230 }}>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {CAMADAS_CN.map((x) => (
                <button key={x.n} type="button" onClick={() => setCamada(x.n)} style={{ padding: "6px 10px", borderRadius: 999, cursor: "pointer", fontSize: 11, fontWeight: 800, border: `1.5px solid ${camada === x.n ? T.gold : T.border}`, background: camada === x.n ? `${T.gold}22` : T.bgInput, color: camada === x.n ? T.gold : T.dim }}>
                  {x.n}. {x.nome}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 900, color: T.gold }}>{c.cn} <span style={{ fontSize: 11, fontWeight: 600, color: T.dim }}>{c.py}</span> — {c.nome}</div>
            <div style={{ ...T.small, fontSize: 12, lineHeight: 1.75, marginTop: 6 }}>{c.oQueEO}</div>
            <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.75, marginTop: 6, padding: "9px 11px", borderRadius: 10, background: "#ffffff08", border: `1px solid ${T.gold}33` }}>
              👁️ <b style={{ color: T.white }}>O que procurar:</b> {c.oQueVer}
            </div>
          </div>
        </div>
      </section>

      {/* PASSO 2 — AS 8 FORMAS DO 眼志 */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 4 }}>⭕ Passo 2 — As 8 formas do círculo 眼志 (cada uma desenhada)</div>
        <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 10, lineHeight: 1.5 }}>
          A classificação chinesa clássica do eye-sign por FORMA — é ela que separa voador de reprodutor. Toque nos desenhos pra ler o veredito de cada uma.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(128px, 1fr))", gap: 8 }}>
          {FORMAS_YANZHI.map((x, i) => (
            <button key={x.cn} type="button" onClick={() => setForma(i)} style={{ padding: 10, borderRadius: 12, cursor: "pointer", background: forma === i ? `${x.cor}18` : "#ffffff08", border: `1.5px solid ${forma === i ? x.cor : T.border}`, textAlign: "center" }}>
              <EsquemaForma f={x} ativo={forma === i} onClick={() => setForma(i)} />
              <div style={{ fontSize: 12.5, fontWeight: 900, color: forma === i ? x.cor : T.white, marginTop: 6 }}>{x.cn}</div>
              <div style={{ fontSize: 9.5, color: T.dim2 }}>{x.py}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.dim, marginTop: 2 }}>{x.nome}</div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: 13, borderRadius: 12, background: "#ffffff08", border: `1px solid ${f.cor}44` }}>
          <div style={{ fontSize: 13.5, fontWeight: 900, color: f.cor }}>{f.cn} <span style={{ fontSize: 11, fontWeight: 600, color: T.dim }}>{f.py}</span> — {f.nome}</div>
          <div style={{ ...T.small, fontSize: 12, lineHeight: 1.75, marginTop: 5 }}>{f.veredito}</div>
        </div>
      </section>

      {/* PASSO 3 — OS 3 TIPOS */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🀄 Passo 3 — Os Três Grandes TIPOS (a cor do FUNDO decide)</div>
        <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 10 }}>Regra prática: olhe a areia de FUNDO (底砂) do desenho do Passo 1 — dourada = 黄眼, prateada = 桃花眼, tudo escuro = 牛眼.</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <CartaoTipo
            src="/img/olho-huang.jpg" cn="黄眼 (huáng yǎn)" nome="Olho Amarelo" yinYang="☯️ YIN — estável" cor="#f7bd00"
            itens={[
              "Fundo dourado-ouro + granulha vermelha: o 'guerreiro todo-tempo'",
              "Volta mesmo com chuva e neblina — rei do FUNDO e das provas duras",
              "Pra escalar em dia ruim de tempo, o mestre chinês escala o amarelo",
            ]}
          />
          <CartaoTipo
            src="/img/olho-tao.jpg" cn="桃花眼 (táo huā yǎn)" nome="Flor de Pêssego" yinYang="☯️ YANG — veloz" cor="#ff8fa3"
            itens={[
              "Fundo prateado/rosado: o VELOCISTA de dia limpo e vento a favor",
              "O mais bonito de ver — e o mais cobiçado pros 300–500km",
              "Em dia adverso, tradição manda poupar: 'rápido, mas flutua'",
            ]}
          />
          <CartaoTipo
            src="/img/olho-niu.jpg" cn="牛眼 (niú yǎn)" nome="Olho de Boi" yinYang="🌑 o misterioso" cor="#9aa8bc"
            itens={[
              "Sem pigmento — os vasos sanguíneos é que aparecem escuros",
              "O ditado: 'pro criadouro, não se estranha' (育种不可怪)",
              "Cuidado: pombo doente também tem olho escuro e APAGADO — não confunda!",
            ]}
          />
        </div>
      </section>

      {/* YIN-YANG + DITADO */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>☯️ O acasalamento Yin-Yang — o equilíbrio dos opostos</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <svg viewBox="0 0 120 120" style={{ width: 125, height: 125, flexShrink: 0 }} role="img" aria-label="Yin-Yang do amarelo com o flor de pêssego">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#31415a" strokeWidth="2" />
            <path d="M 60 8 A 52 52 0 0 1 60 112 A 26 26 0 0 1 60 60 A 26 26 0 0 0 60 8 Z" fill="#f7bd00" opacity="0.92" />
            <path d="M 60 8 A 52 52 0 0 0 60 112 A 26 26 0 0 0 60 60 A 26 26 0 0 1 60 8 Z" fill="#ff8fa3" opacity="0.88" />
            <circle cx="60" cy="34" r="10" fill="#f8fafc" stroke="#31415a" strokeWidth="1.5" />
            <circle cx="60" cy="34" r="4" fill="#14161a" />
            <circle cx="60" cy="86" r="10" fill="#14161a" stroke="#31415a" strokeWidth="1.5" />
            <circle cx="60" cy="86" r="3.5" fill="#f8fafc" />
          </svg>
          <div style={{ flex: 1, minWidth: 230 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: T.gold, lineHeight: 1.5 }}>黄眼稳、砂眼快、牛眼育种不可怪</div>
            <div style={{ ...T.small, fontSize: 12, marginTop: 6, lineHeight: 1.7 }}>
              <b style={{ color: T.white }}>"Amarelo é estável, areia é veloz, olho de boi é pro criadouro."</b><br />
              Tradução prática: cada tipo tem um JEITO de voar. Cruzar <b style={{ color: "#f7bd00" }}>amarelo (Yin)</b> com <b style={{ color: "#ff8fa3" }}>flor de pêssego (Yang)</b> busca o filho <b style={{ color: T.white }}>equilibrado</b> — herda a estabilidade de um e a velocidade do outro. É o mesmo princípio do nosso "amarelo × pérola" — descoberto de forma independente do outro lado do mundo!
            </div>
          </div>
        </div>
      </section>

      {/* AREIAS × CLIMA */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 6 }}>🌦️ As areias e o CLIMA — qual olho pra qual tempo</div>
        <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 10, lineHeight: 1.5 }}>
          Exclusividade chinesa: certas areias voam melhor em certos tempos. Na véspera da prova, o mestre cruza a previsão (no app: Rota da Prova!) com este mapa pra escalar a equipe.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 6 }}>
          {AREIAS_CLIMA.map((a) => (
            <div key={a.cn} style={{ padding: "8px 11px", borderRadius: 9, background: "#ffffff08", fontSize: 11.5, lineHeight: 1.5 }}>
              <b style={{ fontSize: 13 }}>{a.cn}</b> <span style={{ color: T.dim2, fontSize: 10 }}>{a.py}</span>
              <div style={{ color: T.dim, fontSize: 10.5 }}>{a.icon} {a.clima}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CHAVES */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 6 }}>🔑 As 5 chaves do mestre — uma palavra, um teste</div>
        <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 10 }}>O olho campeão chinês se resume em 5 palavras de uma sílaba — cada ideograma é um exame completo:</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 8 }}>
          {CHAVES_MESTRE.map((x) => (
            <div key={x.hanzi} style={{ padding: 12, borderRadius: 12, background: "#ffffff08", border: "1px solid #f7bd0033", display: "flex", gap: 10 }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: T.gold, lineHeight: 1, minWidth: 34, textAlign: "center" }}>{x.hanzi}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800 }}>{x.nome} <span style={{ color: T.dim2, fontSize: 10, fontWeight: 600 }}>{x.pinyin}</span></div>
                <div style={{ ...T.small, fontSize: 10.5, lineHeight: 1.6, marginTop: 3, color: T.dim }}>{x.texto}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DICIONÁRIO */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📖 Dicionário de bolso — 汉字 → português</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(245px, 1fr))", gap: 6 }}>
          {DICIONARIO_CN.map(([cn, py, pt, noApp]) => (
            <div key={cn} style={{ padding: "8px 11px", borderRadius: 9, background: "#ffffff08", fontSize: 11.5, lineHeight: 1.55 }}>
              <b style={{ color: "#ff8fa3", fontSize: 13 }}>{cn}</b> <span style={{ color: T.dim2, fontSize: 10 }}>{py}</span> <span style={{ color: T.dim }}>→ {pt}</span>
              {noApp && <div style={{ fontSize: 10, color: T.dim2 }}>no app: {noApp}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* HONESTIDADE */}
      <section style={{ ...T.card, marginTop: 14, ...T.small, fontSize: 11, lineHeight: 1.75, color: T.dim }}>
        ⚠️ <b>Honestidade:</b> até na China os céticos falam alto — nos comentários dos sites chineses há criadores lembrando que <b>não há prova científica de que pigmento do olho prevê desempenho</b>. Eye-sign é tradição de criador dos dois lados do mundo: use junto com pedigree, anatomia e resultado de voo. Ilustrações artísticas (baseadas em fotos reais) e esquemas didáticos — o olho do SEU pombo continua sendo o juiz final. 🀄👁️
      </section>

      {/* ZOOM */}
      {zoom && (
        <div onClick={() => setZoom(null)} style={{ position: "fixed", inset: 0, background: "rgba(4,10,20,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, cursor: "zoom-out", padding: 12 }}>
          <img src={zoom} alt="ilustração ampliada" style={{ width: "min(94vw, 900px)", borderRadius: 12 }} onClick={(e) => e.stopPropagation()} />
          <div style={{ position: "fixed", bottom: 18, color: "#9aa8bc", fontSize: 12 }}>toque fora da imagem para fechar ✕</div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   🇿🇦 ESCOLA SUL-AFRICANA — Jack Barkel, o pai do eye-sign moderno
   Passo 1: o sinal de corrida medido em % (25/50/75/100)
   Passo 2: a REGRA DOS 100% — calculadora de acasalamento
   Passo 3: a matriz de cores (amarelo × pérola e companhia)
   ══════════════════════════════════════════════════════════════ */

const COBERTURAS: { pct: number; nome: string; leitura: string }[] = [
  { pct: 25, nome: "¼ de volta", leitura: "Sinal discreto, um quarto do anel: na tradição, mais índole de FONDO — ritmo de maratonista, guarda energia. Casal somando pouco = filhos pros dias duros." },
  { pct: 50, nome: "½ volta", leitura: "Meia volta de sinal: o EQUILIBRADO — corre com vontade e ainda tem chapa pra criar. O mais comum nos campeões, diz a escola." },
  { pct: 75, nome: "¾ de volta", leitura: "Três quartos: VELOCISTA de verdade — entra forte, briga a ponta. Pra criar, Barkel pedia cuidado: excesso de corrida de ambos os lados desequilibra." },
  { pct: 100, nome: "volta COMPLETA", leitura: "O sinal fecha o círculo inteiro: intensidade máxima de corrida. A regra clássica: quem tem 100% pede parceiro com sinal mínimo ou nulo — nunca outro 100%." },
];

const CORES_MATRIZ: { nome: string; chip: string; desc: string }[] = [
  { nome: "Amarelo", chip: "#eab308", desc: "íris amarelo-ouro (Y)" },
  { nome: "Pérola", chip: "#cbd5e1", desc: "íris prateada (P)" },
  { nome: "Outra cor", chip: "#a78bfa", desc: "laranja, violeta, olho de boi..." },
];

function vereditoCorres(m: number, f: number): { txt: string; nota: string; cor: string } {
  const amarelo = [m, f].filter((x) => x === 0).length;
  const perola = [m, f].filter((x) => x === 1).length;
  if (amarelo === 2) return { txt: "⚠️ Amarelo × Amarelo", nota: "Íris ESPRESSA demais na tradição: filhos com excesso de pigmento — perdem a fineza de leitura. Evitar, dizia Barkel.", cor: "#f97316" };
  if (perola === 2) return { txt: "⚠️ Pérola × Pérola", nota: "Íris FINA demais: velocidade sem resistência — tradução de Barkel: 'ganham e se perdem' nas provas duras.", cor: "#94a3b8" };
  if (amarelo === 1 && perola === 1) return { txt: "⭐ Amarelo × Pérola", nota: "O CASAMENTO CLÁSSICO: espessura de um + fineza do outro = o equilíbrio dos campeões. A combinação preferida de Barkel.", cor: "#39e58c" };
  return { txt: "✓ Combinado com outra cor", nota: "Laranja, violeta e olho de boi seguem a mesma lógica: buscar o CONTRAPESE — o que um olho tem de menos, o outro completa.", cor: "#a78bfa" };
}

export function EscolaBarkel() {
  const [cob, setCob] = useState(1); // 50% selecionado
  const [machoPct, setMachoPct] = useState(50);
  const [femeaPct, setFemeaPct] = useState(50);
  const [corM, setCorM] = useState(0);
  const [corF, setCorF] = useState(1);

  const c = COBERTURAS[cob];
  const soma = machoPct + femeaPct;
  const aprovado = soma <= 100;
  const vc = vereditoCorres(corM, corF);

  /** arco do sinal de corrida cobrindo pct% da adaptação */
  const arco = (pct: number, cor: string, ativo: boolean) => {
    const fim = (-90 + (pct / 100) * 360) * (Math.PI / 180);
    const x = 50 + 27 * Math.cos(fim), y = 50 + 27 * Math.sin(fim);
    const grande = pct > 50 ? 1 : 0;
    return <path d={`M 50 23 A 27 27 0 ${grande} 1 ${x.toFixed(1)} ${y.toFixed(1)}`} fill="none" stroke={cor} strokeWidth={ativo ? 10 : 7} strokeLinecap="round" opacity={ativo ? 1 : 0.75} />;
  };

  return (
    <>
      {/* INTRODUÇÃO */}
      <section style={T.card}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🇿🇦 A Escola de Jack Barkel — o pai do eye-sign moderno</div>
        <div style={{ ...T.small, fontSize: 12, lineHeight: 1.85, color: T.dim }}>
          O sul-africano <b style={{ color: T.white }}>Jack Barkel</b> foi criador, colunista e autor do clássico <i>"Success with Eye-Sign"</i> — o livro que popularizou os <b style={{ color: T.white }}>5 círculos</b> que o app inteiro usa (pupila, adaptação, correlação, íris e o anel da saúde). A marca dele não foi só LER o olho: foi <b style={{ color: T.white }}>acasalar PELO olho</b> — com regras matemáticas. Esta aba ensina as três ferramentas exclusivas da casa: <b style={{ color: T.white }}>1. o sinal de corrida medido em %</b>, <b style={{ color: T.white }}>2. a Regra dos 100%</b> (com calculadora!) e <b style={{ color: T.white }}>3. a matriz de cores</b>.
        </div>
      </section>

      {/* PASSO 1 — SINAL DE CORRIDA EM % */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 4 }}>📐 Passo 1 — O sinal de corrida MEDIDO (toque nas coberturas!)</div>
        <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 10, lineHeight: 1.5 }}>
          A régua de Barkel: o segmento escuro serrilhado sobre o círculo de adaptação, medido por QUANTO DO ANEL ele cobre. O arco laranja no desenho é o sinal — toque nos tamanhos.
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <svg viewBox="0 0 100 100" style={{ width: 190, height: 190, flexShrink: 0 }} role="img" aria-label="Sinal de corrida cobrindo parte do anel de adaptação">
            <circle cx="50" cy="50" r="46" fill="#1b283c" stroke="#31415a" strokeWidth="2" />
            <circle cx="50" cy="50" r="42" fill="#8a6a30" opacity="0.45" />
            {/* círculo de adaptação (referência cinza) */}
            <circle cx="50" cy="50" r="27" fill="none" stroke="#64748b" strokeWidth="5" opacity="0.5" />
            {/* correlação de fundo */}
            <circle cx="50" cy="50" r="36" fill="none" stroke="#3d5a80" strokeWidth="4" opacity="0.5" />
            {/* sinal de corrida (arco laranja) */}
            {arco(c.pct, "#f97316", true)}
            {/* dentinhos de serra no arco */}
            {Array.from({ length: Math.max(2, Math.round((c.pct / 100) * 10)) }).map((_, i) => {
              const a = (-90 + (i + 0.5) * (c.pct / Math.max(1, Math.round((c.pct / 100) * 10))) * 3.6) * (Math.PI / 180);
              const x1 = 50 + Math.cos(a) * 22, y1 = 50 + Math.sin(a) * 22;
              const x2 = 50 + Math.cos(a) * 34, y2 = 50 + Math.sin(a) * 34;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffd76a" strokeWidth="1.6" />;
            })}
            <ellipse cx="50" cy="50" rx="11" ry="15" fill="#14161a" />
            <circle cx="47" cy="45" r="2.2" fill="#f8fafc" opacity="0.85" />
            <text x="50" y="95" textAnchor="middle" fontSize="10" fontWeight="900" fill="#f97316">{c.pct}% de cobertura</text>
          </svg>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {COBERTURAS.map((x, i) => (
                <button key={x.pct} type="button" onClick={() => setCob(i)} style={{ padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontSize: 11.5, fontWeight: 900, border: "1.5px solid " + (cob === i ? "#f97316" : T.border), background: cob === i ? "#f9731622" : T.bgInput, color: cob === i ? "#f97316" : T.dim }}>
                  {x.pct}%
                </button>
              ))}
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 900, color: "#f97316" }}>Sinal de {c.nome} ({c.pct}%)</div>
            <div style={{ ...T.small, fontSize: 12, lineHeight: 1.75, marginTop: 6 }}>{c.leitura}</div>
          </div>
        </div>
      </section>

      {/* PASSO 2 — REGRA DOS 100% (CALCULADORA) */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 4 }}>🧮 Passo 2 — A REGRA DOS 100% (a calculadora de Barkel)</div>
        <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 12, lineHeight: 1.5 }}>
          A regra de ouro: <b>a soma dos sinais de corrida do casal NÃO deve passar de 100%</b>. Arraste os controles com a cobertura de cada um e veja o veredito na hora.
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          {/* medidor semicircular */}
          <svg viewBox="0 0 200 115" style={{ width: 230, height: "auto", flexShrink: 0 }} role="img" aria-label="Medidor da soma dos sinais de corrida">
            {/* trilha 0–200 */}
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#31415a" strokeWidth="13" strokeLinecap="round" />
            {/* zona aprovada 0–100 (metade esquerda) */}
            <path d="M 20 100 A 80 80 0 0 1 100 20" fill="none" stroke="#39e58c" strokeWidth="13" />
            {/* ponteiro */}
            {(() => {
              const ang = (-180 + Math.min(200, soma) * 0.9) * (Math.PI / 180);
              const x = 100 + 74 * Math.cos(ang), y = 100 + 74 * Math.sin(ang);
              return <line x1="100" y1="100" x2={x.toFixed(1)} y2={y.toFixed(1)} stroke={aprovado ? "#39e58c" : "#ff5d62"} strokeWidth="5" strokeLinecap="round" />;
            })()}
            <circle cx="100" cy="100" r="8" fill="#1b283c" stroke={aprovado ? "#39e58c" : "#ff5d62"} strokeWidth="3" />
            <text x="20" y="112" fontSize="10" fill="#64748b">0%</text>
            <text x="100" y="12" textAnchor="middle" fontSize="10" fill="#64748b">100%</text>
            <text x="180" y="112" textAnchor="end" fontSize="10" fill="#64748b">200%</text>
            <text x="100" y="78" textAnchor="middle" fontSize="26" fontWeight="900" fill={aprovado ? "#39e58c" : "#ff5d62"}>{soma}%</text>
          </svg>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ ...T.small, fontSize: 11, marginBottom: 3 }}>♂ Sinal de corrida do MACHO: <b style={{ color: "#f97316" }}>{machoPct}%</b></div>
            <input type="range" min={0} max={100} step={5} value={machoPct} onChange={(e) => setMachoPct(Number(e.target.value))} style={{ width: "100%", accentColor: "#f97316", cursor: "pointer" }} />
            <div style={{ ...T.small, fontSize: 11, margin: "10px 0 3px" }}>♀ Sinal de corrida da FÊMEA: <b style={{ color: "#ff8fa3" }}>{femeaPct}%</b></div>
            <input type="range" min={0} max={100} step={5} value={femeaPct} onChange={(e) => setFemeaPct(Number(e.target.value))} style={{ width: "100%", accentColor: "#ff8fa3", cursor: "pointer" }} />
            <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: aprovado ? "#39e58c12" : "#ff5d6212", border: "1px solid " + (aprovado ? "#39e58c55" : "#ff5d6255") }}>
              <b style={{ fontSize: 13, color: aprovado ? "#39e58c" : "#ff5d62" }}>{aprovado ? "✅ APROVADO por Barkel" : "❌ REPROVADO: soma > 100%"}</b>
              <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.65, marginTop: 5 }}>
                {aprovado
                  ? "O casal está dentro da regra: a 'vontade de correr' de um completa a do outro sem exagero — tradição diz que filhos nascem equilibrados, correndo com juízo."
                  : "Excesso de sinal de corrida dos dois lados: na tradição de Barkel, o casal 'queima' — passa velocidade sem assentar, e a cria perde equilíbrio. Reduza a cobertura de um dos lados."}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PASSO 3 — MATRIZ DE CORES */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 4 }}>🎨 Passo 3 — A matriz de cores do acasalamento</div>
        <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 10, lineHeight: 1.5 }}>
          A segunda regra famosa: cruzar olhos COMPLEMENTARES, nunca iguais demais. Escolha a cor do macho (linha) e da fêmea (coluna):
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {/* matriz clicável */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "70px repeat(3, 62px)", gap: 4, fontSize: 10.5 }}>
              <div />
              {CORES_MATRIZ.map((cf) => (
                <div key={cf.nome} style={{ textAlign: "center", fontWeight: 800, color: T.dim, padding: "4px 0" }}>♀ {cf.nome}</div>
              ))}
              {CORES_MATRIZ.map((cm, i) => (
                <div key={cm.nome} style={{ display: "contents" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 800, color: T.dim }}>♂ {cm.nome}</div>
                  {CORES_MATRIZ.map((cf, j) => {
                    const v = vereditoCorres(i, j);
                    const on = corM === i && corF === j;
                    return (
                      <button key={j} type="button" onClick={() => { setCorM(i); setCorF(j); }} style={{ height: 44, borderRadius: 9, cursor: "pointer", border: "1.5px solid " + (on ? v.cor : T.border), background: on ? v.cor + "22" : "#ffffff08", display: "grid", placeItems: "center", fontSize: 17 }}>
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg, " + cm.chip + " 50%, " + cf.chip + " 50%)", border: "1.5px solid #0006", display: "inline-block" }} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 220, padding: 13, borderRadius: 12, background: "#ffffff08", border: "1px solid " + vc.cor + "44" }}>
            <div style={{ fontSize: 13.5, fontWeight: 900, color: vc.cor }}>{vc.txt}</div>
            <div style={{ ...T.small, fontSize: 12, lineHeight: 1.75, marginTop: 5 }}>{vc.nota}</div>
            <div style={{ ...T.small, fontSize: 10.5, marginTop: 8, color: T.dim2 }}>💡 Os chips da matriz são meio-a-meio: cada metade é a cor de um dos pais.</div>
          </div>
        </div>
      </section>

      {/* O OLHO COMPOSTO + BIO */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>💎 O olho composto — a joia dupla de Barkel</div>
        <div style={{ ...T.small, fontSize: 12, lineHeight: 1.85, color: T.dim }}>
          O sonho da escola: o pombo que reúne <b style={{ color: T.white }}>sinal de corrida forte</b> (vencedor de provas) <b style={{ color: T.white }}>E</b> anel de correlação completo (transmissor) no mesmo olho — o <b style={{ color: T.white }}>"composite eye"</b>. Raro como o violeta: quem tem um desses no pombal, guarda como relíquia. É por isso que os dois scores do app (⚡ Voador e 🏆 Reprodutor, na aba Analisar) existem separados: o mestre sul-africano buscava os dois mundos — e o equilíbrio entre eles é a arte do acasalamento pelo olho.
          <br /><br />
          ⚠️ <b>Honestidade de sempre:</b> Barkel é tradição columófila amada no mundo inteiro — não ciência de laboratório. As regras dos 100% e da matriz de cores são guias de criador, não garantias. Use junto com pedigree, anatomia e resultados de voo.
        </div>
      </section>
    </>
  );
}
