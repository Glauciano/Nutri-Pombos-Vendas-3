/**
 * 🌐 Tradução de conteúdo — dicionário columófilo + MyMemory API (grátis) + cache.
 * Uso: t("texto") → string (síncrono: dicionário/memória; senão agenda API e avisa
 * com o evento "nutripombos:traduziu" pra página re-renderizar com o resultado).
 */
const CACHE_KEY = "nutripombos-trad-cache-v1";
export const EVENTO_TRAD = "nutripombos:traduziu";

const VOCAB: Record<string, Record<string, string>> = {
  es: {
    "prova": "carrera", "provas": "carreras", "Próxima prova": "Próxima carrera",
    "Rota da prova (cidades)": "Ruta de la carrera (ciudades)", "Calendário de provas": "Calendario de carreras",
    "Gerenciar Calendário": "Gestionar calendario", "Dia da prova": "Día de la carrera",
    "pombo": "paloma", "pombos": "palomas", "Pombos": "Palomas", "Pombo": "Paloma",
    "pombal": "palomar", "Pombal": "Palomar", "soltura": "suelta", "Soltura": "Suelta",
    "solta": "suelta", "Solta": "Suelta", "Encestamento": "Encestamiento",
    "chegada": "llegada", "Chegada": "Llegada", "vento": "viento", "Vento": "Viento",
    "chuva": "lluvia", "Chuva": "Lluvia", "clima": "clima", "Clima": "Clima",
    "temporada": "temporada", "Temporada": "Temporada", "plantel": "plantel", "Plantel": "Plantel",
    "histórico": "histórico", "Histórico": "Histórico", "treinos": "entrenamientos",
    "Treinos": "Entrenamientos", "treino": "entrenamiento", "Treino": "Entrenamiento",
    "acasalamento": "apareamiento", "Acasalamento": "Apareamiento", "vendas": "ventas",
    "Vendas de pombos": "Ventas de palomas", "nutrição": "nutrición", "Nutrição": "Nutrición",
    "mistura": "mezcla", "Mistura semanal (16 sementes)": "Mezcla semanal (16 semillas)",
    "sementes": "semillas", "alertas": "alertas", "Central de alertas": "Central de alertas",
    "ranking": "ranking", "Ranking do plantel": "Ranking del plantel",
    "campeão": "campeón", "Cartão do campeão": "Cartón del campeón", "resgate": "rescate",
    "velocidade": "velocidad", "colocação": "clasificación",
    "distância": "distancia", "Distância": "Distancia", "previsão": "previsión",
    "Previsão do Tempo": "Previsión del tiempo", "radar": "radar", "satélite": "satélite",
    "mapa": "mapa", "Mapa de Solturas": "Mapa de sueltas", "bússola": "brújula",
    "alarme": "alarma", "relatório": "informe", "Relatório da temporada": "Informe de la temporada",
    "gráficos": "gráficos", "Gráficos da temporada": "Gráficos de la temporada",
    "crônicas": "crónicas", "Crônicas da temporada": "Crónicas de la temporada",
    "Geomagnético": "Geomagnético", "Pressão": "Presión", "GPS e chip": "GPS y chip",
    "Fotoperíodo (Darkness)": "Fotoperíodo (Darkness)", "Custos e ROI": "Costos y ROI",
    "Seleção de equipe": "Selección de equipo", "Modo Telão (clube)": "Modo Pantalla (club)",
    "Primeiros passos": "Primeros pasos", "Sobre o app e fontes": "Sobre la app y fuentes",
    "Assistente de acasalamento": "Asistente de apareamiento",
    "Comparador de pombos": "Comparador de palomas", "Ficha de avaliação": "Ficha de evaluación",
    "Checklist de encestamento": "Checklist de encestamiento",
    "Pombo Ás Oficial (FCI)": "Paloma As Oficial (FCI)",
    "Simulador de Vento": "Simulador de viento", "Geodésica e Relevo": "Geodésica y relieve",
    "Clima × Desempenho": "Clima × Desempeño", "Performance": "Performance",
    "Calculadora do plantel": "Calculadora del plantel", "Planejamento anual": "Planificación anual",
    "Calendário nutricional": "Calendario nutricional", "Configuração": "Configuración",
    "Mix energético (lote)": "Mix energético (lote)", "Protocolos gerais": "Protocolos generales",
    "Velocidade": "Velocidad", "Meio fundo": "Medio fondo", "fundo extremo": "fondo extremo",
    "Sistema de viuvez": "Sistema de viudez", "Controle sanitário": "Control sanitario",
    "Treinamento de orientação": "Entrenamiento de orientación",
    "Radar de Índice K-Geomagnético & Tempestades Solares": "Radar de índice K-geomagnético y tormentas solares",
    "Anatomia": "Anatomía", "Asa": "Ala", "Olho": "Ojo", "Classificação": "Clasificación",
    "Recuperação": "Recuperación", "Suplementação": "Suplementación", "Receitas": "Recetas",
    "Alerta de madrugada": "Alerta de madrugada", "Extravio": "Extravío",
    "Visão geral": "General", "Ferramentas": "Herramientas", "Manejo": "Manejo",
    "Competição": "Competición", "Acompanhamento": "Seguimiento", "Ajuda": "Ayuda",
  },
  en: {
    "prova": "race", "provas": "races", "Próxima prova": "Next race",
    "Rota da prova (cidades)": "Race route (cities)", "Calendário de provas": "Race calendar",
    "Gerenciar Calendário": "Manage calendar", "Dia da prova": "Race day",
    "pombo": "pigeon", "pombos": "pigeons", "Pombos": "Pigeons", "Pombo": "Pigeon",
    "pombal": "loft", "Pombal": "Loft", "soltura": "release", "Soltura": "Release",
    "solta": "release", "Solta": "Release", "Encestamento": "Basketing",
    "chegada": "arrival", "Chegada": "Arrival", "vento": "wind", "Vento": "Wind",
    "chuva": "rain", "Chuva": "Rain", "clima": "weather", "Clima": "Weather",
    "temporada": "season", "Temporada": "Season", "plantel": "team", "Plantel": "Team",
    "histórico": "history", "Histórico": "History", "treinos": "training",
    "Treinos": "Training", "treino": "training", "Treino": "Training",
    "acasalamento": "mating", "Acasalamento": "Mating", "vendas": "sales",
    "Vendas de pombos": "Pigeon sales", "nutrição": "nutrition", "Nutrição": "Nutrition",
    "mistura": "mix", "Mistura semanal (16 sementes)": "Weekly mix (16 seeds)",
    "sementes": "seeds", "alertas": "alerts", "Central de alertas": "Alerts center",
    "ranking": "ranking", "Ranking do plantel": "Team ranking",
    "campeão": "champion", "Cartão do campeão": "Champion card", "resgate": "rescue",
    "velocidade": "speed", "colocação": "placing",
    "distância": "distance", "Distância": "Distance", "previsão": "forecast",
    "Previsão do Tempo": "Weather forecast", "radar": "radar", "satélite": "satellite",
    "mapa": "map", "Mapa de Solturas": "Release map", "bússola": "compass",
    "alarme": "alarm", "relatório": "report", "Relatório da temporada": "Season report",
    "gráficos": "charts", "Gráficos da temporada": "Season charts",
    "crônicas": "stories", "Crônicas da temporada": "Season stories",
    "Geomagnético": "Geomagnetic", "Pressão": "Pressure", "GPS e chip": "GPS & chip",
    "Fotoperíodo (Darkness)": "Photoperiod (Darkness)", "Custos e ROI": "Costs & ROI",
    "Seleção de equipe": "Team selection", "Modo Telão (clube)": "Big screen (club)",
    "Primeiros passos": "First steps", "Sobre o app e fontes": "About the app & sources",
    "Assistente de acasalamento": "Mating assistant",
    "Comparador de pombos": "Pigeon comparator", "Ficha de avaliação": "Assessment sheet",
    "Checklist de encestamento": "Basketing checklist",
    "Pombo Ás Oficial (FCI)": "Official Ace Pigeon (FCI)",
    "Simulador de Vento": "Wind simulator", "Geodésica e Relevo": "Geodesics & terrain",
    "Clima × Desempenho": "Weather × Performance", "Performance": "Performance",
    "Calculadora do plantel": "Team calculator", "Planejamento anual": "Annual planning",
    "Calendário nutricional": "Nutrition calendar", "Configuração": "Settings",
    "Mix energético (lote)": "Energy mix (batch)", "Protocolos gerais": "General protocols",
    "Velocidade": "Speed", "Meio fundo": "Middle distance", "fundo extremo": "extreme long distance",
    "Sistema de viuvez": "Widowhood system", "Controle sanitário": "Sanitary control",
    "Treinamento de orientação": "Orientation training",
    "Radar de Índice K-Geomagnético & Tempestades Solares": "K-geomagnetic index & solar storms radar",
    "Anatomia": "Anatomy", "Asa": "Wing", "Olho": "Eye", "Classificação": "Classification",
    "Recuperação": "Recovery", "Suplementação": "Supplementation", "Receitas": "Recipes",
    "Alerta de madrugada": "Dawn alert", "Extravio": "Missing",
    "Visão geral": "Overview", "Ferramentas": "Tools", "Manejo": "Management",
    "Competição": "Competition", "Acompanhamento": "Tracking", "Ajuda": "Help",
  },
};

