"use client";

import { useState } from "react";
import { T } from "../theme";

type Props = {
  comprimento: "longa_curva" | "media_padrao" | "curta";
  profundidade: "rasa_aerodinamica" | "media" | "profunda_quilha_alta";
  forquilha: "fechada_rigida" | "firme_leve_abertura" | "aberta_flexivel";
  baricentro: "equilibrado_frente" | "neutro" | "peso_traseiro";
};

const INFO: Record<string, { nome: string; cor: string; desc: string }> = {
  quilha: {
    nome: "🦴 QUIlHA (esterno)",
    cor: "#f7bd00",
    desc: "O 'osso do peito': quanto mais LONGA e ligeiramente CURVADA, maior a área de inserção dos músculos peitorais — o motor do bater de asas. Profunda demais (muito saliente) pesa; rasa demais indica musculatura fraca. O ideal clássico: longa, com curva suave e 'carne por cima do osso'.",
  },
  forquilha: {
    nome: "🦴 FORQUILHA (ossos pélvicos)",
    cor: "#55a3ff",
    desc: "Os dois ossinhos atrás, perto da cloaca. A tradição pede FECHADA e RÍGIDA (um dedo de folga no máximo, sem flexionar) — sinal de estrutura óssea forte e boa condição. Aberta/flexível demais: pombo fora de forma ou estrutura fraca. Em fêmeas em postura, uma abertura maior é normal.",
  },
  baricentro: {
    nome: "⚖️ BARICENTRO (equilíbrio)",
    cor: "#39e58c",
    desc: "O ponto de equilíbrio do corpo: suspenso pelo bico ou deitado na mão, o pombo ideal fica EQUILIBRADO COM LEVE PESO À FRENTE — pronto pra 'cair pra frente' e ganhar velocidade no ar. Peso demais atrás = pombo 'flutuador', perde propulsão.",
  },
  musculo: {
    nome: "💪 MÚSCULO PEITORAL",
    cor: "#f97316",
    desc: "Sobre a quilha: deve preencher a 'vala' do osso com sensação de esponja firme — nem dura como pedra (fadiga) nem mole (sem forma). O toque do criador avalia: coração de pombo na palma da mão.",
  },
  asa: {
    nome: "🪽 ASA (secundárias na cola)",
    cor: "#a78bfa",
    desc: "As penas secundárias devem terminar alinhadas com o corpo/cola — a 'asa secundária na linha do dorso' dos clássicos. Asa curta demais abre 'degrau' entre secundárias e primárias.",
  },
};

