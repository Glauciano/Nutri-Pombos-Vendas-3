"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type NivelKp = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export default function RadarGeomagnetico() {
  const [kp, setKp] = useState<NivelKp>(1);
  const [ceuSol, setCeuSol] = useState<boolean>(true); // sol visível ajuda a compensar

  const analise = useMemo(() => {
    let status = "✅ MAGNETOSFERA CALMA / NORMAL";
    let cor = "#22C55E";
    let scoreSeguranca = 100;
    let acaoOficial = "SOLTURA AUTORIZADA PARA TODAS AS CATEGORIAS";
    let impactoNavegacao =
      "As linhas do campo magnético terrestre estão estáveis. O sistema de magnetorrecepção da ave opera com 100% de precisão.";

    if (kp >= 7) {
      status = "🚨 TEMPESTADE GEOMAGNÉTICA EXTREMA / APAGÃO MAGNÉTICO";
      cor = "#EF4444";
      scoreSeguranca = ceuSol ? 20 : 5;
      acaoOficial = "PROIBIDA A SOLTURA / CANCELAR OU ADIAR CONCURSO";
      impactoNavegacao =
        "Erupções solares de classe X/M estão atingindo a Terra. Os cristais de magnetita no bico do pombo ficam completamente desorientados, resultando em perdas catastróficas acima de 65% do pelotão!";
    } else if (kp === 5 || kp === 6) {
      status = "🚨 TEMPESTADE GEOMAGNÉTICA MODERADA (G1–G2)";
      cor = "#F97316";
      scoreSeguranca = ceuSol ? 45 : 25;
      acaoOficial = "ALERTA SEVERO — NÃO SOLTAR BORRACHOS E AVES INEXPERIENTES";
      impactoNavegacao =
        "Forte instabilidade na ionosfera. Aves adultas experientes terão dificuldade em traçar o azimute inicial, resultando em horas extras de voo e cansaço extremo.";
    } else if (kp === 3 || kp === 4) {
      status = "⚠️ INSTABILIDADE MAGNÉTICA MODERADA";
      cor = "#EAB308";
      scoreSeguranca = ceuSol ? 82 : 60;
      acaoOficial = "ATENÇÃO NO LOCAL DE SOLTURA — SOLTAR APENAS COM SOL VISÍVEL";
      impactoNavegacao =
        "Pequenas oscilações magnéticas. A presença de sol visível permite que os pombos combinem a bússola solar com a bússola magnética, minimizando o risco de extravio.";
    }

    return {
      status,
      cor,
      scoreSeguranca,
      acaoOficial,
      impactoNavegacao,
    };
  }, [kp, ceuSol]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🌤️ Radar de Índice K-Geomagnético & Tempestades Solares</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Monitore a atividade solar e o índice Kp para evitar perdas catastróficas por desorientação magnética
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        <section style={T.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>
              📡 Seletor de Índice Kp (Atividade Geomagnética — de 0 a 9):
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={ceuSol}
                onChange={(e) => setCeuSol(e.target.checked)}
              />
              <span>☀️ Sol Visível no Local da Soltura</span>
            </label>
          </div>

          <p style={{ ...T.small, marginBottom: 16 }}>
            Selecione o nível Kp previsto pelos satélites espaciais (NOAA / Space Weather) para o horário da prova:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6, marginBottom: 16 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => {
              const num = val as NivelKp;
              const isSelected = kp === num;
              let btnColor = "#22C55E";
              if (num >= 7) btnColor = "#EF4444";
              else if (num >= 5) btnColor = "#F97316";
              else if (num >= 3) btnColor = "#EAB308";

              return (
                <button
                  key={num}
                  onClick={() => setKp(num)}
                  style={{
                    padding: "14px 4px",
                    borderRadius: 10,
                    textAlign: "center",
                    cursor: "pointer",
                    background: isSelected ? btnColor : T.bgInput,
                    color: isSelected ? "#111" : T.white,
                    border: `2px solid ${isSelected ? btnColor : T.border}`,
                    fontWeight: 900,
                    fontSize: 16,
                  }}
                >
                  <div>Kp {num}</div>
                  <div style={{ fontSize: 9, opacity: 0.8, marginTop: 4 }}>
                    {num <= 2 ? "Calmo" : num <= 4 ? "Instável" : "Tempestade"}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setKp(1)} style={{ ...T.btnGhost, fontSize: 11, color: "#22C55E" }}>
              ✅ Kp 1 (Condição Ideal)
            </button>
            <button onClick={() => setKp(4)} style={{ ...T.btnGhost, fontSize: 11, color: "#EAB308" }}>
              ⚠️ Kp 4 (Alerta Moderado)
            </button>
            <button onClick={() => setKp(6)} style={{ ...T.btnGhost, fontSize: 11, color: "#EF4444" }}>
              🚨 Kp 6+ (Tempestade Geomagnética)
            </button>
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
                DIAGNÓSTICO DA MAGNETOSFERA
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: T.white, marginTop: 4 }}>
                {analise.status}
              </div>
              <div style={{ fontSize: 13, color: analise.cor, fontWeight: 800, marginTop: 6 }}>
                📢 Ação Recomendada: {analise.acaoOficial}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: analise.cor }}>
                {analise.scoreSeguranca}%
              </div>
              <div style={{ fontSize: 11, color: T.dim }}>Índice de segurança na navegação</div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "#ffffff0a", fontSize: 13, lineHeight: 1.5 }}>
            💡 <b>Parecer Geobiológico:</b> {analise.impactoNavegacao}
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
            📖 Como o Sol e a Magnetosfera Afetam o Pombo-Correio
          </div>
          <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.8 }}>
            • <b>A Bússola de Magnetita:</b> Os pombos-correio possuem cristais de magnetita natural localizados na base do bico e no ouvido interno. Essa bússola biológica lê a inclinação das linhas magnéticas terrestres para saber exatamente a direção do pombal.
            <br />
            • <b>Erupções Solares (CME):</b> Quando o Sol emite ejeções de massa coronal em direção à Terra, o campo magnético vibra intensamente, fazendo com que o pombo perca a referência magnética.
            <br />• <b>A Bússola Solar:</b> Em dias com o Índice Kp entre 3 e 4, a presença de <b>sol visível</b> é fundamental, pois permite que a ave utilize a posição do sol (relógio solar biológico) para corrigir o desvio magnético.
          </div>
        </section>
      </div>
    </main>
  );
}
