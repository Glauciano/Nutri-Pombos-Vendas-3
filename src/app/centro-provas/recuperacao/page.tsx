"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type DificuldadeProva = "facil_vento_cauda" | "normal" | "dificil_vento_contra" | "extrema_calor_vento";

export default function RecuperacaoPosProva() {
  const [kmProva, setKmProva] = useState<number>(450);
  const [dificuldade, setDificuldade] = useState<DificuldadeProva>("dificil_vento_contra");
  const [horasVoo, setHorasVoo] = useState<number>(7);
  const [perdaPesoPct, setPerdaPesoPct] = useState<number>(12); // % de peso perdido na prova

  const analise = useMemo(() => {
    let scoreFadiga = 20; // 0 = fresco, 100 = exaustao maxima
    const fatores: string[] = [];

    // 1. Distância
    if (kmProva > 700) {
      scoreFadiga += 40;
      fatores.push("Fundo Extremo (> 700 km): Microlesões intensas nas fibras musculares brancas e vermelhas do peito.");
    } else if (kmProva > 450) {
      scoreFadiga += 25;
      fatores.push("Fundo (450–700 km): Alto consumo das reservas lipídicas e estresse hepático.");
    } else {
      scoreFadiga += 10;
    }

    // 2. Dificuldade aerodinâmica
    if (dificuldade === "extrema_calor_vento") {
      scoreFadiga += 35;
      fatores.push("Calor & Vento Frontal: Acúmulo severo de ácido láctico e desidratação celular.");
    } else if (dificuldade === "dificil_vento_contra") {
      scoreFadiga += 20;
      fatores.push("Vento de Bico / Contra: O peito trabalhou em esforço máximo contínuo sem planar.");
    }

    // 3. Horas de voo
    if (horasVoo >= 9) {
      scoreFadiga += 25;
      fatores.push("Voo de maratona (≥ 9h): Esgotamento do glicogênio do fígado e peito.");
    } else if (horasVoo >= 6) {
      scoreFadiga += 15;
    }

    // 4. Perda de peso
    if (perdaPesoPct >= 18) {
      scoreFadiga += 20;
      fatores.push("🚨 Perda de peso crítica (≥ 18%): A ave queimou proteína do próprio músculo peitoral ('peito seco')!");
    } else if (perdaPesoPct >= 12) {
      scoreFadiga += 10;
    }

    const fadigaTotal = Math.min(100, Math.max(10, scoreFadiga));

    let diasRepouso = 2;
    let liberacaoTreino = "Quarta-feira (voo leve ao redor do pombal)";
    let cor = "#22C55E";
    let status = "🟢 FADIGA LEVE — RECUPERAÇÃO EM 48 HORAS";
    let condutaNutricional = "Água com Eletrovitt Líquido no domingo + Ração depurativa leve até terça-feira.";

    if (fadigaTotal >= 78) {
      diasRepouso = 7;
      liberacaoTreino = "PROIBIDO TREINO NA SEMANA — Apenas repouso absoluto no pombal";
      cor = "#EF4444";
      status = "🔴 EXAUSTÃO SEVERA — NECESSITA DE 7 DIAS DE RECONSTRUÇÃO";
      condutaNutricional =
        "URGENTE: Eletrovitt Líquido (2,5 mL/L) + Glicose nas primeiras 24h. Organew probiótico diário e dieta depurativa rica em cevada e arroz com casca. NÃO ENCESTAR NO PRÓXIMO FIM DE SEMANA!";
    } else if (fadigaTotal >= 50) {
      diasRepouso = 4;
      liberacaoTreino = "Quinta-feira (voo espontâneo sem forçar bandeira)";
      cor = "#F97316";
      status = "🟡 FADIGA MODERADA A ALTA — RECUPERAÇÃO EM 4 DIAS";
      condutaNutricional =
        "Eletrovitt Líquido por 2 dias pós-prova + Aminomix na ração na terça e quarta para reconstruir fibras musculares com L-Lisina e Metionina.";
    }

    return {
      fadigaTotal,
      diasRepouso,
      liberacaoTreino,
      cor,
      status,
      condutaNutricional,
      fatores,
    };
  }, [kmProva, dificuldade, horasVoo, perdaPesoPct]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🔋 Índice de Fadiga & Recuperação Cardiorrespiratória</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Calcule o tempo exato de repouso, depuração de ácido láctico e liberação para treinos pós-prova
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 14 }}>
            ⚙️ Parâmetros do Esforço da Prova Realizada
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={T.label}>📏 Distância Voada (km)</label>
              <input
                type="number"
                min={50}
                max={1500}
                value={kmProva}
                onChange={(e) => setKmProva(Math.max(50, Number(e.target.value)))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={T.label}>⏱️ Tempo de Voo no Ar (Horas)</label>
              <input
                type="number"
                step="0.5"
                min={1}
                max={48}
                value={horasVoo}
                onChange={(e) => setHorasVoo(Math.max(1, Number(e.target.value)))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={T.label}>⚖️ Perda Média de Peso na Prova (%)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={perdaPesoPct}
                onChange={(e) => setPerdaPesoPct(Math.min(30, Math.max(1, Number(e.target.value))))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>
          </div>

          <div>
            <label style={T.label}>🌤️ Dificuldade Aerodinâmica / Clima no Dia da Prova:</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 8 }}>
              {([
                ["facil_vento_cauda", "🚀 Fácil / Vento de Cauda"],
                ["normal", "✅ Normal / Céu Limpo"],
                ["dificil_vento_contra", "💨 Vento de Bico / Contra"],
                ["extrema_calor_vento", "🔥 Calor Intenso + Vento"],
              ] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setDificuldade(val)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 9,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: dificuldade === val ? analise.cor : T.bgInput,
                    color: dificuldade === val ? "#fff" : T.dim,
                    border: `2px solid ${dificuldade === val ? analise.cor : T.border}`,
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: analise.cor, textTransform: "uppercase" }}>
                DIAGNÓSTICO DE FADIGA & REPOUSO
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: T.white, marginTop: 4 }}>
                {analise.status}
              </div>
              <div style={{ fontSize: 13, color: analise.cor, fontWeight: 800, marginTop: 6 }}>
                📢 Liberação para Treino: {analise.liberacaoTreino}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: analise.cor }}>
                {analise.fadigaTotal}%
              </div>
              <div style={{ fontSize: 11, color: T.dim }}>Índice de Exaustão Muscular</div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "#ffffff0a", fontSize: 13, lineHeight: 1.5 }}>
            💡 <b>Protocolo Nutricional & Medicamentoso:</b> {analise.condutaNutricional}
          </div>

          {analise.fatores.length > 0 && (
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: "#ffffff0a", fontSize: 13 }}>
              <b style={{ color: analise.cor }}>⚠️ Fatores de Desgaste Detectados:</b>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {analise.fatores.map((f, idx) => (
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
            📖 Entendendo a Limpeza do Ácido Láctico e Regeneração Muscular
          </div>
          <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.8 }}>
            • <b>As 48 Horas Críticas:</b> Após uma prova dura, o fígado e os rins da ave precisam eliminar os subprodutos metabólicos (ácido láctico e creatinoquinase). Forçar treinos antes da completa depuração causa estresse cardíaco irreversível.
            <br />
            • <b>Banho Morno com Sais:</b> Ofertar banho com sais relaxantes na terça-feira dilata os capilares das asas e acelera o retorno da flexibilidade muscular.
            <br />• <b>A Regra do Peso:</b> Um pombo só deve ser encestado para a próxima prova se tiver recuperado 100% das gramas perdidas na etapa anterior!
          </div>
        </section>
      </div>
    </main>
  );
}
