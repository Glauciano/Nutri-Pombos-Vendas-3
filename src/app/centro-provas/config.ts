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
}

export const DEFAULT_CONFIG: ConfigPlantel = {
  consumoDiario: 30,
  quantidadePombos: 20,
  condicaoCorporal: "Ideal",
  soltaModo: "auto",
  soltaMinAposNascer: 20,
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
