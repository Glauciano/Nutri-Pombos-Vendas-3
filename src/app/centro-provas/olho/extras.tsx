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
