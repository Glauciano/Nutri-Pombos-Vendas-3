"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { classificarProva, diasParaProva, loadCalendario, type ProvaCalendario } from "../data/calendario";
import { T } from "../theme";
import {
  COORDS, POMBAL_BASE, KpReal, SolDia, ClimaPonto, ArPonto, FrameRadar,
  buscarKpNoaa, buscarSol, buscarClimaPonto, bearingRota, direcaoCardeal,
  scorePonto, ventoNaRota, wmoInfo,
  buscarAr, classificarAr, buscarAltimetria, interpolarRota,
  buscarRadar, urlTileRadar, tileXY,
  aplicarPombalSalvo, getPombal, EVENTO_POMBAL, Coords,
  HoraSolta, buscarJanelaSolta, hojeSP, somarMinutosHHMM, faseLua,
  NowcastPasso, buscarNowcastChuva, calcularIdp, confiancaPrevisao, protocoloRecepcao,
  riscoExtravio, gerarIcsProvas,
  buscarClimaPontos, buscarSolPontos, buscarArPontos, buscarJanelaSoltaPontos, limparCacheApi,
} from "../lib/apis-gratis";
import { loadConfig } from "../config";

type Modo = "agora" | "prova";

type PontoRota = { chave: string; nome: string; estado: string; km: number; lat: number; lon: number; papel: "solta" | "intermediaria" | "pombal" };
type DadosPonto = { clima: ClimaPonto } | { erro: string };

const LIMITE_PREVISAO_DIAS = 16;

type CompDia = { data: string; label: string; media: number; chuvaTotal: number; pior: { nome: string; pts: number } | null; scoreSolta: number | null; vencedor?: boolean };

