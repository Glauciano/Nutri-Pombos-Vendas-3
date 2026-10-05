"use client";

import { useMemo, useState } from "react";
import { T } from "../theme";

type Props = {
  comprimento: "longa_curva" | "media_padrao" | "curta";
  profundidade: "rasa_aerodinamica" | "media" | "profunda_quilha_alta";
  forquilha: "fechada_rigida" | "firme_leve_abertura" | "aberta_flexivel";
  baricentro: "equilibrado_frente" | "neutro" | "peso_traseiro";
  asaSecundaria?: boolean;
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

// ---------- GEOMETRIA: tudo é calculado a partir da elipse do corpo ----------
// Assim a linha da quilha ACOMPANHA a curva do peito em qualquer opção:
// os marcadores nunca desalinham, porque nascem da própria forma do pombo.
const CX = 192; // centro X do corpo
const RX = 98; // "comprimento" do corpo
const ROT = (-8 * Math.PI) / 180; // leve inclinação: peito fundo na frente, barriga subindo pra trás

const CORPO: Record<Props["profundidade"], { cy: number; ry: number }> = {
  rasa_aerodinamica: { cy: 137, ry: 41 },
  media: { cy: 140, ry: 47 },
  profunda_quilha_alta: { cy: 143, ry: 54 },
};

// ponto na linha do corpo (t em graus na elipse; inset empurra pra dentro do corpo)
function pontoCorpo(t: number, inset: number, cy: number, ry: number): [number, number] {
  const rad = (t * Math.PI) / 180;
  const lx = RX * Math.cos(rad);
  const ly = ry * Math.sin(rad);
  const x = CX + lx * Math.cos(ROT) - ly * Math.sin(ROT);
  const y = cy + lx * Math.sin(ROT) + ly * Math.cos(ROT);
  const dx = CX - x;
  const dy = cy - y;
  const n = Math.hypot(dx, dy) || 1;
  return [x + (dx / n) * inset, y + (dy / n) * inset];
}

const COMPR_LABEL: Record<Props["comprimento"], string> = {
  longa_curva: "longa e curvada",
  media_padrao: "comprimento médio",
  curta: "curta",
};
const PROF_LABEL: Record<Props["profundidade"], string> = {
  rasa_aerodinamica: "rasa",
  media: "profundidade média",
  profunda_quilha_alta: "profunda",
};
const FORQ_LABEL: Record<Props["forquilha"], string> = {
  fechada_rigida: "fechada e rígida",
  firme_leve_abertura: "firme, leve folga",
  aberta_flexivel: "aberta / flexível",
};
const BC_LABEL: Record<Props["baricentro"], string> = {
  equilibrado_frente: "peso à frente",
  neutro: "equilíbrio neutro",
  peso_traseiro: "peso atrás",
};
const COMPR_ICON: Record<Props["comprimento"], string> = { longa_curva: "⭐", media_padrao: "✓", curta: "⚠️" };
const PROF_ICON: Record<Props["profundidade"], string> = { rasa_aerodinamica: "⭐", media: "✓", profunda_quilha_alta: "⚠️" };
const FORQ_ICON: Record<Props["forquilha"], string> = { fechada_rigida: "⭐", firme_leve_abertura: "✓", aberta_flexivel: "🚨" };
const BC_ICON: Record<Props["baricentro"], string> = { equilibrado_frente: "⭐", neutro: "✓", peso_traseiro: "⚠️" };

export default function IlustracaoAnatomia({ comprimento, profundidade, forquilha, baricentro, asaSecundaria }: Props) {
  const [sel, setSel] = useState<string | null>("quilha");
  const [zoom, setZoom] = useState(false);
  const info = sel ? PARTES[sel] : null;

  const geo = useMemo(() => {
    const { cy, ry } = CORPO[profundidade];

    // QUIlHA: acompanha a curva do peito — da frente do peito (176°) até o fim da quilha
    const tFim = comprimento === "longa_curva" ? 63 : comprimento === "media_padrao" ? 78 : 90;
    const curvaFim = comprimento === "longa_curva"; // a "longa e curvada" levanta a ponta no final
    const graus: number[] = [];
    for (let t = 176; t > tFim; t -= 8) graus.push(t);
    graus.push(tFim); // último ponto exato (sem loop infinito!)
    const pts: [number, number][] = graus.map((t) => {
      const resta = t - tFim;
      const ins = curvaFim && resta < 22 ? 3 + (1 - resta / 22) * 9 : 3;
      return pontoCorpo(t, ins, cy, ry);
    });
    const dQuilha = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
    const keelMid = pontoCorpo(112, 3, cy, ry);

    // FORQUILHA: dois ossinhos na região da cloaca, acompanhando o ventre
    // (separados na direção da linha do ventre, que sobe em direção à cauda)
    const fBase = pontoCorpo(40, 9, cy, ry);
    const gap = forquilha === "aberta_flexivel" ? 11 : forquilha === "firme_leve_abertura" ? 7.5 : 4;
    const f1: [number, number] = [fBase[0] - gap * 0.94, fBase[1] + gap * 0.34];
    const f2: [number, number] = [fBase[0] + gap * 0.94, fBase[1] - gap * 0.34];
    const fMid: [number, number] = [(f1[0] + f2[0]) / 2, (f1[1] + f2[1]) / 2];

    // BARICENTRO: ponto de equilíbrio, no meio do corpo
    const bcX = baricentro === "peso_traseiro" ? 192 : baricentro === "neutro" ? 170 : 150;
    const bcY = cy - 4;

    return { cy, ry, dQuilha, keelMid, f1, f2, fMid, bcX, bcY };
  }, [comprimento, profundidade, forquilha, baricentro]);

  const quilhaIcon =
    COMPR_ICON[comprimento] === "⭐" && PROF_ICON[profundidade] === "⭐"
      ? "⭐"
      : COMPR_ICON[comprimento] === "⚠️" || PROF_ICON[profundidade] === "⚠️"
        ? "⚠️"
        : "✓";

  const chips = [
    { cor: PARTES.quilha.cor, txt: `Quilha: ${COMPR_LABEL[comprimento]} · ${PROF_LABEL[profundidade]}` },
    { cor: PARTES.forquilha.cor, txt: `Forquilha: ${FORQ_LABEL[forquilha]}` },
    { cor: PARTES.baricentro.cor, txt: `Baricentro: ${BC_LABEL[baricentro]}` },
  ];

  const dim = (k: string) => (sel && sel !== k ? 0.45 : 1);

  // ---------- O POMBO (SVG desenhado do zero — pombo-correio azul/barra de perfil) ----------
  const svgFig = (
    <svg
      viewBox="0 0 460 300"
      role="img"
      aria-label="Ilustração de um pombo-correio de perfil com os marcadores de quilha, forquilha e baricentro"
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      <defs>
        <linearGradient id="apCeu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8f1fb" />
          <stop offset="1" stopColor="#f6f9fd" />
        </linearGradient>
        <linearGradient id="apIris" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2fae62" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <clipPath id="apCorpo">
          <ellipse cx={CX} cy={geo.cy} rx={RX} ry={geo.ry} transform={`rotate(-8 ${CX} ${geo.cy})`} />
          <ellipse cx="112" cy="116" rx="27" ry="25" />
          <circle cx="80" cy="88" r="21" />
        </clipPath>
        <clipPath id="apAsa">
          <ellipse cx="230" cy="134" rx="86" ry="26" transform="rotate(-5 230 134)" />
        </clipPath>
      </defs>

      {/* fundo céu claro + sombra no chão */}
      <rect x="0" y="0" width="460" height="300" fill="url(#apCeu)" />
      <ellipse cx="225" cy="212" rx="125" ry="10" fill="#1b283c" opacity="0.08" />

      {/* cauda (atrás do corpo) */}
      <path d="M268 124 L398 137 L399 149 L266 142 Z" fill="#6e8cb3" />
      <path d="M381 135.5 L398 137 L399 149 L380 147.5 Z" fill="#33465f" />

      {/* corpo + pescoço + cabeça (mesma cor: formam um contorno só) */}
      <ellipse cx={CX} cy={geo.cy} rx={RX} ry={geo.ry} transform={`rotate(-8 ${CX} ${geo.cy})`} fill="#7e9bc4" />
      <ellipse cx="112" cy="116" rx="27" ry="25" fill="#7e9bc4" />
      <circle cx="80" cy="88" r="21" fill="#7e9bc4" />

      {/* barriga mais clara */}
      <ellipse cx="185" cy="160" rx="82" ry="28" fill="#a9c3e4" opacity="0.5" clipPath="url(#apCorpo)" />

      {/* brilho iridescente do pescoço (verde/roxo do pombo-correio) */}
      <ellipse cx="106" cy="112" rx="20" ry="18" fill="url(#apIris)" opacity="0.45" clipPath="url(#apCorpo)" />

      {/* asa fechada sobre o corpo */}
      <ellipse cx="230" cy="134" rx="86" ry="26" transform="rotate(-5 230 134)" fill="#9db8dc" stroke="#5c7ba6" strokeWidth="1.5" />
      <g clipPath="url(#apAsa)">
        <line x1="206" y1="103" x2="198" y2="165" stroke="#3b4d68" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
        <line x1="228" y1="104" x2="222" y2="166" stroke="#3b4d68" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
        {asaSecundaria && <ellipse cx="262" cy="124" rx="22" ry="9" transform="rotate(-5 262 124)" fill="#39e58c" opacity="0.35" />}
      </g>
      {/* ponta das penas de voo (primárias) cruzando a cauda */}
      <path d="M296 120 C330 122 355 130 372 138 C355 141 328 144 298 147 C305 138 305 129 296 120 Z" fill="#41546f" />

      {/* bico, cera e olho */}
      <path d="M63 92 L43 99 L64 101 Z" fill="#3a3f47" />
      <ellipse cx="64" cy="90" rx="6.5" ry="4.5" transform="rotate(-12 64 90)" fill="#ded8cc" />
      <circle cx="84" cy="84" r="5" fill="#c0392b" />
      <circle cx="84" cy="84" r="3.2" fill="#e67e22" />
      <circle cx="84" cy="84" r="1.8" fill="#14161a" />
      <circle cx="85.2" cy="82.6" r="0.7" fill="#ffffff" opacity="0.9" />

      {/* etiquetas de contexto (cinza claro, só pra se localizar) */}
      <g fontSize="11" fill="#6b7d96" fontWeight="700">
        <text x="52" y="40">cabeça</text>
        <line x1="60" y1="45" x2="76" y2="64" stroke="#9fb0c4" strokeWidth="1" strokeDasharray="3 3" />
        <text x="348" y="180" textAnchor="middle">asa</text>
        <line x1="348" y1="173" x2="320" y2="146" stroke="#9fb0c4" strokeWidth="1" strokeDasharray="3 3" />
        <text x="400" y="120" textAnchor="end">cauda</text>
        <line x1="392" y1="124" x2="380" y2="140" stroke="#9fb0c4" strokeWidth="1" strokeDasharray="3 3" />
      </g>
      {asaSecundaria && (
        <g>
          <text x="316" y="102" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#1f9d55">
            secundárias cobrem o lombo ✓
          </text>
          <line x1="310" y1="106" x2="282" y2="121" stroke="#1f9d55" strokeWidth="1" strokeDasharray="3 3" />
        </g>
      )}

      {/* ===== MARCADOR 1 — QUIlHA (linha dourada colada na curva do peito) ===== */}
      <g onClick={(e) => { e.stopPropagation(); setSel("quilha"); }} style={{ cursor: "pointer" }} opacity={dim("quilha")}>
        <path d={geo.dQuilha} fill="none" stroke="#f7bd00" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" />
        <path d={geo.dQuilha} fill="none" stroke="#f7bd00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={geo.keelMid[0]} cy={geo.keelMid[1]} r="3" fill="#f7bd00" />
        {sel === "quilha" && (
          <circle cx={geo.keelMid[0]} cy={geo.keelMid[1]} r="6" fill="none" stroke="#f7bd00" strokeWidth="2">
            <animate attributeName="r" values="5;17" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}
        <line x1="85" y1="212" x2={geo.keelMid[0] - 6} y2={geo.keelMid[1] + 6} stroke="#b7912a" strokeWidth="1.5" strokeDasharray="4 3" />
        <rect x="16" y="212" width="158" height="46" rx="10" fill="#ffffff" stroke="#f7bd00" strokeWidth={sel === "quilha" ? 2.5 : 1.5} />
        <circle cx="34" cy="235" r="10" fill="#f7bd00" />
        <text x="34" y="239" textAnchor="middle" fontSize="12" fontWeight="900" fill="#ffffff">1</text>
        <text x="50" y="231" fontSize="13.5" fontWeight="900" fill="#22314a">Quilha</text>
        <text x="50" y="247" fontSize="11" fontWeight="700" fill="#8a6a00">
          {COMPR_LABEL[comprimento]} · {PROF_LABEL[profundidade]} {quilhaIcon}
        </text>
      </g>

      {/* ===== MARCADOR 2 — FORQUILHA (dois ossinhos perto da cloaca) ===== */}
      <g onClick={(e) => { e.stopPropagation(); setSel("forquilha"); }} style={{ cursor: "pointer" }} opacity={dim("forquilha")}>
        <line x1={geo.f1[0]} y1={geo.f1[1]} x2={geo.f2[0]} y2={geo.f2[1]} stroke="#55a3ff" strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx={geo.f1[0]} cy={geo.f1[1]} r="3.4" fill="#55a3ff" stroke="#ffffff" strokeWidth="1" />
        <circle cx={geo.f2[0]} cy={geo.f2[1]} r="3.4" fill="#55a3ff" stroke="#ffffff" strokeWidth="1" />
        {sel === "forquilha" && (
          <circle cx={geo.fMid[0]} cy={geo.fMid[1]} r="6" fill="none" stroke="#55a3ff" strokeWidth="2">
            <animate attributeName="r" values="5;17" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}
        <line x1="345" y1="212" x2={geo.fMid[0] + 8} y2={geo.fMid[1] + 8} stroke="#33639c" strokeWidth="1.5" strokeDasharray="4 3" />
        <rect x="292" y="212" width="152" height="46" rx="10" fill="#ffffff" stroke="#55a3ff" strokeWidth={sel === "forquilha" ? 2.5 : 1.5} />
        <circle cx="310" cy="235" r="10" fill="#55a3ff" />
        <text x="310" y="239" textAnchor="middle" fontSize="12" fontWeight="900" fill="#ffffff">2</text>
        <text x="326" y="231" fontSize="13.5" fontWeight="900" fill="#22314a">Forquilha</text>
        <text x="326" y="247" fontSize="11" fontWeight="700" fill="#2f6bb0">
          {FORQ_LABEL[forquilha]} {FORQ_ICON[forquilha]}
        </text>
      </g>

      {/* ===== MARCADOR 3 — BARICENTRO (ponto de equilíbrio) ===== */}
      <g onClick={(e) => { e.stopPropagation(); setSel("baricentro"); }} style={{ cursor: "pointer" }} opacity={dim("baricentro")}>
        <circle cx={geo.bcX} cy={geo.bcY} r="14" fill="none" stroke="#39e58c" strokeWidth="2" strokeDasharray="4 3" />
        <line x1={geo.bcX - 20} y1={geo.bcY} x2={geo.bcX + 20} y2={geo.bcY} stroke="#39e58c" strokeWidth="1.2" />
        <line x1={geo.bcX} y1={geo.bcY - 20} x2={geo.bcX} y2={geo.bcY + 20} stroke="#39e58c" strokeWidth="1.2" />
        <circle cx={geo.bcX} cy={geo.bcY} r="2.6" fill="#39e58c" />
        {sel === "baricentro" && (
          <circle cx={geo.bcX} cy={geo.bcY} r="8" fill="none" stroke="#39e58c" strokeWidth="2">
            <animate attributeName="r" values="6;20" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}
        <line x1="370" y1="66" x2={geo.bcX + 12} y2={geo.bcY - 12} stroke="#1f8f5a" strokeWidth="1.5" strokeDasharray="4 3" />
        <rect x="296" y="20" width="152" height="46" rx="10" fill="#ffffff" stroke="#39e58c" strokeWidth={sel === "baricentro" ? 2.5 : 1.5} />
        <circle cx="314" cy="43" r="10" fill="#39e58c" />
        <text x="314" y="47" textAnchor="middle" fontSize="12" fontWeight="900" fill="#ffffff">3</text>
        <text x="330" y="39" fontSize="13.5" fontWeight="900" fill="#22314a">Baricentro</text>
        <text x="330" y="55" fontSize="11" fontWeight="700" fill="#14855a">
          {BC_LABEL[baricentro]} {BC_ICON[baricentro]}
        </text>
      </g>
    </svg>
  );

  return (
    <div>
      <div style={{ ...T.small, fontSize: 11, marginBottom: 8, lineHeight: 1.5 }}>
        🎨 <b>Ilustração guiada</b> — toque nos balões ① ② ③ ou nos pontos coloridos no pombo. A ilustração{" "}
        <b>muda de verdade</b> conforme as opções aqui embaixo ⬇️
      </div>

      {/* FIGURA */}
      <div
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          border: `1.5px solid ${sel ? `${PARTES[sel].cor}66` : "#31415a"}`,
        }}
      >
        {svgFig}
        <button
          type="button"
          onClick={() => setZoom(true)}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            padding: "5px 10px",
            borderRadius: 8,
            border: "1px solid #31415a",
            background: "#0b1426cc",
            color: "#f8fafc",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🔍 Ampliar
        </button>
      </div>

      {/* RESUMO DAS ESCOLHAS */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {chips.map((c) => (
          <span
            key={c.txt}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 11px",
              borderRadius: 999,
              background: "#ffffff0d",
              border: `1px solid ${c.cor}55`,
              fontSize: 11,
              fontWeight: 700,
              color: T.white,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 99, background: c.cor, display: "inline-block" }} />
            {c.txt}
          </span>
        ))}
      </div>

      {/* PAINEL EXPLICATIVO + BOTÕES */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12, alignItems: "stretch" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          {info && (
            <div style={{ padding: 13, borderRadius: 12, background: "#ffffff08", border: `1px solid ${info.cor}55`, height: "100%", boxSizing: "border-box" }}>
              <b style={{ color: info.cor, fontSize: 13.5 }}>{info.nome}</b>
              <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.75, marginTop: 7 }}>{info.desc}</div>
              <div style={{ ...T.small, fontSize: 10, marginTop: 8, color: "#64748b" }}>
                A ilustração lá em cima se transforma conforme as opções aqui embaixo ⬇️
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 200, display: "grid", gap: 6, alignContent: "start" }}>
          {Object.entries(PARTES).map(([k, v]) => (
            <button
              key={k}
              type="button"
              onClick={() => setSel(k)}
              style={{
                padding: "9px 11px",
                borderRadius: 8,
                textAlign: "left",
                cursor: "pointer",
                fontSize: 11.5,
                fontWeight: 700,
                color: sel === k ? "#0b1426" : T.white,
                background: sel === k ? v.cor : "#ffffff08",
                border: `1px solid ${sel === k ? v.cor : "#31415a"}`,
              }}
            >
              {v.nome}
            </button>
          ))}
        </div>
      </div>

      {/* AMPLIAR (TELA CHEIA) */}
      {zoom && (
        <div
          onClick={() => setZoom(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(4,10,20,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            cursor: "zoom-out",
            padding: 12,
          }}
        >
          <div style={{ width: "min(96vw, 1050px)" }} onClick={(e) => e.stopPropagation()}>
            {svgFig}
            <div style={{ textAlign: "center", color: "#9aa8bc", fontSize: 12, marginTop: 10 }}>
              toque em qualquer lugar fora da ilustração para fechar ✕
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
