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
   🇬🇧 ESCOLA INGLESA — o eye-sign segundo S.W.E. Bishop
   Tradição britânica (anos 1950-60): seleção de pombos de FUNDO,
   a "Fórmula de Reconhecimento", olho voador × reprodutor e o violeta.
   ══════════════════════════════════════════════════════════════ */

const ANEIS_FORMULA: { chave: string; cor: string; r: number; nome: string }[] = [
  { chave: "perimetro", cor: "#39e58c", r: 56, nome: "Anel da condição" },
  { chave: "iris", cor: "#f97316", r: 49, nome: "Íris" },
  { chave: "correlacao", cor: "#55a3ff", r: 37, nome: "Correlação" },
  { chave: "adaptacao", cor: "#eab308", r: 25, nome: "Adaptação" },
  { chave: "pupila", cor: "#f8fafc", r: 13, nome: "Pupila" },
];

const PASSOS_FORMULA: { chave: string; titulo: string; texto: string }[] = [
  { chave: "pupila", titulo: "1. A pupila", texto: "Pequena, firme e REATIVA: cubra a luz com a mão e solte — no candidato a pombo de fundo inglês, ela contrai e expande rápido. Grande e preguiçosa pede passagem pro fundo." },
  { chave: "adaptacao", titulo: "2. O círculo de adaptação", texto: "Borda definida e SERRILHADA — o famoso 'sinal de corrida' (repare no relevo no olho do voador logo abaixo). Pra Bishop, sem adaptação visível falta motor ao atleta." },
  { chave: "correlacao", titulo: "3. O círculo de correlação", texto: "O coração da fórmula: COMPLETE em toda a volta = aptidão ao fundo e ao reproduzir (é o anel escuro do 'olho de reprodutor'). Larga e vazada = pombo de provas curtas." },
  { chave: "iris", titulo: "4. A profundidade da íris", texto: "Cor profunda, granulada, com 'montanhas e vales' — sinal de sangue rico e saúde. Íris rasa, esticada ou com falhas = pombo comum, sem brilho de campeão." },
  { chave: "perimetro", titulo: "5. O anel da condição", texto: "O anel externo conta a CONDIÇÃO do momento: completo, uniforme e brilhante = pombo em forma, pronto pra encarar a prova. Pálido ou interrompido = manejo por cima." },
];

const GLOSSARIO_EN: [string, string][] = [
  ["Eye-sign", "sinal do olho"],
  ["Racer eye", "olho de voador"],
  ["Breeder eye", "olho de reprodutor"],
  ["Circle of adaptation", "círculo de adaptação"],
  ["Circle of correlation", "círculo de correlação"],
  ["Iris granulation", "granulação da íris"],
  ["Depth of colour", "profundidade de cor"],
  ["Violet eye", "olho violeta"],
  ["Pearl eye", "olho pérola"],
  ["Bull eye", "olho preto (de boi)"],
  ["Condition", "condição (forma física)"],
  ["Long distance", "fundo / longa distância"],
  ["Mating by eye-sign", "acasalamento pelo olho"],
  ["Formula of Recognition", "Fórmula de Reconhecimento"],
];

