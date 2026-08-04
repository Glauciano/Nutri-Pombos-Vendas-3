"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type DirecaoVento = "favoravel" | "contra" | "cruzado_leste" | "cruzado_oeste";

export default function SimuladorVento() {
  const [distancia, setDistancia] = useState<number>(400);
  const [direcaoVento, setDirecaoVento] = useState<DirecaoVento>("contra");
  const [velocidadeVento, setVelocidadeVento] = useState<number>(18);

  const analise = useMemo(() => {
    let velBase = 1250; // m/min base
    let ajusteVel = 0;
    let descVento = "Vento de Bico / Contra (Sul/Sudeste)";
    let perigoDeriva = "Baixa — voo alinhado com o eixo central";
    let alaPombal = "Entrada central direta";
    let perfilIdeal = "Pombos de tenacidade muscular e alta resistência peitoral (Especialistas em Meio Fundo/Fundo)";
    let cor = "#FBBF24";

    if (direcaoVento === "favoravel") {
      ajusteVel = Math.round(velocidadeVento * 12);
      descVento = "Vento de Cauda / Favorável (Norte/Nordeste)";
      perigoDeriva = "Baixa — altíssima velocidade esperada";
      alaPombal = "Entrada alta em mergulho rápido";
      perfilIdeal = "Pombos leves e velozes de Sprint com asa explosiva";
      cor = "#22C55E";
    } else if (direcaoVento === "contra") {
      ajusteVel = -Math.round(velocidadeVento * 14);
      descVento = "Vento Frontal / de Bico (Sul/Sudoeste)";
      perigoDeriva = "Média — pombos podem buscar altitudes mais baixas";
      alaPombal = "Entrada baixa próxima ao solo";
      perfilIdeal = "Pombos pesados com ossatura forte e excelente base hídrica na temporada";
      cor = "#F97316";
    } else if (direcaoVento === "cruzado_leste") {
      ajusteVel = -Math.round(velocidadeVento * 8);
      descVento = "Vento Lateral / Cruzado de Leste (Empurrando para Oeste)";
      perigoDeriva = "ALTA — Risco de deriva de até 15 km para Oeste da linha de voo";
      alaPombal = "Pombos chegarão abordando pela Ala Oeste do pombal";
      perfilIdeal = "Pombos experientes em orientação e com asa secundária larga para estabilidade";
      cor = "#A78BFA";
    } else if (direcaoVento === "cruzado_oeste") {
      ajusteVel = -Math.round(velocidadeVento * 8);
      descVento = "Vento Lateral / Cruzado de Oeste (Empurrando para Leste)";
      perigoDeriva = "ALTA — Risco de deriva de até 15 km para Leste da rota";
      alaPombal = "Pombos chegarão abordando pela Ala Leste do pombal";
      perfilIdeal = "Pombos com forte bússola interna e grande envergadura aerodinâmica";
      cor = "#3B82F6";
    }

    const velEsperada = Math.max(700, velBase + ajusteVel);
    const tempoHoras = (distancia * 1000) / (velEsperada * 60);
    const hh = Math.floor(tempoHoras);
    const mm = Math.round((tempoHoras - hh) * 60);
    const tempoVooEstimado = `${String(hh).padStart(2, "0")}h${String(mm).padStart(2, "0")}min`;

    return {
      velEsperada,
      tempoVooEstimado,
      descVento,
      perigoDeriva,
      alaPombal,
      perfilIdeal,
      cor,
    };
  }, [distancia, direcaoVento, velocidadeVento]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🌪️ Simulador Aerodinâmico de Vento & Deriva</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Analise o impacto dos ventos na velocidade da prova, deriva de rota e descubra qual pombo escalar
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 14 }}>
            ⚙️ Parâmetros da Prova & Condições Atmosféricas
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={T.label}>📏 Distância da Prova (km)</label>
              <input
                type="number"
                min={50}
                max={1500}
                value={distancia}
                onChange={(e) => setDistancia(Math.max(50, Number(e.target.value)))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={T.label}>🌬️ Velocidade do Vento (km/h)</label>
              <input
                type="number"
                min={0}
                max={80}
                value={velocidadeVento}
                onChange={(e) => setVelocidadeVento(Math.max(0, Number(e.target.value)))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>
          </div>

          <div>
            <label style={T.label}>🧭 Direção Predominante do Vento na Rota:</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
              {([
                ["contra", "💨 Vento Frontal / Bico"],
                ["favoravel", "🚀 Vento Cauda / Favorável"],
                ["cruzado_leste", "🍃 Cruzado de Leste"],
                ["cruzado_oeste", "🍃 Cruzado de Oeste"],
              ] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setDirecaoVento(val)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 9,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: direcaoVento === val ? analise.cor : T.bgInput,
                    color: direcaoVento === val ? "#fff" : T.dim,
                    border: `2px solid ${direcaoVento === val ? analise.cor : T.border}`,
                  }}
                >
                  {label}
                </button>
              ))}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: analise.cor, textTransform: "uppercase" }}>
                PREVISÃO AERODINÂMICA DA PROVA ({distancia} km)
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: T.white, marginTop: 4 }}>
                {analise.velEsperada.toLocaleString("pt-BR")} m/min
              </div>
              <div style={{ fontSize: 12, color: T.dim }}>Velocidade média esperada para o pelotão de elite</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: analise.cor }}>
                {analise.tempoVooEstimado}
              </div>
              <div style={{ fontSize: 11, color: T.dim }}>Tempo estimado de voo</div>
            </div>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
              🗺️ Análise de Rota & Deriva Lateral
            </div>
            <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.8 }}>
              • <b>Tipo de Vento:</b> <span style={{ color: T.white }}>{analise.descVento}</span>
              <br />
              • <b>Risco de Deriva:</b> <span style={{ color: analise.cor, fontWeight: 800 }}>{analise.perigoDeriva}</span>
              <br />• <b>Entrada no Pombal:</b> <span style={{ color: T.white }}>{analise.alaPombal}</span>
            </div>
          </section>

          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
              🕊️ Perfil de Pombo Indicado para Escalada
            </div>
            <p style={{ fontSize: 13, color: T.white, lineHeight: 1.6, margin: 0 }}>
              {analise.perfilIdeal}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
