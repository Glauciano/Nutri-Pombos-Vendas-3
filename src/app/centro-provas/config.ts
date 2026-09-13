export const CONFIG_KEY = "nutripombos-config-v1";

export interface ConfigPlantel {
  consumoDiario: number;
  quantidadePombos: number;
  condicaoCorporal: string;
  /** Localização do pombal do usuário (se não definido, usa São Paulo como padrão) */
  pombalNome?: string;
  pombalLat?: number;
  pombalLon?: number;
  /** Horário da soltura: automático (minutos após o nascer do sol) ou manual */
  soltaModo?: "auto" | "manual";
  soltaMinAposNascer?: number;
  soltaHoraManual?: string;
  /** Chave do Google Maps Embed API (opcional — habilita mapa de satélite na soltura) */
  mapaApiKey?: string;
  /** 🎚️ Pesos do score (multiplicadores 0–2; 1 = padrão do app) */
  scorePesos?: { chuva: number; vento: number; temp: number; rajada: number; vis: number; kp: number };
}

export const DEFAULT_CONFIG: ConfigPlantel = {
  consumoDiario: 30,
  quantidadePombos: 20,
  condicaoCorporal: "Ideal",
  soltaModo: "auto",
  soltaMinAposNascer: 20,
  scorePesos: { chuva: 1, vento: 1, temp: 1, rajada: 1, vis: 1, kp: 1 },
};

export function loadConfig(): ConfigPlantel {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) } as ConfigPlantel;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: ConfigPlantel) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}
