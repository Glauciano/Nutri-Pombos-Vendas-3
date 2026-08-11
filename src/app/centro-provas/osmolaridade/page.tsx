"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type TipoProva = "velocidade" | "meio_fundo" | "fundo" | "fundo_extremo";
type TipoAgua = "pura" | "eletrolito_leve" | "eletrolito_completo" | "glicose_eletrolito";

export default function OsmolaridadeHidrica() {
  const [tipoProva, setTipoProva] = useState<TipoProva>("meio_fundo");
  const [tempCesto, setTempCesto] = useState<number>(27); // temp esperada no transporte
  const [horasCesto, setHorasCesto] = useState<number>(14); // tempo dentro do caminhao
  const [tipoAguaQuinta, setTipoAguaQuinta] = useState<TipoAgua>("eletrolito_completo");
  const [tipoAguaSexta, setTipoAguaSexta] = useState<TipoAgua>("pura");

  const analise = useMemo(() => {
    let scoreHidratacao = 100;
    const avisos: string[] = [];

    // 1. Checar risco de SEDE NO CESTO (Sexta-feira / Dia do Enceste)
    if (tipoAguaSexta === "eletrolito_completo" || tipoAguaSexta === "glicose_eletrolito") {
      scoreHidratacao -= 40;
      avisos.push(
        "🚨 PERIGO DE SEDE CRÍTICA NO CESTO: Fornecer eletrólitos concentrados ou glicose no dia do encestamento aumenta a osmolaridade sanguínea da ave! O pombo sentirá sede extrema dentro do caminhão, recusando descanso e pousando em rios/poças durante a prova."
      );
    } else if (tipoAguaSexta === "eletrolito_leve") {
      scoreHidratacao -= 15;
      avisos.push(
        "⚠️ Atenção na Sexta-feira: Fornecer apenas solução hipotônica ultraleve (< 2g/L) ou água limpa pura até 2 horas antes do encestamento."
      );
    }

    // 2. Checar carregamento hídrico na Quinta-feira
    if (tipoProva === "fundo" || tipoProva === "fundo_extremo") {
      if (tipoAguaQuinta === "pura") {
        scoreHidratacao -= 25;
        avisos.push(
          "⚠️ Déficit eletrolítico pré-maratona: Em provas acima de 500 km, a reposição celular de Sódio, Potássio e Magnésio deve ser feita na QUINTA-FEIRA para máxima retenção hídrica sem sede."
        );
      }
    }

    // 3. Impacto de calor e tempo de caminhão
    if (tempCesto > 30 && horasCesto > 12) {
      scoreHidratacao -= 15;
      avisos.push(
        "🔥 Estresse térmico no transporte: O caminhão estará quente (> 30°C). Aves perdem água por evaporação respiratória nos sacos aéreos."
      );
    }

    const osmScore = Math.min(100, Math.max(10, scoreHidratacao));

    let status = "🟢 HIDRATAÇÃO ISOTÔNICA PERFEITA / ZERO SEDE NO CESTO";
    let cor = "#22C55E";
    let protocoloSexta = "Água 100% limpa e fresca no bebedouro até o momento do enceste.";

    if (osmScore < 60) {
      status = "🔴 ALERTA VERMELHO: RISCO SEVERO DE SEDE E EXTRAVIO POR DESIDRATAÇÃO";
      cor = "#EF4444";
      protocoloSexta =
        "URGENTE: Substituir imediatamente a água do bebedouro na Sexta-feira por água pura e limpa sem sais ou açúcares!";
    } else if (osmScore < 85) {
      status = "🟡 ATENÇÃO OSMÓTICA / AJUSTAR DILUIÇÃO PRÉ-ENCESTE";
      cor = "#EAB308";
      protocoloSexta =
        "Reduzir a dosagem de eletrólitos ou suspender 6 horas antes da colocação das aves no cesto.";
    }

    return {
      osmScore,
      status,
      cor,
      protocoloSexta,
      avisos,
    };
  }, [tipoProva, tempCesto, horasCesto, tipoAguaQuinta, tipoAguaSexta]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>💧 Hidratação Celular & Osmolaridade (Pré-Enceste)</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Evite a "Sede no Cesto" controlando o fornecimento de eletrólitos e garantindo balanço hídrico isotônico
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 14 }}>
            ⚙️ Parâmetros de Transporte & Tipo de Concurso
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={T.label}>🏆 Categoria da Prova</label>
              <select
                value={tipoProva}
                onChange={(e) => setTipoProva(e.target.value as TipoProva)}
                style={{ ...T.input, background: T.bgInput, color: T.white }}
              >
                <option value="velocidade">⚡ Velocidade (Até 300 km)</option>
                <option value="meio_fundo">🏃 Meio Fundo (300–500 km)</option>
                <option value="fundo">🦅 Fundo (500–700 km)</option>
                <option value="fundo_extremo">🌍 Fundo Extremo (&gt; 700 km)</option>
              </select>
            </div>

            <div>
              <label style={T.label}>🌡️ Temp. no Caminhão (°C)</label>
              <input
                type="number"
                min={10}
                max={45}
                value={tempCesto}
                onChange={(e) => setTempCesto(Number(e.target.value))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={T.label}>⏱️ Tempo de Transporte (Horas)</label>
              <input
                type="number"
                min={1}
                max={48}
                value={horasCesto}
                onChange={(e) => setHorasCesto(Number(e.target.value))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
            <div>
              <label style={T.label}>📅 Água na QUINTA-FEIRA (Véspera -1)</label>
              <select
                value={tipoAguaQuinta}
                onChange={(e) => setTipoAguaQuinta(e.target.value as TipoAgua)}
                style={{ ...T.input, background: T.bgInput, color: T.white }}
              >
                <option value="pura">💧 Água Limpa Pura</option>
                <option value="eletrolito_leve">⚡ Eletrólito Hipotônico Leve (2g/L)</option>
                <option value="eletrolito_completo">⚡ Eletrólito Completo / Bula (5g/L)</option>
                <option value="glicose_eletrolito">🍯 Glicose + Eletrólito</option>
              </select>
            </div>

            <div>
              <label style={T.label}>📅 Água na SEXTA-FEIRA (Dia do Encestamento)</label>
              <select
                value={tipoAguaSexta}
                onChange={(e) => setTipoAguaSexta(e.target.value as TipoAgua)}
                style={{
                  ...T.input,
                  background: tipoAguaSexta !== "pura" ? "rgba(239,68,68,0.2)" : T.bgInput,
                  color: T.white,
                  border: `2px solid ${tipoAguaSexta !== "pura" ? "#EF4444" : T.border}`,
                }}
              >
                <option value="pura">✅ 100% Água Limpa Pura (RECOMENDADO)</option>
                <option value="eletrolito_leve">⚠️ Eletrólito Ultraleve (menos de 2g/L)</option>
                <option value="eletrolito_completo">🚨 Eletrólito Completo (5g/L — PERIGO DE SEDE)</option>
                <option value="glicose_eletrolito">🚨 Glicose + Sais (ALTO RISCO DE SEDE)</option>
              </select>
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
                DIAGNÓSTICO DA OSMOLARIDADE SANGUÍNEA
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.white, marginTop: 4 }}>
                {analise.status}
              </div>
              <div style={{ fontSize: 13, color: analise.cor, fontWeight: 800, marginTop: 6 }}>
                📢 Conduta na Sexta-feira: {analise.protocoloSexta}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: analise.cor }}>
                {analise.osmScore}%
              </div>
              <div style={{ fontSize: 11, color: T.dim }}>Índice de Hidratação Sem Sede</div>
            </div>
          </div>

          {analise.avisos.length > 0 && (
            <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "#ffffff0a", fontSize: 13 }}>
              <b style={{ color: analise.cor }}>⚠️ Alertas de Fisiologia Columbófila:</b>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {analise.avisos.map((aviso, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>
                    {aviso}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
            📖 Por Que Nunca Se Deve Dar Eletrólitos no Dia do Enceste?
          </div>
          <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.8 }}>
            • <b>A Regra de Ouro da Columbofilia:</b> Os eletrólitos (sais de Sódio e Potássio) aumentam a pressão osmótica do sangue. Para diluir esses sais, o cérebro da ave dispara o sinal de <b>SEDE INTENSA</b> nas 6 a 12 horas seguintes.
            <br />
            • <b>O Caminhão de Transporte:</b> Dentro dos cestos do caminhão, a temperatura é elevada e o acesso à água pode ser restrito. Um pombo com sede fica agitado, não repousa e queima glicogênio muscular antes da prova.
            <br />• <b>A Consequência na Prova:</b> Ao ser solto no domingo, o pombo com sede ignora o azimute de voo e desce em rios, açudes ou telhados para beber água, perdendo 30 minutos de prova e virando presa fácil de falcões!
            <br />• <b>O Manejo Correto:</b> Faça a reposição mineral na <b>QUINTA-FEIRA</b> e oferte apenas água 100% limpa na <b>SEXTA-FEIRA</b> do enceste.
          </div>
        </section>
      </div>
    </main>
  );
}
