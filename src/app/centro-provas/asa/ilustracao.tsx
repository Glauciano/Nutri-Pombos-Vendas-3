"use client";

import { useState } from "react";
import { T } from "../theme";

type Props = { penasMuda: number[]; onToggle: (n: number) => void };

const INFO: Record<string, { nome: string; cor: string; desc: string }> = {
  primarias: {
    nome: "🪽 PRIMÁRIAS (P1–P10)",
    cor: "#f7bd00",
    desc: "As 10 penas 'motor' do lado externo — propulsionam o voo. Na muda, caem de dentro pra fora (P1→P10): a P10 (ponta) só cai no fim. Ponta de asa nova = 'asa nova' dos leiloeiros. Clique nas penas pra marcar as caídas e ver o impacto no Índice da Asa!",
  },
  secundarias: {
    nome: "🪶 SECUNDÁRIAS (S1–S~10)",
    cor: "#55a3ff",
    desc: "As penas internas, grudadas no 'braço' — sustentam o voo planado. Trocam depois das primárias (ou em blocos). Devem terminar alinhadas com o corpo: é a clássica 'secundária na linha do dorso'.",
  },
  degrau: {
    nome: "📏 O DEGRAU (primária × secundária)",
    cor: "#39e58c",
    desc: "A diferença de comprimento entre a última secundária e a primeira primária. Degrau curto/quase nenhum = asa 'uniforme', voa mais econômica; degrau alto = mais 'turbo' mas menos economia — os clássicos preferiam degrau discreto para fundo.",
  },
  ponta: {
    nome: "🎯 PONTA DE ASA (P8–P10)",
    cor: "#ff5d62",
    desc: "As 3 últimas primárias formam a ponta — a 'hélice'. Caírem juntas no meio da temporada = desastre aerodinâmico (o famoso 'buraco na ponta'). Se a ponta está nova e fechada, o pombo tá pronto pro cesto.",
  },
  cobertoras: {
    nome: "🛡️ COBERTORAS",
    cor: "#a78bfa",
    desc: "A 'armadura' de peninhas que cobre por cima da estrutura, protegendo as raízes das remiges e moldando o perfil aerodinâmico. Muda espalhada — brilho e fechamento das cobertoras = boa saúde geral.",
  },
};