// memória (evita ler localStorage a cada label)
let memoria: Record<string, string> | null = null;
function cache(): Record<string, string> {
  if (memoria) return memoria;
  if (typeof window === "undefined") return {};
  try { memoria = JSON.parse(window.localStorage.getItem(CACHE_KEY) || "{}"); } catch { memoria = {}; }
  return memoria!;
}
function gravar(novos: Record<string, string>) {
  const c = cache();
  Object.assign(c, novos);
  try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch { /* cheio */ }
}

let fila = new Map<string, string>();
let timer: number | undefined;
let aguardando = new Set<string>();

/** Traduz PT→idioma. Síncrono p/ dicionário+cache; senão agenda API (e avisa quando chegar). */
export function traduz(txt: string, idioma: "pt" | "es" | "en"): string {
  if (idioma === "pt" || !txt) return txt;
  const dic = VOCAB[idioma];
  if (dic && dic[txt]) return dic[txt];
  const chave = `${idioma}:${txt}`;
  const c = cache();
  if (c[chave]) return c[chave];
  if (typeof window !== "undefined" && !aguardando.has(chave)) {
    aguardando.add(chave);
    fila.set(chave, txt);
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => void processarFila(idioma), 300);
  }
  return txt; // ainda sem tradução — quem chamou re-renderiza no evento
}

async function processarFila(idioma: "es" | "en") {
  const itens = Array.from(fila.entries());
  fila = new Map();
  if (!itens.length) return;
  const resultados: Record<string, string> = {};
  const LOTE = 6;
  for (let i = 0; i < itens.length; i += LOTE) {
    await Promise.all(itens.slice(i, i + LOTE).map(async ([chave, texto]) => {
      try {
        const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=pt|${idioma}`);
        if (!r.ok) return;
        const j = await r.json();
        const t = j?.responseData?.translatedText;
        if (typeof t === "string" && t && !/^MYMEMORY WARNING/i.test(t)) resultados[chave] = t;
      } catch { /* offline */ }
    }));
  }
  itens.forEach(([chave]) => aguardando.delete(chave));
  if (Object.keys(resultados).length) {
    gravar(resultados);
    try { window.dispatchEvent(new Event(EVENTO_TRAD)); } catch { /* ignora */ }
  }
}