export function EscolaInglesa() {
  const [passo, setPasso] = useState(0);
  const [zoom, setZoom] = useState<string | null>(null);
  const ativo = PASSOS_FORMULA[passo].chave;

  const CartaoOlho = ({ src, titulo, cor, itens }: { src: string; titulo: string; cor: string; itens: string[] }) => (
    <div style={{ flex: 1, minWidth: 240, padding: 12, borderRadius: 12, background: "#ffffff08", border: `1px solid ${cor}44` }}>
      <div style={{ fontSize: 13.5, fontWeight: 800, color: cor, marginBottom: 8 }}>{titulo}</div>
      <img src={src} alt={titulo} onClick={() => setZoom(src)} style={{ width: "100%", borderRadius: 12, cursor: "zoom-in", border: `1.5px solid ${cor}55`, display: "block" }} />
      <div style={{ display: "grid", gap: 5, marginTop: 9 }}>
        {itens.map((t, i) => (
          <div key={i} style={{ ...T.small, fontSize: 11.5, lineHeight: 1.6 }}>• {t}</div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* INTRODUÇÃO */}
      <section style={T.card}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🇬🇧 A Escola Inglesa — o olho segundo S.W.E. Bishop</div>
        <div style={{ ...T.small, fontSize: 12, lineHeight: 1.85, color: T.dim }}>
          <b style={{ color: T.white }}>S.W.E. Bishop</b> foi colunista da <i>Pigeon Racing News and Gazette</i>, a grande revista britânica da columofilia, e publicou nos anos 1950-60 o clássico raro <b style={{ color: T.white }}>"The Secret of Eye-Sign"</b> (All-British Pigeon Racing Publishing Co.). A escola inglesa nasceu com uma obsessão diferente da continental: <b style={{ color: T.white }}>Barkel e Hofmann</b> ensinavam a <b>combinar olhos</b> no acasalamento; <b style={{ color: T.white }}>Bishop ensinava a LER o olho pra achar o pombo de FUNDO</b> — o maratonista de longa distância. Sua <b style={{ color: T.white }}>"Fórmula de Reconhecimento"</b> era o roteiro prático dessa leitura, círculo por círculo — é ela que você percorre logo abaixo. E o livro abre com o <b style={{ color: T.white }}>"mecanismo maravilhoso do olho"</b>: a anatomia e a fisiologia que sustentam toda a leitura — reconstruída aqui em desenho interativo (🔬) e na seção do olho em voo (✈️), logo mais abaixo na aba.
          <br /><br />
          📚 Resumo honesto da tradição pública da escola inglesa (Bishop e C.J. Cranstoun) — não é tradução do livro, que é raro e protegido por direitos autorais.
        </div>
      </section>

      {/* FÓRMULA DE RECONHECIMENTO — INTERATIVA */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🧭 A Fórmula de Reconhecimento — toque nos passos</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <svg viewBox="0 0 120 120" style={{ width: 185, height: 185, flexShrink: 0 }} role="img" aria-label="Diagrama dos círculos do olho com o passo ativo destacado">
            {ANEIS_FORMULA.map((a) => {
              const on = a.chave === ativo;
              return (
                <circle key={a.chave} cx="60" cy="60" r={a.r} fill={a.chave === "pupila" ? "#14161a" : `${a.cor}${on ? "33" : "14"}`} stroke={a.cor} strokeWidth={on ? 3 : 1.2} opacity={on ? 1 : 0.4} />
              );
            })}
          </svg>
          <div style={{ flex: 1, minWidth: 230 }}>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {PASSOS_FORMULA.map((p, i) => (
                <button key={p.chave} type="button" onClick={() => setPasso(i)} style={{ padding: "7px 11px", borderRadius: 999, cursor: "pointer", fontSize: 11, fontWeight: 800, border: `1.5px solid ${passo === i ? ANEIS_FORMULA.find((a) => a.chave === p.chave)!.cor : T.border}`, background: passo === i ? `${ANEIS_FORMULA.find((a) => a.chave === p.chave)!.cor}22` : T.bgInput, color: passo === i ? ANEIS_FORMULA.find((a) => a.chave === p.chave)!.cor : T.dim }}>
                  {p.titulo.split(".")[0]}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: ANEIS_FORMULA.find((a) => a.chave === ativo)!.cor }}>{PASSOS_FORMULA[passo].titulo}</div>
            <div style={{ ...T.small, fontSize: 12, lineHeight: 1.75, marginTop: 5 }}>{PASSOS_FORMULA[passo].texto}</div>
          </div>
        </div>
      </section>

      {/* VOADOR × REPRODUTOR */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>⚡×🏆 O olho do VOADOR e o olho do REPRODUTOR</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <CartaoOlho
            src="/img/olho-voador.jpg"
            titulo="⚡ O Voador (racer eye)"
            cor="#f97316"
            itens={[
              "Sinal de corrida forte: adaptação serrilhada em RELEVO, agressiva",
              "Íris profunda e vibrante — o olho que 'quer voar'",
              "O atleta das provas — mas nem sempre o transmissor aos filhos",
            ]}
          />
          <CartaoOlho
            src="/img/olho-reprodutor.jpg"
            titulo="🏆 O Reprodutor (breeder eye)"
            cor="#55a3ff"
            itens={[
              "Círculo de correlação ESCURO, largo e COMPLETO em 360°",
              "O 'anel do criador' — a marca de quem transmite qualidades",
              "Bishop e Cranstoun liam nele a vocação de matriz do criadouro",
            ]}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", gap: 6, marginTop: 12, fontSize: 11 }}>
          {[["Sinal", "⚡ Voador", "🏆 Reprodutor"], ["Adaptação", "serrilhada agressiva, em relevo", "definida, mais discreta"], ["Correlação", "parcial ou estreita", "completa, 360°, escura"], ["Íris", "vibrante e profunda", "densa, rica, sem falhas"], ["Vocação", "ganhar a prova", "gerar campeões"], ["No app", "score ⚡ Voador alto (aba Analisar)", "score 🏆 Reprodutor alto (aba Analisar)"]].map((linha, i) => (
            <div key={i} style={{ display: "contents" }}>
              {linha.map((cel, j) => (
                <div key={j} style={{ padding: "7px 9px", borderRadius: 8, background: i === 0 ? "#f7bd0022" : "#ffffff08", fontWeight: i === 0 ? 800 : 600, color: i === 0 ? T.gold : T.dim }}>
                  {cel}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* OLHO VIOLETA */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>💜 O Olho Violeta — a joia rara da escola inglesa</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
          <img src="/img/olho-violeta.jpg" alt="Ilustração do olho violeta" onClick={() => setZoom("/img/olho-violeta.jpg")} style={{ width: 230, borderRadius: 12, cursor: "zoom-in", border: "1.5px solid #a78bfa66", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 220, ...T.small, fontSize: 12, lineHeight: 1.85, color: T.dim }}>
            O violeta é o olho <b style={{ color: T.white }}>mais raro</b> do eye-sign: íris de tom <b style={{ color: "#c4b5fd" }}>lilás/lavanda</b>, delicada e luminosa. Os mestres ingleses o tratavam como <b style={{ color: T.white }}>joia de criadouro</b> — a tradição credita ao violeta a condição de reprodutor excepcional, ainda mais difícil de encontrar que o próprio olho de reprodutor clássico.
            <br /><br />
            Na prática: raríssimo, valioso — e, como tudo no eye-sign, <b style={{ color: T.white }}>tradição, não lei</b>. Se um violeta nascer no seu plantel, tire a foto do olho na hora e guarde com carinho. 😄
          </div>
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
        ⚠️ <b>Honestidade de sempre:</b> eye-sign é tradição de criador, sem validação científica fechada — use como <b>mais uma</b> ferramenta de seleção, junto com pedigree, anatomia e, principalmente, resultados de voo. As ilustrações acima são artísticas (geradas a partir de fotos reais de olhos), feitas pra <b>ensinar a enxergar cada círculo</b> — o olho do seu pombo é o juiz final, e é ele que você analisa com a 📸 mira na aba Analisar.
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
   A maior potência da columofilia mundial lê o olho com vocabulário
   próprio: 黄眼 (amarelo), 桃花眼 (flor de pêssego), 牛眼 (boi),
   areias de superfície e fundo, Yin-Yang e olho × clima.
   ══════════════════════════════════════════════════════════════ */

const DICIONARIO_CN: [string, string, string, string][] = [
  ["眼志", "yǎn zhì", "sinal do olho", "o eye-sign inteiro"],
  ["眼砂", "yǎn shā", "areia do olho", "granulação da íris"],
  ["面砂", "miàn shā", "areia da superfície", "camada de CIMA da íris"],
  ["底砂", "dǐ shā", "areia do fundo", "camada de BAIXO da íris"],
  ["黄眼", "huáng yǎn", "olho amarelo", "íris amarelo-ouro"],
  ["砂眼 / 桃花眼", "shā / táo huā yǎn", "olho areia / flor de pêssego", "íris pérola"],
  ["牛眼", "niú yǎn", "olho de boi", "olho preto"],
  ["内线口", "nèi xiàn kǒu", "linha interna", "círculo de adaptação"],
  ["锯齿型眼志", "jù chǐ xíng", "eye-sign serrilhado", "sinal de corrida"],
  ["紫罗兰眼志", "zǐ luó lán", "eye-sign violeta", "olho violeta"],
  ["种鸽", "zhǒng gē", "pombo reprodutor", "score 🏆"],
  ["赛鸽", "sài gē", "pombo de prova", "score ⚡"],
  ["阴阳调和", "yīn yáng tiáo hé", "harmonia Yin-Yang", "acasalamento equilibrado"],
];

const AREIAS_CLIMA: { cn: string; py: string; clima: string; icon: string }[] = [
  { cn: "云砂", py: "yún shā", clima: "voo em dia NUBLADO", icon: "☁️" },
  { cn: "桃红砂", py: "táo hóng shā", clima: "dia nublado", icon: "☁️" },
  { cn: "云桃红砂", py: "yún táo hóng", clima: "meio-termo", icon: "🌥️" },
  { cn: "蓝水桃花", py: "lán shuǐ táo huā", clima: "SOL FORTE", icon: "☀️" },
  { cn: "土红砂", py: "tǔ hóng shā", clima: "dia nublado", icon: "☁️" },
  { cn: "黄底红砂", py: "huáng dǐ hóng", clima: "sol forte", icon: "☀️" },
  { cn: "黄底飘红砂", py: "huáng dǐ piāo hóng", clima: "sol forte", icon: "☀️" },
  { cn: "红砂", py: "hóng shā", clima: "sol forte", icon: "☀️" },
  { cn: "紫砂", py: "zǐ shā", clima: "alto voo (高翔)", icon: "⛰️" },
  { cn: "粗红砂", py: "cū hóng shā", clima: "clima tropical", icon: "🌴" },
  { cn: "油眼砂", py: "yóu yǎn shā", clima: "voo NOTURNO", icon: "🌙" },
];

const CHAVES_MESTRE: { hanzi: string; pinyin: string; nome: string; texto: string }[] = [
  { hanzi: "干", pinyin: "gān", nome: "SECA", texto: "A areia do olho deve estar seca e firme — sinal de pombo maduro, que vê longe e define a rota. Areia aguada, úmida, embaçada: visão turva, pombo que se perde." },
  { hanzi: "紧", pinyin: "jǐn", nome: "FIRME", texto: "Pálpebra colada no globo (nunca frouxa!), areia compacta disposta em raios a partir da pupila, anéis bem presos: vigor físico e reação rápida — o perfil do velocista." },
  { hanzi: "油", pinyin: "yóu", nome: "OLEOSA", texto: "A areia com brilho de óleo: profundo sem ser escuro, vivo sem flutuar — a lenda diz que a grande maioria dos vencedores tem essa camada de 'óleo'. (Não confundir com olho lacrimejando!)" },
  { hanzi: "活", pinyin: "huó", nome: "VIVA", texto: "A pupila gira e treme sem parar, o olho vigia tudo — até um gavião no alto. A areia 'dança' com o tremor. O sinal do pombo inteligente, pronto pra competir E reproduzir." },
  { hanzi: "鲜", pinyin: "xiān", nome: "BRILHANTE", texto: "Cor viva mas sóbria: profunda sem sujeira, clara sem ser pálida. Cor pálida = pombo novo demais ou fraco; cor turva = sem fôlego pra longe." },
];

export function EscolaChinesa() {
  const [zoom, setZoom] = useState<string | null>(null);

  const CartaoTipo = ({ src, cn, py, nome, yinYang, cor, itens }: { src: string; cn: string; py: string; nome: string; yinYang: string; cor: string; itens: string[] }) => (
    <div style={{ flex: 1, minWidth: 250, padding: 12, borderRadius: 12, background: "#ffffff08", border: `1px solid ${cor}44` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: cor }}>{cn} <span style={{ fontSize: 12, fontWeight: 600 }}>{py}</span></div>
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
      {/* INTRODUÇÃO */}
      <section style={T.card}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🇨🇳 A Escola Chinesa — 眼志 (yǎn zhì), o eye-sign do Oriente</div>
        <div style={{ ...T.small, fontSize: 12, lineHeight: 1.85, color: T.dim }}>
          A China é hoje a <b style={{ color: T.white }}>maior potência da columofilia mundial</b>: cerca de <b style={{ color: T.white }}>400 mil criadores registrados</b>, mais de <b style={{ color: T.white }}>25 milhões de anilhas por ano</b> (mais da metade do planeta) e prêmios que passam de <b style={{ color: T.white }}>28 bilhões de yuan</b> por temporada — um campeão já foi leidado por 22 milhões de yuan (cerca de R$ 17 milhões!). E nas leiloeiras chinesas, <b style={{ color: T.white }}>metade da página do pombo é a FOTO DO OLHO</b>: pupila pequena = "mentalidade de luta" para o fundo.
          <br /><br />
          O sistema deles é <b style={{ color: T.white }}>paralelo ao ocidental</b> — mesmos círculos, outra língua: chamam o eye-sign de <b style={{ color: T.white }}>眼志 (yǎn zhì)</b>, dividem a íris em duas camadas (areia de superfície 面砂 e de fundo 底砂) e classificam tudo pelos <b style={{ color: T.white }}>três grandes tipos de olho</b>, regidos pela harmonia Yin-Yang. E a regra deles é a mesma do Barkel: olho sem círculo <i>"pode competir, mas não deve reproduzir"</i>.
        </div>
      </section>

      {/* OS 3 TIPOS */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>☯️ Os Três Grandes Tipos de Olho</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <CartaoTipo
            src="/img/olho-huang.jpg"
            cn="黄眼" py="huáng yǎn"
            nome="Olho Amarelo"
            yinYang="☯️ YIN — 阴 (estável)"
            cor="#f7bd00"
            itens={[
              "O 'guerreiro todo-tempo': estável, resistente, volta mesmo com chuva, neblina e vento contra",
              "Rei das provas de fundo e dos campeonatos de várias etapas",
              "Na tradição: filtra bem o sol forte e passa herança forte (dominante)",
            ]}
          />
          <CartaoTipo
            src="/img/olho-tao.jpg"
            cn="桃花眼" py="táo huā yǎn"
            nome="Olho Flor de Pêssego (areia)"
            yinYang="☯️ YANG — 阳 (veloz)"
            cor="#ff8fa3"
            itens={[
              "O velocista: explosão e ponta em dia de SOL e vento a favor (300–500km)",
              "Areia clara, translúcida e espirituosa — enxerga contraste fino",
              "Tradição: em adversidade pode 'flutuar' (rápido mas volúvel)",
            ]}
          />
          <CartaoTipo
            src="/img/olho-niu.jpg"
            cn="牛眼" py="niú yǎn"
            nome="Olho de Boi (preto)"
            yinYang="🌑 o misterioso"
            cor="#9aa8bc"
            itens={[
              "O todo-preto, imponente — na China é dito 'para o criadouro não erre' (育种不可怪)",
              "Curiosidade científica: é falta de pigmento — os vasos é que aparecem escuros",
              "Cuidado do mestre: olho de pombo DOENTE é escuro e sem brilho — não confundir!",
            ]}
          />
        </div>
      </section>

      {/* O DITADO + YIN YANG */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📜 O ditado millionário & o acasalamento Yin-Yang</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          {/* taijitu dos olhos */}
          <svg viewBox="0 0 120 120" style={{ width: 130, height: 130, flexShrink: 0 }} role="img" aria-label="Símbolo Yin-Yang com olho amarelo e olho flor de pêssego">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#31415a" strokeWidth="2" />
            <path d="M 60 8 A 52 52 0 0 1 60 112 A 26 26 0 0 1 60 60 A 26 26 0 0 0 60 8 Z" fill="#f7bd00" opacity="0.92" />
            <path d="M 60 8 A 52 52 0 0 0 60 112 A 26 26 0 0 0 60 60 A 26 26 0 0 1 60 8 Z" fill="#ff8fa3" opacity="0.88" />
            <circle cx="60" cy="34" r="10" fill="#f8fafc" stroke="#31415a" strokeWidth="1.5" />
            <circle cx="60" cy="34" r="4" fill="#14161a" />
            <circle cx="60" cy="86" r="10" fill="#14161a" stroke="#31415a" strokeWidth="1.5" />
            <circle cx="60" cy="86" r="3.5" fill="#f8fafc" />
          </svg>
          <div style={{ flex: 1, minWidth: 230 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.gold, lineHeight: 1.5, letterSpacing: 0.5 }}>黄眼稳、砂眼快、牛眼育种不可怪</div>
            <div style={{ ...T.small, fontSize: 12, marginTop: 6, lineHeight: 1.7 }}>
              <b style={{ color: T.white }}>"Amarelo é estável, areia é veloz, olho de boi é pro criadouro — e não erre."</b>
              <br />E a recomendação clássica: cruzar <b style={{ color: "#f7bd00" }}>黄 (amarelo/Yin)</b> com <b style={{ color: "#ff8fa3" }}>砂 (areia/Yang)</b> é a <b style={{ color: T.white }}>阴阳调和 (harmonia Yin-Yang)</b> — junta a estabilidade de um com a velocidade do outro, buscando o atleta completo. Soa familiar? É o nosso <b>amarelo × pérola</b> de Barkel — independente inventado, do outro lado do mundo!
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginTop: 12 }}>
          <div style={{ padding: 11, borderRadius: 10, background: "#f7bd0010", border: "1px solid #f7bd0044", fontSize: 11.5, lineHeight: 1.6 }}>
            <b style={{ color: "#f7bd00" }}>黄 × 黄 (Yin + Yin)</b><br />Máxima estabilidade — mas risco de plantel "sem faísca": tudo estima, nada acelera.
          </div>
          <div style={{ padding: 11, borderRadius: 10, background: "#ff8fa310", border: "1px solid #ff8fa344", fontSize: 11.5, lineHeight: 1.6 }}>
            <b style={{ color: "#ff8fa3" }}>砂 × 砂 (Yang + Yang)</b><br />Pura velocidade — mas tradição alerta: "rápido e volúvel", some na primeira adversidade.
          </div>
          <div style={{ padding: 11, borderRadius: 10, background: "#39e58c10", border: "1px solid #39e58c44", fontSize: 11.5, lineHeight: 1.6 }}>
            <b style={{ color: "#39e58c" }}>黄 × 砂 (调和 — harmonia) ⭐</b><br />O cruzamento clássico chinês: estável NA medida e veloz NA medida — o equilíbrio que gera campeões completos.
          </div>
        </div>
      </section>

      {/* OLHO × CLIMA */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 6 }}>🌦️ As Areias e o Clima — o mapa olho × tempo</div>
        <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 10, lineHeight: 1.5 }}>
          Exclusividade da escola chinesa: classificar a areia pelo TEMPO que o pombo prefere voar. Na hora de escalar a equipe, o mestre cruza a previsão do tempo com o mapa abaixo.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: 6 }}>
          {AREIAS_CLIMA.map((a) => (
            <div key={a.cn} style={{ padding: "8px 11px", borderRadius: 9, background: "#ffffff08", fontSize: 11.5, lineHeight: 1.5 }}>
              <b style={{ fontSize: 13 }}>{a.cn}</b> <span style={{ color: T.dim2, fontSize: 10 }}>{a.py}</span>
              <div style={{ color: T.dim, fontSize: 10.5 }}>{a.icon} {a.clima}</div>
            </div>
          ))}
        </div>
        <div style={{ ...T.small, fontSize: 10, marginTop: 8, color: T.dim2 }}>💡 No app: combine com a Rota da Prova (clima real cidade a cidade) pra escalar a equipe pelo olho de cada pombo.</div>
      </section>

      {/* AS 5 CHAVES */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 6 }}>🔑 As chaves do mestre chinês — uma palavra, um critério</div>
        <div style={{ ...T.small, fontSize: 11, color: T.dim, marginBottom: 10, lineHeight: 1.5 }}>
          A tradição chinesa resume o olho campeão num rosário de palavras de UMA sílaba — cada ideograma é um teste completo. Estas são cinco das clássicas:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(215px, 1fr))", gap: 8 }}>
          {CHAVES_MESTRE.map((c) => (
            <div key={c.hanzi} style={{ padding: 12, borderRadius: 12, background: "#ffffff08", border: "1px solid #f7bd0033", display: "flex", gap: 10 }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: T.gold, lineHeight: 1, minWidth: 34, textAlign: "center" }}>{c.hanzi}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800 }}>{c.nome} <span style={{ color: T.dim2, fontSize: 10, fontWeight: 600 }}>{c.pinyin}</span></div>
                <div style={{ ...T.small, fontSize: 10.5, lineHeight: 1.6, marginTop: 3, color: T.dim }}>{c.texto}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DICIONÁRIO */}
      <section style={{ ...T.card, marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📖 Dicionário do criador chinês — 汉字 → português</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 6 }}>
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
        ⚠️ <b>Honestidade também existe na China:</b> nos comentários dos próprios sites chineses, criadores céticos lembram que <b>não há prova científica de que o pigmento do olho se relacione com desempenho</b>, e que o olho de boi é simplesmente falta de pigmento (os vasos aparecendo). É o mesmo debate do Ocidente — o eye-sign é <b>tradição de criador</b>: use junto com pedigree, anatomia e resultado de voo, nunca como veredito. As ilustrações são artísticas (baseadas em fotos reais), pra ensinar a enxergar cada tipo. 🀄👁️
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
