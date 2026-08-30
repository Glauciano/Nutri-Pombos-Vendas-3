"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";
import { COORDS, POMBAL_BASE, SolDia, aplicarPombalSalvo, EVENTO_POMBAL, buscarSol, fmtHoras, faseLua } from "../lib/apis-gratis";

type FaseAno = "escurecimento_borrachos" | "pre_temporada" | "temporada_oficial" | "luz_artificial_classicas";

const FASES_FOTOPERIODO: Record<
  FaseAno,
  {
    titulo: string;
    meses: string;
    luzHoras: number;
    escuroHoras: number;
    horarioAbrir: string;
    horarioFechar: string;
    cor: string;
    objetivo: string;
    instrucoes: string[];
  }
> = {
  escurecimento_borrachos: {
    titulo: "Sistema de Escurecimento (Darkness) — Borrachos",
    meses: "Fevereiro a Maio (14 semanas antes do primeiro concurso)",
    luzHoras: 10,
    escuroHoras: 14,
    horarioAbrir: "08:00",
    horarioFechar: "18:00",
    cor: "#A78BFA",
    objetivo: "Acelerar a muda da penugem do corpo enquanto retém 100% das penas primárias de voo (P1 a P10).",
    instrucoes: [
      "Fechar as cortinas ou persianas à prova de luz rigorosamente às 18:00 todos os dias",
      "O pombal deve ter ventilação excelente mesmo escurecido — ar fresco é vital",
      "Abrir as cortinas às 08:00 da manhã para soltura de treino e alimentação",
      "Interromper o escurecimento 3 semanas antes do encestamento principal da temporada",
    ],
  },
  pre_temporada: {
    titulo: "Transição Pré-Temporada (Luz Natural)",
    meses: "Junho (3 semanas antes dos concursos)",
    luzHoras: 12,
    escuroHoras: 12,
    horarioAbrir: "06:30",
    horarioFechar: "18:30",
    cor: "#38bdf8",
    objetivo: "Despertar o sistema hormonal de competição, libido de viuvez e motivação territorial.",
    instrucoes: [
      "Retirar gradualmente o escurecimento ao longo de 7 dias (abrir 30 min mais cedo por dia)",
      "Aumentar o tempo de soltura de treino ao redor do pombal para 60 a 90 minutos diários",
      "Introduzir o agendamento de banhos mornos com sais de banho às quartas-feiras",
    ],
  },
  temporada_oficial: {
    titulo: "Temporada de Competição Oficial (Estabilidade)",
    meses: "Julho a Setembro",
    luzHoras: 14,
    escuroHoras: 10,
    horarioAbrir: "06:00",
    horarioFechar: "20:00",
    cor: "#22C55E",
    objetivo: "Manter o pico de forma física e evitar o início da muda das penas primárias de ponta de asa.",
    instrucoes: [
      "Manter rotina de horários 100% pontual — pombos são extremamente sensíveis à regularidade",
      "Evitar perturbações no pombal durante o período de descanso noturno",
      "Após retorno de provas difíceis, manter iluminação suave para repouso absoluto",
    ],
  },
  luz_artificial_classicas: {
    titulo: "Sistema de Luz Artificial (Extensão do Dia) — Clássicas",
    meses: "Setembro a Novembro (Fundo e Clássicas finais)",
    luzHoras: 16,
    escuroHoras: 8,
    horarioAbrir: "05:30",
    horarioFechar: "21:30",
    cor: "#EAB308",
    objetivo: "Enganar o relógio biológico da ave simulando dias longos de verão para prolongar o auge esportivo.",
    instrucoes: [
      "Acender lâmpadas LED de espectro solar (5000K a 6500K) das 05:30 às 07:00 e das 18:30 às 21:30",
      "Usar temporizador (timer) eletrônico automático para acendimento gradual sem estresse",
      "Indispensável para que pombos velhos disputem concursos de fundo sem derramar penas primárias",
    ],
  },
};

