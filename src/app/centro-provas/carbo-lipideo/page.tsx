"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

export default function CarboLipideo() {
  const [distanciaKm, setDistanciaKm] = useState<number>(400);
  const [temperatura, setTemperatura] = useState<number>(25);

  const analise = useMemo(() => {
    let pctCarbo = 80; // milho, ervilha, sorgo, trigo
    let pctGordura = 20; // amendoim, girassol, cártamo, linhaça
    let categoria = "Velocidade / Sprint (Até 300 km)";
    let cor = "#38bdf8";
    let descMetabolica =
      "O pombo utilizará predominantemente o glicogênio (carboidrato) armazenado nas fibras brancas do peito. Combustível explosivo para voos de até 2 horas.";

    if (distanciaKm > 700) {
      pctCarbo = 45;
      pctGordura = 55;
      categoria = "Fundo Extremo / Maratona (> 700 km)";
      cor = "#EF4444";
      descMetabolica =
        "Após 90 minutos de voo, a ave esgota a glicose do peito e passa a queimar exclusivamente ÁCIDOS GRAXOS (gordura). Sem suprimento lipídico nos dias anteriores, o pombo queima a própria proteína muscular (peito seco)!";
    } else if (distanciaKm > 450) {
      pctCarbo = 58;
      pctGordura = 42;
      categoria = "Fundo (450–700 km)";
      cor = "#F97316";
      descMetabolica =
        "Prova de alta exigência calórica. A mistura deve equilibrar carboidratos para o sprint final com alta densidade de lipídeos para sustentar mais de 6 horas de voo.";
    } else if (distanciaKm > 280) {
      pctCarbo = 70;
      pctGordura = 30;
      categoria = "Meio Fundo (280–450 km)";
      cor = "#EAB308";
      descMetabolica =
        "Combinação clássica de glicogênio muscular com carga moderada de sementes oleaginosas leves na quinta e sexta-feira.";
    }

    // Ajuste térmico
    if (temperatura >= 30) {
      descMetabolica += " ⚠️ CALOR INTENSO: Evitar ervilhas/soja pesadas (a digestão de proteína gera calor endógeno excessivo).";
    }

    // Sugestão prática de gramas por pombo (base de 35g de ração diária nas 48h pré-prova)
    const racaoBaseDia = 35;
    const gramasCarbo = Math.round((racaoBaseDia * pctCarbo) / 100);
    const gramasGordura = racaoBaseDia - gramasCarbo;

    return {
      pctCarbo,
      pctGordura,
      categoria,
      cor,
      descMetabolica,
      gramasCarbo,
      gramasGordura,
      racaoBaseDia,
    };
  }, [distanciaKm, temperatura]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🧪 Calculadora de Abastecimento Carbo-Lipídeo</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Gerencie a proporção exata de Glicogênio vs Ácidos Graxos nas 48h pré-prova conforme a distância e o clima
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 14 }}>
            ⚙️ Parâmetros do Concurso
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={T.label}>📏 Distância da Prova (km)</label>
              <input
                type="number"
                min={50}
                max={1500}
                value={distanciaKm}
                onChange={(e) => setDistanciaKm(Math.max(50, Number(e.target.value)))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={T.label}>🌡️ Temperatura Esperada (°C)</label>
              <input
                type="number"
                min={5}
                max={45}
                value={temperatura}
                onChange={(e) => setTemperatura(Number(e.target.value))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setDistanciaKm(180)} style={{ ...T.btnGhost, fontSize: 11 }}>
              ⚡ Sprint (180 km)
            </button>
            <button onClick={() => setDistanciaKm(380)} style={{ ...T.btnGhost, fontSize: 11 }}>
              🏃 Meio Fundo (380 km)
            </button>
            <button onClick={() => setDistanciaKm(620)} style={{ ...T.btnGhost, fontSize: 11 }}>
              🦅 Fundo (620 km)
            </button>
            <button onClick={() => setDistanciaKm(850)} style={{ ...T.btnGhost, fontSize: 11, color: "#EF4444" }}>
              🌍 Fundo Extremo (850 km)
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
                PERFIL METABÓLICO RECOMENDADO
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: T.white, marginTop: 4 }}>
                {analise.categoria}
              </div>
              <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>
                Proporção ótima para encestamento na quinta e sexta-feira
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: T.gold }}>{analise.pctCarbo}%</div>
                <div style={{ fontSize: 11, color: T.dim }}>Carboidratos (Glicogênio)</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#22C55E" }}>{analise.pctGordura}%</div>
                <div style={{ fontSize: 11, color: T.dim }}>Lipídeos (Gordura)</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "#ffffff0a", fontSize: 13, lineHeight: 1.5 }}>
            💡 <b>Explicação Fisiológica:</b> {analise.descMetabolica}
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
              🌾 Sementes Carboidrato (Glicogênio • {analise.gramasCarbo}g / ave / dia)
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              • <b>Milho Pipoca / Milho Amarelo:</b> Rápida digestão e energia base.
              <br />
              • <b>Sorgo Vermelho & Branco:</b> Excelente suporte carboidrato sem excesso de peso.
              <br />
              • <b>Arroz com Casca / Arroz Moido:</b> Depurativo leve de altíssima absorção.
              <br />• <b>Trigo & Cevada:</b> Manutenção do trânsito digestivo em perfeitas condições.
            </div>
          </section>

          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#22C55E", marginBottom: 10 }}>
              🥜 Sementes Lipídeo (Gordura de Maratona • {analise.gramasGordura}g / ave / dia)
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              • <b>Amendoim Quebrado Cru:</b> O combustível de maior densidade calórica (45% lipídeo).
              <br />
              • <b>Girassol Descascado:</b> Rico em ácido linoleico e energia duradoura.
              <br />
              • <b>Cártamo & Linhaça:</b> Suporte lipídico com ômega-3 que melhora a maciez das penas.
              <br />• <b>Dica de Uso:</b> Homogeneizar a mistura com 5mL de Óleo de Fígado de Bacalhau por kg de ração!
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
