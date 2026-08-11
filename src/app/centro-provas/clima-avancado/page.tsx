"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type PressaoTrend = "estavel" | "subindo" | "queda_leve" | "queda_brusca";
type TetoNuvens = "limpo_alto" | "parcial_800m" | "baixo_400m" | "neblina_chao";
type VentoAltitude = "calmo" | "moderado" | "cortante_lateral" | "tempestade";

export default function ClimaAvancadoSoltura() {
  const [pressaoHpa, setPressaoHpa] = useState<number>(1014);
  const [tendencia, setTendencia] = useState<PressaoTrend>("estavel");
  const [teto, setTeto] = useState<TetoNuvens>("limpo_alto");
  const [visibilidadeKm, setVisibilidadeKm] = useState<number>(15);
  const [ventoAlt, setVentoAlt] = useState<VentoAltitude>("calmo");
  const [umidade, setUmidade] = useState<number>(65);

  const analise = useMemo(() => {
    let score = 100;
    const fatoresCriticos: string[] = [];

    // 1. Pressão Barométrica & Tendência
    if (tendencia === "queda_brusca") {
      score -= 35;
      fatoresCriticos.push(
        "🚨 Queda barométrica severa: Indica aproximação de frente fria ou tempestade elétrica. O ouvido interno das aves sofre desorientação e estresse físico."
      );
    } else if (tendencia === "queda_leve" || pressaoHpa < 1008) {
      score -= 15;
      fatoresCriticos.push("⚠️ Pressão baixa/caindo: Ar menos denso exige maior esforço de sustentação peitoral.");
    }

    // 2. Teto de Nuvens e Visibilidade
    if (teto === "neblina_chao" || visibilidadeKm < 4) {
      score -= 45;
      fatoresCriticos.push(
        "🚨 Visibilidade crítica (< 4 km) / Neblina: Os pombos não conseguem traçar o azimute solar inicial e voam em círculos até o esgotamento."
      );
    } else if (teto === "baixo_400m" || visibilidadeKm < 8) {
      score -= 25;
      fatoresCriticos.push(
        "⚠️ Teto de nuvens baixo (< 500m): As ondas magnéticas e sonoras sofrem refração na camada baixa, dificultando a navegação de borrachos."
      );
    }

    // 3. Vento em Altitude (800m - Nível de Cruzeiro)
    if (ventoAlt === "tempestade") {
      score -= 50;
      fatoresCriticos.push("🚨 Tempestade de vento em altitude: Risco iminente de extravio em massa.");
    } else if (ventoAlt === "cortante_lateral") {
      score -= 25;
      fatoresCriticos.push(
        "⚠️ Cisalhamento / Vento Cortante Lateral: O vento a 800m de altura está soprando em direção oposta ao solo, empurrando o pelotão para fora da linha de voo."
      );
    }

    // 4. Umidade Relativa do Ar
    if (umidade > 88) {
      score -= 15;
      fatoresCriticos.push(
        "⚠️ Ar saturado (Umidade > 88%): Penas absorvem umidade microcelular e ficam pesadas, prejudicando a respiração nos sacos aéreos."
      );
    }

    const aeroScore = Math.min(100, Math.max(5, score));

    let decisao = "🟢 SOLTURA AUTORIZADA / CEU SEGURO";
    let cor = "#22C55E";
    let recomendacao =
      "As condições atmosféricas, barométricas e de visibilidade estão perfeitas para o encestamento e soltura.";

    if (aeroScore < 55) {
      decisao = "🔴 PROIBIDA A SOLTURA / TRAZER DE VOLTA OU CANCELAR";
      cor = "#EF4444";
      recomendacao =
        "Condições atmosféricas altamente perigosas. Mesmo com Kp moderado, a combinação de pressão caindo, teto baixo ou cisalhamento causará perdas catastróficas!";
    } else if (aeroScore < 78) {
      decisao = "🟡 ADIAR SOLTURA EM 1 A 2 HORAS (AGUARDAR)";
      cor = "#EAB308";
      recomendacao =
        "Aguardar a dissipação da neblina matinal, elevação do teto de nuvens e estabilização térmica antes de abrir os cestos.";
    }

    return {
      aeroScore,
      decisao,
      cor,
      recomendacao,
      fatoresCriticos,
    };
  }, [pressaoHpa, tendencia, teto, visibilidadeKm, ventoAlt, umidade]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🌤️ Radar Meteorológico de Soltura & Pressão (Aero-Clima)</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Análise barométrica, teto de nuvens, cisalhamento em altitude e inversão térmica para evitar perdas
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 14 }}>
            ⚙️ Parâmetros Atmosféricos Reais no Horário da Soltura
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={T.label}>🧭 Pressão Barométrica (hPa / mb)</label>
              <input
                type="number"
                min={980}
                max={1040}
                value={pressaoHpa}
                onChange={(e) => setPressaoHpa(Number(e.target.value))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={T.label}>👁️ Visibilidade Horizontal (km)</label>
              <input
                type="number"
                min={1}
                max={50}
                value={visibilidadeKm}
                onChange={(e) => setVisibilidadeKm(Math.max(1, Number(e.target.value)))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={T.label}>💧 Umidade Relativa do Ar (%)</label>
              <input
                type="number"
                min={10}
                max={100}
                value={umidade}
                onChange={(e) => setUmidade(Math.min(100, Math.max(10, Number(e.target.value))))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={T.label}>📉 Tendência Barométrica nas Últimas 3 Horas</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {([
                  ["estavel", "✅ Estável (Normal)"],
                  ["subindo", "📈 Subindo (Tempo bom)"],
                  ["queda_leve", "⚠️ Queda Leve (-2 hPa)"],
                  ["queda_brusca", "🚨 Queda Brusca (< -4 hPa)"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setTendencia(val)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: tendencia === val ? T.gold : T.bgInput,
                      color: tendencia === val ? T.bg : T.dim,
                      border: `1px solid ${tendencia === val ? T.gold : T.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={T.label}>☁️ Teto de Nuvens / Altitude da Capa</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {([
                  ["limpo_alto", "☀️ Limpo / > 1.500m"],
                  ["parcial_800m", "⛅ Parcial / ~800m"],
                  ["baixo_400m", "⚠️ Teto Baixo (< 500m)"],
                  ["neblina_chao", "🚨 Neblina / Inversão"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setTeto(val)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: teto === val ? T.gold : T.bgInput,
                      color: teto === val ? T.bg : T.dim,
                      border: `1px solid ${teto === val ? T.gold : T.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={T.label}>🌪️ Vento em Altitude (800m / Nível de Cruzeiro)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {([
                  ["calmo", "✅ Calmo / Alinhado"],
                  ["moderado", "🍃 Moderado (< 20km/h)"],
                  ["cortante_lateral", "⚠️ Cortante / Cisalhamento"],
                  ["tempestade", "🚨 Tempestade de Altitude"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setVentoAlt(val)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: ventoAlt === val ? T.gold : T.bgInput,
                      color: ventoAlt === val ? T.bg : T.dim,
                      border: `1px solid ${ventoAlt === val ? T.gold : T.border}`,
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
                DECISÃO TÉCNICA DE SOLTURA (GO / NO-GO)
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: T.white, marginTop: 4 }}>
                {analise.decisao}
              </div>
              <div style={{ fontSize: 13, color: analise.cor, fontWeight: 800, marginTop: 6 }}>
                📢 Parecer Meteorológico: {analise.recomendacao}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: analise.cor }}>
                {analise.aeroScore}%
              </div>
              <div style={{ fontSize: 11, color: T.dim }}>Aero-Score de Segurança</div>
            </div>
          </div>

          {analise.fatoresCriticos.length > 0 && (
            <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "#ffffff0a", fontSize: 13 }}>
              <b style={{ color: analise.cor }}>⚠️ Fatores de Risco Detectados na Atmosfera:</b>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {analise.fatoresCriticos.map((f, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
            📖 Por que Pombos se Perdem Mesmo com Kp Moderado? (Os 4 Assassinos Invisíveis)
          </div>
          <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.8 }}>
            • <b>1. A Queda Barométrica (Pressão &lt; 1010 hPa):</b> Os pombos possuem receptores barométricos ultrassensíveis no ouvido médio. Quando a pressão cai rapidamente antes de uma frente fria, o ar perde densidade e a dor auditiva desorienta o pelotão.
            <br />
            • <b>2. Inversão Térmica & Teto Baixo:</b> Em manhãs frias de inverno, uma camada de nuvens presa abaixo de 500m bloqueia o sol e faz as ondas sonoras e magnéticas ricochetearem, criando uma "gaiola cega" para borrachos.
            <br />
            • <b>3. Cisalhamento de Vento em Altitude (Wind Shear):</b> No solo o vento pode parecer calmo (5 km/h), mas a 800 metros de altura pode estar soprado uma corrente cruzada de 45 km/h que joga o bando em direção a serras ou oceano!
            <br />• <b>4. Ar Saturado (Umidade &gt; 88%):</b> O ar úmido aumenta o peso microcelular da plumagem e dificulta as trocas gasosas nos sacos aéreos do pombo.
          </div>
        </section>
      </div>
    </main>
  );
}
