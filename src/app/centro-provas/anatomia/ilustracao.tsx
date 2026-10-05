"use client";

import { useState } from "react";
import { T } from "../theme";

type Props = {
  comprimento: "longa_curva" | "media_padrao" | "curta";
  profundidade: "rasa_aerodinamica" | "media" | "profunda_quilha_alta";
  forquilha: "fechada_rigida" | "firme_leve_abertura" | "aberta_flexivel";
  baricentro: "equilibrado_frente" | "neutro" | "peso_traseiro";
};

const PARTES: Record<string, { nome: string; cor: string; desc: string }> = {
  quilha: {
    nome: "🦴 Quilha (esterno)",
    cor: "#f7bd00",
    desc: "O 'osso do peito': quanto mais LONGA e ligeiramente CURVADA, maior a área de inserção dos músculos peitorais — o motor do bater de asas. Profunda demais pesa; rasa demais indica musculatura fraca. O ideal clássico: longa, com curva suave e 'carne por cima do osso'.",
  },
  forquilha: {
    nome: "🦴 Forquilha (ossos pélvicos)",
    cor: "#55a3ff",
    desc: "Os dois ossinhos atrás, perto da cloaca. A tradição pede FECHADA e RÍGIDA (um dedo de folga no máximo) — sinal de estrutura forte e boa condição. Aberta/flexível demais: fora de forma ou estrutura fraca. Em fêmeas em postura, abertura maior é normal.",
  },
  baricentro: {
    nome: "⚖️ Baricentro (equilíbrio)",
    cor: "#39e58c",
    desc: "O ponto de equilíbrio do corpo: o pombo ideal fica EQUILIBRADO COM LEVE PESO À FRENTE — pronto pra 'cair pra frente' e ganhar velocidade. Peso demais atrás = pombo 'flutuador', perde propulsão.",
  },
};

export default function IlustracaoAnatomia({ profundidade, forquilha, baricentro }: Props) {
  const [sel, setSel] = useState<string | null>("quilha");
  const [zoom, setZoom] = useState(false);
  const info = sel ? PARTES[sel] : null;

  // parâmetros dinâmicos conforme seletores
  const forqGap = forquilha === "aberta_flexivel" ? 14 : forquilha === "firme_leve_abertura" ? 7 : 3;
  const bcX = baricentro === "peso_traseiro" ? 55 : baricentro === "neutro" ? 50 : 45; // % da largura
  const quilhaTexto = profundidade === "profunda_quilha_alta" ? "profunda" : profundidade === "media" ? "média" : "rasa";

  return (
    <div>
      <div style={{ ...T.small, fontSize: 11, marginBottom: 8, lineHeight: 1.5 }}>
        📸 <b>Pombo-correio real</b> com os marcadores do Triângulo de Ouro — toque nos marcadores ou na foto ampliada
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* FOTO + MARCADORES */}
        <div style={{ position: "relative", flex: 1, minWidth: 260, borderRadius: 12, overflow: "hidden", border: `1.5px solid ${sel ? `${PARTES[sel].cor}66` : "#31415a"}`, cursor: zoom ? "zoom-out" : "zoom-in", background: "#0b1529" }} onClick={() => setZoom((z) => !z)} title={zoom ? "clique para reduzir" : "clique para ampliar"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/anatomia-pombo.jpg" alt="Pombo-correio com marcadores anatômicos: quilha, forquilha e baricentro" style={{ width: "100%", display: "block", transform: zoom ? "scale(1.5)" : "scale(1)", transition: "transform .25s ease" }} />
          {/* marcadores SVG por cima da foto — coordenadas em % */}
          {!zoom && (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              {/* QUIlHA: curva dourada sob o peito (aprox 30-55% larg, 55-70% alt) */}
              <g onClick={(e) => { e.stopPropagation(); setSel("quilha"); }} style={{ cursor: "pointer" }} opacity={sel && sel !== "quilha" ? 0.4 : 1}>
                <path d="M32 52 Q42 66 55 60" stroke={PARTES.quilha.cor} strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <circle cx="32" cy="52" r="1.4" fill={PARTES.quilha.cor} />
                <text x="30" y="78" fontSize="4" fontWeight="800" fill={PARTES.quilha.cor}>quilha ({quilhaTexto})</text>
              </g>
              {/* FORQUILHA: dois pontos azuis atrás (aprox 68-76% larg, 62-70% alt) */}
              <g onClick={(e) => { e.stopPropagation(); setSel("forquilha"); }} style={{ cursor: "pointer" }} opacity={sel && sel !== "forquilha" ? 0.4 : 1}>
                <circle cx="67" cy="63" r="1.5" fill={PARTES.forquilha.cor} />
                <circle cx="67" cy={63 + forqGap * 0.35} r="1.5" fill={PARTES.forquilha.cor} />
                <line x1="67" y1="63" x2="67" y2={63 + forqGap * 0.35} stroke={`${PARTES.forquilha.cor}99`} strokeWidth="0.5" strokeDasharray="1 0.6" />
                <text x="58" y="84" fontSize="4" fontWeight="800" fill={PARTES.forquilha.cor}>forquilha {forquilha === "fechada_rigida" ? "(fechada ✓)" : forquilha === "firme_leve_abertura" ? "(leve)" : "(aberta!)"}</text>
              </g>
              {/* BARICENTRO: círculo verde (posição dinâmica) */}
              <g onClick={(e) => { e.stopPropagation(); setSel("baricentro"); }} style={{ cursor: "pointer" }} opacity={sel && sel !== "baricentro" ? 0.4 : 1}>
                <circle cx={bcX} cy="48" r="4.5" fill="none" stroke={PARTES.baricentro.cor} strokeWidth="1.2" strokeDasharray="1.5 1" />
                <circle cx={bcX} cy="48" r="1" fill={PARTES.baricentro.cor} />
                <line x1={bcX} y1="53" x2={bcX} y2="60" stroke={`${PARTES.baricentro.cor}77`} strokeWidth="0.5" />
                <text x={bcX - 6} y="76" fontSize="4" fontWeight="800" fill={PARTES.baricentro.cor}>baricentro</text>
              </g>
            </svg>
          )}
        </div>

        {/* PAINEL */}
        <div style={{ flex: 1, minWidth: 210 }}>
          {info && (
            <div style={{ padding: 13, borderRadius: 12, background: "#ffffff08", border: `1px solid ${info.cor}55` }}>
              <b style={{ color: info.cor, fontSize: 13.5 }}>{info.nome}</b>
              <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.75, marginTop: 7 }}>{info.desc}</div>
              <div style={{ ...T.small, fontSize: 10, marginTop: 8, color: "#64748b" }}>Os marcadores na foto se movem conforme seus seletores acima ⬆️</div>
            </div>
          )}
          <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
            {Object.entries(PARTES).map(([k, v]) => (
              <button key={k} type="button" onClick={() => setSel(k)} style={{ padding: "8px 11px", borderRadius: 8, textAlign: "left", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: sel === k ? "#0b1426" : T.white, background: sel === k ? v.cor : "#ffffff08", border: `1px solid ${sel === k ? v.cor : "#31415a"}` }}>
                {v.nome}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
