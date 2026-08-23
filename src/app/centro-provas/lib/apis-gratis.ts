/**
 * APIs 100% gratuitas, sem chave, com CORS liberado:
 *  - Open-Meteo Forecast   (clima atual + pressão + nascer/pôr do sol)
 *  - Open-Meteo Geocoding  (coordenadas de qualquer cidade)
 *  - NOAA SWPC             (índice Kp geomagnético real)
 *  - OpenStreetMap embed   (mapa real embutido, usado nos componentes)
 */

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
  const p = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "pressure_msl,surface_pressure,cloud_cover,visibility,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m",
    hourly: "pressure_msl",
    past_hours: "4",
    forecast_hours: "1",
    timezone: "America/Sao_Paulo",
  });
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?${p}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  const c = j?.current;
  if (!c) throw new Error("Resposta climática inválida");

  // Tendência barométrica: compara a pressão atual com a de 3 horas atrás
  let tendencia3h = 0;
  try {
    const tempos: string[] = j.hourly?.time || [];
    const pressoes: number[] = j.hourly?.pressure_msl || [];
    if (pressoes.length > 1) {
      let idx = tempos.findIndex((t) => t === c.time);
      if (idx < 0) idx = pressoes.length - 1;
      const idxPassado = Math.max(0, idx - 3);
      tendencia3h = +(pressoes[idx] - pressoes[idxPassado]).toFixed(1);
    }
  } catch { /* mantém 0 */ }

  return {
    pressaoMsl: Math.round(c.pressure_msl),
    pressaoLocal: Math.round(c.surface_pressure),
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
    const ultimo = j[j.length - 1] as (string | number)[];
    const kp = Number(ultimo[1]);
    if (!Number.isFinite(kp)) return null;
    const horaUTC = String(ultimo[0] || "").replace("T", " ").slice(5, 16) + " UTC";
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

export async function buscarSol(lat: number, lon: number, dias = 7): Promise<SolDia[]> {
  const p = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: "sunrise,sunset,daylight_duration",
    forecast_days: String(dias),
    timezone: "America/Sao_Paulo",
  });
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?${p}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  const d = j?.daily;
  if (!d?.time) throw new Error("Resposta inválida");
  return (d.time as string[]).map((data, i) => ({
    data,
    nascer: hhmm(d.sunrise[i] || ""),
    por: hhmm(d.sunset[i] || ""),
    horasLuz: +(((d.daylight_duration?.[i] as number) || 0) / 3600).toFixed(2),
  }));
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