export default function IlustracaoAnatomia({ comprimento, profundidade, forquilha, baricentro }: Props) {
  const [sel, setSel] = useState<string | null>("quilha");
  const info = sel ? INFO[sel] : null;

  // parâmetros conforme as escolhas do usuário
  const quilhaX = comprimento === "longa_curva" ? 150 : comprimento === "media_padrao" ? 170 : 188;
  const quilhaW = comprimento === "longa_curva" ? 150 : comprimento === "media_padrao" ? 120 : 92;
  const quilhaDepth = profundidade === "profunda_quilha_alta" ? 46 : profundidade === "media" ? 34 : 24;
  const forqGap = forquilha === "aberta_flexivel" ? 16 : forquilha === "firme_leve_abertura" ? 8 : 3;
  const bcX = baricentro === "peso_traseiro" ? 262 : baricentro === "neutro" ? 238 : 214; // ponto de equilíbrio desloca

  const P = ({ id, children, cor }: { id: string; children: React.ReactNode; cor: string }) => (
    <g
      onClick={() => setSel(id)}
      onMouseEnter={() => setSel(id)}
      style={{ cursor: "pointer" }}
      opacity={sel === null || sel === id ? 1 : 0.45}
    >
      {children}
      {sel === id && (
        <circle cx={0} cy={0} r={0} fill="none">
          {/* marker visual via filter no grupo */}
        </circle>
      )}
      <title>{INFO[id].nome}</title>
      {sel === id && (
        <g>
          {/* anel de seleção genérico desenhado por cima no fim */}
        </g>
      )}
      <animate attributeName="opacity" values="1;1" dur="0.1s" />
      {sel === id && <rect x={-400} y={-400} width={800} height={800} fill={`${cor}08`} pointerEvents="none" />}
    </g>
  );

  return (
    <div>
      <div style={{ ...T.small, fontSize: 11, marginBottom: 8, lineHeight: 1.5 }}>
        🖱️ <b>Ilustração interativa</b> (original do app): toque/passe o mouse em cada parte. O desenho <b>muda conforme seus seletores acima</b> — quilha encurta/profunda, forquilha abre, ponto de equilíbrio desloca!
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg viewBox="0 0 520 330" style={{ flex: 1, minWidth: 280, background: "#0b1529", borderRadius: 12, border: `1px solid ${T.border}` }}>
          {/* ===== CORPO DO POMBO (perfil olhando p/ esquerda) ===== */}
          {/* cauda */}
          <path d="M330 170 L470 150 L474 162 L338 186 Z" fill="#2b3a52" stroke="#31415a" />
          {/* corpo */}
          <ellipse cx="255" cy="160" rx="88" ry="54" fill="#33425c" stroke="#3f5170" strokeWidth="2" />
          {/* asa (primárias + secundárias) */}
          <P id="asa" cor={INFO.asa.cor}>
            <path d="M225 138 Q290 108 372 128 Q330 176 250 180 Q225 162 225 138 Z" fill="#3b4d6e" stroke="#4a5d80" strokeWidth="1.5" />
            <path d="M240 168 L360 138 M236 158 L352 130 M234 150 L342 124" stroke="#55a3ff55" strokeWidth="1.5" />
            <path d="M232 176 Q290 186 340 158" stroke={INFO.asa.cor} strokeWidth="3" fill="none" />
          </P>
          {/* músculo peitoral */}
          <P id="musculo" cor={INFO.musculo.cor}>
            <path d="M175 130 Q225 118 252 140 Q248 178 200 186 Q170 165 175 130 Z" fill="#4a4358" stroke="#5d5570" strokeWidth="1.5" />
            <ellipse cx="212" cy="155" rx="30" ry="21" fill={`${INFO.musculo.cor}22`} />
            <path d="M196 148 Q214 140 228 152" stroke={INFO.musculo.cor} strokeWidth="2" fill="none" />
          </P>
          {/* pescoço + cabeça */}
          <path d="M172 138 Q150 118 138 98" stroke="#33425c" strokeWidth="26" strokeLinecap="round" fill="none" />
          <circle cx="134" cy="92" r="21" fill="#33425c" stroke="#3f5170" strokeWidth="2" />
          {/* bico */}
          <path d="M116 88 L88 82 L116 96 Z" fill="#ca8a04" />
          {/* olho */}
          <circle cx="128" cy="86" r="4.5" fill="#f97316" />
          <circle cx="128" cy="86" r="2" fill="#0b1426" />
          {/* perna (discreta) */}
          <path d="M272 208 L282 240 M292 206 L304 238" stroke="#ca8a04" strokeWidth="4" strokeLinecap="round" />

          {/* ===== QUIlHA — muda com comprimento/profundidade ===== */}
          <P id="quilha" cor={INFO.quilha.cor}>
            <path
              d={`M${quilhaX} 186 Q${quilhaX + quilhaW / 2} ${186 + quilhaDepth} ${quilhaX + quilhaW} 178`}
              stroke={INFO.quilha.cor}
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            <text x={quilhaX + quilhaW / 2} y={186 + quilhaDepth + 24} textAnchor="middle" fill={INFO.quilha.cor} fontSize="10" fontWeight="800">
              QUIlHA {comprimento === "longa_curva" ? "longa+curva" : comprimento === "media_padrao" ? "média" : "curta"} · {profundidade === "profunda_quilha_alta" ? "profunda" : profundidade === "media" ? "média" : "rasa"}
            </text>
          </P>

          {/* ===== FORQUILHA — gap muda ===== */}
          <P id="forquilha" cor={INFO.forquilha.cor}>
            <path d={`M310 200 Q330 ${198 + forqGap / 2} 352 198`} stroke={INFO.forquilha.cor} strokeWidth="4" fill="none" />
            <circle cx="312" cy="199" r="3.5" fill={INFO.forquilha.cor} />
            <circle cx="350" cy="197" r="3.5" fill={INFO.forquilha.cor} />
            <line x1="322" y1="190" x2="340" y2={190 + forqGap} stroke={`${INFO.forquilha.cor}88`} strokeWidth="1.5" strokeDasharray="3 2" />
            <text x="330" y={214 + forqGap} textAnchor="middle" fill={INFO.forquilha.cor} fontSize="10" fontWeight="800">
              forquilha {forquilha === "fechada_rigida" ? "fechada ✓" : forquilha === "firme_leve_abertura" ? "leve abertura" : "aberta!"}
            </text>
          </P>

          {/* ===== BARICENTRO — ponto desloca ===== */}
          <P id="baricentro" cor={INFO.baricentro.cor}>
            {/* fulcro (balança) */}
            <path d={`M${bcX} 232 L${bcX - 12} 252 L${bcX + 12} 252 Z`} fill={`${INFO.baricentro.cor}55`} stroke={INFO.baricentro.cor} strokeWidth="2" />
            <line x1={bcX - 30} y1="252" x2={bcX + 30} y2="252" stroke={INFO.baricentro.cor} strokeWidth="2.5" />
            {/* ponto no corpo */}
            <circle cx={bcX} cy="160" r="7" fill={INFO.baricentro.cor} />
            <circle cx={bcX} cy="160" r="12" fill="none" stroke={INFO.baricentro.cor} strokeWidth="1.5" strokeDasharray="3 2" />
            <text x={bcX} y="272" textAnchor="middle" fill={INFO.baricentro.cor} fontSize="10" fontWeight="800">
              baricentro {baricentro === "equilibrado_frente" ? "à frente ✓" : baricentro === "neutro" ? "neutro" : "atrás!"}
            </text>
            <line x1={bcX} y1="167" x2={bcX} y2="230" stroke={`${INFO.baricentro.cor}55`} strokeWidth="1.5" strokeDasharray="4 3" />
          </P>

          {/* rodapé do desenho */}
          <text x="260" y="316" textAnchor="middle" fill="#64748b" fontSize="9">ilustração original do app · perfil esquemático — toque nas partes destacadas</text>
        </svg>

        {/* painel de informação */}
        <div style={{ flex: 1, minWidth: 220 }}>
          {info ? (
            <div style={{ padding: 14, borderRadius: 12, background: "#ffffff08", border: `1px solid ${info.cor}55` }}>
              <b style={{ color: info.cor, fontSize: 14 }}>{info.nome}</b>
              <div style={{ ...T.small, fontSize: 12, lineHeight: 1.75, marginTop: 8 }}>{info.desc}</div>
            </div>
          ) : (
            <div style={{ ...T.small, padding: 14 }}>Toque numa parte do pombo…</div>
          )}
          <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
            {Object.entries(INFO).map(([k, v]) => (
              <button key={k} type="button" onClick={() => setSel(k)} style={{ padding: "8px 11px", borderRadius: 8, textAlign: "left", cursor: "pointer", fontSize: 12, fontWeight: 700, color: sel === k ? "#0b1426" : T.white, background: sel === k ? v.cor : "#ffffff08", border: `1px solid ${sel === k ? v.cor : "#31415a"}` }}>
                {v.nome}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
