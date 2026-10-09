"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";
import { GuiaCampo, TiposOlhos, SinaisEyeSign, EscolaInglesa, AnatomiaOlho, EscolaChinesa } from "./extras";
import { getFotoOlho } from "../lib/fotos";

type Pupila = "puntiforme" | "media" | "larga";
type Circulo = "serrilhado_largo" | "completo_fino" | "incompleto" | "ausente";
type IrisCor = "amarelo_ouro" | "perola_prata" | "violeta_vermelho" | "castanho";
type Granulacao = "rugosa_3d" | "media" | "lisa";
type AnelSaude = "preto_forte" | "cinza_claro" | "indefinido";

/* 🔬 Olho interativo — ilustração SVG ORIGINAL do app (conceitos clássicos, zero imagem de terceiros) */
const PARTES_OLHO: Record<string, { nome: string; cor: string; desc: string; avaliar: string }> = {
  pupila: { nome: "1️⃣ Pupila", cor: "#f8fafc", desc: "Pequena e REATIVA à luz — contrai rápido quando iluminada (passe o mouse nela e veja!). Grande demais ou parada derruba a avaliação. Olhos pretos (bull eye) também podem ter pupila reativa.", avaliar: "tamanho + velocidade de contração à luz" },
  adaptacao: { nome: "2️⃣ Círculo de Adaptação", cor: "#eab308", desc: "Anel em volta da pupila. Nas matrizes: completo e limpo; bordas SERRILHADAS (em serra) são as mais valorizadas por Barkel e Hofmann. É onde se lê o sinal de corrida.", avaliar: "presença, largura e serrilhado das bordas" },
  corrida: { nome: "⚡ Sinal de Corrida", cor: "#ff5d62", desc: "Segmento escuro sobreposto ao círculo de adaptação — é a marca do VOADOR. Regra de ouro de Barkel ao acasalar: a soma dos sinais de corrida do casal NÃO deve passar de 100%.", avaliar: "presença e tamanho do segmento escuro" },
  correlacao: { nome: "3️⃣ Círculo de Correlação", cor: "#55a3ff", desc: "Vai da pupila ao perímetro. A faixa VISÍVEL (entre adaptação e íris) larga demais = pombo só para distâncias CURTAS; fechada = aptidão para o FUNDO. Barkel considerava essa leitura a parte exclusiva da própria teoria.", avaliar: "largura da faixa visível entre adaptação e íris" },
  iris: { nome: "4️⃣ Íris", cor: "#f97316", desc: "A 'carne' colorida do olho. Espessa, granulada e sem falhas = saúde e fundo. Fina ou com buracos = regressão (velocidade sem homing — ganham e se perdem). Amarelo×amarelo gera íris espessa demais; pérola×pérola, fina demais para provas duras.", avaliar: "espessura, granulação e ausência de falhas" },
  perimetro: { nome: "5️⃣ Perímetro (Reprodutor)", cor: "#39e58c", desc: "O anel externo — círculo da saúde/reprodução. Exigência de Barkel pra matriz: mesma COR e LARGURA do círculo de adaptação, completo em volta. Voador não precisa; matriz sim.", avaliar: "uniformidade completa + igualar cor/largura com a adaptação" },
};

