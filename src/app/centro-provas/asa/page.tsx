"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

export default function ControleMudaAsa() {
  const [penasMuda, setPenasMuda] = useState<number[]>([]); // primárias 1 a 10 que caíram
  const [sistemaEscurecimento, setSistemaEscurecimento] = useState<boolean>(true);

  function togglePena(num: number) {
    if (penasMuda.includes(num)) {
      setPenasMuda(penasMuda.filter((p) => p !== num));
    } else {
      setPenasMuda([...penasMuda, num]);
    }
  }

  const analise = useMemo(() => {
    const qtdMuda = penasMuda.length;
    const temPontaAsa = penasMuda.includes(8) || penasMuda.includes(9) || penasMuda.includes(10);
    const temP7 = penasMuda.includes(7);

    let indiceAsa = Math.max(10, 100 - qtdMuda * 8);
    let status = "✅ ASA INTACTA / COMPLETA";
    let cor = "#22C55E";
    let desc =
      "A ave possui 100% da superfície alar íntegra. Aerodinâmica perfeita para provas de velocidade e fundo extremo!";
    let recomendacao = "Pode competir em qualquer distância sem restrições de sustentação.";

    if (temPontaAsa) {
      indiceAsa = Math.min(65, indiceAsa - 15);
      status = "🚨 ALERTA CRÍTICO DE ENCESTAMENTO — MUDA DE PONTA DE ASA";
      cor = "#EF4444";
      desc =
        "O pombo está na muda da 8ª, 9ª ou 10ª pena primária. As 4 últimas penas primárias são os 'remiges de propulsão'. Sem elas, o gasto energético do voo aumenta em até +35%!";
      recomendacao = "PROIBIDO encestar para provas acima de 250 km. Alto risco de extravio por esgotamento peitoral.";
    } else if (temP7 || qtdMuda >= 3) {
      status = "⚠️ MUDA AVANÇADA / ATENÇÃO AERODINÂMICA";
      cor = "#F97316";
      desc = "A ave está em processo ativo de substituição das penas centrais da asa primária.";
      recomendacao = "Apto para provas curtas de Sprint (até 300 km), mas monitorar esforço contra o vento.";
    } else if (qtdMuda > 0) {
      status = "🟡 MUDA INICIAL LEVE (P1 a P4)";
      cor = "#EAB308";
      desc = "Muda das primeiras penas primárias internas. O impacto na sustentação aerodinâmica é mínimo.";
      recomendacao = "Apto para competir normalmente no calendário oficial.";
    }

    if (sistemaEscurecimento && !temPontaAsa) {
      desc += " (Sistema de escurecimento ativo retendo com sucesso as penas de ponta para os concursos clássicos).";
    }

    return {
      indiceAsa,
      status,
      cor,
      desc,
      recomendacao,
    };
  }, [penasMuda, sistemaEscurecimento]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🪶 Controle Aerodinâmico da Muda & Índice da Asa</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Monitore a troca das 10 penas primárias de voo e garanta que seus atletas não percam sustentação nas provas
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        <section style={T.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>
              🪶 Seletor de Penas Primárias em Muda (P1 a P10)
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={sistemaEscurecimento}
                onChange={(e) => setSistemaEscurecimento(e.target.checked)}
              />
              <span>🌙 Sistema de Escurecimento Ativo</span>
            </label>
          </div>

          <p style={{ ...T.small, marginBottom: 12 }}>
            Clique abaixo nas penas primárias de voo que o pombo <b>já derrubou ou que estão em crescimento</b>:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((pNum) => {
              const inMolt = penasMuda.includes(pNum);
              const isPonta = pNum >= 8;
              return (
                <button
                  key={pNum}
                  onClick={() => togglePena(pNum)}
                  style={{
                    padding: "14px 4px",
                    borderRadius: 10,
                    textAlign: "center",
                    cursor: "pointer",
                    background: inMolt ? (isPonta ? "#EF4444" : T.gold) : T.bgInput,
                    color: inMolt ? T.bg : T.white,
                    border: `2px solid ${inMolt ? (isPonta ? "#EF4444" : T.gold) : T.border}`,
                    fontWeight: 900,
                    fontSize: 14,
                  }}
                >
                  <div>P{pNum}</div>
                  <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
                    {inMolt ? "Muda" : "Intacta"}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setPenasMuda([])} style={{ ...T.btnGhost, fontSize: 11 }}>
              ✨ Limpar (Asa Completa)
            </button>
            <button onClick={() => setPenasMuda([1, 2, 3])} style={{ ...T.btnGhost, fontSize: 11 }}>
              🟡 Muda Inicial
            </button>
            <button onClick={() => setPenasMuda([8, 9])} style={{ ...T.btnGhost, fontSize: 11, color: "#EF4444" }}>
              🚨 Simular Muda de Ponta
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
                DIAGNÓSTICO AERODINÂMICO DO ATLETA
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: T.white, marginTop: 4 }}>
                {analise.status}
              </div>
              <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>{analise.desc}</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: analise.cor }}>
                {analise.indiceAsa}%
              </div>
              <div style={{ fontSize: 11, color: T.dim }}>Índice de sustentação da asa</div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "#ffffff0a", fontSize: 13 }}>
            💡 <b>Recomendação Oficial para Encestamento:</b> {analise.recomendacao}
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
            📖 A Importância das 4 Penas de Ponta (P7 a P10)
          </div>
          <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.8 }}>
            • <b>Propulsão e Velocidade:</b> As primárias 8, 9 e 10 são responsáveis por 80% do impulso aerodinâmico do voo. Se o pombo perde uma dessas penas, o vácuo na ponta da asa força o peito a trabalhar o dobro para manter a velocidade.
            <br />
            • <b>O Sistema de Escurecimento:</b> Na columbofilia de elite, fechar as cortinas por 14h/dia nos primeiros meses do ano retém a queda das penas primárias de ponta até que as competições principais se encerrem.
          </div>
        </section>
      </div>
    </main>
  );
}
