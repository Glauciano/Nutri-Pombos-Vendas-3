"use client";

import { useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type Caso = "desidratado" | "exausto" | "ferido" | "fezes_verdes";

const PROTOCOLOS_RESGATE: Record<Caso, { titulo: string; emoji: string; urgencia: string; cor: string; acoes: string[]; obs: string }> = {
  desidratado: {
    titulo: "Extraviado Pós-Prova (2 a 4 dias de atraso) — Desidratado",
    emoji: "💧",
    urgencia: "ALTA — Risco hidroeletrolítico",
    cor: "#38bdf8",
    acoes: [
      "PASSO 1: Imediatamente fornecer água morna limpa com Eletrólito (dose 5g/L) à vontade",
      "PASSO 2: NÃO fornecer ração pesada (milho, ervilha, soja) nas primeiras 6 horas",
      "PASSO 3: Após 6 horas, ofertar 10g de mistura depurativa leve (sorgo, cevada, arroz em casca, cártamo)",
      "PASSO 4: Manter a ave em box individual, escuro, calmo e longe do vento",
    ],
    obs: "A introdução brusca de grãos pesados em uma ave desidratada pode causar estase de papo e toxemia grave.",
  },
  exausto: {
    titulo: "Esgotamento Muscular Severo / Peito Seco Pós-Prova",
    emoji: "⚡",
    urgencia: "MÉDIA-ALTA — Reconstrução hepática",
    cor: "#EAB308",
    acoes: [
      "PASSO 1: Água com glicose 5% ou Glicopan nas primeiras 12 horas para suporte de fígado",
      "PASSO 2: Adicionar probiótico/prebiótico (Organew 2g/kg) na ração depurativa",
      "PASSO 3: A partir do 2º dia, introduzir gradativamente sementes oleaginosas leves (amendoim quebrado, girassol)",
      "PASSO 4: Proibir voo ao redor do pombal por 7 dias completos",
    ],
    obs: "O músculo peitoral precisa de 5 a 7 dias para recuperar o glicogênio perdido em maratonas extenuantes.",
  },
  ferido: {
    titulo: "Ataque de Gavião / Falcão ou Choque em Cabos",
    emoji: "🦅",
    urgencia: "EMERGÊNCIA — Risco de infecção",
    cor: "#EF4444",
    acoes: [
      "PASSO 1: Limpar imediatamente os ferimentos com soro fisiológico morno e antisséptico (clorexidina aquosa)",
      "PASSO 2: Em caso de penas de voo quebradas na raiz com sangramento, estancar e avaliar remoção veterinária",
      "PASSO 3: Isolar a ave em gaiola aquecida e silenciosa com piso macio",
      "PASSO 4: Consultar Médico Veterinário sobre antibiótico sistêmico de profilaxia (ex: enrofloxacina / amoxicilina)",
    ],
    obs: "Garras de aves de rapina abrigam bactérias agressivas. O isolamento e limpeza imediata evitam septicemia.",
  },
  fezes_verdes: {
    titulo: "Estresse Severo com Fezes Verdes Esmeralda / Água",
    emoji: "🦠",
    urgencia: "ALTA — Disbiose / Coccidiose de estresse",
    cor: "#A78BFA",
    acoes: [
      "PASSO 1: Suspensão imediata de grit mineral e areia da gaiola (irrita a mucosa)",
      "PASSO 2: Água com eletrólito e probiótico em alta dosagem por 3 dias seguidos",
      "PASSO 3: Alimento 100% depurativo cozido ou tostado levemente se não houver apetite",
      "PASSO 4: Monitorar fezes por 48h; se persistir verde viscoso, realizar exame parasitológico",
    ],
    obs: "Fezes verdes neon indicam que a ave consumiu toda a reserva e está excretando bile pura. Requer suporte intestinal.",
  },
};

export default function ResgateExtraviados() {
  const [casoSel, setCasoSel] = useState<Caso>("desidratado");
  const d = PROTOCOLOS_RESGATE[casoSel];

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🚨 Protocolo Médico de Resgate (Extraviados)</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Guia clínico de triagem e reabilitação emergencial para pombos retornados com atraso ou debilitados
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 14 }}>
            🔍 Selecione a Condição do Pombo Resgatado:
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {(Object.entries(PROTOCOLOS_RESGATE) as [Caso, typeof d][]).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setCasoSel(key)}
                style={{
                  padding: 14,
                  borderRadius: 11,
                  textAlign: "left",
                  cursor: "pointer",
                  background: casoSel === key ? `${info.cor}18` : T.bgInput,
                  border: `2px solid ${casoSel === key ? info.cor : T.border}`,
                  color: casoSel === key ? info.cor : T.white,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{info.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.3 }}>{info.titulo}</div>
                <div style={{ fontSize: 11, color: info.cor, marginTop: 6, fontWeight: 700 }}>{info.urgencia}</div>
              </button>
            ))}
          </div>
        </section>

        <section
          style={{
            ...T.card,
            border: `2px solid ${d.cor}`,
            background: `${d.cor}0f`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 36 }}>{d.emoji}</span>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: d.cor, textTransform: "uppercase" }}>
                PLANO DE REABILITAÇÃO • {d.urgencia}
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: T.white, margin: "4px 0 0" }}>
                {d.titulo}
              </h2>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10, margin: "16px 0" }}>
            {d.acoes.map((acao, idx) => (
              <div
                key={idx}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: "#ffffff0a",
                  borderLeft: `4px solid ${d.cor}`,
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                {acao}
              </div>
            ))}
          </div>

          <div style={{ padding: 12, borderRadius: 9, background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.4)", fontSize: 12, color: T.gold }}>
            💡 <b>Atenção do Columbófilo:</b> {d.obs}
          </div>
        </section>
      </div>
    </main>
  );
}
