"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * 🧠 Quiz do Eye-Sign — treine o olho de criador.
 * Banco de ~14 perguntas sobre a teoria dos 5 círculos (Barkel) e regras de acasalamento.
 * Recorde guardado na gaveta "nutripombos-quiz-eyesign-v1".
 */
const KEY = "nutripombos-quiz-eyesign-v1";

type Q = { pergunta: string; opcoes: string[]; correta: number; explica: string };

const BANCO: Q[] = [
  {
    pergunta: "Quantos 'círculos' a análise clássica do eye-sign (Escher/Barkel) enxerga no olho do pombo?",
    opcoes: ["2", "3", "5", "7"],
    correta: 2,
    explica: "São 5 círculos concêntricos: pupila, círculo de adaptação, círculo de correlação, círculo da saúde e a íris (o 'campo' colorido).",
  },
  {
    pergunta: "Qual círculo fica logo ao redor da pupila e muda de tamanho com a luz?",
    opcoes: ["Círculo de correlação", "Círculo de adaptação", "Círculo da saúde", "Íris"],
    correta: 1,
    explica: "O círculo de adaptação abraça a pupila e contrai/dilata conforme a luminosidade — quanto mais rápido reage, mais 'nervoso' e pronto o atleta.",
  },
  {
    pergunta: "O 'círculo de correlação' (o mais falado pelos criadores) costuma indicar...",
    opcoes: ["a cor das penas", "qualidade de reprodutor", "a idade do pombo", "o sexo do pombo"],
    correta: 1,
    explica: "A tradição credita ao círculo de correlação (dentro da íris) a leitura de reprodução: completo, largo e bem definido = transmissor de qualidades pros filhos.",
  },
  {
    pergunta: "Na regra clássica de acasalamento por olho, cruzar olhos IGUAIS (ex: amarelo intenso × amarelo intenso) é considerado...",
    opcoes: ["o ideal, sempre", "neutro", "ruim — perde vigor", "proibido"],
    correta: 2,
    explica: "A regra tradicional manda combinar olhos COMPLEMENTARES: olhos iguais demais 'fecham' a combinação e, na tradição, perdem vigor de cria.",
  },
  {
    pergunta: "A combinação clássica recomendada é...",
    opcoes: ["amarelo × pérola", "amarelo × amarelo", "pérola × pérola", "laranja × laranja"],
    correta: 0,
    explica: "Amarelo (forte, pigmentado) × pérola (claro) é o casamento clássico: um completa o que falta no outro, na tradição do eye-sign.",
  },
  {
    pergunta: "Pupila pequena e reativa à luz, na tradição, indica pombo...",
    opcoes: ["lento de viagem", "de fundo/extremo", "nervoso e veloz", "reprodutor apenas"],
    correta: 2,
    explica: "Pupila pequena que responde rápido à luz = sistema nervoso afiado, associado aos velocistas.",
  },
  {
    pergunta: "Uma pupila GRANDE e pouco reativa é tradicionalmente associada a...",
    opcoes: ["campeãs de velocidade", "pombos de vida longa em prova (fundo)", "machos apenas", "defeito eliminator"],
    correta: 1,
    explica: "A tradição liga pupila maior/mais calma aos pombos de fundo — o 'ritmo de maratonista'. Não é defeito: é perfil.",
  },
  {
    pergunta: "O 'círculo da saúde' (mais externo, na borda do olho) quando largo e rosado/forte sugere...",
    opcoes: ["pombo doente", "boa condição física e vitalidade", "pombo muito novo", "pombo estéril"],
    correta: 1,
    explica: "A margem externa é o 'termômetro' da condição: cheia e bem colorida = pombo em forma; pálida ou interrompida = atenção no manejo.",
  },
  {
    pergunta: "Olho de cor 'pérola' é aquele que...",
    opcoes: ["tem tom azulado/acizentado claro", "é totalmente preto", "tem pintas de sangue", "muda de cor por estação"],
    correta: 0,
    explica: "Pérola (ou 'branco de pérola') é o olho de pigmentação clara, acinzentada/azulada — a base do clássico amarelo × pérola.",
  },
  {
    pergunta: "'Serrilhado' ou 'quebra' na íris, cheio de relevos, na tradição indica...",
    opcoes: ["pombo com problema ocular", "riqueza de 'sangue' — bom reprodutor", "pombo velho", "erro de leitura"],
    correta: 1,
    explica: "Íris com relevo, montanhas e vales é tradicionalmente sinal de pombo 'cheio de sangue' — associado a reprodução de campeões.",
  },
  {
    pergunta: "A regra prática de olho na mão: avalie o eye-sign...",
    opcoes: ["em foto de celular com flash", "sob sol forte direto", "na sombra ou luz difusa, girando o pombo", "de noite"],
    correta: 2,
    explica: "Luz difusa (sombra) e girando devagar o pombo pra achar o ângulo: é assim que se enxergam os círculos sem ofuscar nem contrair tudo.",
  },
  {
    pergunta: "Olho 'cheio de cor' (muito pigmentado na íris) na tradição é associado a...",
    opcoes: ["velocidade e força", "doença", "fêmeas apenas", "nada — cor é só estética"],
    correta: 0,
    explica: "Pigmentação intensa e distribuída = na tradição, pombo de velocidade e fibra. A ciência discute, mas o criador antigo jurava por ela.",
  },
  {
    pergunta: "Dois olhos do MESMO pombo podem ter círculos de correlação diferentes?",
    opcoes: ["Não, nunca", "Sim, e a tradição manda ler os dois", "Só em fêmeas", "Só em pombos de 3+ anos"],
    correta: 1,
    explica: "Sim! Olho esquerdo e direito podem diferir — a tradição manda avaliar os dois (e alguns juram que um olho 'conta' a velocidade e o outro a reprodução).",
  },
  {
    pergunta: "Sobre eye-sign, a atitude cientificamente honesta é:",
    opcoes: ["é lei comprovada em laboratório", "é tradição de criador: guia, mas não garante", "é superstição inútil", "só vale para pombos belgas"],
    correta: 1,
    explica: "Exato: o eye-sign é conhecimento tradicional, sem prova científica fechada. Serve como MAIS uma ferramenta de seleção — junto com pedigree, anatomia e, principalmente, resultados de voo.",
  },
];