export default function ControleFotoperiodo() {
  const [faseSel, setFaseSel] = useState<FaseAno>("escurecimento_borrachos");
  const info = FASES_FOTOPERIODO[faseSel];

  // 🌅 Nascer/Pôr do Sol reais (Open-Meteo — gratuito, sem chave)
  const [cidadeSol, setCidadeSol] = useState<string>(POMBAL_BASE);
  const [sol, setSol] = useState<SolDia[] | null>(null);
  const [solErro, setSolErro] = useState("");
  const [solLoading, setSolLoading] = useState(false);

  const consultarSol = useCallback(async (cidade: string) => {
    const coord = COORDS[cidade];
    if (!coord) { setSolErro("Cidade sem coordenadas cadastradas."); return; }
    setSolLoading(true); setSolErro("");
    try { setSol(await buscarSol(coord.lat, coord.lon)); }
    catch (e) { setSol(null); setSolErro(`Não foi possível obter o horário do sol agora. ${e instanceof Error ? e.message : "Erro de rede"}`); }
    finally { setSolLoading(false); }
  }, []);

  useEffect(() => {
    aplicarPombalSalvo();
    consultarSol(cidadeSol);
    const atualizar = () => consultarSol(cidadeSol);
    window.addEventListener(EVENTO_POMBAL, atualizar);
    return () => window.removeEventListener(EVENTO_POMBAL, atualizar);
  }, [cidadeSol, consultarSol]);

  const hojeSol = sol?.[0];
  // Comparação entre a luz natural de hoje e a meta da fase selecionada
  let paredeLuz: { texto: string; cor: string } | null = null;
  if (hojeSol) {
    const diffMin = Math.round((info.luzHoras - hojeSol.horasLuz) * 60);
    if (diffMin > 15) paredeLuz = { texto: `☀️ A fase "${info.titulo}" exige ${info.luzHoras}h de luz, mas o sol de hoje só entrega ${fmtHoras(hojeSol.horasLuz)} — acenda luz artificial por ~${fmtHoras(diffMin / 60)} para completar a meta.`, cor: T.gold };
    else if (diffMin < -15) paredeLuz = { texto: `🌙 O sol de hoje entrega ${fmtHoras(hojeSol.horasLuz)} de luz — mais que a meta de ${info.luzHoras}h da fase. Feche as cortinas ~${fmtHoras(Math.abs(diffMin) / 60)} antes do pôr do sol para escurecer.`, cor: "#A78BFA" };
    else paredeLuz = { texto: `✅ A luz natural de hoje (${fmtHoras(hojeSol.horasLuz)}) já está de acordo com a meta da fase.`, cor: T.green };
  }

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>💡 Simulador do Sistema Darkness & Light (Fotoperíodo)</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Gerencie a rotina diária de luz e escuridão do pombal para controlar a muda e estender a forma esportiva
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 12 }}>
            📅 Selecione a Fase da Temporada do seu Pombal:
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {(Object.entries(FASES_FOTOPERIODO) as [FaseAno, typeof info][]).map(([key, f]) => (
              <button
                key={key}
                onClick={() => setFaseSel(key)}
                style={{
                  padding: 14,
                  borderRadius: 11,
                  textAlign: "left",
                  cursor: "pointer",
                  background: faseSel === key ? `${f.cor}18` : T.bgInput,
                  border: `2px solid ${faseSel === key ? f.cor : T.border}`,
                  color: faseSel === key ? f.cor : T.white,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.3 }}>{f.titulo}</div>
                <div style={{ fontSize: 11, color: T.dim, marginTop: 4 }}>{f.meses}</div>
              </button>
            ))}
          </div>
        </section>

        {/* 🌅 NASCER E PÔR DO SOL REAIS — Open-Meteo (gratuito, sem chave) */}
        <section style={{ ...T.card, borderColor: `${T.gold}55`, background: `${T.gold}0d`, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>
              🌅 Nascer e Pôr do Sol — Dados Reais (Open-Meteo)
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={cidadeSol} onChange={(e) => setCidadeSol(e.target.value)} style={{ ...T.input, width: "auto", minHeight: 36, padding: "6px 10px", fontSize: 12 }}>
                {Object.keys(COORDS).map((c) => <option key={c} value={c}>{c === POMBAL_BASE ? "🏠 Pombal (base)" : c}</option>)}
              </select>
              <button onClick={() => consultarSol(cidadeSol)} disabled={solLoading} style={{ ...T.btnSm, opacity: solLoading ? 0.6 : 1 }}>
                {solLoading ? "⏳" : "↻"}
              </button>
            </div>
          </div>

          {solErro && <div style={{ padding: 12, borderRadius: 9, color: T.red, background: `${T.red}12`, border: `1px solid ${T.red}44`, fontSize: 12 }}>⚠️ {solErro}</div>}
          {solLoading && !sol && <div style={{ textAlign: "center", padding: 20, color: T.dim, fontSize: 13 }}>⏳ Consultando o horário do sol...</div>}

          {hojeSol && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                <div style={{ padding: 14, borderRadius: 10, background: "rgba(245,158,11,0.12)", border: "1px solid #F59E0B55", textAlign: "center" }}>
                  <div style={{ fontSize: 22 }}>🌅</div>
                  <div style={{ ...T.small, fontSize: 10 }}>NASCER DO SOL</div>
                  <b style={{ fontSize: 24, color: T.gold }}>{hojeSol.nascer}</b>
                </div>
                <div style={{ padding: 14, borderRadius: 10, background: "rgba(167,139,250,0.12)", border: "1px solid #A78BFA55", textAlign: "center" }}>
                  <div style={{ fontSize: 22 }}>🌇</div>
                  <div style={{ ...T.small, fontSize: 10 }}>PÔR DO SOL</div>
                  <b style={{ fontSize: 24, color: "#A78BFA" }}>{hojeSol.por}</b>
                </div>
                <div style={{ padding: 14, borderRadius: 10, background: "rgba(85,163,255,0.12)", border: "1px solid #55a3ff55", textAlign: "center" }}>
                  <div style={{ fontSize: 22 }}>☀️</div>
                  <div style={{ ...T.small, fontSize: 10 }}>LUZ NATURAL HOJE</div>
                  <b style={{ fontSize: 24, color: T.blue }}>{fmtHoras(hojeSol.horasLuz)}</b>
                </div>
              </div>

              {paredeLuz && (
                <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 10, color: paredeLuz.cor, background: `${paredeLuz.cor}12`, border: `1px solid ${paredeLuz.cor}55`, fontSize: 12, lineHeight: 1.5 }}>
                  {paredeLuz.texto}
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <div style={{ ...T.small, fontSize: 11, marginBottom: 6 }}>📅 Próximos dias:</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 6 }}>
                  {sol?.slice(1).map((d) => (
                    <div key={d.data} style={{ padding: "8px 10px", borderRadius: 8, background: "#ffffff08", fontSize: 11 }}>
                      <b style={{ color: T.gold }}>{new Date(`${d.data}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "numeric" })}</b>
                      <div style={{ ...T.small, fontSize: 11 }}>🌅 {d.nascer} • 🌇 {d.por} • ☀️ {fmtHoras(d.horasLuz)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...T.small, marginTop: 10, fontSize: 11 }}>Fonte: Open-Meteo • horários no fuso de São Paulo (GMT-3)</div>
            </>
          )}
        </section>

        {/* 🌙 Fase da lua (cálculo astronômico local — funciona offline) */}
        <section style={{ ...T.card, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🌙 Fase da Lua</div>
          {(() => {
            const hoje = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
            const lua = faseLua(hoje);
            const proximos = (sol || []).slice(1, 7).map((d) => ({ data: d.data, l: faseLua(d.data) }));
            return (
              <div>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ fontSize: 52 }}>{lua.emoji}</div>
                  <div>
                    <b style={{ fontSize: 18 }}>{lua.fase}</b>
                    <div style={{ ...T.small }}>Iluminação: <b style={{ color: T.gold }}>{lua.iluminacao}%</b> • hoje</div>
                    <div style={{ ...T.small, fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>
                      {lua.iluminacao >= 75
                        ? "🌙 Lua quase cheia: noites mais claras — borrachos podem se demorar e a duração do voo muda pouco, mas o escurecimento do pombal precisa ser mais rigoroso."
                        : lua.iluminacao <= 25
                          ? "🌑 Lua nova/escura: noites escuras — retorno tardio fica mais difícil; solturas longas no fim da tarde pedem atenção."
                          : "🌓 Lua intermediária: efeito luminoso noturno moderado no comportamento de retorno."}
                    </div>
                  </div>
                </div>
                {proximos.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 6, marginTop: 12 }}>
                    {proximos.map((d) => (
                      <div key={d.data} style={{ padding: 8, borderRadius: 8, background: "#ffffff08", textAlign: "center" }}>
                        <div style={{ fontSize: 18 }}>{d.l.emoji}</div>
                        <b style={{ fontSize: 11, color: T.gold }}>{new Date(`${d.data}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "numeric" })}</b>
                        <div style={{ ...T.small, fontSize: 10 }}>{d.l.iluminacao}%</div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ ...T.small, fontSize: 11, marginTop: 10 }}>Cálculo astronômico local — funciona até sem internet.</div>
              </div>
            );
          })()}
        </section>

        <section
          style={{
            ...T.card,
            border: `2px solid ${info.cor}`,
            background: `${info.cor}0f`,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: info.cor, textTransform: "uppercase" }}>
                CONFIGURAÇÃO DIÁRIA DO FOTOPERÍODO
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: T.white, marginTop: 4 }}>
                {info.titulo}
              </div>
              <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>
                <b>Objetivo Técnico:</b> {info.objetivo}
              </div>
            </div>

            <div style={{ display: "flex", gap: 18, textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: T.gold }}>{info.luzHoras}h</div>
                <div style={{ fontSize: 11, color: T.dim }}>Luz (Dia)</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#A78BFA" }}>{info.escuroHoras}h</div>
                <div style={{ fontSize: 11, color: T.dim }}>Escuridão (Noite)</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "18px 0 10px" }}>
            <div style={{ padding: 14, borderRadius: 10, background: "rgba(34,197,94,0.12)", border: "1px solid #22C55E55" }}>
              <span style={{ fontSize: 12, color: "#22C55E", fontWeight: 800 }}>☀️ ABRIR CORTINAS / LUZ</span>
              <div style={{ fontSize: 28, fontWeight: 900, color: T.white, marginTop: 4 }}>{info.horarioAbrir}</div>
            </div>
            <div style={{ padding: 14, borderRadius: 10, background: "rgba(167,139,250,0.12)", border: "1px solid #A78BFA55" }}>
              <span style={{ fontSize: 12, color: "#A78BFA", fontWeight: 800 }}>🌙 FECHAR CORTINAS / ESCURO</span>
              <div style={{ fontSize: 28, fontWeight: 900, color: T.white, marginTop: 4 }}>{info.horarioFechar}</div>
            </div>
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
            📋 Instruções de Manejo do Fotoperíodo
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {info.instrucoes.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: 12,
                  borderRadius: 9,
                  background: "#ffffff0a",
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                • {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
