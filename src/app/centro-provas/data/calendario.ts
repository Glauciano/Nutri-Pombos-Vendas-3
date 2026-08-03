export type Prova = {
  id?: string;
  num: number;
  cidade: string;
  estado: string;
  km: number;
  categoria: string;
  dataEmbarque: string;
  diaEmbarque: string;
  dataSolta: string;
  diaSolta: string;
  latitude?: number;
  longitude?: number;
  adiada?: boolean;
  cancelada?: boolean;
  obs?: string;
};

export type ProvaCalendario = Prova & {
  id: string;
  adiada: boolean;
  cancelada: boolean;
  obs: string;
};

const CALENDARIO_KEY = "nutripombos-calendario-2026-v1";

export const CALENDARIO_2026: Prova[] = [
  { num: 1, cidade: "Cravinhos", estado: "SP", km: 148, categoria: "Adultos", dataEmbarque: "2026-05-02", diaEmbarque: "Sábado", dataSolta: "2026-05-03", diaSolta: "Domingo", latitude: -21.34, longitude: -47.73 },
  { num: 2, cidade: "Jardinópolis", estado: "SP", km: 174, categoria: "Adultos", dataEmbarque: "2026-05-16", diaEmbarque: "Sábado", dataSolta: "2026-05-17", diaSolta: "Domingo", latitude: -21.02, longitude: -47.76 },
  { num: 3, cidade: "São Joaquim da Barra", estado: "SP", km: 218, categoria: "Adultos", dataEmbarque: "2026-05-30", diaEmbarque: "Sábado", dataSolta: "2026-05-31", diaSolta: "Domingo", latitude: -20.58, longitude: -47.86 },
  { num: 4, cidade: "Igarapava", estado: "SP", km: 283, categoria: "Adultos", dataEmbarque: "2026-06-13", diaEmbarque: "Sábado", dataSolta: "2026-06-14", diaSolta: "Domingo", latitude: -20.04, longitude: -47.75 },
  { num: 5, cidade: "Uberaba", estado: "MG", km: 330, categoria: "Adultos", dataEmbarque: "2026-06-26", diaEmbarque: "Sexta", dataSolta: "2026-06-28", diaSolta: "Domingo", latitude: -19.75, longitude: -47.93 },
  { num: 6, cidade: "Araguari", estado: "MG", km: 463, categoria: "Adultos", dataEmbarque: "2026-07-09", diaEmbarque: "Quinta", dataSolta: "2026-07-11", diaSolta: "Sábado", latitude: -18.65, longitude: -48.19 },
  { num: 7, cidade: "Catalão", estado: "GO", km: 490, categoria: "Adultos", dataEmbarque: "2026-07-23", diaEmbarque: "Quinta", dataSolta: "2026-07-25", diaSolta: "Sábado", latitude: -18.17, longitude: -47.95 },
  { num: 8, cidade: "Campo Alegre", estado: "GO", km: 555, categoria: "Adultos", dataEmbarque: "2026-08-06", diaEmbarque: "Quinta", dataSolta: "2026-08-08", diaSolta: "Sábado", latitude: -17.63, longitude: -47.78 },
  { num: 9, cidade: "Cristalina", estado: "GO", km: 650, categoria: "Adultos", dataEmbarque: "2026-08-13", diaEmbarque: "Quinta", dataSolta: "2026-08-15", diaSolta: "Sábado", latitude: -16.77, longitude: -47.61 },
  { num: 10, cidade: "Brasília", estado: "DF", km: 795, categoria: "Adultos", dataEmbarque: "2026-08-27", diaEmbarque: "Quinta", dataSolta: "2026-08-30", diaSolta: "Domingo", latitude: -15.79, longitude: -47.88 },
];

const CALENDARIO_ORIGINAL = CALENDARIO_2026.map((prova) => ({ ...prova }));

export function classificarProva(km: number) {
  if (km <= 300) return { tipo: "Velocidade", cor: "#eab308", emoji: "⚡" };
  if (km <= 600) return { tipo: "Meio Fundo", cor: "#3b82f6", emoji: "🏃" };
  return { tipo: "Fundo", cor: "#f97316", emoji: "🦅" };
}

export function diasParaProva(data: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(`${data}T00:00:00`);
  return Math.ceil((alvo.getTime() - hoje.getTime()) / 86_400_000);
}

export function uid() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
}

export function diaDaSemana(data: string) {
  if (!data) return "";
  const nomes = ["Domingo", "Segunda Feira", "Terça Feira", "Quarta Feira", "Quinta Feira", "Sexta Feira", "Sábado"];
  return nomes[new Date(`${data}T12:00:00`).getDay()];
}

function seedCalendario(): ProvaCalendario[] {
  return CALENDARIO_ORIGINAL.map((prova) => ({
    ...prova,
    id: prova.id ?? `prova-2026-${prova.num}`,
    adiada: prova.adiada ?? false,
    cancelada: prova.cancelada ?? false,
    obs: prova.obs ?? "",
  }));
}

export function loadCalendario(): ProvaCalendario[] {
  if (typeof window === "undefined") return seedCalendario();
  try {
    const raw = window.localStorage.getItem(CALENDARIO_KEY);
    return raw ? JSON.parse(raw) as ProvaCalendario[] : seedCalendario();
  } catch {
    return seedCalendario();
  }
}

export function saveCalendario(provas: ProvaCalendario[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(CALENDARIO_KEY, JSON.stringify(provas));
}

export function atualizarCalendarioGlobal(provas: ProvaCalendario[]) {
  CALENDARIO_2026.splice(0, CALENDARIO_2026.length, ...provas);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("nutripombos:calendario", { detail: provas }));
}

export function resetCalendario() {
  if (typeof window !== "undefined") window.localStorage.removeItem(CALENDARIO_KEY);
  const seed = seedCalendario();
  atualizarCalendarioGlobal(seed);
  saveCalendario(seed);
  return seed;
}