export default function IlustracaoAsa({ penasMuda, onToggle }: Props) {
  const [sel, setSel] = useState<string | null>("primarias");
  const info = sel ? INFO[sel] : null;

  return (
    <div>
      <div style={{ ...T.small, fontSize: 11, marginBottom: 8, lineHeight: 1.5 }}>
        🖱️ <b>Asa ilustrada</b> (original do app) — vista de cima com a muda ao vivo: <b>clique nas primárias P1–P10</b> pra marcar as caídas (integra com o Índice da Asa acima) e toque nas áreas pra entender cada parte.
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg viewBox="0 0 540 330" style={{ flex: 1, minWidth: 280, background: "#0b1529", borderRadius: 12, border: `1px solid ${T.border}` }}>
          {/* ===== ASA ESTENDIDA (esquerda do pombo) ===== */}
          {/* corpo/cobertoras */}
          <g onClick={() => setSel("cobertoras")} style={{ cursor: "pointer" }} opacity={sel && sel !== "cobertoras" ? 0.5 : 1}>
            <ellipse cx={112} cy={165} rx={72} ry={52} fill="#33425c" stroke="#3f5170" strokeWidth={2} />
            {/* cobertoras: leque de peninhas */}
            {Array.from({ length: 14 }, (_, i) => {
              const a = -50 + i * 8;
              return <ellipse key={i} cx={128} cy={165} rx={30} ry={7} fill="#3b4d6e" stroke="#4a5d80" transform={`rotate(${a} 128 165)`} />;
            })}
            <text x={112} y={238} textAnchor="middle" fill={INFO.cobertoras.cor} fontSize={10} fontWeight="800">🛡️ cobertoras</text>
            <title>{INFO.cobertoras.nome}</title>
          </g>

          {/* secundárias (S1-S10) — internas */}
          <g onClick={() => setSel("secundarias")} style={{ cursor: "pointer" }} opacity={sel && sel !== "secundarias" ? 0.45 : 1}>
            {Array.from({ length: 9 }, (_, i) => {
              const x = 168 + i * 13;
              const len = 66 - Math.abs(i - 3) * 4;
              return <ellipse key={i} cx={x + len / 2 - 10} cy={165 - (i < 4 ? (3 - i) * 2 : (i - 4) * 2)} rx={len / 2 + 12} ry={9} fill="#2f4a6e" stroke={INFO.secundarias.cor} strokeWidth={1.3} transform={`rotate(${i < 4 ? -(i - 3) * 6 : (i - 5) * 5} ${x} 165)`} />;
            })}
            <text x={230} y={118} textAnchor="middle" fill={INFO.secundarias.cor} fontSize={10} fontWeight="800">🪶 secundárias (S1–S9)</text>
            <title>{INFO.secundarias.nome}</title>
          </g>

          {/* primárias P1-P10 — interativas de muda */}
          {Array.from({ length: 10 }, (_, i) => {
            const n = i + 1;
            const caida = penasMuda.includes(n);
            const ang = 8 + i * 5.4; // leque abrindo
            const len = 62 + i * 5.6;
            const cx = 300;
            const cy = 158;
            const cor = caida ? "#0b1426" : n >= 8 ? INFO.ponta.cor : INFO.primarias.cor;
            return (
              <g key={n} style={{ cursor: "pointer" }} onClick={() => onToggle(n)} opacity={sel && sel !== "primarias" && sel !== "ponta" ? 0.55 : 1}>
                <ellipse cx={cx + len / 2} cy={cy} rx={len / 2 + 4} ry={8.5} fill={caida ? "none" : cor} stroke={cor} strokeWidth={1.6} strokeDasharray={caida ? "4 3" : undefined} transform={`rotate(${ang - 32} ${cx} ${cy})`} />
                <text x={cx + len + 2} y={cy + 3} fontSize={10.5} fontWeight={900} fill={cor} transform={`rotate(${ang - 32} ${cx} ${cy})`}>{n}</text>
                <title>P{n} {caida ? "— CAÍDA (muda)" : "— intacta"}</title>
              </g>
            );
          })}
          <text x={430} y={92} fill={INFO.primarias.cor} fontSize={10} fontWeight={800}>🪽 primárias — clique = caiu ✕</text>
          {/* zona da ponta */}
          <g onClick={() => setSel("ponta")} style={{ cursor: "pointer" }}>
            <path d="M400 118 Q450 108 496 140 Q470 172 424 168 Z" fill={`${INFO.ponta.cor}12`} stroke={INFO.ponta.cor} strokeWidth={1.2} strokeDasharray="5 4" />
            <text x={458} y={196} textAnchor="middle" fill={INFO.ponta.cor} fontSize={9.5} fontWeight={800}>🎯 zona P8–P10</text>
            <title>{INFO.ponta.nome}</title>
          </g>

          {/* degrau */}
          <g onClick={() => setSel("degrau")} style={{ cursor: "pointer" }}>
            <line x1={252} y1={132} x2={252} y2={198} stroke={INFO.degrau.cor} strokeWidth={1.6} strokeDasharray="3 3" />
            <text x={252} y={214} textAnchor="middle" fill={INFO.degrau.cor} fontSize={9.5} fontWeight={800}>↕ degrau</text>
            <title>{INFO.degrau.nome}</title>
          </g>

          {/* status da muda */}
          <g>
            <rect x={20} y={252} width={500} height={58} rx={10} fill="#1b283c" stroke="#31415a" />
            <text x={36} y={274} fontSize={11} fill="#f8fafc" fontWeight={800}>
              MUDA: {penasMuda.length}/10 primárias caídas {penasMuda.length === 0 ? "— asa completa ✅" : ""}
            </text>
            <text x={36} y={292} fontSize={9.5} fill="#9aa8bc">
              {penasMuda.length === 0
                ? "Nenhuma pena marcada — marque as caídas clicando nas primárias numeradas"
                : `Caídas: ${[...penasMuda].sort((a, b) => a - b).map((n) => "P" + n).join(", ")} — a nova pena nasce em ~24 dias`}
            </text>
            <text x={36} y={304} fontSize={9} fill={penasMuda.some((n) => n >= 8) ? "#ff5d62" : "#39e58c"}>
              {penasMuda.some((n) => n >= 8) ? "⚠️ ponta de asa em muda — evite encestar em prova longa!" : "ponta de asa intacta ou fora de risco"}
            </text>
          </g>
        </svg>

        {/* painel */}
        <div style={{ flex: 1, minWidth: 210 }}>
          {info && (
            <div style={{ padding: 14, borderRadius: 12, background: "#ffffff08", border: `1px solid ${info.cor}55` }}>
              <b style={{ color: info.cor, fontSize: 13.5 }}>{info.nome}</b>
              <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.75, marginTop: 8 }}>{info.desc}</div>
            </div>
          )}
          <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
            {Object.entries(INFO).map(([k, v]) => (
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