type Progresso = { recorde: number; rodadas: number };

function carregar(): Progresso {
  try { const d = JSON.parse(localStorage.getItem(KEY) || "{}"); return { recorde: Number(d.recorde) || 0, rodadas: Number(d.rodadas) || 0 }; } catch { return { recorde: 0, rodadas: 0 }; }
}

const embaralhar = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function QuizEyeSign() {
  const [prog, setProg] = useState<Progresso>({ recorde: 0, rodadas: 0 });
  const [rodada, setRodada] = useState<Q[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [fim, setFim] = useState(false);

  const q = rodada?.[idx];

  const iniciar = () => {
    setRodada(embaralhar(BANCO).slice(0, 8));
    setIdx(0);
    setEscolha(null);
    setAcertos(0);
    setFim(false);
  };

  const responder = (i: number) => {
    if (escolha !== null || !q) return;
    setEscolha(i);
    if (i === q.correta) setAcertos((a) => a + 1);
  };

  const avancar = () => {
    if (!rodada) return;
    if (idx + 1 >= rodada.length) {
      const final = acertos;
      const novo: Progresso = { recorde: Math.max(final, prog.recorde), rodadas: prog.rodadas + 1 };
      setProg(novo);
      try { localStorage.setItem(KEY, JSON.stringify(novo)); } catch { /* ignora */ }
      setFim(true);
    } else {
      setIdx((i) => i + 1);
      setEscolha(null);
    }
  };

  const medalha = useMemo(() => {
    if (!rodada) return null;
    const pct = acertos / rodada.length;
    if (pct === 1) return { t: "🏆 OLHO DE MESTRE!", c: T.gold, d: "Acerto total — você lê olho como criador antigo." };
    if (pct >= 0.75) return { t: "🥈 Olho afiado!", c: T.green, d: "Já enxerga os círculos — falta pouca lapidação." };
    if (pct >= 0.5) return { t: "🥉 No caminho", c: T.blue, d: "Metade acertada — revisa a aba Teoria da Análise de Olho." };
    return { t: "📚 Hora de estudar", c: T.orange, d: "Abra a Análise de Olho → aba Teoria e depois volte pra vingança!" };
  }, [fim, acertos, rodada]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🧠 Quiz do Eye-Sign</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Treine o olho de criador: 8 perguntas por rodada, explicação na hora. O mestre dos olhos não nasce — treina!</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {/* RECORDE */}
        <div style={{ ...T.card, marginBottom: 14, display: "flex", justifyContent: "space-around", textAlign: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: T.gold }}>{prog.recorde}/8</div>
            <div style={{ ...T.small, fontSize: 10 }}>seu recorde</div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: T.blue }}>{prog.rodadas}</div>
            <div style={{ ...T.small, fontSize: 10 }}>rodadas jogadas</div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: T.green }}>14</div>
            <div style={{ ...T.small, fontSize: 10 }}>perguntas no pote</div>
          </div>
        </div>

        {/* INÍCIO */}
        {!rodada && (
          <div style={{ ...T.card, textAlign: "center", padding: 30 }}>
            <div style={{ fontSize: 44 }}>👁️</div>
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 8, marginBottom: 4 }}>Pronto pro teste do olho?</div>
            <div style={{ ...T.small, fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>8 perguntas sorteadas, resposta na hora com explicação.<br />Dica: estude antes em <Link href="/centro-provas/olho" style={{ color: T.blue }}>Análise de Olho (Eye-Sign) →</Link></div>
            <button onClick={iniciar} style={{ ...T.btn, maxWidth: 280, margin: "0 auto" }}>▶️ Começar rodada</button>
          </div>
        )}

        {/* PERGUNTA */}
        {rodada && !fim && q && (
          <div style={T.card}>
            <div style={{ display: "flex", justifyContent: "space-between", ...T.small, fontSize: 11, marginBottom: 12 }}>
              <span style={{ color: T.dim }}>Pergunta {idx + 1} de {rodada.length}</span>
              <span style={{ color: T.green, fontWeight: 800 }}>✅ {acertos}</span>
            </div>
            <div style={{ height: 5, borderRadius: 4, background: "#ffffff12", marginBottom: 16 }}>
              <div style={{ height: "100%", borderRadius: 4, background: T.gold, width: `${((idx + (escolha !== null ? 1 : 0)) / rodada.length) * 100}%`, transition: "width .3s" }} />
            </div>

            <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.5, marginBottom: 16 }}>{q.pergunta}</div>

            <div style={{ display: "grid", gap: 8 }}>
              {q.opcoes.map((op, i) => {
                const certa = i === q.correta;
                const escolhida = escolha === i;
                let estilo: React.CSSProperties = { ...T.btnGhost, textAlign: "left", fontWeight: 700, fontSize: 13, cursor: "pointer" };
                if (escolha === null) estilo = { ...estilo, color: T.white };
                else if (certa) estilo = { ...estilo, borderColor: T.green, background: `${T.green}22`, color: T.green };
                else if (escolhida) estilo = { ...estilo, borderColor: T.red, background: `${T.red}22`, color: T.red };
                else estilo = { ...estilo, opacity: 0.5 };
                return (
                  <button key={i} onClick={() => responder(i)} disabled={escolha !== null} style={estilo}>
                    {escolha !== null && certa && "✅ "}{escolha !== null && escolhida && !certa && "❌ "}{op}
                  </button>
                );
              })}
            </div>

            {escolha !== null && (
              <div style={{ marginTop: 14, padding: 13, borderRadius: 10, background: escolha === q.correta ? `${T.green}12` : `${T.orange}12`, border: `1px solid ${escolha === q.correta ? T.green : T.orange}44` }}>
                <b style={{ fontSize: 12.5, color: escolha === q.correta ? T.green : T.orange }}>{escolha === q.correta ? "✅ Acertou!" : "❌ Essa passou batendo..."}</b>
                <div style={{ ...T.small, fontSize: 12, lineHeight: 1.7, marginTop: 5 }}>{q.explica}</div>
                <button onClick={avancar} style={{ ...T.btn, marginTop: 10 }}>{idx + 1 >= rodada.length ? "🏁 Ver resultado" : "Próxima ➜"}</button>
              </div>
            )}
          </div>
        )}

        {/* FIM */}
        {rodada && fim && medalha && (
          <div style={{ ...T.card, textAlign: "center", padding: 30, borderColor: `${medalha.c}66` }}>
            <div style={{ fontSize: 40 }}>👁️</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: medalha.c, marginTop: 6 }}>{acertos}/{rodada.length}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: medalha.c, marginTop: 6 }}>{medalha.t}</div>
            <div style={{ ...T.small, fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>{medalha.d}</div>
            {acertos > prog.recorde - 0 && acertos >= prog.recorde && acertos > 0 && (
              <div style={{ display: "inline-block", marginTop: 10, padding: "4px 14px", borderRadius: 999, background: `${T.gold}22`, color: T.gold, fontWeight: 900, fontSize: 12 }}>
                ⭐ novo recorde!
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={iniciar} style={{ ...T.btn, maxWidth: 240 }}>🔁 Jogar de novo</button>
              <Link href="/centro-provas/olho" style={{ ...T.btnGhost, textDecoration: "none", fontWeight: 800, display: "inline-flex", alignItems: "center" }}>📖 Estudar Eye-Sign</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
