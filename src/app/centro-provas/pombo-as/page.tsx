"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type PomboAsItem = {
  id: string;
  anilha: string;
  nome: string;
  sexo: "macho" | "femea";
  provasComputadas: number;
  coeficienteTotal: number; // soma dos melhores coeficientes FCI (quanto menor, melhor)
  colocacaoMedia: number;
  vitorias: number;
  podios: number;
  categoriaEspecialidade: "Geral" | "Velocidade" | "Fundo";
};

const POMBO_AS_INICIAL: PomboAsItem[] = [
  { id: "1", anilha: "BR-23-10492", nome: "Trovão Azul", sexo: "macho", provasComputadas: 5, coeficienteTotal: 4.12, colocacaoMedia: 3.2, vitorias: 2, podios: 4, categoriaEspecialidade: "Velocidade" },
  { id: "2", anilha: "BR-22-99210", nome: "Rainha do Sul", sexo: "femea", provasComputadas: 5, coeficienteTotal: 6.85, colocacaoMedia: 5.4, vitorias: 1, podios: 3, categoriaEspecialidade: "Fundo" },
  { id: "3", anilha: "BR-24-55412", nome: "Titan", sexo: "macho", provasComputadas: 5, coeficienteTotal: 12.4, colocacaoMedia: 9.8, vitorias: 0, podios: 2, categoriaEspecialidade: "Geral" },
  { id: "4", anilha: "BR-24-00123", nome: "Flecha", sexo: "macho", provasComputadas: 4, coeficienteTotal: 15.8, colocacaoMedia: 11.2, vitorias: 1, podios: 2, categoriaEspecialidade: "Velocidade" },
  { id: "5", anilha: "BR-23-44111", nome: "Maratona", sexo: "femea", provasComputadas: 5, coeficienteTotal: 18.9, colocacaoMedia: 14.5, vitorias: 0, podios: 1, categoriaEspecialidade: "Fundo" },
];

export default function PomboAsRanking() {
  const [pombosAs, setPombosAs] = useState<PomboAsItem[]>(POMBO_AS_INICIAL);
  const [categoriaSel, setCategoriaSel] = useState<"Geral" | "Velocidade" | "Fundo">("Geral");

  const listaClassificada = useMemo(() => {
    let filtrados = pombosAs;
    if (categoriaSel !== "Geral") {
      filtrados = pombosAs.filter((p) => p.categoriaEspecialidade === categoriaSel || p.categoriaEspecialidade === "Geral");
    }
    return [...filtrados].sort((a, b) => a.coeficienteTotal - b.coeficienteTotal);
  }, [pombosAs, categoriaSel]);

  const campeao = listaClassificada[0];

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🏆 Calculadora Oficial de "Pombo Ás" (Ace Pigeon Ranking)</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Consagre o melhor atleta da temporada através do somatório oficial do Coeficiente FCI nas 5 melhores provas
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        {/* CAMPEÃO EM DESTAQUE */}
        {campeao && (
          <section
            style={{
              ...T.card,
              border: `2px solid ${T.gold}`,
              background: "rgba(234,179,8,0.1)",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <span style={{ fontSize: 52 }}>👑</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.gold, textTransform: "uppercase", letterSpacing: 1 }}>
                    POMBO ÁS GERAL DO POMBAL • 2026
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: T.white, margin: "4px 0" }}>
                    {campeao.nome} ({campeao.anilha})
                  </div>
                  <div style={{ fontSize: 12, color: T.dim }}>
                    {campeao.sexo === "macho" ? "♂ Macho" : "♀ Fêmea"} • Especialidade: {campeao.categoriaEspecialidade}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: T.gold }}>{campeao.coeficienteTotal.toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: T.dim }}>Coeficiente FCI (Total)</div>
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#22C55E" }}>{campeao.vitorias}</div>
                  <div style={{ fontSize: 11, color: T.dim }}>Vitórias no Ano</div>
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#38bdf8" }}>{campeao.podios}</div>
                  <div style={{ fontSize: 11, color: T.dim }}>Pódios (Top 3)</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ABA DE CATEGORIAS */}
        <section style={T.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>
              📊 Ranking Oficial do Pombal ({listaClassificada.length} aves computadas)
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["Geral", "Velocidade", "Fundo"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaSel(cat)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: categoriaSel === cat ? T.gold : T.bgCard,
                    color: categoriaSel === cat ? T.bg : T.dim,
                    border: `1px solid ${categoriaSel === cat ? T.gold : T.border}`,
                  }}
                >
                  {cat === "Geral" ? "🏆 Geral" : cat === "Velocidade" ? "⚡ Velocidade (Sprint)" : "🦅 Fundo / Maratona"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}`, background: "#ffffff04", textAlign: "left", color: T.dim }}>
                  <th style={{ padding: "10px 8px" }}>Pos.</th>
                  <th style={{ padding: "10px 8px" }}>Pombo</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>Provas</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>Pos. Média</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>Vitórias / Pódios</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>Especialidade</th>
                  <th style={{ padding: "10px 8px", textAlign: "right" }}>Coeficiente FCI (Ás)</th>
                </tr>
              </thead>
              <tbody>
                {listaClassificada.map((p, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: `1px solid ${T.border}`,
                        background: isFirst ? "rgba(234,179,8,0.06)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "12px 8px", fontWeight: 800, color: idx < 3 ? T.gold : T.dim }}>
                        {idx + 1}º
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ fontWeight: 800, color: T.white }}>{p.anilha}</div>
                        <div style={{ fontSize: 11, color: T.dim }}>
                          {p.nome} • {p.sexo === "macho" ? "♂ Macho" : "♀ Fêmea"}
                        </div>
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 700 }}>
                        {p.provasComputadas} provas
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        {p.colocacaoMedia.toFixed(1)}º lugar
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <span style={{ color: T.gold, fontWeight: 800 }}>{p.vitorias}V</span> /{" "}
                        <span style={{ color: "#22C55E" }}>{p.podios}P</span>
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, background: "#ffffff08", color: T.white }}>
                          {p.categoriaEspecialidade}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 900, color: isFirst ? T.gold : "#4ADE80", fontSize: 16 }}>
                        {p.coeficienteTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
            📖 Entendendo a Fórmula do "Pombo Ás" (FCI Ace Pigeon)
          </div>
          <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.8 }}>
            • <b>A Regra FCI:</b> O título de <i>Pombo Ás</i> premia a constância e a qualidade máxima de um atleta durante o campeonato. Em vez de valorizar um pombo que ganha uma prova e se perde na seguinte, o Pombo Ás é aquele que se mantém entre os primeiros colocados em todas as etapas disputadas.
            <br />
            • <b>Fórmula do Coeficiente:</b> Em cada prova, o coeficiente é obtido por: <code>((Posição conquistada × 100) ÷ Número de concorrentes) × 10</code>.
            <br />• <b>Somatório Oficial:</b> O Pombo Ás é o que apresenta a <b>menor soma total</b> de coeficientes nas suas melhores provas computadas no ano.
          </div>
        </section>
      </div>
    </main>
  );
}