function OlhoInterativo() {
  const [sel, setSel] = useState<string | null>(null);
  const [luz, setLuz] = useState(false);
  const op = (k: string) => (sel == null || sel === k ? 1 : 0.28);
  const info = sel ? PARTES_OLHO[sel] : null;
  const granulacao = Array.from({ length: 44 }, (_, i) => i * (360 / 44));
  return (
    <section style={T.card}>
      <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 8 }}>🔬 Olho Interativo — passe o mouse (ou toque) em cada círculo</div>
      <div style={{ ...T.small, fontSize: 11, marginBottom: 12, lineHeight: 1.5 }}>
        Ilustração original do app inspirada nos 5 círculos de Jack Barkel — hover/toque destaca o anel e explica o que avaliar. Dica: passe o mouse na <b>pupila</b> e veja ela contrair (reativa à luz ⚡).
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg viewBox="0 0 280 280" style={{ width: "100%", maxWidth: 320, margin: "0 auto", display: "block" }}>
          <circle cx="140" cy="140" r="136" fill="#0b1529" />
          {/* 5. perímetro */}
          <circle cx="140" cy="140" r="128" fill="#2f2620" stroke={sel === "perimetro" ? "#fff" : "#1a140e"} strokeWidth={sel === "perimetro" ? 3 : 2} strokeDasharray={sel === "perimetro" ? "6 4" : undefined} opacity={op("perimetro")} style={{ cursor: "pointer", transition: "opacity .25s" }} onMouseEnter={() => setSel("perimetro")} onMouseLeave={() => setSel(null)} onClick={() => setSel("perimetro")} />
          {/* 4. íris + granulação */}
          <g opacity={op("iris")} style={{ cursor: "pointer", transition: "opacity .25s" }} onMouseEnter={() => setSel("iris")} onMouseLeave={() => setSel(null)} onClick={() => setSel("iris")}>
            <circle cx="140" cy="140" r="118" fill="#c87f06" stroke={sel === "iris" ? "#fff" : "#8a5a10"} strokeWidth={sel === "iris" ? 3 : 2} strokeDasharray={sel === "iris" ? "6 4" : undefined} />
            {granulacao.map((a) => (
              <line key={a} x1="140" y1="70" x2="140" y2="40" stroke="#f7bd00" strokeWidth="3.2" strokeLinecap="round" opacity="0.65" transform={`rotate(${a} 140 140)`} />
            ))}
          </g>
          {/* 3. correlação */}
          <circle cx="140" cy="140" r="68" fill="#cdb287" stroke={sel === "correlacao" ? "#fff" : "#a68b5f"} strokeWidth={sel === "correlacao" ? 3 : 2} strokeDasharray={sel === "correlacao" ? "6 4" : undefined} opacity={op("correlacao")} style={{ cursor: "pointer", transition: "opacity .25s" }} onMouseEnter={() => setSel("correlacao")} onMouseLeave={() => setSel(null)} onClick={() => setSel("correlacao")} />
          {/* 2. adaptação (serrilhada) */}
          <circle cx="140" cy="140" r="48" fill="#8a5a2b" stroke={sel === "adaptacao" ? "#fff" : "#4a2f14"} strokeWidth={sel === "adaptacao" ? 3.5 : 5} strokeDasharray="5 5" opacity={op("adaptacao")} style={{ cursor: "pointer", transition: "opacity .25s" }} onMouseEnter={() => setSel("adaptacao")} onMouseLeave={() => setSel(null)} onClick={() => setSel("adaptacao")} />
          {/* ⚡ sinal de corrida (segmento escuro sobre a adaptação) */}
          <path d="M94.9 123.6 A48 48 0 0 1 123.6 94.9" fill="none" stroke="#0a0a0a" strokeWidth="11" strokeLinecap="round" opacity={op("corrida") || 0.95} style={{ cursor: "pointer", transition: "opacity .25s" }} onMouseEnter={() => setSel("corrida")} onMouseLeave={() => setSel(null)} onClick={() => setSel("corrida")} />
          {sel === "corrida" && <circle cx="109" cy="109" r="30" fill="none" stroke="#ff5d62" strokeWidth="2" strokeDasharray="5 4" />}
          {/* 1. pupila (reativa!) */}
          <circle cx="140" cy="140" r={luz ? 15 : 28} fill="#050505" stroke={sel === "pupila" ? "#fff" : "#222"} strokeWidth={sel === "pupila" ? 3 : 2} strokeDasharray={sel === "pupila" ? "5 4" : undefined} opacity={op("pupila")} style={{ cursor: "pointer", transition: "r .35s ease, opacity .25s" }} onMouseEnter={() => { setSel("pupila"); setLuz(true); }} onMouseLeave={() => { setSel(null); setLuz(false); }} onClick={() => setSel("pupila")} />
          {luz && <text x="140" y="205" textAnchor="middle" fontSize="11" fontWeight="800" fill="#f7bd00">⚡ pupila contraindo à luz!</text>}
        </svg>
        <div style={{ flex: 1, minWidth: 220 }}>
          {info ? (
            <div style={{ padding: 14, borderRadius: 11, background: "#ffffff08", border: `1px solid ${T.border}` }}>
              <b style={{ fontSize: 14, color: info.cor }}>{info.nome}</b>
              <div style={{ ...T.small, fontSize: 12, marginTop: 6, lineHeight: 1.65 }}>{info.desc}</div>
              <div style={{ marginTop: 8, padding: "8px 11px", borderRadius: 8, background: `${T.gold}12`, border: `1px solid ${T.gold}44`, fontSize: 11.5, lineHeight: 1.5 }}>
                ✔ <b>O que avaliar:</b> {info.avaliar}
              </div>
            </div>
          ) : (
            <div style={{ ...T.small, fontSize: 12, lineHeight: 1.7, padding: 14, borderRadius: 11, background: "#ffffff08" }}>
              👁️ Passe o mouse ou toque em um anel do olho:<br /><br />
              {Object.values(PARTES_OLHO).map((pp) => (
                <div key={pp.nome} style={{ marginBottom: 3 }}><b style={{ color: pp.cor }}>{pp.nome}</b></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════ 📸 SEU POMBO NA MIRA — foto do olho real + guia ajustável dos círculos ═══════ */
function FotoOlhoMira() {
  const [pombos, setPombos] = useState<{ id: number; anilha: string; nome: string | null; sexo: string }[]>([]);
  const [anilha, setAnilha] = useState("");
  const [mira, setMira] = useState(true);
  const [zoom, setZoom] = useState(false);
  const [cx, setCx] = useState(50);
  const [cy, setCy] = useState(50);
  const [raio, setRaio] = useState(32);

  useEffect(() => {
    fetch("/api/pombos")
      .then(async (r) => (r.ok ? r.json() : []))
      .then((d) => setPombos(Array.isArray(d) ? d : []))
      .catch(() => setPombos([]));
  }, []);

  const foto = anilha ? getFotoOlho(anilha) : null;

  // anéis-guia com as MESMAS cores dos círculos no diagrama do app (de dentro pra fora)
  const aneis: { nome: string; cor: string; prop: number }[] = [
    { nome: "1️⃣ Pupila", cor: "#f8fafc", prop: 0.26 },
    { nome: "2️⃣ Adaptação (amarelo)", cor: "#eab308", prop: 0.46 },
    { nome: "3️⃣ Correlação (azul)", cor: "#55a3ff", prop: 0.73 },
    { nome: "5️⃣ Saúde/Perímetro (verde)", cor: "#39e58c", prop: 1 },
  ];

  const slider = { width: "100%", accentColor: "#f7bd00", cursor: "pointer" } as const;

  return (
    <section style={{ ...T.card, borderColor: "#55a3ff55" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: T.blue, marginBottom: 4 }}>
        📸 Seu pombo na mira — estude o olho DE VERDADE
      </div>
      <div style={{ ...T.small, fontSize: 11, marginBottom: 10, lineHeight: 1.5 }}>
        Escolha o pombo, ajuste a mira com os controles e compare a foto com o diagrama abaixo. A foto é a cadastrada em <b>Pombos → 📸 Fotos do Pombo → 👁️ Olho</b>.
      </div>

      <select value={anilha} onChange={(e) => setAnilha(e.target.value)} style={{ ...T.btnGhost, padding: "9px 12px", fontWeight: 700, fontSize: 12.5, width: "100%", textAlign: "left", marginBottom: 10 }}>
        <option value="">— escolha o pombo —</option>
        {pombos.map((p) => <option key={p.id} value={p.anilha}>{p.sexo === "macho" ? "♂" : "♀"} {p.nome || p.anilha} — {p.anilha}</option>)}
      </select>

      {!anilha && <div style={{ ...T.small, fontSize: 11.5, color: T.dim }}>☝️ Selecione um pombo pra ver a foto do olho dele aqui.</div>}

      {anilha && !foto && (
        <div style={{ padding: 16, borderRadius: 10, border: "1.5px dashed #31415a", background: "#0b1529", textAlign: "center", ...T.small, fontSize: 11.5, lineHeight: 1.6 }}>
          👁️ Este pombo ainda não tem foto do olho.<br />Adicione em <b>Pombos → toque no pombo → 📸 Fotos do Pombo</b> — e volte pra analisar aqui!
        </div>
      )}

      {foto && (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* FOTO + MIRA */}
            <div
              style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 340, aspectRatio: "1/1", borderRadius: 14, overflow: "hidden", border: `1.5px solid ${mira ? "#55a3ff66" : "#31415a"}`, cursor: zoom ? "zoom-out" : "zoom-in", background: "#0b1529" }}
              onClick={() => setZoom((z) => !z)}
              title={zoom ? "clique para reduzir" : "clique para ampliar"}
            >
              <img src={foto} alt={`Olho de ${anilha}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: zoom ? "scale(1.7)" : "scale(1)", transformOrigin: `${cx}% ${cy}%`, transition: "transform .25s ease" }} />
              {mira && (
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                  {aneis.map((a) => (
                    <circle key={a.nome} cx={cx} cy={cy} r={raio * a.prop} fill="none" stroke={a.cor} strokeWidth={a.prop === 1 ? 1.4 : 1} strokeDasharray={a.prop === 1 ? "3 2" : "2.5 2"} opacity="0.9" />
                  ))}
                  <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} stroke="#ffffff" strokeWidth="0.7" />
                  <line x1={cx} y1={cy - 3} x2={cx} y2={cy + 3} stroke="#ffffff" strokeWidth="0.7" />
                </svg>
              )}
            </div>

            {/* CONTROLES */}
            <div style={{ flex: 1, minWidth: 180, display: "grid", gap: 10, alignContent: "start" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                <input type="checkbox" checked={mira} onChange={(e) => setMira(e.target.checked)} />
                🧭 Mira dos círculos
              </label>
              <div>
                <div style={{ ...T.small, fontSize: 10, marginBottom: 3 }}>📏 Tamanho da mira</div>
                <input type="range" min={8} max={48} value={raio} onChange={(e) => setRaio(Number(e.target.value))} style={slider} />
              </div>
              <div>
                <div style={{ ...T.small, fontSize: 10, marginBottom: 3 }}>↔️ Posição horizontal</div>
                <input type="range" min={0} max={100} value={cx} onChange={(e) => setCx(Number(e.target.value))} style={slider} />
              </div>
              <div>
                <div style={{ ...T.small, fontSize: 10, marginBottom: 3 }}>↕️ Posição vertical</div>
                <input type="range" min={0} max={100} value={cy} onChange={(e) => setCy(Number(e.target.value))} style={slider} />
              </div>
              <div style={{ display: "grid", gap: 4, marginTop: 4 }}>
                {aneis.map((a) => (
                  <div key={a.nome} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: T.dim }}>
                    <span style={{ width: 11, height: 11, borderRadius: "50%", border: `2px dashed ${a.cor}`, display: "inline-block" }} />
                    {a.nome}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ ...T.small, fontSize: 10, marginTop: 8, color: T.dim2 }}>💡 Dica: encaixe o anel VERDE na borda externa do olho — os outros caem aproximadamente nos círculos de correlação, adaptação e pupila. O zoom amplia justamente no centro da mira.</div>
        </>
      )}
    </section>
  );
}

export default function AnaliseOlhoPombo() {
  const [aba, setAba] = useState<"interativo" | "guia" | "tipos" | "sinais" | "teoria" | "escola" | "escola-c">("interativo");
  const [pupila, setPupila] = useState<Pupila>("puntiforme");
  const [circulo, setCirculo] = useState<Circulo>("serrilhado_largo");
  const [iris, setIris] = useState<IrisCor>("amarelo_ouro");
  const [granulacao, setGranulacao] = useState<Granulacao>("rugosa_3d");
  const [anelSaude, setAnelSaude] = useState<AnelSaude>("preto_forte");

  const analise = useMemo(() => {
    let ptsReprodutor = 50;
    let ptsVoador = 50;

    // 1. Pupila
    if (pupila === "puntiforme") {
      ptsReprodutor += 15;
      ptsVoador += 20;
    } else if (pupila === "media") {
      ptsReprodutor += 10;
      ptsVoador += 10;
    }

    // 2. Círculo de Adaptação
    if (circulo === "serrilhado_largo") {
      ptsReprodutor += 25;
      ptsVoador += 15;
    } else if (circulo === "completo_fino") {
      ptsReprodutor += 10;
      ptsVoador += 15;
    }

    // 3. Granulação da Esclerótica
    if (granulacao === "rugosa_3d") {
      ptsReprodutor += 15;
      ptsVoador += 10;
    } else if (granulacao === "media") {
      ptsReprodutor += 10;
      ptsVoador += 10;
    }

    // 4. Anel de Saúde
    if (anelSaude === "preto_forte") {
      ptsReprodutor += 10;
      ptsVoador += 15;
    }

    const scoreReprodutor = Math.min(100, Math.max(10, ptsReprodutor));
    const scoreVoador = Math.min(100, Math.max(10, ptsVoador));

    let classificacao = "Atleta Balanceado / Intermediário";
    let cor = "#3B82F6";
    let desc = "Pombo funcional com boa visão e equilíbrio entre esclerótica e íris.";

    if (scoreReprodutor >= 88) {
      classificacao = "⭐ MATRIZ DE OURO / REPRODUTOR DE ELITE";
      cor = "#EAB308";
      desc =
        "Círculo de correlação extremamente bem definido e serrilhado em 3D. Olho altamente valorizado para fixar linhagem campeã e transferir orientação magnética aos filhotes!";
    } else if (scoreVoador >= 88) {
      classificacao = "🏆 VOADOR DE ELITE / NAVEGADOR DE MARATONA";
      cor = "#22C55E";
      desc =
        "Pupila puntiforme ultrarreagente com excelente anel de saúde. Máxima resistência visual contra o sol frontal em provas de meio fundo e fundo extremo.";
    }

    let recomendacaoCruzamento = "Cruzar com olho Pérola Prata para buscar contraste de pigmentação na linhagem.";
    if (iris === "amarelo_ouro") {
      recomendacaoCruzamento = "Ideal cruzar com olho Pérola ou Violeta (Evitar acasalar Ouro x Ouro por mais de 3 gerações).";
    } else if (iris === "perola_prata") {
      recomendacaoCruzamento = "Perfeito para acasalar com pombos de íris Amarelo Ouro ou Pechblenda rica em grãos escuros.";
    }

    return {
      scoreReprodutor,
      scoreVoador,
      classificacao,
      cor,
      desc,
      recomendacaoCruzamento,
    };
  }, [pupila, circulo, iris, granulacao, anelSaude]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>👁️ Análise de Olho de Pombo (Eye-Sign Theory)</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Teoria do Círculo de Adaptação e Esclerótica para selecionar matrizes de ouro e grandes voadores
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        {/* abas do eye-sign */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 14 }}>
          {([["interativo", "🔬 Analisar"], ["guia", "📖 Guia de Campo"], ["tipos", "🎨 Tipos"], ["sinais", "⚡ Sinais"], ["teoria", "📚 Teoria"], ["escola", "🇬🇧 Inglesa"], ["escola-c", "🇨🇳 Chinesa"]] as const).map(([k, lbl]) => (
            <button key={k} type="button" onClick={() => setAba(k)} style={{ padding: "10px 2px", borderRadius: 10, cursor: "pointer", fontSize: 10.5, fontWeight: 800, color: aba === k ? "#0b1426" : "#9aa8bc", background: aba === k ? "#f7bd00" : "#1b283c", border: `1.5px solid ${aba === k ? "#f7bd00" : "#31415a"}`, textAlign: "center", lineHeight: 1.3 }}>
              {lbl}
            </button>
          ))}
        </div>

        {aba === "interativo" && (<>
        <FotoOlhoMira />
        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 14 }}>
            🔍 Características Visuais do Olho do Pombo
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={T.label}>1. Pupila (Reatividade & Tamanho)</label>
              <div style={{ display: "flex", gap: 6 }}>
                {([
                  ["puntiforme", "⚡ Puntiforme (Pequena)"],
                  ["media", "👁️ Média Normal"],
                  ["larga", "⚠️ Larga / Dilatada"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setPupila(val)}
                    style={{
                      flex: 1,
                      padding: "8px 6px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: pupila === val ? T.gold : T.bgInput,
                      color: pupila === val ? T.bg : T.dim,
                      border: `1px solid ${pupila === val ? T.gold : T.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={T.label}>2. Círculo de Adaptação (Correlação)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {([
                  ["serrilhado_largo", "⭐ Largo & Serrilhado"],
                  ["completo_fino", "✅ Completo & Fino"],
                  ["incompleto", "⚠️ Incompleto"],
                  ["ausente", "❌ Ausente / Liso"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setCirculo(val)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: circulo === val ? T.gold : T.bgInput,
                      color: circulo === val ? T.bg : T.dim,
                      border: `1px solid ${circulo === val ? T.gold : T.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={T.label}>3. Pigmentação da Íris</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {([
                  ["amarelo_ouro", "🟡 Amarelo Ouro / Pechblenda"],
                  ["perola_prata", "⚪ Pérola / Prata"],
                  ["violeta_vermelho", "🟣 Violeta / Vermelho"],
                  ["castanho", "🟤 Castanho Escuro"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setIris(val)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: iris === val ? T.gold : T.bgInput,
                      color: iris === val ? T.bg : T.dim,
                      border: `1px solid ${iris === val ? T.gold : T.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={T.label}>4. Granulação Esclerótica (Relevo)</label>
              <div style={{ display: "flex", gap: 6 }}>
                {([
                  ["rugosa_3d", "🏔️ Rugosa em 3D"],
                  ["media", "📊 Rugosidade Média"],
                  ["lisa", "⚠️ Lisa / Plana"],
                ] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setGranulacao(val)}
                    style={{
                      flex: 1,
                      padding: "8px 6px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: granulacao === val ? T.gold : T.bgInput,
                      color: granulacao === val ? T.bg : T.dim,
                      border: `1px solid ${granulacao === val ? T.gold : T.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
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
                RESULTADO DO LAUDO OCULAR
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: T.white, marginTop: 4 }}>
                {analise.classificacao}
              </div>
              <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>{analise.desc}</div>
            </div>

            <div style={{ display: "flex", gap: 16, textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: T.gold }}>{analise.scoreReprodutor}%</div>
                <div style={{ fontSize: 11, color: T.dim }}>Aptidão Matriz</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#22C55E" }}>{analise.scoreVoador}%</div>
                <div style={{ fontSize: 11, color: T.dim }}>Aptidão Voador</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "#ffffff0a", fontSize: 13 }}>
            💡 <b>Dica de Cruzamento Espectral:</b> {analise.recomendacaoCruzamento}
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
            📖 Entendendo as Zonas do Olho na Columbofilia
          </div>
          <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.8 }}>
            • <b>A Pupila Puntiforme:</b> Em pombos-correio de alta performance, a pupila deve ser pequena e reagir instantaneamente à luz solar, garantindo foco em longa distância e reduzindo a fadiga visual.
            <br />
            • <b>O Círculo de Adaptação:</b> É o anel que envolve a pupila. Quando largo e serrilhado em relevo, indica altíssima capacidade de reprodução e fixação das linhas magnéticas de orientação.
            <br />• <b>Íris & Esclerótica:</b> A riqueza em granulação (relevo montanhoso) evidencia vitalidade e resistência circulatória do atleta.
          </div>
        </section>
      <OlhoInterativo />
        </>)}

        {aba === "guia" && (<>
          <GuiaCampo />
        </>)}

        {aba === "tipos" && (<>
          <TiposOlhos />
        </>)}

        {aba === "sinais" && (<>
          <SinaisEyeSign />
        </>)}

        {aba === "escola" && (<>
          <EscolaInglesa />
          <AnatomiaOlho />
        </>)}

        {aba === "escola-c" && <EscolaChinesa />}

        {aba === "teoria" && (<>

      {/* 📚 ESCOLA EYE-SIGN — conteúdo pesquisado (Jack Barkel + Hofmann + ciência) */}
      <section style={T.card}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📚 Escolas Clássicas do Eye-Sign — tradição columófila internacional</div>
        <div style={{ ...T.small, fontSize: 11, marginBottom: 10, lineHeight: 1.5 }}>
          Pesquisa direta das fontes clássicas (Alberta Classic, fórum PigeonBasics com o próprio Barkel). O sul-africano <b>Jack Barkel</b> divide o olho em <b>5 círculos</b>: pupila, adaptação, correlação, íris e o círculo reprodutor (perímetro/círculo da saúde).
        </div>
        {([
          ["1️⃣ Pupila", "Pequena e REATIVA à luz (contrai e expande). Quanto maior a pupila ou a correlação, mais estreito fica o perímetro. Barkel: olhar o músculo esfíncter com lupa sem avaliar reatividade é perda de tempo. Olhos pretos (bull eye) podem ter pupila reativa como qualquer outro."],
          ["2️⃣ Círculo de Adaptação", "Nos puros de reprodução, limpo e completo. O 'sinal de corrida' é o segmento escuro sobreposto — é o que marca o voador. Nas matrizes de Barkel/Hofmann, preferem-no serrilhado (bordas em serra) e bem desenvolvido."],
          ["3️⃣ Círculo de Correlação", "Vai da pupila ao perímetro. Se a parte VISÍVEL (entre adaptação e íris) for larga demais → pombo só para distâncias CURTAS. Correlação fechada = fundo. Barkel considerava a leitura da correlação a parte exclusiva e original da própria teoria."],
          ["4️⃣ Íris", "Íris fina, com falhas/buracos = regressão genética (velocidade sem homing — ganham provas mas se perdem). Íris espessa e granulada = saúde e fundo. Amarelo×amarelo gera íris muito espessa; pérola×pérola gera íris fina demais para provas duras."],
          ["5️⃣ Perímetro / Círculo Reprodutor", "Para merecer vaga no plantel de reprodução, Barkel exigia: os 5 círculos perfeitos, adaptação e perímetro da MESMA cor e largura, e pupila pequena e reativa. VOADORES NÃO PRECISAM dos 5 círculos — a exigência completa é só para matrizes."],
        ] as const).map(([t, d]) => (
          <div key={t} style={{ padding: "9px 12px", borderRadius: 9, background: "#ffffff08", marginBottom: 6, fontSize: 12, lineHeight: 1.6 }}>
            <b style={{ color: T.gold }}>{t}</b> — {d}
          </div>
        ))}
      </section>

      <section style={T.card}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>💘 Regras de acasalamento de Barkel (por cor de olho)</div>
        {([
          ["🚫 Pérola × Pérola", "Aumenta velocidade e vitalidade, mas sacrifica a capacidade de voltar pra casa (homing). Evitar."],
          ["🚫 Amarelo × Amarelo", "Gera pombos lentos e teimosos: muita resistência e homing, pouca vitalidade. Evitar."],
          ["✅ Amarelo × Pérola", "Combina velocidade + resistência + homing + vitalidade. A aposta de Barkel."],
          ["🏆 O pombo duplo propósito", "Melhor que criar puro voador: criar o 'dual purpose' — voa bem e, ao fim da carreira, vai pro plantel. Regra de ouro: acasalar aves cuja SOM dos sinais de corrida não passe de 100%."],
          ["📅 Plano de 3 a 5 anos", "Barkel via o eye-sign como controle de 'deriva genética' do plantel: seleção de olhos gera, em 3-5 gerações, um plantel concentrado nos genes certos. Olho é o termômetro mais sensível — junto com osso, asa e quilha."],
        ] as const).map(([t, d]) => (
          <div key={t} style={{ padding: "9px 12px", borderRadius: 9, background: "#ffffff08", marginBottom: 6, fontSize: 12, lineHeight: 1.6 }}>
            <b style={{ color: t.startsWith("✅") || t.startsWith("🏆") ? T.green : t.startsWith("🚫") ? T.red : T.gold }}>{t}</b> — {d}
          </div>
        ))}
      </section>

      <section style={T.card}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🇩🇪 Escola alemã — Josef Hofmann</div>
        <div style={{ ...T.small, fontSize: 12, lineHeight: 1.7 }}>
          Hofmann compartilha com Barkel: pupila pequena, círculo de adaptação bem desenvolvido e <b>serrilhado</b>, e o eye-sign como ferramenta para <b>encontrar os reprodutores</b> do plantel. Os dois admitem: é possível criar excelentes pombos <b>sem nunca olhar o olho</b> — o eye-sign é um filtro a mais, não uma religião.
        </div>
      </section>

      <section style={{ ...T.card, borderColor: "#55a3ff55", background: "#55a3ff0d" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.blue, marginBottom: 10 }}>⚖️ E o que a ciência diz hoje?</div>
        <div style={{ ...T.small, fontSize: 12, lineHeight: 1.7 }}>
          A ciência moderna deu razão e tirou razão dos eye-signistas ao mesmo tempo: o olho <b>realmente participa da navegação</b> — pombos têm proteínas sensíveis à luz (criptocromos) na retina que enxergam o <b>campo magnético da Terra</b> (bússola magnética dependente de luz). Ou seja, a intuição de que "o olho é a chave da orientação" estava certa! <br /><br />
          MAS: esses mecanismos funcionam em nível molecular/neurológico — <b>não alteram a cor, textura ou granulação da íris</b> de forma diagnosticável. Não há evidência científica de que feições visíveis do olho prevejam desempenho. O que o olho revela bem: <b>saúde geral, vitalidade e calma</b> do pombo.<br /><br />
          <b style={{ color: T.gold }}>Uso sábio:</b> use o eye-sign como mais uma ferramenta de seleção (junte com linhagem, resultados no cesto, asa/osso/saúde) — nunca como única. Como dizem os próprios Barkel e Hofmann: os melhores pombos se revelam <b>voando</b>, não só no olho.
        </div>
        <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 9, background: "#ffffff08", fontSize: 10, lineHeight: 1.6 }}>
          ℹ️ <b>Nota:</b> o Eye-Sign é uma tradição histórica da columofilia, desenvolvida e divulgada ao longo de décadas por diversos autores e criadores — entre eles Jack Barkel (África do Sul), Josef Hofmann (Alemanha) e outros. Este material é <b>educativo e informativo</b>, baseado em conhecimento público do esporte, com <b>crédito e links às fontes</b>. O app não tem vínculo, afiliação ou endosso desses autores ou sites. As regras de acasalamento são referências tradicionais — a decisão de criação é sempre sua.
        </div>
        <div style={{ ...T.small, fontSize: 10, marginTop: 8, lineHeight: 1.8 }}>
          🔗 Fontes: <a href="http://www.albertaclassic.com/eyes/barkel.php" target="_blank" rel="noreferrer" style={{ color: T.blue }}>Alberta Classic — Jack Barkel</a> • <a href="http://www.albertaclassic.com/eyes/hofmann.php" target="_blank" rel="noreferrer" style={{ color: T.blue }}>Alberta Classic — Josef Hofmann</a> • <a href="https://pigeonweb.co.uk/pigeon-racing-explained/pigeon-racing-science-and-theory/eye-sign-and-navigation-right-question-wrong-evidence" target="_blank" rel="noreferrer" style={{ color: T.blue }}>PigeonWeb — ciência e navegação</a> • <a href="http://forum.pigeonbasics.com/topic/20687-jack-barkel-eyesign/" target="_blank" rel="noreferrer" style={{ color: T.blue }}>Fórum PigeonBasics</a>
        </div>
              </section>
        </>)}
      </div>
    </main>
  );
}
