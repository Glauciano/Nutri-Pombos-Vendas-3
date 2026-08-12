"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type QuilhaComprimento = "longa_curva" | "media_padrao" | "curta";
type QuilhaProfundidade = "rasa_aerodinamica" | "media" | "profunda_quilha_alta";
type ForquilhaRigidez = "fechada_rigida" | "firme_leve_abertura" | "aberta_flexivel";
type Baricentro = "equilibrado_frente" | "neutro" | "peso_traseiro";

export default function AnatomiaTrianguloOuro() {
  const [comprimento, setComprimento] = useState<QuilhaComprimento>("longa_curva");
  const [profundidade, setProfundidade] = useState<QuilhaProfundidade>("rasa_aerodinamica");
  const [forquilha, setForquilha] = useState<ForquilhaRigidez>("fechada_rigida");
  const [baricentro, setBaricentro] = useState<Baricentro>("equilibrado_frente");
  const [asaSecundaria, setAsaSecundaria] = useState<boolean>(true); // asa secundária alinhada com as costas

  const analise = useMemo(() => {
    let scoreAnatomico = 40;
    const destaques: string[] = [];

    // 1. Quilha / Esterno
    if (comprimento === "longa_curva") {
      scoreAnatomico += 20;
      destaques.push("Esterno longo e ligeiramente curvado: Oferece ampla área de inserção para os músculos peitorais de voo.");
    } else if (comprimento === "media_padrao") {
      scoreAnatomico += 12;
    }

    if (profundidade === "rasa_aerodinamica") {
      scoreAnatomico += 15;
      destaques.push("Quilha rasa e aerodinâmica: Menor resistência frontal ao vento (reduz o arrasto em voo de velocidade).");
    } else if (profundidade === "media") {
      scoreAnatomico += 10;
    }

    // 2. Forquilha / Ossos Pélvicos
    if (forquilha === "fechada_rigida") {
      scoreAnatomico += 15;
      destaques.push("Forquilha fechada e rígida: Ossos pélvicos fortes sem flexibilidade ao toque. Vital para suportar a tensão abdominal em maratonas.");
    } else if (forquilha === "firme_leve_abertura") {
      scoreAnatomico += 10;
    }

    // 3. Baricentro
    if (baricentro === "equilibrado_frente") {
      scoreAnatomico += 10;
      destaques.push("Baricentro projetado à frente ('Pombo que flutua na mão'): O peso da massa peitoral puxa levemente para a frente sem desequilibrar a cauda.");
    }

    // 4. Asa secundária
    if (asaSecundaria) {
      scoreAnatomico += 10;
      destaques.push("Asa secundária larga cobrindo o lombo: Evita turbulência e perda de ar entre o corpo e a asa em voo planado.");
    }

    const total = Math.min(100, Math.max(15, scoreAnatomico));

    let classificacao = "ATLETA INTERMEDIÁRIO / PLANTEL GERAL";
    let cor = "#3B82F6";
    let vocacaoEsportiva = "Apto para provas de Velocidade e Meio Fundo em condições climáticas normais.";

    if (total >= 90) {
      classificacao = "💎 ESTRUTURA DE DIAMANTE / MARATONISTA DE ELITE";
      cor = "#EAB308";
      vocacaoEsportiva =
        "Anatomia de classe mundial! Quilha perfeita unida à forquilha inflexível com excelente equilíbrio. Atleta ideal para provas de Fundo Extremo (> 700 km) e reprodução de linhagem.";
    } else if (total >= 75) {
      classificacao = "🏆 ESTRUTURA DE OURO / ATLETA COMPETITIVO";
      cor = "#22C55E";
      vocacaoEsportiva =
        "Excelente conformação física com baixo arrasto aerodinâmico. Especialista para disputar pódios em Meio Fundo (300–500 km).";
    } else if (total < 55) {
      classificacao = "⚠️ ESTRUTURA FRÁGIL / ALERTA BIOMECÂNICO";
      cor = "#EF4444";
      vocacaoEsportiva =
        "Forquilha aberta ou quilha profunda com peso traseiro. Risco elevado de exaustão muscular e cãibras abdominais em ventos contrários.";
    }

    return {
      total,
      classificacao,
      cor,
      vocacaoEsportiva,
      destaques,
    };
  }, [comprimento, profundidade, forquilha, baricentro, asaSecundaria]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>⚖️ Triângulo de Ouro Anatômico (Quilha, Forquilha & Baricentro)</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Guia oficial de avaliação física do pombo na mão conforme os critérios dos juízes belgas e holandeses
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 14 }}>
            🔍 Avaliação Física Corporal (Inspeção na Mão)
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={T.label}>1. Comprimento do Esterno (Quilha)</label>
              <div style={{ display: "grid", gap: 6 }}>
                {([
                  ["longa_curva", "⭐ Longa & Ligeiramente Curvada"],
                  ["media_padrao", "✅ Comprimento Médio"],
                  ["curta", "⚠️ Curta (Pouca inserção muscular)"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setComprimento(val)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: comprimento === val ? T.gold : T.bgInput,
                      color: comprimento === val ? T.bg : T.dim,
                      border: `1px solid ${comprimento === val ? T.gold : T.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={T.label}>2. Profundidade da Quilha (Arrasto)</label>
              <div style={{ display: "grid", gap: 6 }}>
                {([
                  ["rasa_aerodinamica", "⭐ Rasa & Aerodinâmica"],
                  ["media", "✅ Profundidade Média"],
                  ["profunda_quilha_alta", "⚠️ Quilha Alta / Profunda (Maior arrasto)"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setProfundidade(val)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: profundidade === val ? T.gold : T.bgInput,
                      color: profundidade === val ? T.bg : T.dim,
                      border: `1px solid ${profundidade === val ? T.gold : T.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={T.label}>3. Rigidez da Forquilha (Ossos Pélvicos)</label>
              <div style={{ display: "grid", gap: 6 }}>
                {([
                  ["fechada_rigida", "⭐ Fechada, Rígida & Inflexível"],
                  ["firme_leve_abertura", "✅ Firme com Leve Espaço"],
                  ["aberta_flexivel", "🚨 Aberta / Flexível ao Toque"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setForquilha(val)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: forquilha === val ? T.gold : T.bgInput,
                      color: forquilha === val ? T.bg : T.dim,
                      border: `1px solid ${forquilha === val ? T.gold : T.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={T.label}>4. Equilíbrio Corporal (Baricentro)</label>
              <div style={{ display: "grid", gap: 6 }}>
                {([
                  ["equilibrado_frente", "⭐ 'Flutua na Mão' (Frente equilibrada)"],
                  ["neutro", "✅ Equilíbrio Neutro"],
                  ["peso_traseiro", "⚠️ Cauda Pesada / Traseiro Baixo"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setBaricentro(val)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: baricentro === val ? T.gold : T.bgInput,
                      color: baricentro === val ? T.bg : T.dim,
                      border: `1px solid ${baricentro === val ? T.gold : T.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={asaSecundaria}
                onChange={(e) => setAsaSecundaria(e.target.checked)}
              />
              <span>🪶 <b>Asa Secundária Larga & Alinhada:</b> As penas secundárias cobrem totalmente o lombo sem vazamento de ar</span>
            </label>
          </div>
        </section>

        <section
          style={{
            ...T.card,
            border: `2px solid ${analise.cor}`,
            background: `${analise.cor}0f`,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: analise.cor, textTransform: "uppercase" }}>
                LAUDO DE CONFORMAÇÃO ANATÔMICA
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: T.white, marginTop: 4 }}>
                {analise.classificacao}
              </div>
              <div style={{ fontSize: 13, color: analise.cor, fontWeight: 800, marginTop: 6 }}>
                📢 Vocação Esportiva: {analise.vocacaoEsportiva}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: analise.cor }}>
                {analise.total}%
              </div>
              <div style={{ fontSize: 11, color: T.dim }}>Índice Anatômico (Triângulo de Ouro)</div>
            </div>
          </div>

          {analise.destaques.length > 0 && (
            <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "#ffffff0a", fontSize: 13 }}>
              <b style={{ color: analise.cor }}>💡 Pontos Fortes da Biomecânica Corporal:</b>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {analise.destaques.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
            📖 O Segredo dos Juízes Belgas: Como Avaliar o Pombo na Mão
          </div>
          <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.8 }}>
            • <b>A Quilha (Esterno):</b> Deve se estender suavemente sem pontas agudas ou curvaturas irregulares. Quanto mais longa a quilha em relação ao tamanho da ave, maior o volume da musculatura peitoral que impulsiona o voo.
            <br />
            • <b>A Forquilha (Ossos Pélvicos):</b> É a distância entre a ponta traseira da quilha e os dois ossos pélvicos. Em um atleta de maratona, esses ossos devem ser duros, curtos e estar o mais próximos possível da quilha, sem ceder à pressão do dedo.
            <br />• <b>O Baricentro:</b> Um pombo equilibrado não pende a cauda para baixo quando segurado na mão; ele deve parecer "leve" em relação ao seu volume, flutuando com o peito projetado.
          </div>
        </section>
      </div>
    </main>
  );
}
