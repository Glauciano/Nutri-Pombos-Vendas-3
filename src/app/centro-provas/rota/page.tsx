"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { classificarProva, diasParaProva, loadCalendario, type ProvaCalendario } from "../data/calendario";
import { T } from "../theme";
import {
  COORDS, POMBAL_BASE, KpReal, SolDia, ClimaPonto, ArPonto, FrameRadar,
  buscarKpNoaa, buscarSol, buscarClimaPonto, bearingRota, direcaoCardeal,
  scorePonto, ventoNaRota, wmoInfo,
  buscarAr, classificarAr, buscarAltimetria, interpolarRota,
  buscarRadar, urlTileRadar, tileXY,
} from "../lib/apis-gratis";

type Modo = "agora" | "prova";

type PontoRota = { chave: string; nome: string; estado: string; km: number; lat: number; lon: number; papel: "solta" | "intermediaria" | "pombal" };
type DadosPonto = { clima: ClimaPonto } | { erro: string };

const LIMITE_PREVISAO_DIAS = 16;

export default function RotaDaProva() {
  const [provas, setProvas] = useState<ProvaCalendario[]>([]);
  const [provaSel, setProvaSel] = useState<ProvaCalendario | null>(null);
  const [modo, setModo] = useState<Modo>("agora");
  const [dados, setDados] = useState<Record<string, DadosPonto>>({});
  const [kp, setKp] = useState<KpReal | null>(null);
  const [solSolta, setSolSolta] = useState<SolDia | null>(null);
  const [solPombal, setSolPombal] = useState<SolDia | null>(null);
  const [carregando, setCarregando] = useState(false);
  // 🌫️ Qualidade do ar por cidade
  const [ar, setAr] = useState<Record<string, ArPonto | null>>({});
  // ⛰️ Altimetria da rota
  const [altimetria, setAltimetria] = useState<number[] | null>(null);
  const [altErro, setAltErro] = useState("");
  // 🛰️ Radar de chuva (RainViewer)
  const [radar, setRadar] = useState<{ host: string; frames: FrameRadar[] } | null>(null);
  const [radarIdx, setRadarIdx] = useState(0);
  const [radarPlay, setRadarPlay] = useState(true);

  useEffect(() => {
    const lista = loadCalendario().filter((p) => !p.cancelada);
    setProvas(lista);
    const hoje = new Date().toISOString().slice(0, 10);
    setProvaSel(lista.find((p) => p.dataSolta >= hoje) || lista[lista.length - 1] || null);
  }, []);

  const rota = useMemo<PontoRota[]>(() => {
    if (!provaSel) return [];
    const base = COORDS[POMBAL_BASE];
    const waypoints = provas
      .filter((p) => p.km <= provaSel.km)
      .sort((a, b) => b.km - a.km)
      .map((p, i) => {
        const coord = p.latitude != null && p.longitude != null ? { lat: p.latitude, lon: p.longitude } : COORDS[p.cidade];
        return { chave: `p${p.num}`, nome: p.cidade, estado: p.estado, km: p.km, lat: coord?.lat ?? base.lat, lon: coord?.lon ?? base.lon, papel: i === 0 ? ("solta" as const) : ("intermediaria" as const) };
      });
    return [...waypoints, { chave: "pombal", nome: "Pombal (chegada)", estado: "SP", km: 0, lat: base.lat, lon: base.lon, papel: "pombal" as const }];
  }, [provaSel, provas]);

  const diasAte = provaSel ? diasParaProva(provaSel.dataSolta) : 0;
  const previsivel = diasAte >= 0 && diasAte <= LIMITE_PREVISAO_DIAS;

  const consultar = useCallback(async (rotaAtual: PontoRota[], modoAtual: Modo, dataSolta?: string) => {
    if (!rotaAtual.length) return;
    setCarregando(true); setDados({}); setKp(null); setSolSolta(null); setSolPombal(null); setAr({});
    const dia = modoAtual === "prova" && dataSolta ? dataSolta : undefined;
    const [resultados, kpR] = await Promise.all([
      Promise.all(rotaAtual.map(async (pt) => {
        try { return [pt.chave, { clima: await buscarClimaPonto(pt.lat, pt.lon, dia) }] as const; }
        catch (e) { return [pt.chave, { erro: e instanceof Error ? e.message : "Falha na consulta" }] as const; }
      })),
      buscarKpNoaa(),
    ]);
    setDados(Object.fromEntries(resultados));
    setKp(kpR);
    // 🌫️ Qualidade do ar (somente modo "agora" — a API não prevê AQI com antecedência)
    if (modoAtual === "agora") {
      Promise.all(rotaAtual.map(async (pt) => [pt.chave, await buscarAr(pt.lat, pt.lon)] as const))
        .then((res) => setAr(Object.fromEntries(res)));
    }
    if (rotaAtual[0] && rotaAtual[rotaAtual.length - 1]) {
      const base = rotaAtual[rotaAtual.length - 1];
      const solta = rotaAtual[0];
      const [s1, s2] = await Promise.all([
        buscarSol(solta.lat, solta.lon, 1).catch(() => null),
        buscarSol(base.lat, base.lon, 1).catch(() => null),
      ]);
      setSolSolta(s1?.[0] ?? null);
      setSolPombal(s2?.[0] ?? null);
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (provaSel && (modo === "agora" || previsivel)) consultar(rota, modo, provaSel.dataSolta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provaSel?.id, modo]);

  // ⛰️ Altimetria do perfil da rota (41 amostras em 1 chamada)
  useEffect(() => {
    if (!rota.length || !provaSel) return;
    const solta = rota[0];
    const base = rota[rota.length - 1];
    setAltimetria(null); setAltErro("");
    buscarAltimetria(interpolarRota({ lat: solta.lat, lon: solta.lon }, { lat: base.lat, lon: base.lon }, 41))
      .then((v) => { if (v.length) setAltimetria(v); else setAltErro("sem dados"); })
      .catch(() => setAltErro("indisponível agora"));
  }, [rota, provaSel]);

  // 🛰️ Radar de chuva ao vivo
  useEffect(() => { buscarRadar().then((r) => { if (r) setRadar(r); }); }, []);
  useEffect(() => {
    if (!radar || !radarPlay) return;
    const t = setInterval(() => setRadarIdx((i) => (i + 1) % radar.frames.length), 900);
    return () => clearInterval(t);
  }, [radar, radarPlay]);

  const base = COORDS[POMBAL_BASE];
  const pontosComScore = rota.map((pt) => {
    const d = dados[pt.chave];
    if (d && "clima" in d) {
      const bearing = bearingRota(pt.lat, pt.lon, base.lat, base.lon);
      const vento = ventoNaRota(d.clima.dirVento, bearing);
      const score = scorePonto(d.clima, vento.pen, kp?.kp ?? null);
      return { pt, d, vento, score };
    }
    return { pt, d, vento: null, score: null };
  });
  const validos = pontosComScore.filter((x) => x.score);
  const pior = validos.length ? validos.reduce((a, b) => (a.score!.pts < b.score!.pts ? a : b)) : null;
  const media = validos.length ? Math.round(validos.reduce((s, x) => s + x.score!.pts, 0) / validos.length) : null;

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🛣️ Rota Completa da Prova — Instrumentos por Cidade</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Da soltura até o pombal: clima, vento na rota, pressão, visibilidade e Kp em cada cidade do percurso • Open-Meteo + NOAA (gratuito)
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {/* Seleção da prova */}
        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🏁 Selecionar a prova (soltura → pombal)</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
            {provas.map((p) => {
              const sel = provaSel?.id === p.id;
              const c = classificarProva(p.km);
              return (
                <button key={p.id} onClick={() => setProvaSel(p)} style={{ padding: "7px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800, color: sel ? T.bg : T.dim, background: sel ? T.gold : T.bgInput, border: `1px solid ${sel ? T.gold : T.border}` }}>
                  #{p.num} {p.cidade} · {p.km}km
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={T.small}>Consultar:</span>
            {([["agora", "📡 Agora"], ["prova", `🏁 Dia da soltura${provaSel ? ` (${provaSel.dataSolta.slice(8, 10)}/${provaSel.dataSolta.slice(5, 7)})` : ""}`]] as const).map(([k, lbl]) => (
              <button key={k} onClick={() => setModo(k)} disabled={k === "prova" && !previsivel}
                style={{ padding: "8px 12px", borderRadius: 9, fontSize: 11, fontWeight: 800, cursor: "pointer", color: modo === k ? T.bg : T.dim, background: modo === k ? T.gold : T.bgInput, border: `1px solid ${modo === k ? T.gold : T.border}`, opacity: k === "prova" && !previsivel ? 0.45 : 1 }}>
                {lbl}
              </button>
            ))}
            <button onClick={() => provaSel && consultar(rota, modo, provaSel.dataSolta)} disabled={carregando} style={{ ...T.btnSm, opacity: carregando ? 0.6 : 1 }}>{carregando ? "⏳" : "↻ Atualizar"}</button>
          </div>
          {modo === "prova" && !previsivel && provaSel && (
            <div style={{ ...T.small, marginTop: 8, fontSize: 11, color: T.orange }}>
              ⚠️ A previsão do dia da soltura só fica disponível até {LIMITE_PREVISAO_DIAS} dias antes da prova {diasAte < 0 ? "(esta prova já foi realizada)" : `(faltam ${diasAte} dias)`}.
            </div>
          )}
        </section>

        {/* Resumo geral */}
        {provaSel && (
          <section style={{ ...T.card, borderColor: `${T.gold}55`, background: `${T.gold}0d` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.gold, textTransform: "uppercase" }}>Percurso de {rota.length} pontos</div>
                <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>
                  {rota[0]?.nome} 🠊 {base === COORDS[POMBAL_BASE] ? "Pombal" : "Pombal"} ({provaSel.km}km)
                </div>
                <div style={{ ...T.small, marginTop: 4 }}>
                  {rota.filter((r) => r.papel === "intermediaria").length} cidades intermediárias • passagem: {rota.map((r) => r.papel === "pombal" ? "🏠" : r.nome.split(" ")[0]).join(" → ")}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {media !== null && (
                  <>
                    <div style={{ fontSize: 40, fontWeight: 900, color: (pior?.score!.pts ?? 100) >= 75 ? T.green : (pior?.score!.pts ?? 0) >= 55 ? "#fbbf24" : T.red }}>{Math.min(media, pior?.score!.pts ?? media)}%</div>
                    <div style={{ fontSize: 11, color: T.dim }}>Índice do trecho mais crítico</div>
                  </>
                )}
                {carregando && <div style={{ ...T.small, color: T.gold }}>⏳ Consultando {rota.length} cidades...</div>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginTop: 12 }}>
              <div style={{ padding: 10, borderRadius: 9, background: "#ffffff08", textAlign: "center" }}>
                <div style={{ fontSize: 16 }}>🧲</div>
                <div style={{ ...T.small, fontSize: 10 }}>KP GEOMAGNÉTICO</div>
                <b style={{ color: kp ? (kp.kp >= 5 ? T.red : kp.kp >= 3 ? "#fbbf24" : T.green) : T.dim }}>{kp ? kp.kp.toFixed(2) : "—"}</b>
                <div style={{ ...T.small, fontSize: 9 }}>{kp ? kp.horaUTC : "NOAA indisponível"}</div>
              </div>
              <div style={{ padding: 10, borderRadius: 9, background: "#ffffff08", textAlign: "center" }}>
                <div style={{ fontSize: 16 }}>🌅</div>
                <div style={{ ...T.small, fontSize: 10 }}>SOL NA SOLTURA</div>
                <b style={{ color: T.gold, fontSize: 12 }}>{solSolta ? `${solSolta.nascer} → ${solSolta.por}` : "—"}</b>
              </div>
              <div style={{ padding: 10, borderRadius: 9, background: "#ffffff08", textAlign: "center" }}>
                <div style={{ fontSize: 16 }}>🏠</div>
                <div style={{ ...T.small, fontSize: 10 }}>SOL NO POMBAL</div>
                <b style={{ color: T.gold, fontSize: 12 }}>{solPombal ? `${solPombal.nascer} → ${solPombal.por}` : "—"}</b>
              </div>
              {pior?.score && (
                <div style={{ padding: 10, borderRadius: 9, background: `${pior.score.cor}12`, border: `1px solid ${pior.score.cor}55`, textAlign: "center" }}>
                  <div style={{ fontSize: 16 }}>⚠️</div>
                  <div style={{ ...T.small, fontSize: 10 }}>TRECHO MAIS CRÍTICO</div>
                  <b style={{ color: pior.score.cor, fontSize: 12 }}>{pior.pt.nome} · {pior.score.pts}%</b>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ⛰️ Perfil do relevo da rota (Open-Meteo Elevation — gratuito) */}
        {provaSel && (
          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
              ⛰️ Perfil do Relevo da Rota — {rota[0]?.nome} → Pombal
            </div>
            {!altimetria && !altErro && <div style={{ ...T.small, textAlign: "center", padding: 16 }}>⏳ Medindo a altimetria do percurso...</div>}
            {altErro && <div style={{ ...T.small, color: T.orange }}>⚠️ Altimetria {altErro}.</div>}
            {altimetria && provaSel.km > 0 && (() => {
              const W = 800, H = 190, padL = 34, padR = 12, padT = 26, padB = 26;
              const max = Math.max(...altimetria), min = Math.min(...altimetria);
              const y = (v: number) => padT + (1 - (v - min) / ((max - min) || 1)) * (H - padT - padB);
              const x = (i: number) => padL + (i / (altimetria.length - 1)) * (W - padL - padR);
              const linha = altimetria.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
              const idxMax = altimetria.indexOf(max);
              return (
                <div>
                  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", background: "#0b1529", borderRadius: 12 }}>
                    <polygon points={`${padL},${H - padB} ${linha} ${W - padR},${H - padB}`} fill="url(#grad-relevo)" />
                    <defs>
                      <linearGradient id="grad-relevo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#f7bd00" stopOpacity="0.55" />
                        <stop offset="1" stopColor="#f7bd00" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <polyline points={linha} fill="none" stroke="#f7bd00" strokeWidth="2" />
                    <text x={x(idxMax)} y={y(max) - 8} textAnchor="middle" fill="#ff5d62" fontSize="11" fontWeight="800">▲ {Math.round(max)}m</text>
                    <text x={padL - 4} y={padT + 4} textAnchor="end" fill="#9aa8bc" fontSize="9">{Math.round(max)}m</text>
                    <text x={padL - 4} y={H - padB} textAnchor="end" fill="#9aa8bc" fontSize="9">{Math.round(min)}m</text>
                    {[0.25, 0.5, 0.75].map((f) => (
                      <text key={f} x={padL + f * (W - padL - padR)} y={H - 8} textAnchor="middle" fill="#9aa8bc" fontSize="9">{Math.round(provaSel.km * (1 - f))}km</text>
                    ))}
                    {rota.map((pt, i) => {
                      const t = pt.papel === "pombal" ? 1 : (provaSel.km - pt.km) / provaSel.km;
                      const cx = padL + t * (W - padL - padR);
                      return (
                        <g key={pt.chave}>
                          <circle cx={cx} cy={H - padB} r={i === 0 || pt.papel === "pombal" ? 6 : 4} fill={i === 0 ? "#ff5d62" : pt.papel === "pombal" ? "#39e58c" : "#55a3ff"} stroke="#0b1426" strokeWidth="2" />
                          <text x={cx} y={i % 2 === 0 ? H - padB + 18 : H - padB - 10} textAnchor="middle" fill="#9aa8bc" fontSize="9">{pt.papel === "pombal" ? "🏠" : pt.nome.split(" ")[0]}</text>
                        </g>
                      );
                    })}
                  </svg>
                  <div style={{ ...T.small, fontSize: 11, marginTop: 8 }}>
                    🔺 Ponto mais alto do percurso: <b style={{ color: T.gold }}>{Math.round(max)}m</b> • desníveis e serras aumentam o esforço e desviam a linha de voo • Fonte: Open-Meteo Elevation
                  </div>
                </div>
              );
            })()}
          </section>
        )}

        {/* 🛰️ Radar de chuva ao vivo (RainViewer — gratuito) */}
        {provaSel && rota.length > 0 && (
          <section style={T.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>🛰️ Radar de Chuva ao Vivo na Rota</div>
              {radar && (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button onClick={() => setRadarIdx((i) => (i - 1 + radar.frames.length) % radar.frames.length)} style={T.btnGhost}>‹</button>
                  <button onClick={() => setRadarPlay((p) => !p)} style={T.btnSm}>{radarPlay ? "⏸" : "▶"}</button>
                  <button onClick={() => setRadarIdx((i) => (i + 1) % radar.frames.length)} style={T.btnGhost}>›</button>
                </div>
              )}
            </div>
            {!radar && <div style={{ ...T.small, textAlign: "center", padding: 16 }}>⏳ Carregando radar de chuva...</div>}
            {radar && (() => {
              const Z = 6;
              const lats = rota.map((p) => p.lat), lons = rota.map((p) => p.lon);
              const maxLat = Math.max(...lats) + 0.7, minLat = Math.min(...lats) - 0.7;
              const maxLon = Math.max(...lons) + 1.4, minLon = Math.min(...lons) - 1.4;
              const a = tileXY(maxLat, minLon, Z), b = tileXY(minLat, maxLon, Z);
              const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x);
              const y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
              const cols = x1 - x0 + 1, rows = y1 - y0 + 1;
              const n = 2 ** Z;
              const pos = (lat: number, lon: number) => {
                const xx = ((lon + 180) / 360) * n * 256;
                const latR = (lat * Math.PI) / 180;
                const yy = ((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n * 256;
                return { left: xx - x0 * 256, top: yy - y0 * 256 };
              };
              const frame = radar.frames[radarIdx];
              const hora = new Date(frame.time * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
              const tiles: { gx: number; gy: number }[] = [];
              for (let gx = 0; gx < cols; gx++) for (let gy = 0; gy < rows; gy++) tiles.push({ gx, gy });
              return (
                <div>
                  <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${T.border}` }}>
                    <div style={{ position: "relative", width: cols * 256, height: rows * 256, background: "#0b1426" }}>
                      {tiles.map(({ gx, gy }) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={`b${gx}-${gy}`} src={`https://basemaps.cartocdn.com/dark_all/${Z}/${x0 + gx}/${y0 + gy}.png`} alt="" width={256} height={256} style={{ position: "absolute", left: gx * 256, top: gy * 256, opacity: 0.9 }} />
                      ))}
                      {tiles.map(({ gx, gy }) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={`r${gx}-${gy}-${frame.path}`} src={urlTileRadar(radar.host, frame.path, Z, x0 + gx, y0 + gy)} alt="" width={256} height={256} style={{ position: "absolute", left: gx * 256, top: gy * 256, opacity: 0.7 }} />
                      ))}
                      {rota.map((pt, i) => {
                        const p = pos(pt.lat, pt.lon);
                        const cor = i === 0 ? "#ff5d62" : pt.papel === "pombal" ? "#39e58c" : "#55a3ff";
                        return (
                          <div key={pt.chave} style={{ position: "absolute", left: p.left, top: p.top, transform: "translate(-50%,-50%)", textAlign: "center" }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: cor, border: "2px solid white", boxShadow: "0 0 8px rgba(0,0,0,.6)" }} />
                            <small style={{ display: "block", marginTop: 3, fontSize: 10, fontWeight: 800, color: "#fff", textShadow: "0 1px 3px #000, 0 0 6px #000" }}>
                              {pt.papel === "pombal" ? "🏠 Pombal" : pt.nome.split(" ")[0]}
                            </small>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, flexWrap: "wrap", gap: 6 }}>
                    <small style={{ color: frame.previsto ? T.blue : T.gold, fontWeight: 800 }}>
                      {frame.previsto ? "🔮 Previsão" : "🛰️ Observado"} · {hora} · quadro {radarIdx + 1}/{radar.frames.length}
                    </small>
                    <small style={{ color: T.dim }}> verde=fraca · amarelo=moderada · vermelho=forte · Fonte: RainViewer</small>
                  </div>
                </div>
              );
            })()}
          </section>
        )}

        {/* Pontos da rota */}
        {pontosComScore.map(({ pt, d, vento, score }) => {
          const clima = d && "clima" in d ? d.clima : null;
          const wi = clima ? wmoInfo(clima.wmo) : null;
          return (
            <section key={pt.chave} style={{ ...T.card, border: pt.papel === "solta" ? `2px solid ${T.gold}66` : pt.papel === "pombal" ? `2px solid ${T.green}66` : `1px solid ${T.border}`, opacity: score ? 1 : 0.75 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", background: pt.papel === "solta" ? T.gold : pt.papel === "pombal" ? T.green : T.bgInput, color: pt.papel === "intermediaria" ? T.white : T.bg, fontWeight: 900, fontSize: 13 }}>
                    {pt.papel === "solta" ? "🏁" : pt.papel === "pombal" ? "🏠" : `${pt.km}k`}
                  </div>
                  <div>
                    <b style={{ fontSize: 15 }}>{pt.nome} — {pt.estado}</b>
                    <div style={{ ...T.small, fontSize: 11 }}>
                      {pt.papel === "solta" ? "PONTO DE SOLTURA" : pt.papel === "pombal" ? "CHEGADA NO POMBAL" : "Passagem pela rota"}
                      {clima && ` • referência: ${clima.horaRef}`}
                    </div>
                  </div>
                </div>
                {clima && wi && (
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ fontSize: 26 }}>{wi.emoji}</div>
                    <div style={{ textAlign: "right" }}>
                      <b style={{ color: T.gold, fontSize: 18 }}>{clima.temp}°</b>
                      <div style={{ ...T.small, fontSize: 10 }}>{wi.desc}</div>
                    </div>
                  </div>
                )}
              </div>

              {d && "erro" in d && (
                <div style={{ marginTop: 10, padding: 10, borderRadius: 8, color: T.orange, background: "#f9731612", border: "1px solid #f9731655", fontSize: 12 }}>
                  ⚠️ Não foi possível obter os dados desta cidade agora ({d.erro}).
                </div>
              )}
              {!d && carregando && <div style={{ marginTop: 10, color: T.dim, fontSize: 12 }}>⏳ Consultando instrumentos...</div>}

              {clima && vento && score && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8, marginTop: 12 }}>
                    {([
                      ["💨", "Vento", `${clima.ventoKmh} km/h ${direcaoCardeal(clima.dirVento)}`],
                      ["🌪️", "Rajada", `${clima.rajadaKmh} km/h`],
                      ["🌧️", "Chuva", `${clima.chuvaMm} mm`],
                      ["💧", "Umidade", `${clima.umidade}%`],
                      ["🧭", "Pressão", `${clima.pressaoMsl} hPa`],
                      ["☁️", "Nuvens", `${clima.nuvens}%`],
                      ["👁️", "Visibilidade", `${clima.visibilidadeKm} km`],
                    ] as const).map(([emoji, label, valor]) => (
                      <div key={label} style={{ padding: 9, borderRadius: 8, background: "#ffffff08", textAlign: "center" }}>
                        <div style={{ fontSize: 15 }}>{emoji}</div>
                        <div style={{ ...T.small, fontSize: 9 }}>{label}</div>
                        <b style={{ fontSize: 12 }}>{valor}</b>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: 10, marginTop: 10, borderRadius: 9, color: vento.cor, background: `${vento.cor}12`, border: `1px solid ${vento.cor}55`, fontSize: 12 }}>
                    {vento.emoji} <b>{vento.tipo}</b> nesta parte do percurso — o vento vem de {direcaoCardeal(clima.dirVento)} ({clima.dirVento}°) e o bando voa rumo {direcaoCardeal(bearingRota(pt.lat, pt.lon, base.lat, base.lon))} em direção ao pombal.
                  </div>
                  {ar[pt.chave] && (() => {
                    const info = classificarAr(ar[pt.chave]!);
                    const dado = ar[pt.chave]!;
                    return (
                      <div style={{ padding: 9, marginTop: 8, borderRadius: 8, color: info.cor, background: `${info.cor}12`, border: `1px solid ${info.cor}44`, fontSize: 12 }}>
                        🌫️ <b>{info.label}</b> — PM2.5 {dado.pm25} · PM10 {dado.pm10} µg/m³{dado.pm25 > 35 ? " · ⚠️ fumaça/queimada dificulta a respiração em voo" : ""}
                      </div>
                    );
                  })()}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
                    <b style={{ color: score.cor, fontSize: 13 }}>● {score.label}</b>
                    <div style={{ height: 5, flex: 1, background: "#ffffff14", borderRadius: 3 }}>
                      <div style={{ height: "100%", width: `${score.pts}%`, background: score.cor, borderRadius: 3 }} />
                    </div>
                    <b style={{ color: score.cor }}>{score.pts}%</b>
                  </div>
                </>
              )}
            </section>
          );
        })}

        <div style={{ ...T.small, textAlign: "center", fontSize: 11 }}>
          Fontes: Open-Meteo (clima e sol) • NOAA SWPC (Kp) • gratuitos, sem chave • {carregando ? "consultando..." : "atualizado agora"}
        </div>
      </div>
    </main>
  );
}
