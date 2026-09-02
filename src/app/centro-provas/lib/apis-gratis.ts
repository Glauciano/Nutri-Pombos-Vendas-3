import { loadConfig, saveConfig } from "../config";

/**
 * APIs 100% gratuitas, sem chave, com CORS liberado:
 *  - Open-Meteo Forecast   (clima atual + pressão + nascer/pôr do sol)
 *  - Open-Meteo Geocoding  (coordenadas de qualquer cidade)
 *  - NOAA SWPC             (índice Kp geomagnético real)
 *  - OpenStreetMap embed   (mapa real embutido, usado nos componentes)
 */

/** Evento disparado quando o usuário altera a localização do pombal */
export const EVENTO_POMBAL = "nutripombos:pombal";

/* Cache de 10 min + retry — evita HTTP 429 (limite) do Open-Meteo */
const CACHE_API = new Map<string, { t: number; data: unknown }>();
const TTL_API = 10 * 60 * 1000;

async function fetchJson<T>(url: string, tentativas = 3): Promise<T> {
  const c = CACHE_API.get(url);
  if (c && Date.now() - c.t < TTL_API) return c.data as T;
  let ultimoErro: unknown = new Error("falha na rede");
  for (let i = 0; i < tentativas; i++) {
    try {
      const r = await fetch(url);
      if (r.status === 429 || r.status >= 500) {
        ultimoErro = new Error(`HTTP ${r.status} (limite da API)`);
        await new Promise((res) => setTimeout(res, 900 * (i + 1)));
        continue;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as T;
      CACHE_API.set(url, { t: Date.now(), data: j });
      return j;
    } catch (e) {
      ultimoErro = e;
      await new Promise((res) => setTimeout(res, 700 * (i + 1)));
    }
  }
  throw ultimoErro;
}

/** Limpa o cache (botão ↻ Atualizar) */
export function limparCacheApi() { CACHE_API.clear(); }

export interface Coords { lat: number; lon: number }

export const POMBAL_BASE = "Pombal (sua base)";

/** Cidades já conhecidas (mesmas da Previsão do Tempo) + Limeira */
export const COORDS: Record<string, Coords> = {
  [POMBAL_BASE]: { lat: -23.55, lon: -46.63 },
  Limeira: { lat: -22.8864, lon: -47.4017 },
  Cravinhos: { lat: -21.34, lon: -47.73 },
  Jardinópolis: { lat: -21.02, lon: -47.77 },
  "São Joaquim da Barra": { lat: -20.58, lon: -47.85 },
  Igarapava: { lat: -20.03, lon: -47.76 },
  Uberaba: { lat: -19.75, lon: -47.93 },
  Araguari: { lat: -18.65, lon: -48.19 },
  Catalão: { lat: -18.17, lon: -47.94 },
  "Campo Alegre": { lat: -17.63, lon: -47.78 },
  Cristalina: { lat: -16.77, lon: -47.61 },
  Brasília: { lat: -15.78, lon: -47.93 },
};

const GEO_CACHE_KEY = "nutripombos-geocode-v1";

/* ------------------------------------------------------------------ */
/* Localização do pombal (configurável pelo usuário)                   */
/* ------------------------------------------------------------------ */

/** Lê o pombal configurado; se não houver, usa São Paulo como padrão */
export function getPombal(): Coords & { nome: string } {
  try {
    const cfg = loadConfig();
    if (typeof cfg.pombalLat === "number" && typeof cfg.pombalLon === "number"
      && Number.isFinite(cfg.pombalLat) && Number.isFinite(cfg.pombalLon)
      && Math.abs(cfg.pombalLat) <= 90 && Math.abs(cfg.pombalLon) <= 180) {
      return { lat: cfg.pombalLat, lon: cfg.pombalLon, nome: cfg.pombalNome?.trim() || "Pombal" };
    }
  } catch { /* ignora */ }
  return { ...COORDS[POMBAL_BASE], nome: POMBAL_BASE };
}

/** Aplica o pombal salvo à tabela de coordenadas (chamar no mount das páginas) */
export function aplicarPombalSalvo(): Coords & { nome: string } {
  const p = getPombal();
  COORDS[POMBAL_BASE] = { lat: p.lat, lon: p.lon };
  return p;
}

/** Salva a localização do pombal e avisa todas as páginas abertas */
export function salvarPombal(lat: number, lon: number, nome?: string) {
  const cfg = loadConfig();
  cfg.pombalLat = lat;
  cfg.pombalLon = lon;
  if (nome !== undefined) cfg.pombalNome = nome.trim() || undefined;
  saveConfig(cfg);
  COORDS[POMBAL_BASE] = { lat, lon };
  try { window.dispatchEvent(new Event(EVENTO_POMBAL)); } catch { /* ignora */ }
}

/** Descobre a coordenada de qualquer cidade (cache em localStorage) */
export async function geocodeCidade(nome: string): Promise<Coords | null> {
  if (COORDS[nome]) return COORDS[nome];
  let cache: Record<string, Coords> = {};
  try { cache = JSON.parse(localStorage.getItem(GEO_CACHE_KEY) || "{}"); } catch { cache = {}; }
  if (cache[nome]) return cache[nome];
  try {
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nome)}&count=1&language=pt&format=json`
    );
    if (!r.ok) return null;
    const j = await r.json();
    const res = j?.results?.[0];
    if (!res || typeof res.latitude !== "number" || typeof res.longitude !== "number") return null;
    const c: Coords = { lat: res.latitude, lon: res.longitude };
    try { cache[nome] = c; localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache)); } catch { /* ignora */ }
    return c;
  } catch { return null; }
}

/* ------------------------------------------------------------------ */
/* Aero-Clima (para a página Clima Avançado)                          */
/* ------------------------------------------------------------------ */

export interface AeroClimaReal {
  temp: number;              // °C (conforto térmico)
  pressaoMsl: number;        // hPa ao nível do mar
  pressaoLocal: number;      // hPa na altitude do local
  tendencia3h: number;       // variação de pressão nas últimas 3h (hPa)
  coberturaNuvens: number;   // %
  visibilidadeKm: number;
  umidade: number;           // %
  ventoKmh: number;
  rajadaKmh: number;
  direcaoVento: number;      // graus
  atualizado: string;        // HH:MM
}

export async function buscarAeroClima(lat: number, lon: number): Promise<AeroClimaReal> {
  const CURRENT_VARS = "temperature_2m,pressure_msl,surface_pressure,cloud_cover,visibility,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m";
  const p = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: CURRENT_VARS,
    hourly: "pressure_msl",
    past_hours: "4",
    forecast_hours: "1",
    timezone: "America/Sao_Paulo",
  });
  // 1ª tentativa (com tendência); se falhar, retry simplificado só com dados atuais
  let r = await fetch(`https://api.open-meteo.com/v1/forecast?${p}`);
  if (!r.ok) {
    const p2 = new URLSearchParams({ latitude: String(lat), longitude: String(lon), current: CURRENT_VARS, timezone: "America/Sao_Paulo" });
    r = await fetch(`https://api.open-meteo.com/v1/forecast?${p2}`);
  }
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  const c = j?.current;
  if (!c) throw new Error("Resposta climática inválida");

  // Tendência barométrica: compara a hora atual com a de 3 horas atrás (tolerância a minutos)
  let tendencia3h = 0;
  try {
    const tempos: string[] = j.hourly?.time || [];
    const pressoes: number[] = j.hourly?.pressure_msl || [];
    if (pressoes.length > 1) {
      const agora = String(c.time || "");
      let idx = tempos.findIndex((t) => t === agora);
      if (idx < 0) idx = tempos.reduce((acc, t, i) => (t.slice(0, 13) <= agora.slice(0, 13) ? i : acc), 0);
      const idxPassado = Math.max(0, idx - 3);
      tendencia3h = +(pressoes[idx] - pressoes[idxPassado]).toFixed(1);
    }
  } catch { /* mantém 0 */ }

  return {
    temp: Math.round(Number(c.temperature_2m ?? 0)),
    pressaoMsl: Math.round(Number(c.pressure_msl ?? c.surface_pressure ?? 0)) || 0,
    pressaoLocal: Math.round(Number(c.surface_pressure ?? 0)) || 0,
    tendencia3h,
    coberturaNuvens: Math.round(c.cloud_cover ?? 0),
    visibilidadeKm: Math.max(0, Math.round((c.visibility ?? 0) / 1000)),
    umidade: Math.round(c.relative_humidity_2m ?? 0),
    ventoKmh: Math.round(c.wind_speed_10m ?? 0),
    rajadaKmh: Math.round(c.wind_gusts_10m ?? 0),
    direcaoVento: Math.round(c.wind_direction_10m ?? 0),
    atualizado: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

/* ------------------------------------------------------------------ */
/* Índice Kp geomagnético real (NOAA SWPC)                            */
/* ------------------------------------------------------------------ */

export interface KpReal { kp: number; horaUTC: string }

export async function buscarKpNoaa(): Promise<KpReal | null> {
  try {
    const r = await fetch("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json");
    if (!r.ok) return null;
    const j = await r.json();
    if (!Array.isArray(j) || j.length < 2) return null;
    // O NOAA pode retornar objetos {"time_tag","Kp",...} ou arrays [time,kp,...]
    const ultimo = j[j.length - 1] as Record<string, unknown> | (string | number)[];
    const kp = Number(Array.isArray(ultimo) ? ultimo[1] : (ultimo as Record<string, unknown>).Kp);
    if (!Number.isFinite(kp)) return null;
    const horaRaw = String(Array.isArray(ultimo) ? ultimo[0] : (ultimo as Record<string, unknown>).time_tag || "");
    const horaUTC = horaRaw.replace("T", " ").slice(5, 16) + " UTC";
    return { kp, horaUTC };
  } catch { return null; }
}

/* ------------------------------------------------------------------ */
/* Nascer / Pôr do Sol (Open-Meteo)                                   */
/* ------------------------------------------------------------------ */

export interface SolDia { data: string; nascer: string; por: string; horasLuz: number }

function hhmm(iso: string): string {
  return iso ? iso.slice(11, 16) : "--:--";
}

/** Sol de vários pontos em UMA chamada */
export async function buscarSolPontos(pontos: Coords[], dias = 1): Promise<SolDia[][]> {
  const p = new URLSearchParams({
    latitude: pontos.map((c) => c.lat.toFixed(4)).join(","),
    longitude: pontos.map((c) => c.lon.toFixed(4)).join(","),
    daily: "sunrise,sunset,daylight_duration",
    forecast_days: String(dias),
    timezone: "America/Sao_Paulo",
  });
  const j = await fetchJson<unknown>(`https://api.open-meteo.com/v1/forecast?${p}`);
  const lista = Array.isArray(j) ? j : [j];
  return lista.map((item) => {
    const d = (item as { daily?: Record<string, unknown[]> })?.daily;
    if (!d?.time) return [] as SolDia[];
    return (d.time as string[]).map((data, i) => ({
      data,
      nascer: hhmm(String(d.sunrise?.[i] ?? "")),
      por: hhmm(String(d.sunset?.[i] ?? "")),
      horasLuz: +((Number(d.daylight_duration?.[i] ?? 0)) / 3600).toFixed(2),
    }));
  });
}

export async function buscarSol(lat: number, lon: number, dias = 7): Promise<SolDia[]> {
  const r = await buscarSolPontos([{ lat, lon }], dias);
  if (!r[0]?.length) throw new Error("Resposta inválida");
  return r[0];
}

/** Formata horas decimais como "11h 32min" */
export function fmtHoras(h: number): string {
  const min = Math.round(h * 60);
  return `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}min`;
}

/** Converte graus de direção do vento em ponto cardeal */
export function direcaoCardeal(deg: number): string {
  const d = ["N", "NNE", "NE", "ENE", "L", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
  return d[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
}

/* ------------------------------------------------------------------ */
/* Rota da prova — clima por cidade do percurso                       */
/* ------------------------------------------------------------------ */

export interface ClimaPonto {
  temp: number;             // °C
  chuvaMm: number;          // mm acumulados na janela do voo
  chuvaPct?: number;        // % probabilidade máxima no dia
  ventoKmh: number;
  rajadaKmh: number;
  dirVento: number;         // graus (de onde o vento vem)
  umidade: number;          // %
  pressaoMsl: number;       // hPa
  nuvens: number;           // %
  visibilidadeKm: number;
  wmo: number;              // código do tempo
  horaRef: string;          // "Agora" ou "09:00 de 30/08"
}


function agregarDiaVoo(hRaw: unknown, dia: string): ClimaPonto {
  const h = hRaw as Record<string, unknown> | undefined;
  if (!h?.time) throw new Error("Sem previsão para esta data");
  const tempos = (h.time as string[])
  const janela: number[] = [];
  tempos.forEach((t, i) => { const hh = Number(t.slice(11, 13)); if (hh >= 6 && hh <= 19) janela.push(i); });
  if (!janela.length) throw new Error("Sem previsão para esta data");
  const pegar = (k: string, i: number): number => Number(((h[k] as (number | null)[] | undefined)?.[i]) ?? 0);
  const maxNa = (k: string): number => janela.reduce((m, i) => Math.max(m, pegar(k, i)), 0);
  const minNa = (k: string): number => janela.reduce((m, i) => Math.min(m, pegar(k, i)), Infinity);
  const idxRep = Math.max(0, tempos.findIndex((t) => t.endsWith("T12:00")));
  return {
    temp: Math.round(pegar("temperature_2m", idxRep)),
    chuvaMm: +janela.reduce((soma, i) => soma + pegar("precipitation", i), 0).toFixed(1),
    chuvaPct: Math.round(maxNa("precipitation_probability")),
    ventoKmh: Math.round(maxNa("wind_speed_10m")),
    rajadaKmh: Math.round(maxNa("wind_gusts_10m")),
    dirVento: Math.round(pegar("wind_direction_10m", idxRep)),
    umidade: Math.round(pegar("relative_humidity_2m", idxRep)),
    pressaoMsl: Math.round(pegar("pressure_msl", idxRep)) || 0,
    nuvens: Math.round(maxNa("cloud_cover")),
    visibilidadeKm: Math.round(minNa("visibility") / 1000),
    wmo: janela.reduce((m, i) => Math.max(m, pegar("weather_code", i)), 0),
    horaRef: `06h–20h de ${dia.slice(8, 10)}/${dia.slice(5, 7)} (janela do voo)`,
  };
}

function currentParaClima(c: Record<string, unknown> | undefined): ClimaPonto {
  if (!c) throw new Error("Resposta climática inválida");
  return {
    temp: Math.round(Number(c.temperature_2m ?? 0)),
    chuvaMm: +Number(c.precipitation ?? 0).toFixed(1),
    ventoKmh: Math.round(Number(c.wind_speed_10m ?? 0)),
    rajadaKmh: Math.round(Number(c.wind_gusts_10m ?? 0)),
    dirVento: Math.round(Number(c.wind_direction_10m ?? 0)),
    umidade: Math.round(Number(c.relative_humidity_2m ?? 0)),
    pressaoMsl: Math.round(Number(c.pressure_msl ?? 0)) || 0,
    nuvens: Math.round(Number(c.cloud_cover ?? 0)),
    visibilidadeKm: Math.round(Number(c.visibility ?? 0) / 1000),
    wmo: Number(c.weather_code ?? 0),
    horaRef: "Agora",
  };
}

const VARS_CLIMA = "temperature_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,relative_humidity_2m,pressure_msl,cloud_cover,visibility";

/**
 * Clima de VÁRIOS pontos em UMA chamada (a API aceita várias coordenadas) — evita 429.
 */
export async function buscarClimaPontos(pontos: Coords[], dia?: string): Promise<(ClimaPonto | undefined)[]> {
  const lat = pontos.map((p) => p.lat.toFixed(4)).join(",");
  const lon = pontos.map((p) => p.lon.toFixed(4)).join(",");
  const p = new URLSearchParams({ latitude: lat, longitude: lon, timezone: "America/Sao_Paulo" });
  if (dia) {
    p.set("hourly", `${VARS_CLIMA},precipitation_probability`);
    p.set("start_date", dia);
    p.set("end_date", dia);
  } else {
    p.set("current", VARS_CLIMA);
  }
  const j = await fetchJson<unknown>(`https://api.open-meteo.com/v1/forecast?${p}`);
  const lista = Array.isArray(j) ? j : [j];
  return lista.map((item) => {
    const o = item as Record<string, Record<string, unknown> | undefined>;
    try {
      if (dia) return agregarDiaVoo(o.hourly, dia);
      return currentParaClima(o.current as Record<string, unknown>);
    } catch { return undefined; }
  });
}

/** Clima de um ponto (mantida para outras páginas) */
export async function buscarClimaPonto(lat: number, lon: number, dia?: string): Promise<ClimaPonto> {
  const r = await buscarClimaPontos([{ lat, lon }], dia);
  if (!r[0]) throw new Error("Sem dados do local");
  return r[0];
}

/** Ângulo (bearing) do trecho: da cidade atual até o destino, em graus */
export function bearingRota(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const y = Math.sin(rad(lon2 - lon1)) * Math.cos(rad(lat2));
  const x = Math.cos(rad(lat1)) * Math.sin(rad(lat2)) - Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(rad(lon2 - lon1));
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
}

export function wmoInfo(code: number): { desc: string; emoji: string } {
  if (code === 0) return { desc: "Céu limpo", emoji: "☀️" };
  if (code <= 2) return { desc: "Parcialmente nublado", emoji: "⛅" };
  if (code === 3) return { desc: "Encoberto", emoji: "☁️" };
  if (code <= 49) return { desc: "Névoa/neblina", emoji: "🌫️" };
  if (code <= 59) return { desc: "Garoa", emoji: "🌦️" };
  if (code <= 69) return { desc: "Chuva", emoji: "🌧️" };
  if (code <= 79) return { desc: "Granizo/neve", emoji: "🌨️" };
  if (code <= 86) return { desc: "Chuva forte", emoji: "⛈️" };
  if (code >= 95) return { desc: "Tempestade", emoji: "⛈️" };
  return { desc: "Variável", emoji: "🌤️" };
}

/** Vento relativo à rota: a favor (cauda), contra (nariz) ou lateral */
export function ventoNaRota(dirVentoDeg: number, bearingDestino: number, velocidadeKmh?: number): { tipo: string; emoji: string; cor: string; pen: number } {
  if (velocidadeKmh !== undefined && velocidadeKmh < 4) {
    return { tipo: "Vento calmo", emoji: "⚪", cor: "#9aa8bc", pen: 0 }; // vento fraco demais: direção irrelevante
  }
  const r = ((dirVentoDeg - bearingDestino) % 360 + 360) % 360; // 0 = vento na cara
  if (r >= 135 && r <= 225) return { tipo: "Vento a favor", emoji: "🟢", cor: "#39e58c", pen: 0 };
  if (r < 45 || r > 315) return { tipo: "Vento contra", emoji: "🔴", cor: "#ff5d62", pen: 20 };
  return { tipo: "Vento lateral", emoji: "🟡", cor: "#fbbf24", pen: 10 };
}

/** Score de segurança do ponto (0-100) */
export function scorePonto(c: ClimaPonto, penVento: number, kpGlobal: number | null): { pts: number; label: string; cor: string } {
  let p = 100 - penVento;
  if (c.temp > 35) p -= 30; else if (c.temp > 30) p -= 12; else if (c.temp < 5) p -= 25; else if (c.temp < 10) p -= 8;
  if (c.chuvaMm > 5) p -= 40; else if (c.chuvaMm > 1) p -= 20; else if (c.chuvaMm > 0) p -= 5;
  if (c.rajadaKmh > 50) p -= 30; else if (c.rajadaKmh > 35) p -= 15;
  if (c.wmo >= 95) p -= 30; else if (c.wmo >= 80) p -= 15;
  if (c.visibilidadeKm < 4) p -= 25; else if (c.visibilidadeKm < 8) p -= 10;
  if (kpGlobal !== null && kpGlobal >= 7) p -= 25; else if (kpGlobal !== null && kpGlobal >= 5) p -= 12;
  p = Math.max(0, Math.min(100, Math.round(p)));
  if (p >= 75) return { pts: p, label: "Ótimas condições", cor: "#39e58c" };
  if (p >= 55) return { pts: p, label: "Condições razoáveis", cor: "#fbbf24" };
  if (p >= 35) return { pts: p, label: "Condições difíceis", cor: "#f97316" };
  return { pts: p, label: "Condições ruins", cor: "#ff5d62" };
}

/* ------------------------------------------------------------------ */
/* Qualidade do ar (Open-Meteo Air Quality — gratuito, sem chave)     */
/* ------------------------------------------------------------------ */

export interface ArPonto { pm25: number; pm10: number; ozonio: number; aqi: number }

export async function buscarAr(lat: number, lon: number): Promise<ArPonto | null> {
  try {
    const r = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,ozone,us_aqi&timezone=America%2FSao_Paulo`);
    if (!r.ok) return null;
    const j = await r.json();
    const c = j?.current;
    if (!c) return null;
    return { pm25: Math.round(c.pm2_5 ?? 0), pm10: Math.round(c.pm10 ?? 0), ozonio: Math.round(c.ozone ?? 0), aqi: Math.round(c.us_aqi ?? -1) };
  } catch { return null; }
}

export function classificarAr(a: ArPonto): { label: string; cor: string; emoji: string } {
  const v = a.aqi;
  if (v >= 0 && v <= 50) return { label: "Ar bom", cor: "#39e58c", emoji: "🟢" };
  if (v <= 100) return { label: "Ar moderado", cor: "#fbbf24", emoji: "🟡" };
  if (v <= 150) return { label: "Ruim p/ voadores", cor: "#f97316", emoji: "🟠" };
  return { label: "Ar ruim (queimada?)", cor: "#ff5d62", emoji: "🔴" };
}

/** Qualidade do ar de vários pontos em UMA chamada */
export async function buscarArPontos(pontos: Coords[]): Promise<(ArPonto | null)[]> {
  try {
    const p = new URLSearchParams({
      latitude: pontos.map((c) => c.lat.toFixed(4)).join(","),
      longitude: pontos.map((c) => c.lon.toFixed(4)).join(","),
      current: "pm10,pm2_5,ozone,us_aqi",
      timezone: "America/Sao_Paulo",
    });
    const j = await fetchJson<unknown>("https://air-quality-api.open-meteo.com/v1/air-quality?" + p);
    const lista = Array.isArray(j) ? j : [j];
    return lista.map((item) => {
      const c = (item as Record<string, Record<string, unknown>>)?.current;
      if (!c) return null;
      return { pm25: Math.round(Number(c.pm2_5 ?? 0)), pm10: Math.round(Number(c.pm10 ?? 0)), ozonio: Math.round(Number(c.ozone ?? 0)), aqi: Math.round(Number(c.us_aqi ?? -1)) };
    });
  } catch { return pontos.map(() => null); }
}

/* ------------------------------------------------------------------ */
/* Altimetria da rota (Open-Meteo Elevation — gratuito, em lote)      */
/* ------------------------------------------------------------------ */

/** Interpola n pontos na linha reta entre A e B (incluindo extremos) */
export function interpolarRota(a: Coords, b: Coords, n: number): Coords[] {
  const pts: Coords[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    pts.push({ lat: a.lat + (b.lat - a.lat) * t, lon: a.lon + (b.lon - a.lon) * t });
  }
  return pts;
}

/** Elevação (m) de vários pontos em UMA chamada */
export async function buscarAltimetria(pontos: Coords[]): Promise<number[]> {
  const lat = pontos.map((p) => p.lat.toFixed(4)).join(",");
  const lon = pontos.map((p) => p.lon.toFixed(4)).join(",");
  const j = await fetchJson<{ elevation?: number[] }>(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`);
  return j?.elevation || [];
}

/* ------------------------------------------------------------------ */
/* Radar de chuva ao vivo (RainViewer — gratuito, sem chave)          */
/* ------------------------------------------------------------------ */

export interface FrameRadar { time: number; path: string; previsto: boolean }

export async function buscarRadar(): Promise<{ host: string; frames: FrameRadar[] } | null> {
  try {
    const r = await fetch("https://api.rainviewer.com/public/weather-maps.json");
    if (!r.ok) return null;
    const j = await r.json();
    const passado: FrameRadar[] = (j?.radar?.past || []).map((f: { time: number; path: string }) => ({ time: f.time, path: f.path, previsto: false }));
    const previsto: FrameRadar[] = (j?.radar?.nowcast || []).map((f: { time: number; path: string }) => ({ time: f.time, path: f.path, previsto: true }));
    const frames = [...passado.slice(-12), ...previsto].filter((f, i, arr) => arr.findIndex((x) => x.time === f.time) === i);
    if (!frames.length || !j?.host) return null;
    return { host: j.host, frames };
  } catch { return null; }
}

export function urlTileRadar(host: string, path: string, z: number, x: number, y: number): string {
  return `${host}${path}/256/${z}/${x}/${y}/2/1_1.png`;
}

/** Converte lat/lon em número do tile (Web Mercator) */
export function tileXY(lat: number, lon: number, z: number): { x: number; y: number } {
  const n = 2 ** z;
  const x = Math.floor(((lon + 180) / 360) * n);
  const latR = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n);
  return { x, y };
}

/* ------------------------------------------------------------------ */
/* Clima de datas passadas (Open-Meteo Archive — gratuito)            */
/* ------------------------------------------------------------------ */

export interface ClimaPassado { temp: number; chuva: number; vento: number; dirVento: number }

export async function buscarClimaPassado(lat: number, lon: number, data: string): Promise<ClimaPassado> {
  const p = new URLSearchParams({
    latitude: String(lat), longitude: String(lon),
    start_date: data, end_date: data,
    hourly: "temperature_2m,precipitation,wind_speed_10m,wind_direction_10m",
    timezone: "America/Sao_Paulo",
  });
  const r = await fetch(`https://archive-api.open-meteo.com/v1/archive?${p}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  const h = j?.hourly;
  if (!h?.time) throw new Error("Sem dados no arquivo");
  const idx: number[] = [];
  (h.time as string[]).forEach((t, i) => { if (/T(09|10|11|12|13):00$/.test(t)) idx.push(i); });
  if (!idx.length) throw new Error("Sem horas do dia");
  const media = (k: string) => idx.reduce((s, i) => s + Number(h[k]?.[i] ?? 0), 0) / idx.length;
  return {
    temp: Math.round(media("temperature_2m")),
    chuva: +media("precipitation").toFixed(1),
    vento: Math.round(media("wind_speed_10m")),
    dirVento: Math.round(media("wind_direction_10m")),
  };
}

/* ------------------------------------------------------------------ */
/* 🕐 Janela ideal de soltura (previsão hora a hora)                  */
/* ------------------------------------------------------------------ */

export interface HoraSolta { hora: string; temp: number; chuva: number; vento: number; rajada: number; dir: number; wmo: number; umidade: number }

/** Data de hoje no fuso de São Paulo (YYYY-MM-DD) */
export function hojeSP(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

/** Previsão hora a hora (05h–18h) para o dia informado (ou hoje) */
export async function buscarJanelaSolta(lat: number, lon: number, dia?: string): Promise<HoraSolta[]> {
  const d = dia || hojeSP();
  const p = new URLSearchParams({
    latitude: String(lat), longitude: String(lon), timezone: "America/Sao_Paulo",
    hourly: "temperature_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,relative_humidity_2m",
    start_date: d, end_date: d,
  });
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?${p}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  const h = j?.hourly;
  if (!h?.time) throw new Error("Sem previsão horária");
  const out: HoraSolta[] = [];
  (h.time as string[]).forEach((t, i) => {
    const hh = Number(t.slice(11, 13));
    if (hh < 5 || hh > 18) return;
    out.push({
      hora: `${String(hh).padStart(2, "0")}:00`,
      temp: Math.round(Number(h.temperature_2m?.[i] ?? 0)),
      chuva: +Number(h.precipitation?.[i] ?? 0).toFixed(1),
      vento: Math.round(Number(h.wind_speed_10m?.[i] ?? 0)),
      rajada: Math.round(Number(h.wind_gusts_10m?.[i] ?? 0)),
      dir: Math.round(Number(h.wind_direction_10m?.[i] ?? 0)),
      wmo: Number(h.weather_code?.[i] ?? 0),
      umidade: Math.round(Number(h.relative_humidity_2m?.[i] ?? 0)),
    });
  });
  if (!out.length) throw new Error("Dia fora do alcance da previsão");
  return out;
}

/** Previsão hora a hora (05h–18h) de VÁRIOS pontos em UMA chamada */
export async function buscarJanelaSoltaPontos(pontos: Coords[], dia: string): Promise<HoraSolta[][]> {
  const p = new URLSearchParams({
    latitude: pontos.map((c) => c.lat.toFixed(4)).join(","),
    longitude: pontos.map((c) => c.lon.toFixed(4)).join(","),
    hourly: "temperature_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,relative_humidity_2m",
    start_date: dia, end_date: dia,
    timezone: "America/Sao_Paulo",
  });
  const j = await fetchJson<unknown>(`https://api.open-meteo.com/v1/forecast?${p}`);
  const lista = Array.isArray(j) ? j : [j];
  return lista.map((item) => {
    const h = (item as { hourly?: Record<string, unknown[]> })?.hourly;
    if (!h?.time) return [] as HoraSolta[];
    const out: HoraSolta[] = [];
    (h.time as string[]).forEach((t, i) => {
      const hh = Number(t.slice(11, 13));
      if (hh < 5 || hh > 18) return;
      out.push({
        hora: `${String(hh).padStart(2, "0")}:00`,
        temp: Math.round(Number(h.temperature_2m?.[i] ?? 0)),
        chuva: +Number(h.precipitation?.[i] ?? 0).toFixed(1),
        vento: Math.round(Number(h.wind_speed_10m?.[i] ?? 0)),
        rajada: Math.round(Number(h.wind_gusts_10m?.[i] ?? 0)),
        dir: Math.round(Number(h.wind_direction_10m?.[i] ?? 0)),
        wmo: Number(h.weather_code?.[i] ?? 0),
        umidade: Math.round(Number(h.relative_humidity_2m?.[i] ?? 0)),
      });
    });
    return out;
  });
}

/* ------------------------------------------------------------------ */
/* 🌙 Fase da lua (cálculo local — nem precisa de internet)           */
/* ------------------------------------------------------------------ */

export function faseLua(dataISO: string): { fase: string; emoji: string; iluminacao: number } {
  const [y, m, d] = dataISO.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d, 12) / 86400000;
  const ref = Date.UTC(2000, 0, 6, 18, 14) / 86400000; // lua nova conhecida
  const idade = (((t - ref) % 29.530588853) + 29.530588853) % 29.530588853;
  const iluminacao = Math.round(((1 - Math.cos((2 * Math.PI * idade) / 29.530588853)) / 2) * 100);
  const f = Math.floor((idade / 29.530588853) * 8 + 0.5) % 8;
  const nomes: [string, string][] = [
    ["Lua nova", "🌑"], ["Lua crescente côncava", "🌒"], ["Quarto crescente", "🌓"], ["Lua crescente gibosa", "🌔"],
    ["Lua cheia", "🌕"], ["Lua minguante gibosa", "🌖"], ["Quarto minguante", "🌗"], ["Lua minguante côncava", "🌘"],
  ];
  return { fase: nomes[f][0], emoji: nomes[f][1], iluminacao };
}

/* ------------------------------------------------------------------ */
/* 🌡️ Conforto térmico (Índice de Desconforto de Thom)                */
/* ------------------------------------------------------------------ */

export function confortoTermico(temp: number, umidade: number): { label: string; cor: string; emoji: string; rec: string } {
  const di = temp - 0.55 * (1 - umidade / 100) * (temp - 14);
  if (di >= 30) return { label: `Calor perigoso (ID ${di.toFixed(0)})`, cor: "#ff5d62", emoji: "🥵", rec: "Estresse térmico grave: banho sempre disponível, eletrólitos na água, sombra e ventilação máxima. Evite treinos e solturas longas." };
  if (di >= 26) return { label: `Calor alto (ID ${di.toFixed(0)})`, cor: "#f97316", emoji: "😰", rec: "Banho e eletrólitos recomendados; redobre a água limpa e voe só no início da manhã." };
  if (di >= 21) return { label: `Calor moderado (ID ${di.toFixed(0)})`, cor: "#fbbf24", emoji: "🙂", rec: "Conforto razoável: água fresca e observação normal." };
  if (di >= 15) return { label: `Confortável (ID ${di.toFixed(0)})`, cor: "#39e58c", emoji: "😊", rec: "Faixa ideal de conforto térmico para o plantel." };
  return { label: `Frio (ID ${di.toFixed(0)})`, cor: "#55a3ff", emoji: "🥶", rec: "Aumente energia da mistura (milho/girassol) e proteja o pombal do vento." };
}

/** Soma minutos a um horário HH:MM (com virada de dia) */
export function somarMinutosHHMM(hhmm: string, minutos: number): string {
  const [H, M] = hhmm.split(":").map(Number);
  const tot = ((H || 0) * 60 + (M || 0) + minutos + 1440 * 7) % 1440;
  return `${String(Math.floor(tot / 60)).padStart(2, "0")}:${String(tot % 60).padStart(2, "0")}`;
}

/** Distância em linha reta entre dois pontos (km) */
export function distanciaKmHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

/* ------------------------------------------------------------------ */
/* 🌙 Madrugada no pombal (20h–06h) — manejo noturno                  */
/* ------------------------------------------------------------------ */

export interface Madrugada { minTemp: number; horaMin: string; maxTemp: number; chuvaMm: number; umidade: number }

export async function buscarMadrugada(lat: number, lon: number): Promise<Madrugada> {
  const hoje = hojeSP();
  const amanha = new Date(Date.now() + 86_400_000).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const p = new URLSearchParams({
    latitude: String(lat), longitude: String(lon), timezone: "America/Sao_Paulo",
    hourly: "temperature_2m,precipitation,relative_humidity_2m",
    start_date: hoje, end_date: amanha,
  });
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?${p}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  const h = j?.hourly;
  if (!h?.time) throw new Error("Sem previsão");
  const idx: number[] = [];
  (h.time as string[]).forEach((t, i) => {
    const d = t.slice(0, 10), hh = Number(t.slice(11, 13));
    if ((d === hoje && hh >= 20) || (d === amanha && hh <= 6)) idx.push(i);
  });
  if (!idx.length) throw new Error("Janela noturna indisponível");
  const pegar = (k: string, i: number) => Number(h[k]?.[i] ?? 0);
  const temps = idx.map((i) => pegar("temperature_2m", i));
  const iMin = idx[temps.indexOf(Math.min(...temps))];
  const iMax = idx[temps.indexOf(Math.max(...temps))];
  const hhmm = (i: number) => h.time[i].slice(11, 16);
  return {
    minTemp: Math.round(Math.min(...temps)),
    horaMin: hhmm(iMin),
    maxTemp: Math.round(Math.max(...temps)),
    chuvaMm: +idx.reduce((s, i) => s + pegar("precipitation", i), 0).toFixed(1),
    umidade: Math.round(idx.reduce((s, i) => s + pegar("relative_humidity_2m", i), 0) / idx.length),
  };
}

export function alertaMadrugada(m: Madrugada): { titulo: string; emoji: string; cor: string; dicas: string[] } {
  let base: { titulo: string; emoji: string; cor: string; dicas: string[] };
  if (m.minTemp <= 8) base = { titulo: `Madrugada MUITO FRIA — mínima ${m.minTemp}°C`, emoji: "🥶", cor: "#55a3ff", dicas: [
    "Aumente a energia da mistura de tarde: milho e girassol extras (gordura de combustão noturna)",
    "Bloqueie correntes de vento direto nos poleiros — o frio no peito gasta reserva",
    "Água trocada no fim da tarde — água gelada de madrugada reduz o consumo",
  ] };
  else if (m.minTemp <= 13) base = { titulo: `Madrugada fria — mínima ${m.minTemp}°C`, emoji: "🧥", cor: "#55a3ff", dicas: [
    "Levemente mais energia na mistura de tarde (milho)",
    "Confira se não há entrada de vento frio no pombal",
  ] };
  else if (m.minTemp <= 20) base = { titulo: `Madrugada confortável — mínima ${m.minTemp}°C`, emoji: "😊", cor: "#39e58c", dicas: ["Condições ideais de descanso noturno — manejo padrão"] };
  else if (m.minTemp <= 23) base = { titulo: `Madrugada abafada — mínima ${m.minTemp}°C`, emoji: "😕", cor: "#fbbf24", dicas: [
    "Garanta ventilação cruzada sem corrente direta",
    "Água fresca disponível até a última hora",
  ] };
  else base = { titulo: `Madrugada QUENTE — mínima ${m.minTemp}°C`, emoji: "🥵", cor: "#ff5d62", dicas: [
    "Ventilação máxima no pombal — calor noturno impede recuperação e derrete a forma",
    "Água à vontade e banho liberado no fim da tarde",
    "Atenção redobrada com borrachos: calor noturno atrasa o crescimento",
  ] };
  if (m.chuvaMm > 1) base = { ...base, dicas: [...base.dicas, `🌧️ Chuva prevista na madrugada (${m.chuvaMm}mm): proteja rações e evite bandeja de banho exposta`] };
  return base;
}

/* ------------------------------------------------------------------ */
/* 🌧️ Chuva iminente — nowcast de 15 em 15 min (2h) no pombal          */
/* ------------------------------------------------------------------ */

export type NowcastPasso = { hora: string; mm: number };

export async function buscarNowcastChuva(lat: number, lon: number): Promise<NowcastPasso[]> {
  const p = new URLSearchParams({ latitude: String(lat), longitude: String(lon), minutely_15: "precipitation", forecast_minutely_15: "8", timezone: "America/Sao_Paulo" });
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?${p}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  const m = j?.minutely_15;
  if (!m?.time) throw new Error("Nowcast indisponível");
  return (m.time as string[]).map((t, i) => ({ hora: t.slice(11, 16), mm: Number(m.precipitation?.[i] ?? 0) }));
}

/* ------------------------------------------------------------------ */
/* 🎯 IDP — Índice de Dificuldade da Prova (0–10)                      */
/* ------------------------------------------------------------------ */

export function calcularIdp(input: {
  km: number;
  penVentoMedio: number;      // 0 (a favor) a 20 (contra)
  chuvaMaxMm: number;         // pior cidade
  kp: number | null;
  relevoDesnivelM?: number | null; // máximo-mínimo da altimetria
}): { idp: number; label: string; cor: string; emoji: string; partes: { nome: string; valor: number }[] } {
  const dist = Math.min(10, input.km / 80);                                   // 760km → 9.5
  const vento = 2 + input.penVentoMedio * 0.35;                               // 0→2 · 10→5.5 · 20→9
  const chuva = Math.min(10, 1 + input.chuvaMaxMm * 0.9);                     // 0mm→1 · 8.4mm→8.6
  const kp = input.kp == null ? 2 : input.kp >= 7 ? 10 : input.kp >= 5 ? 7 : input.kp >= 3 ? 4 : 1;
  const d = input.relevoDesnivelM;
  const relevo = d == null ? 3 : d > 800 ? 9 : d > 400 ? 6.5 : d > 150 ? 4 : 2;
  const idp = Math.round((dist * 0.3 + vento * 0.25 + chuva * 0.2 + kp * 0.1 + relevo * 0.15) * 10) / 10;
  const label = idp <= 3 ? "Prova tranquila" : idp <= 5 ? "Dificuldade média" : idp <= 7 ? "Prova dura" : "PROVA BRABA";
  const cor = idp <= 3 ? "#39e58c" : idp <= 5 ? "#fbbf24" : idp <= 7 ? "#f97316" : "#ff5d62";
  const emoji = idp <= 3 ? "🟢" : idp <= 5 ? "🟡" : idp <= 7 ? "🟠" : "🔴";
  return { idp, label, cor, emoji, partes: [{ nome: "Distância", valor: dist }, { nome: "Vento", valor: vento }, { nome: "Chuva", valor: chuva }, { nome: "Kp", valor: kp }, { nome: "Relevo", valor: relevo }] };
}

/* ------------------------------------------------------------------ */
/* 📊 Confiança da previsão (dias até a prova)                         */
/* ------------------------------------------------------------------ */

export function confiancaPrevisao(dias: number): { label: string; cor: string; emoji: string; nota: string } {
  if (dias <= 1) return { label: "ALTA", cor: "#39e58c", emoji: "🟢", nota: "véspera/dia — previsão confiável" };
  if (dias <= 4) return { label: "MÉDIA", cor: "#fbbf24", emoji: "🟡", nota: "bom parâmetro — confira de novo na véspera" };
  if (dias <= 9) return { label: "BAIXA-MÉDIA", cor: "#f97316", emoji: "🟠", nota: "pode mudar bastante — reconfire perto da data" };
  return { label: "BAIXA", cor: "#ff5d62", emoji: "🔴", nota: "visão grossa de longo prazo — reconfire na semana da prova" };
}

/* ------------------------------------------------------------------ */
/* 🌡️ Protocolo de recepção no pombal (clima na hora da chegada)       */
/* ------------------------------------------------------------------ */

export function protocoloRecepcao(temp: number, chuvaMm: number, ventoTipo: string | null): string[] {
  const L: string[] = [];
  if (temp >= 30) L.push(`🥵 ${temp}°C na chegada: eletrólito na água ANTES do bando chegar, sombra na portinola e banho disponível`);
  else if (temp >= 22) L.push(`😌 ${temp}°C na chegada: água limpa + eletrólito leve, recepção padrão`);
  else L.push(`🧊 ${temp}°C na chegada: recepção padrão — mistura de recuperação e ambiente protegido`);
  if (chuvaMm > 1) L.push(`🌧️ Chuva prevista na chegada (${chuvaMm}mm): seque quem chegar molhado e feche correntes de ar`);
  if (ventoTipo === "Vento contra") L.push("🔴 Vêm de frente contra o vento: chegam gastas — Protocolo de Resgate pronto e NADA de ração pesada nas primeiras horas");
  else if (ventoTipo === "Vento a favor") L.push("🟢 Vêm com vento a favor: chegam mais inteiras — hidratação e mistura leve de recuperação");
  return L;
}

/* ------------------------------------------------------------------ */
/* 👟 Corta-Treino — veredito imediato pra soltar treino              */
/* ------------------------------------------------------------------ */

export function vereditoTreino(c: { ventoKmh: number; rajadaKmh: number; chuvaMm: number; wmo: number; temp: number }): {
  nivel: "liberado" | "curto" | "cortar"; titulo: string; emoji: string; cor: string; motivos: string[];
} {
  const motivos: string[] = [];
  let nivel: "liberado" | "curto" | "cortar" = "liberado";
  const pior = (m: string, p: "curto" | "cortar") => { motivos.push(m); if (p === "cortar" || nivel === "liberado") nivel = p === "cortar" ? "cortar" : (nivel === "cortar" ? "cortar" : "curto"); };
  if (c.rajadaKmh >= 45) pior(`💨 Rajada forte (${c.rajadaKmh} km/h) — risco de colisão e extravio`, "cortar");
  else if (c.rajadaKmh >= 30) pior(`💨 Rajada moderada (${c.rajadaKmh} km/h)`, "curto");
  if (c.ventoKmh >= 32) pior(`🌬️ Vento muito forte (${c.ventoKmh} km/h)`, "cortar");
  else if (c.ventoKmh >= 20) pior(`🌬️ Vento forte (${c.ventoKmh} km/h)`, "curto");
  if (c.chuvaMm >= 2) pior(`🌧️ Chuva (${c.chuvaMm} mm)`, "cortar");
  else if (c.chuvaMm > 0.2) pior(`🌧️ Garoa/chuvisco (${c.chuvaMm} mm)`, "curto");
  if (c.wmo >= 95) pior("⛈️ Tempestade na região", "cortar");
  else if (c.wmo >= 61) pior("🌧️ Chuva no radar", "cortar");
  else if (c.wmo >= 51) pior("🌦️ Garoa no radar", "curto");
  if (c.temp >= 34) pior(`🥵 Calor extremo (${c.temp}°C) — estresse térmico em voo`, "cortar");
  else if (c.temp >= 31) pior(`😰 Calor alto (${c.temp}°C)`, "curto");
  if (c.temp > 5 && c.temp < 10) pior(`🥶 Frio (${c.temp}°C)`, "curto");
  if (!motivos.length) motivos.push("✅ Condições tranquilas: vento, chuva e temperatura dentro da faixa boa");
  const map = {
    liberado: { titulo: "TREINO LIBERADO — bom voo!", emoji: "🟢", cor: "#39e58c" },
    curto: { titulo: "SÓ VOLO CURTO ao redor do pombal", emoji: "🟡", cor: "#fbbf24" },
    cortar: { titulo: "CORTA O TREINO HOJE", emoji: "🔴", cor: "#ff5d62" },
  } as const;
  return { nivel, ...map[nivel], motivos };
}

/* ------------------------------------------------------------------ */
/* 🐦 Risco de extravio (0-100%) — estimativa honesta                 */
/* ------------------------------------------------------------------ */

export function riscoExtravio(input: {
  km: number;
  scoreMedio: number | null;   // 0-100 da rota
  idp: number | null;          // 0-10
  kp: number | null;
}): { pct: number; nivel: string; cor: string; emoji: string; fatores: string[] } {
  let r = 2; // base da modalidade
  const fatores: string[] = [];
  if (input.km > 600) { r += 6; fatores.push(`Fundo extremo (${input.km}km): +6% base`); }
  else if (input.km > 300) { r += 3; fatores.push(`Meio fundo (${input.km}km): +3% base`); }
  else fatores.push(`Velocidade (${input.km}km): base baixa`);
  if (input.scoreMedio != null) {
    const add = Math.round((100 - input.scoreMedio) * 0.3);
    r += add; fatores.push(`Clima da rota (${input.scoreMedio}%): +${add}%`);
  }
  if (input.idp != null) { const add = Math.round(input.idp * 0.8); r += add; fatores.push(`Dificuldade IDP ${input.idp.toFixed(1)}: +${add}%`); }
  if (input.kp != null && input.kp >= 5) { r += input.kp >= 7 ? 8 : 4; fatores.push(`Kp ${input.kp.toFixed(2)} (tempestade magnética): +${input.kp >= 7 ? 8 : 4}%`); }
  const pct = Math.max(1, Math.min(85, Math.round(r)));
  const nivel = pct < 10 ? "Baixo" : pct < 20 ? "Moderado" : pct < 35 ? "Alto" : "Muito alto";
  const cor = pct < 10 ? "#39e58c" : pct < 20 ? "#fbbf24" : pct < 35 ? "#f97316" : "#ff5d62";
  const emoji = pct < 10 ? "🟢" : pct < 20 ? "🟡" : pct < 35 ? "🟠" : "🔴";
  return { pct, nivel, cor, emoji, fatores };
}

/* ------------------------------------------------------------------ */
/* 📆 Arquivo ICS — provas no calendário do celular                    */
/* ------------------------------------------------------------------ */

export function gerarIcsProvas(provas: { num: number; cidade: string; estado: string; km: number; dataEmbarque: string; dataSolta: string; diaEmbarque: string; diaSolta: string; cancelada?: boolean }[]): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const dt = (iso: string, h: number, m: number) => iso.replace(/-/g, "") + "T" + pad(h) + pad(m) + "00";
  const linhas: string[] = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Nutri Pombos//Calendario de Provas//PT-BR", "CALSCALE:GREGORIAN", "X-WR-CALNAME:Nutri Pombos — Provas", "X-WR-TIMEZONE:America/Sao_Paulo"];
  provas.filter((p) => !p.cancelada).forEach((p) => {
    const id = `nutripombos-prova-${p.num}@nutripombos`;
    linhas.push(
      "BEGIN:VEVENT",
      `UID:${id}`,
      `DTSTAMP:${dt(new Date().toISOString().slice(0, 10), 12, 0)}`,
      // evento 1: embarque
      `DTSTART;VALUE=DATE:${p.dataEmbarque.replace(/-/g, "")}`,
      `SUMMARY:📦 Embarque Prova #${p.num} — ${p.cidade}/${p.estado} (${p.km}km)`,
      `DESCRIPTION:Pombos no clube para o embarque da prova #${p.num}. Solta em ${p.dataSolta.split("-").reverse().slice(0, 2).join("/")}.`,
      "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", `DESCRIPTION:Lembrete: embarque da prova #${p.num} hoje!`, "END:VALARM",
      "END:VEVENT",
      // evento 2: solta
      "BEGIN:VEVENT",
      `UID:${id}-solta`,
      `DTSTAMP:${dt(new Date().toISOString().slice(0, 10), 12, 0)}`,
      `DTSTART;VALUE=DATE:${p.dataSolta.replace(/-/g, "")}`,
      `SUMMARY:🏁 Prova #${p.num} — solta em ${p.cidade}/${p.estado} (${p.km}km)`,
      `DESCRIPTION:Dia da solta da prova #${p.num}. Confira a rota e as condições no app Nutri Pombos.`,
      "BEGIN:VALARM", "TRIGGER:-PT12H", "ACTION:DISPLAY", `DESCRIPTION:Véspera/dia: prova #${p.num} em ${p.cidade}!`, "END:VALARM",
      "END:VEVENT",
    );
  });
  linhas.push("END:VCALENDAR");
  return linhas.join("\r\n");
}
