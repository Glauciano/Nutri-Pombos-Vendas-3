"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type Pupila = "puntiforme" | "media" | "larga";
type Circulo = "serrilhado_largo" | "completo_fino" | "incompleto" | "ausente";
type IrisCor = "amarelo_ouro" | "perola_prata" | "violeta_vermelho" | "castanho";
type Granulacao = "rugosa_3d" | "media" | "lisa";
type AnelSaude = "preto_forte" | "cinza_claro" | "indefinido";

export default function AnaliseOlhoPombo() {
  const [pupila, setPupila] = useState<Pupila>("puntiforme");
  const [circulo, setCirculo] = useState<Circulo>("serrilhado_largo");
  const [iris, setIris] = useState<IrisCor>("amarelo_ouro");
  const [granulacao, setGranulacao] = useState<Granulacao>("rugosa_3d");
  const [anelSaude, setAnelSaude] = useState<AnelSaude>("preto_forte");

  const analise = useMemo(() => {
    let ptsReprodutor = 50;
    let ptsVoador = 50;

    // 1. Pupila
    if (pupila === "puntiforme") {
      ptsReprodutor += 15;
      ptsVoador += 20;
    } else if (pupila === "media") {
      ptsReprodutor += 10;
      ptsVoador += 10;
    }

    // 2. Círculo de Adaptação
    if (circulo === "serrilhado_largo") {
      ptsReprodutor += 25;
      ptsVoador += 15;
    } else if (circulo === "completo_fino") {
      ptsReprodutor += 10;
      ptsVoador += 15;
    }

    // 3. Granulação da Esclerótica
    if (granulacao === "rugosa_3d") {
      ptsReprodutor += 15;
      ptsVoador += 10;
    } else if (granulacao === "media") {
      ptsReprodutor += 10;
      ptsVoador += 10;
    }

    // 4. Anel de Saúde
    if (anelSaude === "preto_forte") {
      ptsReprodutor += 10;
      ptsVoador += 15;
    }

    const scoreReprodutor = Math.min(100, Math.max(10, ptsReprodutor));
    const scoreVoador = Math.min(100, Math.max(10, ptsVoador));

    let classificacao = "Atleta Balanceado / Intermediário";
    let cor = "#3B82F6";
    let desc = "Pombo funcional com boa visão e equilíbrio entre esclerótica e íris.";

    if (scoreReprodutor >= 88) {
      classificacao = "⭐ MATRIZ DE OURO / REPRODUTOR DE ELITE";
      cor = "#EAB308";
      desc =
        "Círculo de correlação extremamente bem definido e serrilhado em 3D. Olho altamente valorizado para fixar linhagem campeã e transferir orientação magnética aos filhotes!";
    } else if (scoreVoador >= 88) {
      classificacao = "🏆 VOADOR DE ELITE / NAVEGADOR DE MARATONA";
      cor = "#22C55E";
      desc =
        "Pupila puntiforme ultrarreagente com excelente anel de saúde. Máxima resistência visual contra o sol frontal em provas de meio fundo e fundo extremo.";
    }

    let recomendacaoCruzamento = "Cruzar com olho Pérola Prata para buscar contraste de pigmentação na linhagem.";
    if (iris === "amarelo_ouro") {
      recomendacaoCruzamento = "Ideal cruzar com olho Pérola ou Violeta (Evitar acasalar Ouro x Ouro por mais de 3 gerações).";
    } else if (iris === "perola_prata") {
      recomendacaoCruzamento = "Perfeito para acasalar com pombos de íris Amarelo Ouro ou Pechblenda rica em grãos escuros.";
    }

    return {
      scoreReprodutor,
      scoreVoador,
      classificacao,
      cor,
      desc,
      recomendacaoCruzamento,
    };
  }, [pupila, circulo, iris, granulacao, anelSaude]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>👁️ Análise de Olho de Pombo (Eye-Sign Theory)</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Teoria do Círculo de Adaptação e Esclerótica para selecionar matrizes de ouro e grandes voadores
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 14 }}>
            🔍 Características Visuais do Olho do Pombo
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={T.label}>1. Pupila (Reatividade & Tamanho)</label>
              <div style={{ display: "flex", gap: 6 }}>
                {([
                  ["puntiforme", "⚡ Puntiforme (Pequena)"],
                  ["media", "👁️ Média Normal"],
                  ["larga", "⚠️ Larga / Dilatada"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setPupila(val)}
                    style={{
                      flex: 1,
                      padding: "8px 6px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: pupila === val ? T.gold : T.bgInput,
                      color: pupila === val ? T.bg : T.dim,
                      border: `1px solid ${pupila === val ? T.gold : T.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={T.label}>2. Círculo de Adaptação (Correlação)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {([
                  ["serrilhado_largo", "⭐ Largo & Serrilhado"],
                  ["completo_fino", "✅ Completo & Fino"],
                  ["incompleto", "⚠️ Incompleto"],
                  ["ausente", "❌ Ausente / Liso"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setCirculo(val)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: circulo === val ? T.gold : T.bgInput,
                      color: circulo === val ? T.bg : T.dim,
                      border: `1px solid ${circulo === val ? T.gold : T.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={T.label}>3. Pigmentação da Íris</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {([
                  ["amarelo_ouro", "🟡 Amarelo Ouro / Pechblenda"],
                  ["perola_prata", "⚪ Pérola / Prata"],
                  ["violeta_vermelho", "🟣 Violeta / Vermelho"],
                  ["castanho", "🟤 Castanho Escuro"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setIris(val)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: iris === val ? T.gold : T.bgInput,
                      color: iris === val ? T.bg : T.dim,
                      border: `1px solid ${iris === val ? T.gold : T.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={T.label}>4. Granulação Esclerótica (Relevo)</label>
              <div style={{ display: "flex", gap: 6 }}>
                {([
                  ["rugosa_3d", "🏔️ Rugosa em 3D"],
                  ["media", "📊 Rugosidade Média"],
                  ["lisa", "⚠️ Lisa / Plana"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setGranulacao(val)}
                    style={{
                      flex: 1,
                      padding: "8px 6px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: granulacao === val ? T.gold : T.bgInput,
                      color: granulacao === val ? T.bg : T.dim,
                      border: `1px solid ${granulacao === val ? T.gold : T.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
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
                RESULTADO DO LAUDO OCULAR
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: T.white, marginTop: 4 }}>
                {analise.classificacao}
              </div>
              <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>{analise.desc}</div>
            </div>

            <div style={{ display: "flex", gap: 16, textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: T.gold }}>{analise.scoreReprodutor}%</div>
                <div style={{ fontSize: 11, color: T.dim }}>Aptidão Matriz</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#22C55E" }}>{analise.scoreVoador}%</div>
                <div style={{ fontSize: 11, color: T.dim }}>Aptidão Voador</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "#ffffff0a", fontSize: 13 }}>
            💡 <b>Dica de Cruzamento Espectral:</b> {analise.recomendacaoCruzamento}
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
            📖 Entendendo as Zonas do Olho na Columbofilia
          </div>
          <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.8 }}>
            • <b>A Pupila Puntiforme:</b> Em pombos-correio de alta performance, a pupila deve ser pequena e reagir instantaneamente à luz solar, garantindo foco em longa distância e reduzindo a fadiga visual.
            <br />
            • <b>O Círculo de Adaptação:</b> É o anel que envolve a pupila. Quando largo e serrilhado em relevo, indica altíssima capacidade de reprodução e fixação das linhas magnéticas de orientação.
            <br />• <b>Íris & Esclerótica:</b> A riqueza em granulação (relevo montanhoso) evidencia vitalidade e resistência circulatória do atleta.
          </div>
        </section>
      </div>
    </main>
  );
}
