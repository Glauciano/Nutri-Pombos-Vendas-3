"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type Pombo = {
  id: number;
  anilha: string;
  nome: string | null;
  sexo: "macho" | "femea";
  cor: string | null;
  paiId: number | null;
  maeId: number | null;
  status: string | null;
};

export default function SimuladorCruzamento() {
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [machoId, setMachoId] = useState<string>("");
  const [femeaId, setFemeaId] = useState<string>("");
  const [focoAves, setFocoAves] = useState<"competicão" | "matriz">("competicão");

  useEffect(() => {
    fetch("/api/pombos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPombos(data);
      })
      .catch(() => {});
  }, []);

  const machos = useMemo(() => pombos.filter((p) => p.sexo === "macho"), [pombos]);
  const femeas = useMemo(() => pombos.filter((p) => p.sexo === "femea"), [pombos]);

  const machoSel = useMemo(() => pombos.find((p) => String(p.id) === machoId), [pombos, machoId]);
  const femeaSel = useMemo(() => pombos.find((p) => String(p.id) === femeaId), [pombos, femeaId]);

  const analise = useMemo(() => {
    if (!machoSel || !femeaSel) return null;

    // Verificar se há pais em comum (consanguinidade direta básica 1ª geração)
    const mesmoPai = machoSel.paiId && femeaSel.paiId && machoSel.paiId === femeaSel.paiId;
    const mesmaMae = machoSel.maeId && femeaSel.maeId && machoSel.maeId === femeaSel.maeId;
    const isIrmaos = mesmoPai || mesmaMae;

    let tipoCruzamento = "Outcross (Cruzamento Aberto)";
    let inbreeding = "0,0% (Baixa consanguinidade — Máximo Vigor Híbrido)";
    let scoreCompatibilidade = 92;
    let corDestaque = "#22C55E"; // verde

    if (isIrmaos) {
      tipoCruzamento = "Linebreeding Fechado / Meio-Irmãos";
      inbreeding = "12,5% a 25,0% (Consanguinidade Alta — Ideal para fixar plantel de reprodução)";
      scoreCompatibilidade = focoAves === "matriz" ? 95 : 72;
      corDestaque = focoAves === "matriz" ? "#EAB308" : "#F97316";
    }

    // Previsão de cores
    const coresPai = (machoSel.cor || "Azul").toLowerCase();
    const coresMae = (femeaSel.cor || "Azul").toLowerCase();
    let corPrevista = "Plumagem Azul Barro / Escama";
    if (coresPai.includes("vermelho") || coresMae.includes("vermelho")) {
      corPrevista = "50% Vermelho / Mosaico, 50% Escama Azul";
    } else if (coresPai.includes("branco") || coresMae.includes("branco") || coresPai.includes("pardo")) {
      corPrevista = "Plumagem Clara / Pardo / Malhado";
    }

    // Previsão de especialidade
    const especialidades = [
      { dist: "⚡ Velocidade (100–300 km)", prob: isIrmaos ? "25%" : "35%" },
      { dist: "🏃 Meio Fundo (300–500 km)", prob: "55% — Especialidade Predominante" },
      { dist: "🦅 Fundo / Maratona (> 500 km)", prob: isIrmaos ? "20%" : "10%" },
    ];

    return {
      tipoCruzamento,
      inbreeding,
      scoreCompatibilidade,
      corDestaque,
      corPrevista,
      especialidades,
      parecer:
        focoAves === "competicão"
          ? "Excelente combinação para gerar atletas competitivos com forte vitalidade e rápida recuperação pós-prova."
          : "Combinação técnica excelente para criar reprodutores capazes de fixar as características genéticas dominantes da linhagem.",
    };
  }, [machoSel, femeaSel, focoAves]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🧬 Simulador de Cruzamento Genético</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Preveja a compatibilidade, o vigor híbrido e a aptidão esportiva dos futuros filhotes do seu plantel
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 14 }}>
            ❤️ Seleção do Casal para Reprodução
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={T.label}>♂️ Macho (Pai)</label>
              <select
                value={machoId}
                onChange={(e) => setMachoId(e.target.value)}
                style={{ ...T.input, background: T.bgInput, color: T.white }}
              >
                <option value="">Selecione o Macho...</option>
                {machos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.anilha} — {m.nome || "Sem nome"} ({m.cor || "Cor não inf."})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={T.label}>♀️ Fêmea (Mãe)</label>
              <select
                value={femeaId}
                onChange={(e) => setFemeaId(e.target.value)}
                style={{ ...T.input, background: T.bgInput, color: T.white }}
              >
                <option value="">Selecione a Fêmea...</option>
                {femeas.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.anilha} — {f.nome || "Sem nome"} ({f.cor || "Cor não inf."})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: T.dim, fontWeight: 600 }}>🎯 Objetivo do Cruzamento:</span>
            <div style={{ display: "flex", gap: 6 }}>
              {(["competicão", "matriz"] as const).map((obj) => (
                <button
                  key={obj}
                  onClick={() => setFocoAves(obj)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: focoAves === obj ? T.gold : T.bgInput,
                    color: focoAves === obj ? T.bg : T.dim,
                    border: `1px solid ${focoAves === obj ? T.gold : T.border}`,
                  }}
                >
                  {obj === "competicão" ? "🏆 Gerar Atletas para Provas (Outcross)" : "🧬 Fixar Linhagem (Reprodutores)"}
                </button>
              ))}
            </div>
          </div>
        </section>

        {analise ? (
          <div>
            <section
              style={{
                ...T.card,
                border: `2px solid ${analise.corDestaque}`,
                background: `${analise.corDestaque}0f`,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: analise.corDestaque, textTransform: "uppercase" }}>
                    COMPATIBILIDADE GENÉTICA ESTESTIMADA
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: T.white, marginTop: 4 }}>
                    {analise.tipoCruzamento}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: analise.corDestaque }}>
                    {analise.scoreCompatibilidade}%
                  </div>
                  <div style={{ fontSize: 11, color: T.dim }}>Índice de sucesso</div>
                </div>
              </div>

              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "#ffffff08", fontSize: 13 }}>
                💡 <b>Parecer Técnico:</b> {analise.parecer}
              </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 16 }}>
              <section style={T.card}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
                  ⚡ Previsão de Aptidão Esportiva dos Filhotes
                </div>
                {analise.especialidades.map((e) => (
                  <div
                    key={e.dist}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: `1px solid ${T.border}`,
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: T.white }}>{e.dist}</span>
                    <strong style={{ color: e.prob.includes("55%") ? "#22C55E" : T.gold }}>{e.prob}</strong>
                  </div>
                ))}
              </section>

              <section style={T.card}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
                  🎨 Características Hereditárias
                </div>
                <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.8 }}>
                  • <b>Consanguinidade (COI):</b> <span style={{ color: T.white }}>{analise.inbreeding}</span>
                  <br />
                  • <b>Plumagem Esperada:</b> <span style={{ color: T.white }}>{analise.corPrevista}</span>
                  <br />• <b>Recuperação Muscular:</b> <span style={{ color: "#4ADE80" }}>Alta capacidade aeróbica</span>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 40, color: T.dim, background: T.bgCard, borderRadius: 14, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🧬</div>
            <b>Selecione um Macho e uma Fêmea acima para iniciar a simulação genética.</b>
            <p style={{ ...T.small, marginTop: 4 }}>
              O sistema analisará automaticamente o grau de parentesco e as características da plumagem.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
