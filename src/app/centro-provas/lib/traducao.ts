/**
 * 🌐 Tradução de conteúdo — MyMemory API (gratuita, sem chave) + dicionário
 * columófilo embutido + cache em localStorage. Fallback: texto original (PT).
 */
const CACHE_KEY = "nutripombos-trad-cache-v1";
const VOCAB: Record<string, Record<string, string>> = {
  es: {
    "prova": "carrera", "provas": "carreras", "Próxima prova": "Próxima carrera",
    "Rota da prova (cidades)": "Ruta de la carrera (ciudades)", "Calendário de provas": "Calendario de carreras",
    "Dia da prova": "Día de la carrera", "pombo": "paloma", "pombos": "palomas",
    "Pombos": "Palomas", "Pombo": "Paloma", "pombal": "palomar", "Pombal": "Palomar",
    "soltura": "suelta", "Soltura": "Suelta", "solta": "suelta", "Solta": "Suelta",
    "embarque": "embarque", "Encestamento": "Encestamiento", "encestar": "encestar",
    "chegada": "llegada", "Chegada": "Llegada", "vento": "viento", "Vento": "Viento",
    "chuva": "lluvia", "Chuva": "Lluvia", "clima": "clima", "Clima": "Clima",
    "temporada": "temporada", "Temporada": "Temporada", "plantel": "plantel", "Plantel": "Plantel",
    "histórico": "histórico", "Histórico": "Histórico", "treinos": "entrenamientos",
    "Treinos": "Entrenamientos", "treino": "entrenamiento", "Treino": "Entrenamiento",
    "acasalamento": "apareamiento", "Acasalamento": "Apareamiento", "vendas": "ventas",
    "Vendas": "Ventas", "nutrição": "nutrición", "Nutrição": "Nutrición",
    "mistura": "mezcla", "Mistura": "Mezcla", "sementes": "semillas", "alertas": "alertas",
    "Alertas": "Alertas", "centro": "centro", "Centro": "Centro", "ranking": "ranking",
    "Ranking": "Ranking", "campeão": "campeón", "Campeão": "Campeón", "resgate": "rescate",
    "Resgate": "Rescate", "madruzada": "madrugada", "velocidade": "velocidad",
    "Velocidade": "Velocidad", "colocação": "clasificación", "distância": "distancia",
    "Distância": "Distancia", "previsão": "previsión", "Previsão": "Previsión",
    "radar": "radar", "Radar": "Radar", "satélite": "satélite", "mapa": "mapa", "Mapa": "Mapa",
    "bússola": "brújula", "Bússola": "Brújula", "alarme": "alarma", "Alarme": "Alarma",
    "relatório": "informe", "Relatório": "Informe", "gráficos": "gráficos",
    "Gráficos": "Gráficos", "crônicas": "crónicas", "Crônicas": "Crónicas",
  },
  en: {
    "prova": "race", "provas": "races", "Próxima prova": "Next race",
    "Rota da prova (cidades)": "Race route (cities)", "Calendário de provas": "Race calendar",
    "Dia da prova": "Race day", "pombo": "pigeon", "pombos": "pigeons",
    "Pombos": "Pigeons", "Pombo": "Pigeon", "pombal": "loft", "Pombal": "Loft",
    "soltura": "release", "Soltura": "Release", "solta": "release", "Solta": "Release",
    "embarque": "basketing", "Encestamento": "Basketing", "encestar": "basket",
    "chegada": "arrival", "Chegada": "Arrival", "vento": "wind", "Vento": "Wind",
    "chuva": "rain", "Chuva": "Rain", "clima": "weather", "Clima": "Weather",
    "temporada": "season", "Temporada": "Season", "plantel": "team", "Plantel": "Team",
    "histórico": "history", "Histórico": "History", "treinos": "training",
    "Treinos": "Training", "treino": "training", "Treino": "Training",
    "acasalamento": "mating", "Acasalamento": "Mating", "vendas": "sales",
    "Vendas": "Sales", "nutrição": "nutrition", "Nutrição": "Nutrition",
    "mistura": "mix", "Mistura": "Mix", "sementes": "seeds", "alertas": "alerts",
    "Alertas": "Alerts", "centro": "center", "Centro": "Center", "ranking": "ranking",
    "Ranking": "Ranking", "campeão": "champion", "Campeão": "Champion", "resgate": "rescue",
    "Resgate": "Rescue", "madrugada": "dawn", "velocidade": "speed",
    "Velocidade": "Speed", "colocação": "placing", "distância": "distance",
    "Distância": "Distance", "previsão": "forecast", "Previsão": "Forecast",
    "radar": "radar", "Radar": "Radar", "satélite": "satellite", "mapa": "map", "Mapa": "Map",
    "bússola": "compass", "Bússola": "Compass", "alarme": "alarm", "Alarme": "Alarm",
    "relatório": "report", "Relatório": "Report", "gráficos": "charts",
    "Gráficos": "Charts", "crônicas": "stories", "Crônicas": "Stories",
  },
};

function lerCache(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
}
function gravarCache(c: Record<string, string>) {
  try {
    const atual = lerCache();
    const junto = { ...atual, ...c };
    const chaves = Object.keys(junto);
    if (chaves.length > 3000) chaves.slice(0, 500).forEach((k) => delete junto[k]); // limita tamanho
    localStorage.setItem(CACHE_KEY, JSON.stringify(junto));
  } catch { /* storage cheio — ignora */ }
}

let fila: Record<string, string> = {};
let timer: number | undefined;

/** Traduz um texto PT→idioma. Síncrono quando já está no dicionário/cache; senão dispara a busca e devolve o original por enquanto. */
export function traduz(txt: string, idioma: "pt" | "es" | "en"): string {
  if (idioma === "pt" || !txt) return txt;
  const chave = `${idioma}:${txt}`;
  const cache = lerCache();
  if (cache[chave]) return cache[chave];
  if (VOCAB[idioma][txt]) { return VOCAB[idioma][txt]; }
  // agenda a tradução remota (lote)
  fila[chave] = txt;
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => void processarFila(idioma), 350);
  return txt; // por enquanto original — a página será reavisa quando chegar
}

async function processarFila(idioma: "pt" | "es" | "en") {
  const itens = Object.entries(fila);
  fila = {};
  if (!itens.length) return;
  const resultados: Record<string, string> = {};
  // MyMemory: 1 string por chamada; agrupamos até 8 em paralelo com separador seguro
  const LOTE = 8;
  for (let i = 0; i < itens.length; i += LOTE) {
    const pedaco = itens.slice(i, i + LOTE);
    await Promise.all(pedaco.map(async ([chave, texto]) => {
      try {
        const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=pt|${idioma}`);
        if (!r.ok) return;
        const j = await r.json();
        const t = j?.responseData?.translatedText;
        if (typeof t === "string" && t && !/^MYMEMORY WARNING/i.test(t)) resultados[chave] = t;
      } catch { /* offline — fica original */ }
    }));
  }
  if (Object.keys(resultados).length) {
    gravarCache(resultados);
    try { window.dispatchEvent(new Event("nutripombos:traduziu")); } catch { /* ignora */ }
  }
}