function nomeDiaSemana(dataISO: string): string {
  const s = new Date(`${dataISO}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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
  // 🏁 Configuração de soltura (Configuração → Horário da Soltura)
  const [cfgSolta, setCfgSolta] = useState<{ modo: "auto" | "manual"; min: number; manual: string }>({ modo: "auto", min: 20, manual: "07:00" });
  useEffect(() => {
    const c = loadConfig();
    setCfgSolta({ modo: c.soltaModo === "manual" ? "manual" : "auto", min: c.soltaMinAposNascer ?? 20, manual: c.soltaHoraManual || "07:00" });
  }, []);

  // 🕐 Janela ideal de soltura + ⏱️ previsão de chegada
  const [janela, setJanela] = useState<{ solta: HoraSolta[]; pombal: HoraSolta[] } | null>(null);
  const [janelaErro, setJanelaErro] = useState("");
  const [veloBase, setVeloBase] = useState<number | null>(null);
  const [copiado, setCopiado] = useState(false);
  // 📱 abas (mobile-first)
  const [aba, setAba] = useState<"resumo" | "tempos" | "cidades" | "mapas" | "tudo">("tudo");
  // 🔔 Alarme de chegada
  const [alarmeAtivo, setAlarmeAtivo] = useState(false);
  const [alarmeHora, setAlarmeHora] = useState<string | null>(null);
  const [alarmeMsg, setAlarmeMsg] = useState("");
  const alarmeDisparadoRef = useRef(false);
  // 📅 Comparação sábado × domingo
  const [compDias, setCompDias] = useState<CompDia[] | null>(null);
  const [compCarregando, setCompCarregando] = useState(false);
  // 🧭 Bússola da chegada (quem espera no pombal)
  const [tick, setTick] = useState(0);

  // 🔢 Matriz cidade × hora (onda do clima) + 🐦 risco de extravio + 📆 ICS
  const [matriz, setMatriz] = useState<{ horas: string[]; celulas: Record<string, (number | null)[]> } | null>(null);
  const [matrizCarregando, setMatrizCarregando] = useState(false);

  // 🌧️ Nowcast de chuva no pombal + 📖 crônica
  const [nowcast, setNowcast] = useState<NowcastPasso[] | null>(null);
  const [cronicaSalva, setCronicaSalva] = useState(false);
  const [cronicaMsg, setCronicaMsg] = useState("");

  // 🏠 Pombal configurável (Configuração → Localização do Pombal)
  const [pombal, setPombalState] = useState<Coords & { nome: string }>(() => ({ ...COORDS[POMBAL_BASE], nome: POMBAL_BASE }));
  useEffect(() => {
    setPombalState(aplicarPombalSalvo());
    const atualizar = () => setPombalState(getPombal());
    window.addEventListener(EVENTO_POMBAL, atualizar);
    return () => window.removeEventListener(EVENTO_POMBAL, atualizar);
  }, []);

  useEffect(() => {
    try {
      const hist = JSON.parse(localStorage.getItem("nutripombos-historico-provas-v1") || "[]");
      if (Array.isArray(hist) && hist.length) {
        const soma = hist.reduce((acc: number, h: { velocidade?: number }) => acc + (h.velocidade || 0), 0);
        if (soma > 0) setVeloBase(Math.round(soma / hist.length));
      }
    } catch { /* sem histórico */ }
    const lista = loadCalendario().filter((p) => !p.cancelada);
    setProvas(lista);
    const hoje = new Date().toISOString().slice(0, 10);
    const prox = lista.find((p) => p.dataSolta >= hoje) || lista[lista.length - 1] || null;
    setProvaSel(prox);
    if (prox) {
      const d = Math.ceil((new Date(`${prox.dataSolta}T00:00:00`).getTime() - new Date(`${hoje}T00:00:00`).getTime()) / 86_400_000);
      if (d >= 0 && d <= LIMITE_PREVISAO_DIAS) setModo("prova"); // já abre na previsão do dia da soltura
    }
  }, []);

  const rota = useMemo<PontoRota[]>(() => {
    if (!provaSel) return [];
    const base = { lat: pombal.lat, lon: pombal.lon };
    const waypoints = provas
      .filter((p) => p.km <= provaSel.km)
      .sort((a, b) => b.km - a.km)
      .map((p, i) => {
        const coord = p.latitude != null && p.longitude != null ? { lat: p.latitude, lon: p.longitude } : COORDS[p.cidade];
        return { chave: `p${p.num}`, nome: p.cidade, estado: p.estado, km: p.km, lat: coord?.lat ?? base.lat, lon: coord?.lon ?? base.lon, papel: i === 0 ? ("solta" as const) : ("intermediaria" as const) };
      });
    return [...waypoints, { chave: "pombal", nome: pombal.nome === POMBAL_BASE ? "Pombal (chegada)" : `${pombal.nome} (chegada)`, estado: "SP", km: 0, lat: base.lat, lon: base.lon, papel: "pombal" as const }];
  }, [provaSel, provas, pombal]);

  const diasAte = provaSel ? diasParaProva(provaSel.dataSolta) : 0;
  const previsivel = diasAte >= 0 && diasAte <= LIMITE_PREVISAO_DIAS;

  const consultar = useCallback(async (rotaAtual: PontoRota[], modoAtual: Modo, dataSolta?: string, forcar = false) => {
    if (!rotaAtual.length) return;
    if (forcar) limparCacheApi();
    setCarregando(true); setDados({}); setKp(null); setSolSolta(null); setSolPombal(null); setAr({});
    const dia = modoAtual === "prova" && dataSolta ? dataSolta : undefined;
    const coords = rotaAtual.map((pt) => ({ lat: pt.lat, lon: pt.lon }));
    // 🚀 TODAS as cidades em UMA chamada (antes eram 11 — estourava o limite/429)
    const [climas, kpR] = await Promise.all([
      buscarClimaPontos(coords, dia).catch(() => undefined),
      buscarKpNoaa(),
    ]);
    setDados(Object.fromEntries(rotaAtual.map((pt, i) => [
      pt.chave,
      climas?.[i] ? { clima: climas[i] as ClimaPonto } : { erro: "limite da API — toque ↻ Atualizar" },
    ])));
    setKp(kpR);
    // 🌫️ Qualidade do ar em lote (somente modo "agora")
    if (modoAtual === "agora") {
      buscarArPontos(coords).then((ars) => setAr(Object.fromEntries(rotaAtual.map((pt, i) => [pt.chave, ars[i]])))).catch(() => {});
    }
    // 🌅 Sol na soltura e no pombal (1 chamada)
    if (rotaAtual.length > 1) {
      try {
        const sois = await buscarSolPontos([coords[0], coords[coords.length - 1]], 1);
        setSolSolta(sois[0]?.[0] ?? null);
        setSolPombal(sois[1]?.[0] ?? null);
      } catch { /* segue sem sol */ }
    }
    // 🕐 Janela ideal de soltura (1 chamada, solta + pombal)
    setJanela(null); setJanelaErro("");
    const diaJanela = modoAtual === "prova" && dataSolta ? dataSolta : hojeSP();
    try {
      const janelas = await buscarJanelaSoltaPontos([coords[0], coords[coords.length - 1]], diaJanela);
      if (janelas[0]?.length) setJanela({ solta: janelas[0], pombal: janelas[1] || [] });
      else setJanelaErro("previsão horária ainda não disponível para esta data");
    } catch { setJanelaErro("previsão horária indisponível agora — toque ↻"); }
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (provaSel && (modo === "agora" || previsivel)) consultar(rota, modo, provaSel.dataSolta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provaSel?.id, modo, pombal]);

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

  const base = pombal;


  // 🛰️ Satélite opcional (Google, com API Key) + 🌙 lua da prova
  const gKey = (loadConfig().mapaApiKey || "").trim();
  const [modoMapa, setModoMapa] = useState<"radar" | "satelite" | "google">("radar");
  const diaLua = modo === "prova" && provaSel ? provaSel.dataSolta : hojeSP();
  const lua = provaSel ? faseLua(diaLua) : null;
  const pontosComScore = rota.map((pt, i) => {
    const d = dados[pt.chave];
    if (d && "clima" in d) {
      // No pombal (chegada) o rumo correto é o do TRECHO FINAL: da última cidade até o pombal
      const origem = pt.papel === "pombal" && i > 0 ? rota[i - 1] : pt;
      const bearing = bearingRota(origem.lat, origem.lon, base.lat, base.lon);
      const vento = ventoNaRota(d.clima.dirVento, bearing, d.clima.ventoKmh);
      const score = scorePonto(d.clima, vento.pen, kp?.kp ?? null);
      return { pt, d, vento, score, bearing, trechoFinal: pt.papel === "pombal" && i > 0 ? rota[i - 1].nome : null };
    }
    return { pt, d, vento: null, score: null, bearing: null, trechoFinal: null };
  });
  const validos = pontosComScore.filter((x) => x.score);
  const pior = validos.length ? validos.reduce((a, b) => (a.score!.pts < b.score!.pts ? a : b)) : null;
  const media = validos.length ? Math.round(validos.reduce((s, x) => s + x.score!.pts, 0) / validos.length) : null;

  // 🎯 IDP — Índice de Dificuldade da Prova (0-10)
  const idp = useMemo(() => {
    if (!provaSel) return null;
    const penMedio = validos.length ? validos.reduce((soma, v) => soma + (v.vento?.pen ?? 0), 0) / validos.length : 5;
    const chuvaMax = validos.reduce((m, v) => Math.max(m, (v.d && "clima" in v.d ? v.d.clima.chuvaMm : 0)), 0);
    const d = altimetria && altimetria.length ? Math.max(...altimetria) - Math.min(...altimetria) : null;
    return calcularIdp({ km: provaSel.km, penVentoMedio: penMedio, chuvaMaxMm: chuvaMax, kp: kp?.kp ?? null, relevoDesnivelM: d });
  }, [provaSel, validos, kp, altimetria]);

  // 📊 confiança da previsão + 🐦 risco de extravio
  const conf = confiancaPrevisao(Math.max(0, diasAte));
  const risco = provaSel ? riscoExtravio({ km: provaSel.km, scoreMedio: media, idp: idp?.idp ?? null, kp: kp?.kp ?? null }) : null;

  // 🕐 Score de cada hora da manhã na cidade da soltura (vento relativo à rota)
  const bearingSolta = rota.length > 1 && provaSel ? bearingRota(rota[0].lat, rota[0].lon, base.lat, base.lon) : 180;
  const horasScored = (janela?.solta || []).map((h) => {
    const v = ventoNaRota(h.dir, bearingSolta, h.vento);
    const sc = scorePonto({ temp: h.temp, chuvaMm: h.chuva, ventoKmh: h.vento, rajadaKmh: h.rajada, dirVento: h.dir, umidade: h.umidade, pressaoMsl: 1013, nuvens: 0, visibilidadeKm: 24, wmo: h.wmo, horaRef: h.hora }, v.pen, kp?.kp ?? null);
    return { ...h, ventoR: v, sc };
  });
  const manha = horasScored.filter((h) => h.hora >= "05:00" && h.hora <= "11:00");
  let janelaIdeal: { ini: string; fim: string; pts: number } | null = null;
  if (manha.length) {
    const melhor = manha.reduce((a, b) => (b.sc.pts > a.sc.pts ? b : a));
    let i0 = manha.indexOf(melhor), i1 = i0;
    while (i0 > 0 && manha[i0 - 1].sc.pts >= Math.max(60, melhor.sc.pts - 10)) i0--;
    while (i1 < manha.length - 1 && manha[i1 + 1].sc.pts >= Math.max(60, melhor.sc.pts - 10)) i1++;
    janelaIdeal = { ini: manha[i0].hora, fim: `${String(Number(manha[i1].hora.slice(0, 2)) + 1).padStart(2, "0")}:00`, pts: melhor.sc.pts };
  }

  // ⏱️ Previsão de chegada (média histórica ajustada pelo vento)
  const fatorVento = pior?.vento?.tipo === "Vento contra" ? 0.82 : pior?.vento?.tipo === "Vento lateral" ? 0.95 : 1.08;
  const veloEstimada = Math.round((veloBase || 1200) * fatorVento);
  // 🏁 horário de soltura configurável: automático (nascer do sol real + minutos) ou manual
  const horaSoltaAuto = solSolta?.nascer ? somarMinutosHHMM(solSolta.nascer, cfgSolta.min) : janelaIdeal?.ini || "07:00";
  const horaSolta = cfgSolta.modo === "manual" && cfgSolta.manual ? cfgSolta.manual : horaSoltaAuto;
  const infoSolta = cfgSolta.modo === "manual"
    ? "horário fixo configurado"
    : solSolta?.nascer ? `☀️ nascer ${solSolta.nascer} + ${cfgSolta.min}min` : "aguardando nascer do sol";
  const minutosVoo = provaSel ? Math.round((provaSel.km * 1000) / veloEstimada) : 0;
  const chegada = (fator: number) => {
    const [H, M] = horaSolta.split(":").map(Number);
    const tot = H * 60 + M + Math.round(minutosVoo * fator);
    return `${String(Math.floor(tot / 60) % 24).padStart(2, "0")}:${String(tot % 60).padStart(2, "0")}`;
  };

  // ⏱️ Linha do tempo do voo — passagem estimada por cidade (vento+chuva+Kp por trecho)
  const passagens = (() => {
    if (!provaSel || !validos.length) return [] as { nome: string; papel: string; km: number; hora: string; horaMin: number; vel: number; vento: { emoji: string; tipo: string; cor: string } | null }[];
    const velo = veloBase || 1200;
    const kpPen = kp && kp.kp >= 5 ? 0.97 : 1;
    const [h0, m0] = horaSolta.split(":").map(Number);
    let minutos = 0, distAnt = 0;
    const base0 = (h0 || 0) * 60 + (m0 || 0);
    return validos.map((v) => {
      const cl = v.d && "clima" in v.d ? v.d.clima : null;
      const distSolta = v.pt.papel === "pombal" ? provaSel.km : provaSel.km - v.pt.km;
      const fator = 1.08 - (v.vento?.pen ?? 0) * 0.013; // a favor 1.08 · lateral 0.95 · contra 0.82
      const chuvaPen = cl ? (cl.chuvaMm > 5 ? 0.9 : cl.chuvaMm > 1 ? 0.95 : 1) : 1;
      const vel = Math.round(velo * fator * chuvaPen * kpPen);
      minutos += (Math.max(0, distSolta - distAnt) * 1000) / vel;
      distAnt = distSolta;
      const tot = base0 + minutos;
      const horaMin = tot;
      return { nome: v.pt.nome, papel: v.pt.papel, km: v.pt.km, hora: `${String(Math.floor(tot / 60) % 24).padStart(2, "0")}:${String(Math.round(tot % 60)).padStart(2, "0")}`, horaMin, vel, vento: v.vento };
    });
  })();

  // 💬 Mensagem pronta para o WhatsApp
  const msgWhatsApp = (() => {
    if (!provaSel) return "";
    const L: string[] = [];
    L.push(`🕊️ *PROVA #${provaSel.num} — ${provaSel.cidade}/${provaSel.estado} (${provaSel.km}km)*`);
    L.push(`📅 Solta: ${provaSel.diaSolta} ${provaSel.dataSolta.split("-").reverse().slice(0, 2).join("/")}`);
    L.push(modo === "prova"
      ? `🌡️ Previsão para o dia da soltura (${provaSel.dataSolta.split("-").reverse().slice(0, 2).join("/")})`
      : `🌡️ Condições de AGORA (${hojeSP().split("-").reverse().slice(0, 2).join("/")}) — NÃO é a previsão do dia da prova`);
    if (media !== null) L.push(`\n🛣️ Rota com ${rota.length} pontos • score médio ${media}% • pior trecho: ${pior?.pt.nome} (${pior?.score?.pts}%)`);
    if (kp) L.push(`🧲 Kp ${kp.kp.toFixed(2)} — ${kp.kp <= 2 ? "calmo" : kp.kp <= 4 ? "instável" : "tempestade"}`);
    if (idp) L.push(`🎯 IDP ${idp.idp.toFixed(1)}/10 — ${idp.label}`);
    if (risco) L.push(`🐦 Risco de extravio: ~${risco.pct}% (${risco.nivel.toLowerCase()})`);
    if (validos.length) {
      L.push("\n💨🌧️ *Vento e chuva por trecho:*");
      const climaDe = (v: typeof validos[number]) => (v.d && "clima" in v.d ? v.d.clima : null);
      const horaDe = (nome: string) => passagens.find((pp) => pp.nome === nome)?.hora;
      validos.forEach((v) => {
        const cl = climaDe(v);
        const c = cl ? `${cl.ventoKmh}km/h ${direcaoCardeal(cl.dirVento)}` : "";
        const chuva = cl ? ` · 🌧️ ${cl.chuvaMm}mm${cl.chuvaPct != null ? ` (${cl.chuvaPct}%)` : ""}${cl.wmo >= 95 ? " ⛈️" : cl.chuvaMm > 1 ? " ☔" : ""}` : "";
        const temp = cl ? ` · ${cl.temp}°C` : "";
        const hp = horaDe(v.pt.nome);
        L.push(`${v.vento!.emoji} ${v.pt.nome}: ${v.vento!.tipo.toLowerCase()}${c ? ` (${c})` : ""}${temp}${chuva}${hp ? ` — passa ~${hp}` : ""}`);
      });
      const comChuva = validos.filter((v) => ((climaDe(v)?.chuvaMm ?? 0) > 0.5 || (climaDe(v)?.chuvaPct ?? 0) >= 50));
      if (comChuva.length) {
        L.push(`\n☔ *Atenção — chuva em:* ${comChuva.map((v) => { const cl = climaDe(v)!; return `${v.pt.nome} (${cl.chuvaMm}mm${cl.chuvaPct != null ? ` · ${cl.chuvaPct}%` : ""})`; }).join(", ")}`);
      } else {
        L.push("☂️ Sem chuva prevista na janela do voo em nenhum ponto da rota");
      }
    }
    if (janelaIdeal) L.push(`\n🕐 *Melhor janela de soltura: ${janelaIdeal.ini}–${janelaIdeal.fim}* (${janelaIdeal.pts}%)`);
    if (solSolta) L.push(`🌅 Nascer do sol na soltura: ${solSolta.nascer} → solta às ${horaSolta} (${infoSolta.replace("☀️ ", "")})`);
    if (minutosVoo) L.push(`⏱️ Chegada prevista: *${chegada(0.92)} – ${chegada(1.08)}*`);
    L.push(`\n_${modo === "prova" ? "Previsão do dia da soltura" : "ATENÇÃO: condições de agora, não do dia da prova"} • Open-Meteo + NOAA • Nutri Pombos_`);
    return L.join("\n");
  })();

  // Versão compacta (sem emojis) para o link wa.me — imune ao limite/quebra de caracteres
  const msgCompacta = (() => {
    if (!provaSel) return "";
    const L: string[] = [];
    const climaDe = (v: typeof validos[number]) => (v.d && "clima" in v.d ? v.d.clima : null);
    L.push(`PROVA #${provaSel.num} — ${provaSel.cidade}/${provaSel.estado} (${provaSel.km}km)`);
    L.push(`Solta: ${provaSel.diaSolta} ${provaSel.dataSolta.split("-").reverse().slice(0, 2).join("/")} — previsão do dia`);
    if (media !== null) L.push(`Rota ${rota.length} pts • média ${media}% • pior: ${pior?.pt.nome} (${pior?.score?.pts}%)`);
    if (kp) L.push(`Kp ${kp.kp.toFixed(2)} (${kp.kp <= 2 ? "calmo" : kp.kp <= 4 ? "instável" : "tempestade"})`);
    if (idp) L.push(`IDP ${idp.idp.toFixed(1)}/10 (${idp.label})`);
    if (risco) L.push(`Risco de extravio ~${risco.pct}%`);
    if (validos.length) {
      L.push("Vento e chuva por trecho:");
      validos.forEach((v) => {
        const cl = climaDe(v);
        const vento = v.vento!.tipo.replace("Vento ", "").toLowerCase();
        L.push(`${v.pt.nome}: ${vento}${cl ? ` ${cl.ventoKmh}km/h • ${cl.chuvaMm}mm${cl.chuvaPct != null ? ` ${cl.chuvaPct}%` : ""}` : ""}`);
      });
      const comChuva = validos.filter((v) => ((climaDe(v)?.chuvaMm ?? 0) > 0.5 || (climaDe(v)?.chuvaPct ?? 0) >= 50));
      if (comChuva.length) L.push(`ATENÇÃO chuva: ${comChuva.map((v) => v.pt.nome).join(", ")}`);
    }
    if (passagens.length > 1) {
      const meio = passagens[Math.floor(passagens.length / 2)];
      L.push(`Passagens: ${passagens[1].nome} ~${passagens[1].hora} • ${meio.nome} ~${meio.hora} • pombal ~${passagens[passagens.length - 1].hora}`);
    }
    if (solSolta) L.push(`Nascer ${solSolta.nascer} • solta ${horaSolta}`);
    if (minutosVoo) L.push(`Chegada prevista: ${chegada(0.92)}–${chegada(1.08)}`);
    L.push("Nutri Pombos • Open-Meteo + NOAA");
    return L.join("\n");
  })();

  // 🔔 ALARME DE CHEGADA — toca 15 min antes da chegada prevista (página aberta)
  const ativarAlarme = async () => {
    if (alarmeAtivo) { setAlarmeAtivo(false); setAlarmeMsg(""); return; }
    const hora = somarMinutosHHMM(chegada(0.92), -15);
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch { /* segue sem notificação */ }
    }
    alarmeDisparadoRef.current = false;
    setAlarmeHora(hora);
    setAlarmeAtivo(true);
  };

  useEffect(() => {
    if (!alarmeAtivo || !alarmeHora) return;
    const checar = () => {
      if (alarmeDisparadoRef.current) return;
      const agora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
      if (agora >= alarmeHora) {
        alarmeDisparadoRef.current = true;
        try { navigator.vibrate?.([300, 150, 300]); } catch { /* sem vibração */ }
        try {
          const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new Ctx();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = 880; g.gain.value = 0.25;
          o.start();
          window.setTimeout(() => { try { o.stop(); ctx.close(); } catch { /* ignora */ } }, 500);
        } catch { /* sem som */ }
        const corpo = `Chegada prevista ${chegada(0.92)}–${chegada(1.08)} — fica de olho no céu!`;
        (async () => {
          try {
            const reg = await navigator.serviceWorker?.getRegistration();
            if (reg) reg.showNotification("👀 Chegada próxima!", { body: corpo, icon: "/icon.svg", tag: "nutripombos-chegada" });
            else if (typeof Notification !== "undefined") new Notification("👀 Chegada próxima!", { body: corpo, icon: "/icon.svg" });
          } catch { /* ignora */ }
        })();
        setAlarmeMsg(`👀 HORA DE OLHAR O CÉU! Chegada prevista ${chegada(0.92)}–${chegada(1.08)}`);
      }
    };
    checar();
    const t = window.setInterval(checar, 15000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alarmeAtivo, alarmeHora]);

  // 📅 SÁBADO × DOMINGO — mesma rota nos dois dias, qual é melhor?
  const compararDias = async () => {
    if (!provaSel || !rota.length) return;
    setCompCarregando(true);
    setCompDias(null);
    const d2 = new Date(`${provaSel.dataSolta}T12:00:00`);
    d2.setDate(d2.getDate() + 1);
    const dia2 = d2.toISOString().slice(0, 10);
    const alvo: [string, string][] = [[provaSel.dataSolta, provaSel.diaSolta || nomeDiaSemana(provaSel.dataSolta)], [dia2, nomeDiaSemana(dia2)]];
    const saida: CompDia[] = [];
    for (const [data, label] of alvo) {
      const climas = await buscarClimaPontos(rota.map((pt) => ({ lat: pt.lat, lon: pt.lon })), data).catch(() => undefined);
      const pontos = rota.map((pt, i) => {
        const clima = climas?.[i];
        if (!clima) return null;
        const origem = pt.papel === "pombal" && i > 0 ? rota[i - 1] : pt;
        const b = bearingRota(origem.lat, origem.lon, base.lat, base.lon);
        const v = ventoNaRota(clima.dirVento, b, clima.ventoKmh);
        const sc = scorePonto(clima, v.pen, null);
        return { nome: pt.nome, pts: sc.pts, chuva: clima.chuvaMm, solta: i === 0 };
      });
      const ok2 = pontos.filter((x): x is NonNullable<typeof x> => x !== null);
      if (!ok2.length) { saida.push({ data, label, media: 0, chuvaTotal: 0, pior: null, scoreSolta: null }); continue; }
      saida.push({
        data, label,
        media: Math.round(ok2.reduce((soma, x) => soma + x.pts, 0) / ok2.length),
        chuvaTotal: +ok2.reduce((soma, x) => soma + x.chuva, 0).toFixed(1),
        pior: ok2.reduce((p, x) => (x.pts < p.pts ? x : p)),
        scoreSolta: ok2.find((x) => x.solta)?.pts ?? null,
      });
    }
    if (saida[0].media !== saida[1].media) (saida[0].media > saida[1].media ? saida[0] : saida[1]).vencedor = true;
    else (saida[0].chuvaTotal <= saida[1].chuvaTotal ? saida[0] : saida[1]).vencedor = true;
    setCompDias(saida);
    setCompCarregando(false);
  };

  // relógio da bússola da chegada (contagem atualiza a cada 30s) + nowcast de chuva
  useEffect(() => {
    const t = window.setInterval(() => setTick((v) => v + 1), 30000);
    return () => window.clearInterval(t);
  }, []);
  void tick;
  useEffect(() => {
    buscarNowcastChuva(pombal.lat, pombal.lon).then(setNowcast).catch(() => setNowcast(null));
    const t = window.setInterval(() => { buscarNowcastChuva(pombal.lat, pombal.lon).then(setNowcast).catch(() => {}); }, 600000);
    return () => window.clearInterval(t);
  }, [pombal.lat, pombal.lon]);

  // 🧭 Bússola da Chegada: horizonte certo + vento na reta final
  const dadoPombal = rota.length ? dados[rota[rota.length - 1].chave] : undefined;
  const climaPombal = dadoPombal && "clima" in dadoPombal ? dadoPombal.clima : null;
  const rumoSoltura = rota.length > 1 && provaSel ? bearingRota(pombal.lat, pombal.lon, rota[0].lat, rota[0].lon) : null;
  const ventoFinal = climaPombal && rumoSoltura != null ? ventoNaRota(climaPombal.dirVento, (rumoSoltura + 180) % 360, climaPombal.ventoKmh) : null;

  // 🌡️ protocolo de recepção (clima na hora da chegada)
  const recepcao = climaPombal ? protocoloRecepcao(climaPombal.temp, climaPombal.chuvaMm, ventoFinal?.tipo ?? null) : [];
  const contagem = (() => {
    const [H, M] = chegada(0.92).split(":").map(Number);
    const agora2 = new Date();
    const diff = H * 60 + M - (agora2.getHours() * 60 + agora2.getMinutes());
    if (diff > 0) return `faltam ${Math.floor(diff / 60)}h ${diff % 60}min`;
    if (diff > -180) return "é agora — hora da chegada! 👀";
    return "janela prevista já passou — fique atento";
  })();
  // 🔢 MATRIZ CIDADE × HORA — a onda do clima pela rota
  const carregarMatriz = async () => {
    if (!provaSel || !rota.length) return;
    setMatrizCarregando(true); setMatriz(null);
    const dia = modo === "prova" ? provaSel.dataSolta : hojeSP();
    const horas = Array.from({ length: 12 }, (_, i) => `${String(7 + i).padStart(2, "0")}:00`); // 07h–18h
    const janelas = await buscarJanelaSoltaPontos(rota.map((pt) => ({ lat: pt.lat, lon: pt.lon })), dia).catch(() => undefined);
    const fracos = rota.map((pt, idx) => {
      const hs = janelas?.[idx];
      if (!hs?.length) return [pt.chave, horas.map(() => null)] as const;
      const ref = idx > 0 && idx === rota.length - 1 ? rota[idx - 1] : pt;
      const b = bearingRota(ref.lat, ref.lon, base.lat, base.lon);
      const vals = horas.map((hAlvo) => {
        const h = hs.find((x) => x.hora === hAlvo);
        if (!h) return null;
        const v = ventoNaRota(h.dir, b, h.vento);
        return scorePonto({ temp: h.temp, chuvaMm: h.chuva, ventoKmh: h.vento, rajadaKmh: h.rajada, dirVento: h.dir, umidade: h.umidade, pressaoMsl: 1013, nuvens: 0, visibilidadeKm: 24, wmo: h.wmo, horaRef: h.hora }, v.pen, null).pts;
      });
      return [pt.chave, vals] as const;
    });
    setMatriz({ horas, celulas: Object.fromEntries(fracos) });
    setMatrizCarregando(false);
  };

  // 📆 baixar calendário .ics (provas + embarques no celular)
  const baixarIcs = () => {
    const ics = gerarIcsProvas(provas);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "nutri-pombos-provas.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // 📖 Crônica — arquiva o panorama desta prova (previsão vs realizado depois)
  const arquivarCronica = () => {
    if (!provaSel) return;
    const KEY_CRON = "nutripombos-cronicas-v1";
    let lista: unknown[] = [];
    try { lista = JSON.parse(localStorage.getItem(KEY_CRON) || "[]"); } catch { lista = []; }
    const registro = {
      provaId: provaSel.id, num: provaSel.num, cidade: provaSel.cidade, estado: provaSel.estado, km: provaSel.km,
      dataSolta: provaSel.dataSolta, geradoEm: new Date().toISOString(), modo,
      scoreMedio: media, piorTrecho: pior ? { nome: pior.pt.nome, pts: pior.score?.pts ?? null } : null,
      idp: idp ? { valor: idp.idp, label: idp.label } : null,
      kp: kp?.kp ?? null, chegadaPrevista: minutosVoo ? `${chegada(0.92)}–${chegada(1.08)}` : null,
      veloEstimada, passagens: passagens.map((pp) => `${pp.nome} ~${pp.hora}`),
      resumo: msgCompacta,
    };
    const filtrada = (lista as typeof registro[]).filter((r) => r && r.provaId !== registro.provaId);
    filtrada.unshift(registro);
    try {
      localStorage.setItem(KEY_CRON, JSON.stringify(filtrada.slice(0, 60)));
      setCronicaSalva(true); setCronicaMsg("✅ Crônica arquivada! Veja em 📖 Crônicas da Temporada (menu)");
      window.setTimeout(() => { setCronicaSalva(false); setCronicaMsg(""); }, 3500);
    } catch { setCronicaMsg("⚠️ Sem espaço para salvar a crônica."); }
  };

  // 🖨️ Relatório da prova — versão completa pra imprimir / salvar PDF
  const gerarRelatorio = () => {
    if (!provaSel) return;
    const climaDe = (v: typeof validos[number]) => (v.d && "clima" in v.d ? v.d.clima : null);
    const pressoes = validos.map((v) => climaDe(v)?.pressaoMsl ?? 0).filter((x) => x > 0);
    const pressaoMedia = pressoes.length ? Math.round(pressoes.reduce((a, b) => a + b, 0) / pressoes.length) : null;
    const altMax = altimetria && altimetria.length ? Math.round(Math.max(...altimetria)) : null;
    const linhasTabela = pontosComScore.map(({ pt, d, vento, score }) => {
      const cl = d && "clima" in d ? d.clima : null;
      const arPt = ar[pt.chave];
      return `<tr>
        <td><b>${pt.papel === "pombal" ? "🏠 " : pt.papel === "solta" ? "🏁 " : ""}${pt.nome}</b></td>
        <td>${pt.papel === "pombal" ? "—" : pt.km + "km"}</td>
        <td>${cl ? cl.temp + "°C" : "—"}</td>
        <td>${cl ? cl.chuvaMm + "mm" + (cl.chuvaPct != null ? " (" + cl.chuvaPct + "%)" : "") : "—"}</td>
        <td>${cl ? cl.ventoKmh + "km/h " + direcaoCardeal(cl.dirVento) : "—"}</td>
        <td>${cl ? cl.rajadaKmh + "km/h" : "—"}</td>
        <td>${cl && cl.pressaoMsl > 0 ? cl.pressaoMsl + " hPa" : "—"}</td>
        <td>${cl ? cl.umidade + "%" : "—"}</td>
        <td>${cl ? cl.visibilidadeKm + "km" : "—"}</td>
        <td>${arPt ? arPt.pm25 + "µg" : "—"}</td>
        <td>${vento ? vento.tipo.replace("Vento ", "") : "—"}</td>
        <td style="color:${score ? score.cor : "#000"}"><b>${score ? score.pts + "%" : "—"}</b></td>
        ${passagens.length ? `<td>${passagens.find((pp) => pp.nome === pt.nome)?.hora ?? "—"}</td>` : ""}
      </tr>`;
    }).join("");
    const colPass = passagens.length ? "<th>Passa ~</th>" : "";
    const linhasTempo = passagens.length ? `<h2>⏱️ Linha do tempo do voo (soltura ${horaSolta})</h2><table><tr><th>Hora</th><th>Cidade</th><th>Observação</th></tr>${passagens.map((pp) => `<tr><td><b>${pp.hora}</b></td><td>${pp.nome}</td><td>${pp.papel === "solta" ? "abertura dos cestos" : pp.papel === "pombal" ? "chegada no pombal (±8%)" : "passagem • " + (pp.vento?.tipo?.toLowerCase() ?? "") + " • ~" + pp.vel + " m/min"}</td></tr>`).join("")}</table>` : "";
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório Prova #${provaSel.num}</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:24px;max-width:900px}
      h1{font-size:20px;margin:0 0 4px}h2{font-size:14px;margin:18px 0 6px;color:#444}
      .sub{color:#555;font-size:12px;margin-bottom:12px}
      .box{border:1px solid #ccc;border-radius:8px;padding:10px 14px;margin-bottom:8px;font-size:13px}
      .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}
      .mini{border:1px solid #ddd;border-radius:8px;padding:8px;text-align:center;font-size:12px}
      .mini b{display:block;font-size:16px}
      table{width:100%;border-collapse:collapse;font-size:10.5px}th,td{border:1px solid #ddd;padding:5px 6px;text-align:left}th{background:#f5f5f5}
      .destaque{background:#fff8e1;border-color:#e6c200}</style></head><body>
      <h1>🕊️ Prova #${provaSel.num} — ${provaSel.cidade}/${provaSel.estado} (${provaSel.km}km)</h1>
      <div class="sub">Solta: ${provaSel.diaSolta} ${provaSel.dataSolta.split("-").reverse().slice(0, 2).join("/")} • Gerado em ${new Date().toLocaleString("pt-BR")} • Nutri Pombos</div>

      <div class="grid">
        ${idp ? `<div class="mini" style="border-color:${idp.cor}">🎯 IDP<b style="color:${idp.cor}">${idp.idp.toFixed(1)}/10</b>${idp.label}</div>` : ""}
        ${kp ? `<div class="mini">🧲 Kp<b>${kp.kp.toFixed(2)}</b>${kp.kp <= 2 ? "calmo" : kp.kp <= 4 ? "instável" : "tempestade"}${kp.horaUTC ? " • " + kp.horaUTC : ""}</div>` : ""}
        ${pressaoMedia ? `<div class="mini">🧭 Pressão média<b>${pressaoMedia} hPa</b>ao longo da rota</div>` : ""}
        ${altMax != null ? `<div class="mini">⛰️ Ponto mais alto<b>${altMax} m</b>no perfil da rota</div>` : ""}
      </div>

      <div class="box destaque"><b>Resumo:</b> ${media !== null ? `score médio ${media}% • pior trecho: ${pior?.pt.nome} (${pior?.score?.pts}%)` : "—"}${lua ? ` • Lua ${lua.fase} ${lua.iluminacao}%` : ""}${solSolta ? ` • Nascer ${solSolta.nascer} → solta ${horaSolta} (${infoSolta.replace("☀️ ", "")})` : ""}${minutosVoo ? ` • Chegada prevista ${chegada(0.92)}–${chegada(1.08)} (~${veloEstimada} m/min)` : ""}${janelaIdeal ? ` • 🕐 Melhor janela: ${janelaIdeal.ini}–${janelaIdeal.fim} (${janelaIdeal.pts}%)` : ""}</div>
      <div class="box">📊 <b>Confiança da previsão:</b> ${conf.emoji} ${conf.label} — ${conf.nota} • Referência das cidades: ${modo === "prova" ? "janela do voo 06h–20h do dia da soltura" : "condições atuais"}</div>

      <h2>Vento e chuva por cidade</h2>
      <table><tr><th>Cidade</th><th>Dist.</th><th>Temp.</th><th>Chuva</th><th>Vento</th><th>Rajada</th><th>Pressão</th><th>Umid.</th><th>Visib.</th><th>PM2.5</th><th>Na rota</th><th>Score</th>${colPass}</tr>${linhasTabela}</table>

      ${linhasTempo}

      <div class="sub" style="margin-top:14px">Fontes: Open-Meteo (clima, pressão, sol, altimetria, ar) • NOAA SWPC (Kp) • RainViewer (chuva) — gratuitos. Previsões sujeitas a alteração; confira na véspera.</div>
      <script>window.onload=()=>{window.print()}</script></body></html>`;
    const win = window.open("", "_blank");
    if (!win) { alert("Permita pop-ups para gerar o relatório (ou toque novamente)."); return; }
    win.document.write(html);
    win.document.close();
  };

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🛣️ Rota Completa da Prova — Instrumentos por Cidade <small style={{ fontSize: 10, color: T.dim, fontWeight: 600 }}>· v3.3</small></h1>
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
            {([["prova", `🏁 Dia da soltura${provaSel ? ` (${provaSel.dataSolta.slice(8, 10)}/${provaSel.dataSolta.slice(5, 7)})` : ""}`], ["agora", "📡 Agora"]] as const).map(([k, lbl]) => (
              <button key={k} onClick={() => setModo(k)} disabled={k === "prova" && !previsivel}
                style={{ padding: "8px 12px", borderRadius: 9, fontSize: 11, fontWeight: 800, cursor: "pointer", color: modo === k ? T.bg : T.dim, background: modo === k ? T.gold : T.bgInput, border: `1px solid ${modo === k ? T.gold : T.border}`, opacity: k === "prova" && !previsivel ? 0.45 : 1 }}>
                {lbl}
              </button>
            ))}
            <button onClick={() => provaSel && consultar(rota, modo, provaSel.dataSolta, true)} disabled={carregando} style={{ ...T.btnSm, opacity: carregando ? 0.6 : 1 }}>{carregando ? "⏳" : "↻ Atualizar"}</button>
          </div>
          {modo === "prova" && (
            <div style={{ marginTop: 8, padding: "7px 11px", borderRadius: 8, fontSize: 11, color: conf.cor, background: `${conf.cor}12`, border: `1px solid ${conf.cor}44`, lineHeight: 1.4 }}>
              {conf.emoji} Confiança da previsão: <b>{conf.label}</b> — {conf.nota}
            </div>
          )}
          {modo === "agora" && previsivel && provaSel && (
            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 9, color: T.orange, background: "#f9731612", border: "1px solid #f9731655", fontSize: 12, lineHeight: 1.5 }}>
              ⚠️ Você está vendo as condições de <b>AGORA ({hojeSP().split("-").reverse().slice(0, 2).join("/")})</b> — e não do dia da prova! A previsão de <b>{provaSel.dataSolta.split("-").reverse().slice(0, 2).join("/")}</b> já está disponível: toque em <b>🏁 Dia da soltura</b>.
            </div>
          )}
          {modo === "prova" && !previsivel && provaSel && (
            <div style={{ ...T.small, marginTop: 8, fontSize: 11, color: T.orange }}>
              ⚠️ A previsão do dia da soltura só fica disponível até {LIMITE_PREVISAO_DIAS} dias antes da prova {diasAte < 0 ? "(esta prova já foi realizada)" : `(faltam ${diasAte} dias)`}.
            </div>
          )}
        </section>

        {/* 📱 Barra de abas — grande e impossível de não ver */}
        <div style={{ position: "sticky", top: 0, zIndex: 20, background: T.bg, padding: "10px 0 8px", borderBottom: `2px solid ${T.gold}44`, marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5 }}>
            {([["resumo", "📊", "Resumo"], ["tempos", "🕐", "Tempos"], ["cidades", "🏙️", "Cidades"], ["mapas", "🗺️", "Mapas"], ["tudo", "📋", "TUDO"]] as const).map(([k, emoji, lbl]) => (
              <button key={k} type="button" onClick={() => setAba(k)} style={{ padding: "11px 2px 9px", borderRadius: 11, cursor: "pointer", color: aba === k ? T.bg : T.white, background: aba === k ? (k === "tudo" ? T.green : T.gold) : T.bgCard, border: `2px solid ${aba === k ? (k === "tudo" ? T.green : T.gold) : T.border}`, textAlign: "center", lineHeight: 1.25 }}>
                <div style={{ fontSize: 19 }}>{emoji}</div>
                <div style={{ fontSize: 10.5, fontWeight: 800 }}>{lbl}</div>
              </button>
            ))}
          </div>
          {aba !== "tudo" ? <div style={{ ...T.small, fontSize: 10, textAlign: "center", marginTop: 7 }}>👆 você está vendo só esta parte — toque em <b style={{ color: T.green }}>📋 TUDO</b> pra ver a página inteira</div> : <div style={{ ...T.small, fontSize: 10, textAlign: "center", marginTop: 7 }}>✅ vendo a página inteira — use as abas pra focar em uma parte</div>}
        </div>

{(aba==="resumo" || aba==="tudo") && (<>         {/* Resumo geral */}
        {provaSel && (
          <section style={{ ...T.card, borderColor: `${T.gold}55`, background: `${T.gold}0d` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.gold, textTransform: "uppercase" }}>Percurso de {rota.length} pontos</div>
                <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>
                  {rota[0]?.nome} 🠊 {pombal.nome === POMBAL_BASE ? "Pombal" : pombal.nome} ({provaSel.km}km)
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
              {lua && (
                <div style={{ padding: 10, borderRadius: 9, background: "#ffffff08", textAlign: "center" }}>
                  <div style={{ fontSize: 16 }}>{lua.emoji}</div>
                  <div style={{ ...T.small, fontSize: 10 }}>LUA {modo === "prova" ? "NA PROVA" : "HOJE"}</div>
                  <b style={{ color: T.gold, fontSize: 12 }}>{lua.iluminacao}%</b>
                  <div style={{ ...T.small, fontSize: 9 }}>{lua.fase}</div>
                </div>
              )}
              {idp && (
                <div style={{ padding: 10, borderRadius: 9, background: `${idp.cor}12`, border: `1px solid ${idp.cor}55`, textAlign: "center" }}>
                  <div style={{ fontSize: 16 }}>🎯</div>
                  <div style={{ ...T.small, fontSize: 10 }}>DIFICULDADE (IDP)</div>
                  <b style={{ color: idp.cor, fontSize: 14 }}>{idp.idp.toFixed(1)}/10</b>
                  <div style={{ ...T.small, fontSize: 9, color: idp.cor }}>{idp.label}</div>
                </div>
              )}
              {risco && (
                <div style={{ padding: 10, borderRadius: 9, background: `${risco.cor}12`, border: `1px solid ${risco.cor}55`, textAlign: "center" }}>
                  <div style={{ fontSize: 16 }}>🐦</div>
                  <div style={{ ...T.small, fontSize: 10 }}>RISCO DE EXTRAVIO</div>
                  <b style={{ color: risco.cor, fontSize: 14 }}>~{risco.pct}%</b>
                  <div style={{ ...T.small, fontSize: 9, color: risco.cor }}>{risco.nivel}</div>
                </div>
              )}
              <button type="button" onClick={baixarIcs} style={{ padding: 10, borderRadius: 9, background: "#ffffff08", border: `1px solid ${T.border}`, textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 16 }}>📆</div>
                <div style={{ ...T.small, fontSize: 10 }}>PROVAS NO CELULAR</div>
                <b style={{ color: T.blue, fontSize: 10 }}>baixar .ics</b>
              </button>
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

 </>)}
        {(aba==="resumo" || aba==="tudo") && (<>         {/* 📅 Sábado × Domingo — qual dia soltar? */}
        {provaSel && modo === "prova" && previsivel && (
          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
              📅 {provaSel.diaSolta} × Dia Seguinte — qual dia soltar?
            </div>
            <div style={{ ...T.small, fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
              Roda a mesma análise da rota nos <b>dois dias</b> do fim de semana e aponta o melhor — útil quando o clube dá opção de soltar em outro dia.
            </div>
            <button type="button" onClick={compararDias} disabled={compCarregando} style={{ ...T.btn, opacity: compCarregando ? 0.6 : 1 }}>
              {compCarregando ? "⏳ Analisando os dois dias..." : "⚖️ Comparar os dois dias"}
            </button>
            {compDias && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                {compDias.map((d) => (
                  <div key={d.data} style={{ padding: 12, borderRadius: 10, background: d.vencedor ? `${T.green}12` : "#ffffff08", border: `2px solid ${d.vencedor ? T.green : T.border}` }}>
                    {d.vencedor && <div style={{ fontSize: 11, fontWeight: 900, color: T.green, marginBottom: 4 }}>🏆 MELHOR DIA</div>}
                    <b style={{ fontSize: 13 }}>{d.label} ({d.data.split("-").reverse().slice(0, 2).join("/")})</b>
                    <div style={{ ...T.small, marginTop: 6 }}>Média da rota: <b style={{ color: d.media >= 75 ? T.green : d.media >= 55 ? "#fbbf24" : T.red }}>{d.media}%</b></div>
                    <div style={T.small}>🌧️ Chuva acumulada: {d.chuvaTotal}mm</div>
                    <div style={T.small}>⚠️ Pior trecho: {d.pior ? `${d.pior.nome} (${d.pior.pts}%)` : "—"}</div>
                    {d.scoreSolta != null && <div style={T.small}>🏁 Score na soltura: {d.scoreSolta}%</div>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

 </>)}
        {(aba==="mapas" || aba==="tudo") && (<>         {/* ⛰️ Perfil do relevo da rota (Open-Meteo Elevation — gratuito) */}
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

 </>)}
        {(aba==="mapas" || aba==="tudo") && (<>         {/* 🛰️ Radar de chuva + 🗺️ Satélite GRÁTIS (Esri World Imagery, sem chave) */}
        {provaSel && rota.length > 0 && (
          <section style={T.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>🛰️ Radar de Chuva & Satélite da Rota</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={() => setModoMapa("radar")} style={{ ...T.btnGhost, color: modoMapa === "radar" ? T.bg : T.white, background: modoMapa === "radar" ? T.gold : "#1b283c" }}>🌧️ Radar</button>
                <button onClick={() => setModoMapa("satelite")} style={{ ...T.btnGhost, color: modoMapa === "satelite" ? T.bg : T.white, background: modoMapa === "satelite" ? T.gold : "#1b283c" }}>🗺️ Satélite</button>
                {gKey && <button onClick={() => setModoMapa("google")} style={{ ...T.btnGhost, color: modoMapa === "google" ? T.bg : T.white, background: modoMapa === "google" ? T.gold : "#1b283c" }}>🧭 Rota Google</button>}
                {radar && modoMapa !== "google" && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <button onClick={() => setRadarIdx((i) => (i - 1 + radar.frames.length) % radar.frames.length)} style={T.btnGhost}>‹</button>
                    <button onClick={() => setRadarPlay((p) => !p)} style={T.btnSm}>{radarPlay ? "⏸" : "▶"}</button>
                    <button onClick={() => setRadarIdx((i) => (i + 1) % radar.frames.length)} style={T.btnGhost}>›</button>
                  </div>
                )}
              </div>
            </div>

            {modoMapa === "google" && gKey && rota.length > 1 && (
              <div>
                <iframe title="Rota Google" src={`https://www.google.com/maps/embed/v1/directions?key=${encodeURIComponent(gKey)}&origin=${rota[0].lat},${rota[0].lon}&destination=${pombal.lat},${pombal.lon}&language=pt-BR&region=br`} style={{ width: "100%", height: 380, border: 0, borderRadius: 12 }} loading="lazy" allowFullScreen />
                <div style={{ ...T.small, fontSize: 11, marginTop: 6, textAlign: "center" }}>🧭 Rota por estrada (Google) — referência • o voo do pombo é linha reta até o pombal</div>
              </div>
            )}

            {modoMapa !== "google" && (radar || modoMapa === "satelite") && (() => {
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
              const frame = radar?.frames[radarIdx];
              const hora = frame ? new Date(frame.time * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
              const tiles: { gx: number; gy: number }[] = [];
              for (let gx = 0; gx < cols; gx++) for (let gy = 0; gy < rows; gy++) tiles.push({ gx, gy });
              const baseTile = modoMapa === "satelite"
                ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile`
                : `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile`;
              return (
                <div>
                  <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${T.border}` }}>
                    <div style={{ position: "relative", width: cols * 256, height: rows * 256, background: modoMapa === "satelite" ? "#000" : "#0b1426" }}>
                      {tiles.map(({ gx, gy }) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={`b${gx}-${gy}`} src={`${baseTile}/${Z}/${y0 + gy}/${x0 + gx}`} alt="" width={256} height={256} style={{ position: "absolute", left: gx * 256, top: gy * 256 }} />
                      ))}
                      {frame && tiles.map(({ gx, gy }) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={`r${gx}-${gy}-${frame.path}`} src={urlTileRadar(radar.host, frame.path, Z, x0 + gx, y0 + gy)} alt="" width={256} height={256} style={{ position: "absolute", left: gx * 256, top: gy * 256, opacity: modoMapa === "satelite" ? 0.6 : 0.7 }} />
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
                    <small style={{ color: frame?.previsto ? T.blue : T.gold, fontWeight: 800 }}>
                      {frame ? `${frame.previsto ? "🔮 Previsão" : "🛰️ Observado"} · ${hora} · quadro ${radarIdx + 1}/${radar.frames.length}` : "🛰️ Chuva carregando..."}
                    </small>
                    <small style={{ color: T.dim }}>
                      {modoMapa === "satelite" ? "🗺️ Satélite © Esri · chuva: RainViewer" : "verde=fraca · amarelo=moderada · vermelho=forte · Mapa © Esri/OSM · Chuva: RainViewer"}
                    </small>
                  </div>
                </div>
              );
            })()}

            {modoMapa === "radar" && !radar && <div style={{ ...T.small, textAlign: "center", padding: 16 }}>⏳ Carregando radar de chuva...</div>}
          </section>
        )}

 </>)}
        {(aba==="tempos" || aba==="tudo") && (<>         {/* 🕐 Janela ideal de soltura — hora a hora (Open-Meteo, gratuito) */}
        {provaSel && (
          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
              🕐 Janela Ideal de Soltura — hora a hora em {rota[0]?.nome} ({modo === "prova" ? "dia da prova" : "hoje"})
            </div>
            {!janela && !janelaErro && <div style={{ ...T.small }}>⏳ Calculando a melhor janela...</div>}
            {janelaErro && <div style={{ ...T.small, color: T.orange }}>⚠️ Janela {janelaErro}.</div>}
            {janelaIdeal && (
              <div style={{ padding: 12, borderRadius: 10, color: T.green, background: `${T.green}12`, border: `1px solid ${T.green}55`, marginBottom: 12, fontSize: 13 }}>
                🟢 <b>Melhor janela: {janelaIdeal.ini} – {janelaIdeal.fim}</b> ({janelaIdeal.pts}% de score) — soltura neste intervalo pega as melhores condições de vento e clima.
              </div>
            )}
            {janela && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))", gap: 6 }}>
                {horasScored.map((h) => {
                  const naJanela = janelaIdeal ? h.hora >= janelaIdeal.ini && h.hora < janelaIdeal.fim : false;
                  const eHoraSolta = h.hora.slice(0, 2) === horaSolta.slice(0, 2);
                  return (
                    <div key={h.hora} style={{ padding: 8, borderRadius: 8, background: naJanela ? `${h.sc.cor}18` : "#ffffff08", border: `1px solid ${naJanela ? `${h.sc.cor}66` : T.border}`, textAlign: "center", outline: eHoraSolta ? `2px solid ${T.gold}` : "none" }}>
                      <b style={{ fontSize: 12, color: naJanela ? h.sc.cor : T.white }}>{h.hora}{eHoraSolta ? " 🏁" : ""}</b>
                      <div style={{ fontSize: 15 }}>{wmoInfo(h.wmo).emoji}</div>
                      <div style={{ ...T.small, fontSize: 9 }}>{h.temp}° · 🌧️ {h.chuva}mm</div>
                      <div style={{ ...T.small, fontSize: 9 }}>{h.ventoR.emoji} {h.vento}km/h</div>
                      <b style={{ fontSize: 11, color: h.sc.cor }}>{h.sc.pts}%</b>
                    </div>
                  );
                })}
              </div>
            )}
            {janela && <div style={{ ...T.small, fontSize: 11, marginTop: 8 }}>Cada hora recebe um score (vento na rota + chuva + rajadas + temperatura). 🏁 = hora da sua soltura ({horaSolta} — {infoSolta}). Fonte: Open-Meteo (gratuito, sem chave).</div>}
          </section>
        )}

 </>)}
        {(aba==="tempos" || aba==="tudo") && (<>         {/* ⏱️ Previsão de chegada + 💬 WhatsApp */}
        {provaSel && (
          <section style={{ ...T.card, borderColor: `${T.blue}55`, background: `${T.blue}0d` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>⏱️ Previsão de Chegada no Pombal</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
              {([
                ["🚀 Solta às", horaSolta],
                ["⚡ Velocidade est.", `${veloEstimada} m/min`],
                ["⏳ Tempo de voo", minutosVoo ? `${Math.floor(minutosVoo / 60)}h ${minutosVoo % 60}min` : "—"],
                ["🏁 Chegada entre", minutosVoo ? `${chegada(0.92)} – ${chegada(1.08)}` : "—"],
              ] as const).map(([l, v]) => (
                <div key={l} style={{ padding: 10, borderRadius: 9, background: "#ffffff08", textAlign: "center" }}>
                  <div style={{ ...T.small, fontSize: 10 }}>{l}</div>
                  <b style={{ color: T.gold, fontSize: 14 }}>{v}</b>
                </div>
              ))}
            </div>
            <div style={{ ...T.small, fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>
              ⚙️ Soltura: <b>{infoSolta}</b> — ajustável em <b>Configuração → 🏁 Horário da Soltura</b>.<br />
              {veloBase
                ? `Base: sua média histórica de ${veloBase} m/min, ajustada pelo vento da rota (${pior?.vento?.tipo?.toLowerCase() || "—"} no pior trecho).`
                : "Base: 1200 m/min (estimativa padrão) — registre seus resultados no Histórico para a previsão usar a média do SEU plantel."}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(msgWhatsApp);
                  } catch {
                    const ta = document.createElement("textarea");
                    ta.value = msgWhatsApp;
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand("copy"); } catch { /* ignora */ }
                    document.body.removeChild(ta);
                  }
                  setCopiado(true);
                  window.setTimeout(() => setCopiado(false), 2500);
                }}
                style={{ ...T.btn, flex: 1, minWidth: 180 }}
              >
                {copiado ? "✅ Mensagem copiada!" : "📋 Copiar mensagem completa"}
              </button>
              <a href={`https://wa.me/?text=${encodeURIComponent(msgCompacta)}`} target="_blank" rel="noreferrer" style={{ ...T.btn, flex: 1, minWidth: 180, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", background: "#25D366", borderColor: "#25D366" }}>
                💬 Enviar resumo no WhatsApp
              </a>
              <button type="button" onClick={gerarRelatorio} style={{ ...T.btnGhost, flex: 1, minWidth: 180, fontWeight: 800 }}>
                🖨️ Relatório (imprimir / PDF)
              </button>
              <button type="button" onClick={arquivarCronica} style={{ ...T.btnGhost, flex: 1, minWidth: 180, fontWeight: 800, color: cronicaSalva ? T.green : T.white }}>
                {cronicaSalva ? "✅ Arquivada!" : "📖 Arquivar crônica"}
              </button>
            </div>
            <div style={{ ...T.small, fontSize: 11, marginTop: 8, textAlign: "center", lineHeight: 1.5 }}>
              💡 <b>Copiar</b> cola a versão completa com emojis (recomendado — funciona em qualquer grupo).<br />O botão verde abre o WhatsApp com a versão resumida (links têm limite de tamanho e quebram emojis).
            </div>
            {cronicaMsg && <div style={{ ...T.small, fontSize: 12, marginTop: 8, textAlign: "center", color: cronicaMsg.startsWith("✅") ? T.green : T.orange }}>{cronicaMsg}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={ativarAlarme} style={{ ...T.btnGhost, color: alarmeAtivo ? T.red : T.gold, fontWeight: 800 }}>
                {alarmeAtivo ? "🔕 Desativar alarme" : "🔔 Alarme de chegada"}
              </button>
              {alarmeAtivo && alarmeHora && <small style={{ color: T.gold, fontWeight: 700 }}>⏰ Vai tocar às {alarmeHora} (15 min antes da prevista)</small>}
            </div>
            {alarmeAtivo && <div style={{ ...T.small, fontSize: 10, marginTop: 6, textAlign: "center" }}>Mantenha esta página aberta — o alarme toca com aviso no celular, som e vibração 🔔</div>}
            {alarmeMsg && <div style={{ marginTop: 10, padding: 12, borderRadius: 10, color: T.green, background: `${T.green}12`, border: `1px solid ${T.green}55`, fontWeight: 800, textAlign: "center" }}>{alarmeMsg}</div>}
          </section>
        )}

 </>)}
        {(aba==="tempos" || aba==="tudo") && (<>         {/* 🔢 Matriz Cidade × Hora — a onda do clima pela rota */}
        {provaSel && (
          <section style={T.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>🔢 Matriz Cidade × Hora — a onda do clima</div>
              <button type="button" onClick={carregarMatriz} disabled={matrizCarregando} style={T.btnSm}>{matrizCarregando ? "⏳ Montando..." : "Ver a onda"}</button>
            </div>
            <div style={{ ...T.small, fontSize: 11, marginBottom: 10, lineHeight: 1.5 }}>
              Score de cada cidade a cada hora do dia {modo === "prova" ? "da soltura" : "de hoje"} — veja a frente ruim entrando pela rota e planeje a soltura antes dela chegar. Cada quadrado = condições naquela cidade naquela hora.
            </div>
            {matrizCarregando && <div style={{ ...T.small, textAlign: "center", padding: 14 }}>⏳ Consultando {rota.length} cidades × {matriz?.horas.length ?? 12} horas...</div>}
            {matriz && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", fontSize: 9, minWidth: 560 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "5px 7px", textAlign: "left", color: T.dim, borderBottom: `1px solid ${T.border}` }}>Cidade</th>
                      {matriz.horas.map((h) => <th key={h} style={{ padding: "5px 3px", color: T.dim, borderBottom: `1px solid ${T.border}`, fontWeight: 700 }}>{h.slice(0, 2)}h</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rota.map((pt) => (
                      <tr key={pt.chave}>
                        <td style={{ padding: "4px 7px", whiteSpace: "nowrap", borderBottom: `1px solid ${T.border}` }}>
                          <b style={{ fontSize: 10 }}>{pt.papel === "pombal" ? "🏠 " : pt.papel === "solta" ? "🏁 " : ""}{pt.nome.split(" ")[0]}</b>
                        </td>
                        {(matriz.celulas[pt.chave] || []).map((v, i) => {
                          const cor = v == null ? "#1b283c" : v >= 75 ? "#39e58c" : v >= 55 ? "#fbbf24" : v >= 35 ? "#f97316" : "#ff5d62";
                          const opac = v == null ? 1 : 0.25 + (v / 100) * 0.75;
                          return <td key={i} title={v == null ? "sem dado" : `${pt.nome} ${matriz.horas[i]}: ${v}%`} style={{ padding: 0, borderBottom: `1px solid ${T.border}` }}><div style={{ width: "100%", minWidth: 26, height: 22, background: cor, opacity: opac, display: "grid", placeItems: "center", fontSize: 8, fontWeight: 800, color: "#0b1426" }}>{v ?? "–"}</div></td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ ...T.small, fontSize: 10, marginTop: 8, lineHeight: 1.5 }}>🟢 ≥75 ótima · 🟡 55–74 razoável · 🟠 35–54 difícil · 🔴 &lt;35 ruim · Fonte: Open-Meteo por hora. Cruze com a ⏱️ linha do tempo: a hora que o bando passa em cada cidade precisa estar verde!</div>
              </div>
            )}
          </section>
        )}

 </>)}
        {(aba==="tempos" || aba==="tudo") && (<>         {/* ⏱️ Linha do tempo do voo — passagem estimada por cidade */}
        {provaSel && passagens.length > 1 && (
          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>⏱️ Linha do Tempo do Voo — passagem por cidade</div>
            <div style={{ ...T.small, fontSize: 11, marginBottom: 12, lineHeight: 1.5 }}>
              Estimativa trecho a trecho: solta às {horaSolta} + velocidade do seu plantel ({veloBase || 1200} m/min) ajustada pelo <b>vento de cada trecho</b> (🟢 +8% · 🟡 −5% · 🔴 −18%), <b>chuva</b> (−5% a −10%) e <b>Kp</b> (−3% se ≥5).
            </div>
            <div>
              {passagens.map((pa, i) => {
                const ultimo = i === passagens.length - 1;
                const horaFim = `${String(Math.floor(((pa.horaMin + 1) * 0.92 + 0) / 60) % 24).padStart(2, "0")}`;
                void horaFim;
                return (
                  <div key={pa.nome + i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
                    <b style={{ fontSize: 16, color: ultimo ? T.green : T.gold, minWidth: 52 }}>{pa.hora}</b>
                    <div style={{ width: 26, textAlign: "center", fontSize: 15 }}>{pa.papel === "pombal" ? "🏠" : pa.papel === "solta" ? "🏁" : pa.vento?.emoji || "•"}</div>
                    <div style={{ flex: 1 }}>
                      <b style={{ fontSize: 13 }}>{pa.nome}</b>
                      <div style={{ ...T.small, fontSize: 11 }}>
                        {pa.papel === "solta" ? "soltura dos cestos" : pa.papel === "pombal" ? "chegada no pombal 🎉" : `a ${pa.km}km do pombal`}
                        {pa.papel !== "solta" && pa.vento ? ` • ${pa.vento.tipo.toLowerCase()} • ~${pa.vel} m/min` : ""}
                      </div>
                    </div>
                    {ultimo && <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800, color: T.green, background: `${T.green}12`, border: `1px solid ${T.green}55` }}>CHEGADA ±8%</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ ...T.small, fontSize: 10, marginTop: 10, lineHeight: 1.5 }}>
              ⚠️ Estimativa: bando real não voa em linha reta perfeita nem velocidade constante (correntes, térmicas e liderança variam). Use como referência de vigilância — da 1ª cidade prevista em diante, fique de olho no horizonte {rota.length > 1 ? direcaoCardeal(bearingRota(pombal.lat, pombal.lon, rota[0].lat, rota[0].lon)).toUpperCase() : "NORTE"}.
            </div>
          </section>
        )}

 </>)}
        {(aba==="mapas" || aba==="tudo") && (<>         {/* 🧭 Bússola da Chegada — para quem espera no pombal */}
        {provaSel && rota.length > 1 && rumoSoltura != null && (
          <section style={{ ...T.card, borderColor: `${T.blue}55`, background: `${T.blue}0d` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🧭 Bússola da Chegada — onde olhar no céu</div>
            <div style={{ ...T.small, fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
              Pra quem espera <b>no pombal</b> (o caminhão do clube leva os pombos!): o 🕊️ marca o horizonte por onde o bando vai surgir e o 💨 pra onde o vento empurra na reta final.
            </div>
            <svg viewBox="0 0 200 200" style={{ width: "100%", maxWidth: 280, display: "block", margin: "0 auto" }}>
              <circle cx="100" cy="100" r="92" fill="#0b1529" stroke={T.border} strokeWidth="2" />
              <circle cx="100" cy="100" r="68" fill="none" stroke={T.border} strokeWidth="1" />
              {(["N", "L", "S", "O"] as const).map((d, i) => {
                const ang = (i * 90 * Math.PI) / 180;
                const x = 100 + 80 * Math.sin(ang), y = 100 - 80 * Math.cos(ang);
                return <text key={d} x={x} y={y + 4} textAnchor="middle" fontSize="13" fontWeight="900" fill={d === "N" ? T.red : T.dim}>{d}</text>;
              })}
              <line x1="100" y1="14" x2="100" y2="186" stroke="#ffffff10" strokeWidth="1" />
              <line x1="14" y1="100" x2="186" y2="100" stroke="#ffffff10" strokeWidth="1" />
              <g transform={`rotate(${rumoSoltura} 100 100)`}>
                <circle cx="100" cy="30" r="15" fill={`${T.gold}22`} stroke={T.gold} strokeWidth="1.5" />
                <text x="100" y="36" textAnchor="middle" fontSize="14">🕊️</text>
                <text x="100" y="62" textAnchor="middle" fontSize="9" fontWeight="800" fill={T.gold}>VEM DAQUI</text>
              </g>
              {climaPombal && (
                <g transform={`rotate(${(climaPombal.dirVento + 180) % 360} 100 100)`}>
                  <path d="M100 122 L94 90 L100 97 L106 90 Z" fill={T.blue} />
                  <text x="100" y="80" textAnchor="middle" fontSize="10">💨</text>
                </g>
              )}
              <circle cx="100" cy="100" r="20" fill={`${T.green}22`} stroke={T.green} strokeWidth="1.5" />
              <text x="100" y="106" textAnchor="middle" fontSize="16">🏠</text>
            </svg>
            <div style={{ textAlign: "center", marginTop: 10, lineHeight: 1.7 }}>
              <b style={{ fontSize: 14, color: T.gold }}>👀 Espere o bando surgir no horizonte {direcaoCardeal(rumoSoltura).toUpperCase()} ({Math.round(rumoSoltura)}°)</b>
              <div style={T.small}>A soltura ({rota[0].nome}) fica a {provaSel.km}km nesse lado — o bando vem direto pra cá 🏠</div>
              {climaPombal && (
                <div style={{ ...T.small, marginTop: 4 }}>
                  💨 Vento no pombal vem de {direcaoCardeal(climaPombal.dirVento)} a {climaPombal.ventoKmh}km/h
                  {ventoFinal && <> — <b style={{ color: ventoFinal.cor }}>{ventoFinal.emoji} {ventoFinal.tipo.toLowerCase()} na reta final</b>{ventoFinal.tipo === "Vento contra" ? " (chegam mais baixas e cansadas)" : ventoFinal.tipo === "Vento a favor" ? " (chegam altas e velozes!)" : ""}</>}
                </div>
              )}
              <div style={{ ...T.small, marginTop: 4 }}>⏱️ Chegada prevista {chegada(0.92)}–{chegada(1.08)} — <b style={{ color: T.gold }}>{contagem}</b></div>
            </div>
            {nowcast && nowcast.length > 0 && (() => {
              const comChuva = nowcast.filter((n) => n.mm > 0.1);
              const primeira = comChuva[0];
              const idxPrimeira = primeira ? nowcast.indexOf(primeira) : -1;
              return (
                <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "#ffffff08", fontSize: 12, lineHeight: 1.6 }}>
                  <b style={{ color: T.blue }}>🌧️ Chuva iminente no pombal (próximas 2h):</b>{" "}
                  {primeira
                    ? <>começa ~<b style={{ color: T.blue }}>{primeira.hora}</b> ({idxPrimeira * 15}min) — pico {Math.max(...comChuva.map((n) => n.mm)).toFixed(1)}mm</>
                    : <>sem chuva prevista ✅ — céu livre na reta final</>}
                </div>
              );
            })()}
            {recepcao.length > 0 && (
              <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "#ffffff08", fontSize: 12, lineHeight: 1.7 }}>
                <b style={{ color: T.gold }}>🌡️ Protocolo de recepção:</b>
                {recepcao.map((r, i) => <div key={i} style={{ marginTop: 4 }}>{r}</div>)}
              </div>
            )}
          </section>
        )}

 </>)}
        {(aba==="cidades" || aba==="tudo") && (<>         {/* Pontos da rota */}
        {pontosComScore.map(({ pt, d, vento, score, bearing, trechoFinal }) => {
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
                      ["🌧️", "Chuva", `${clima.chuvaMm} mm${clima.chuvaPct != null ? ` (${clima.chuvaPct}%)` : ""}`],
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
                    {vento.emoji} <b>{vento.tipo}</b> {trechoFinal ? `no trecho final (${trechoFinal} → pombal)` : "nesta parte do percurso"} — o vento vem de {direcaoCardeal(clima.dirVento)} ({clima.dirVento}°), o bando voa rumo {direcaoCardeal(bearing ?? 0)} ({bearing ?? 0}°) e o vento {vento.tipo === "Vento a favor" ? "🔥 EMPURRA o bando na direção do voo" : vento.tipo === "Vento contra" ? "🛑 FREIA o bando de frente" : "↔️ EMPURRA o bando de lado"}.
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
 </>)}
              </div>
    </main>
  );
}
