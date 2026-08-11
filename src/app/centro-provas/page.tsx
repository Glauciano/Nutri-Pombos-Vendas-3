"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CALENDARIO_2026, atualizarCalendarioGlobal, classificarProva, diasParaProva, loadCalendario } from "./data/calendario";
import { T } from "./theme";
import MapaSolturas from "./components/MapaSolturas";
import PrevisaoTempo from "./components/PrevisaoTempo";

type Aba = "hub" | "calendario" | "detalhe" | "mapa" | "clima" | "velocidade";
type Modo = "vel" | "tempo" | "dist";

function fmt(data: string) { const [a, m, d] = data.split("-"); return `${d}/${m}/${a}`; }
function segundosEntre(a: string, b: string) {
  const toSeconds = (v: string) => { const [h = 0, m = 0, s = 0] = v.split(":").map(Number); return h * 3600 + m * 60 + s; };
  let result = toSeconds(b) - toSeconds(a);
  if (result < 0) result += 86400;
  return result;
}
function formatarTempo(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.round(total % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function classeVelocidade(mmin: number) {
  if (mmin >= 1400) return { label: "🏆 Excepcional", cor: "#EAB308" };
  if (mmin >= 1300) return { label: "🥇 Excelente", cor: "#22C55E" };
  if (mmin >= 1200) return { label: "🥈 Muito boa", cor: "#3B82F6" };
  if (mmin >= 1100) return { label: "🥉 Boa", cor: "#A78BFA" };
  if (mmin >= 1000) return { label: "📊 Regular", cor: "#F97316" };
  if (mmin >= 900) return { label: "⚠️ Abaixo da média", cor: "#FBBF24" };
  return { label: "❌ Muito baixa", cor: "#EF4444" };
}

function CalcVelocidade({ onBack }: { onBack: () => void }) {
  const [modo, setModo] = useState<Modo>("vel");
  const [distKm, setDistKm] = useState(300);
  const [hSolta, setHSolta] = useState("07:00:00");
  const [hCheg, setHCheg] = useState("09:45:00");
  const [velMmin, setVelMmin] = useState(1200);
  const [velKmh, setVelKmh] = useState(72);
  const [tempoH, setTempoH] = useState(2);
  const [tempoMin, setTempoMin] = useState(45);
  const [tempoSeg, setTempoSeg] = useState(0);

  const segundosVoo = segundosEntre(hSolta, hCheg);
  const minutosVoo = segundosVoo / 60;
  const velCalcMmin = minutosVoo > 0 ? Math.round(distKm * 1000 / minutosVoo) : 0;
  const velCalcKmh = segundosVoo > 0 ? distKm / (segundosVoo / 3600) : 0;
  const tempoTotalSeg = tempoH * 3600 + tempoMin * 60 + tempoSeg;
  const distCalc = velMmin * (tempoTotalSeg / 60) / 1000;
  const tempoCalcSeg = velKmh > 0 ? distKm / velKmh * 3600 : 0;
  const classe = classeVelocidade(velCalcMmin || velMmin);

  return <div>
    <button onClick={onBack} style={{ ...T.btnGhost, marginBottom: 16 }}>← Voltar</button>
    <div style={{ marginBottom: 20 }}><h1 style={T.h1}>⚡ Calculadora de Velocidade</h1><p style={{ ...T.small, marginTop: 4 }}>Calcule velocidade, tempo ou distância da prova em HH:MM:SS</p></div>
    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>{([{ k: "vel", l: "⚡ Calcular Velocidade" }, { k: "tempo", l: "⏱️ Calcular Tempo" }, { k: "dist", l: "📏 Calcular Distância" }] as const).map(m => <button key={m.k} onClick={() => setModo(m.k)} style={{ flex: 1, padding: "10px 5px", borderRadius: 10, cursor: "pointer", fontSize: 11, fontWeight: modo === m.k ? 800 : 500, background: modo === m.k ? T.gold : T.bgCard, color: modo === m.k ? T.bg : T.dim, border: modo === m.k ? `2px solid ${T.gold}` : `1px solid ${T.border}` }}>{m.l}</button>)}</div>

    {modo === "vel" && <>
      <div style={T.card}><CardTitle>⚡ Velocidade — Distância ÷ Tempo de voo</CardTitle><Field label="📏 Distância da prova (km)"><input type="number" min={1} value={distKm} onChange={e => setDistKm(+e.target.value)} style={{ ...T.input, textAlign: "center", fontSize: 22, fontWeight: 900 }} /></Field>
        <div className="two-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}><Field label="🚀 Hora de soltura (HH:MM:SS)"><input type="time" step="1" value={hSolta} onChange={e => setHSolta(e.target.value)} style={{ ...T.input, textAlign: "center", fontSize: 17, color: T.gold, fontWeight: 800 }} /></Field><Field label="🏠 Hora de chegada (HH:MM:SS)"><input type="time" step="1" value={hCheg} onChange={e => setHCheg(e.target.value)} style={{ ...T.input, textAlign: "center", fontSize: 17, color: T.green, fontWeight: 800 }} /></Field></div>
        {segundosVoo > 0 && <div style={{ background: `${classe.cor}0D`, border: `1px solid ${classe.cor}66`, borderRadius: 14, padding: 16 }}><div style={{ ...T.small, marginBottom: 9 }}>⏱️ Tempo de voo: <b style={{ color: T.white }}>{formatarTempo(segundosVoo)}</b> ({minutosVoo.toFixed(2)} min)</div><div className="two-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}><Metric label="m/min" value={velCalcMmin.toLocaleString("pt-BR")} color={classe.cor} /><Metric label="km/h" value={velCalcKmh.toFixed(1)} color={classe.cor} /></div><div style={{ textAlign: "center", color: classe.cor, fontSize: 18, fontWeight: 900, marginTop: 12 }}>{classe.label}</div></div>}
      </div>
      <div style={T.card}><CardTitle>📊 Tabela de Referência de Velocidade</CardTitle>{[["≥ 1.400 m/min", "≥ 84 km/h", "🏆 Excepcional", "#EAB308"], ["1.300–1.399", "78–83 km/h", "🥇 Excelente", "#22C55E"], ["1.200–1.299", "72–77 km/h", "🥈 Muito boa", "#3B82F6"], ["1.100–1.199", "66–71 km/h", "🥉 Boa", "#A78BFA"], ["1.000–1.099", "60–65 km/h", "📊 Regular", "#F97316"], ["900–999", "54–59 km/h", "⚠️ Abaixo da média", "#FBBF24"], ["< 900", "< 54 km/h", "❌ Muito baixa", "#EF4444"]].map(r => <div key={r[0]} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 11, color: r[3] }}><b>{r[0]} <span style={{ color: T.dim, fontWeight: 400 }}>• {r[1]}</span></b><b>{r[2]}</b></div>)}</div>
    </>}

    {modo === "tempo" && <div style={T.card}><CardTitle>⏱️ Tempo previsto — Distância ÷ Velocidade</CardTitle><Field label="📏 Distância (km)"><input type="number" value={distKm} onChange={e => setDistKm(+e.target.value)} style={{ ...T.input, textAlign: "center", fontSize: 22, fontWeight: 900 }} /></Field><Field label="⚡ Velocidade esperada (km/h)"><input type="number" value={velKmh} onChange={e => setVelKmh(+e.target.value)} style={{ ...T.input, textAlign: "center", fontSize: 22, fontWeight: 900 }} /></Field><div style={{ padding: 18, borderRadius: 14, textAlign: "center", background: "#3b82f61a", border: "1px solid #3b82f666" }}><div style={T.small}>Tempo estimado de voo</div><div style={{ color: T.blue, fontSize: 42, fontWeight: 900 }}>{formatarTempo(tempoCalcSeg)}</div><div style={{ ...T.small, marginTop: 5 }}>formato HH:MM:SS</div></div></div>}

    {modo === "dist" && <div style={T.card}><CardTitle>📏 Distância percorrida — Velocidade × Tempo</CardTitle><Field label="⚡ Velocidade (m/min)"><input type="number" value={velMmin} onChange={e => setVelMmin(+e.target.value)} style={{ ...T.input, textAlign: "center", fontSize: 22, fontWeight: 900 }} /></Field><div className="three-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}><Field label="Horas"><input type="number" min={0} value={tempoH} onChange={e => setTempoH(+e.target.value)} style={{ ...T.input, textAlign: "center" }} /></Field><Field label="Minutos"><input type="number" min={0} max={59} value={tempoMin} onChange={e => setTempoMin(+e.target.value)} style={{ ...T.input, textAlign: "center" }} /></Field><Field label="Segundos"><input type="number" min={0} max={59} value={tempoSeg} onChange={e => setTempoSeg(+e.target.value)} style={{ ...T.input, textAlign: "center" }} /></Field></div><div style={{ padding: 18, borderRadius: 14, textAlign: "center", background: "#a78bfa1a", border: "1px solid #a78bfa66" }}><div style={T.small}>Distância percorrida em {formatarTempo(tempoTotalSeg)}</div><div style={{ color: "#A78BFA", fontSize: 52, fontWeight: 900 }}>{distCalc.toFixed(1)}</div><div style={{ color: "#A78BFA" }}>km</div></div></div>}

    <div style={T.card}><CardTitle>🔄 Conversor Rápido m/min ↔ km/h</CardTitle><div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}><Field label="m/min"><input type="number" value={velMmin} onChange={e => { const v = +e.target.value; setVelMmin(v); setVelKmh(+(v * .06).toFixed(1)); }} style={{ ...T.input, textAlign: "center", color: T.blue }} /></Field><span>⇄</span><Field label="km/h"><input type="number" value={velKmh} onChange={e => { const v = +e.target.value; setVelKmh(v); setVelMmin(Math.round(v / .06)); }} style={{ ...T.input, textAlign: "center", color: T.green }} /></Field></div></div>
  </div>;
}

export default function CentroProvas() {
  const [aba, setAba] = useState<Aba>("hub");
  const [provaNum, setProvaNum] = useState<number | null>(null);
  const [, setCalendarVersion] = useState(0);

  useEffect(() => {
    atualizarCalendarioGlobal(loadCalendario());
    setCalendarVersion((value) => value + 1);
    const sync = () => setCalendarVersion((value) => value + 1);
    window.addEventListener("nutripombos:calendario", sync);
    return () => window.removeEventListener("nutripombos:calendario", sync);
  }, []);

  const hoje = new Date().toISOString().slice(0, 10);
  const proxima = CALENDARIO_2026.find(p => p.dataSolta >= hoje) ?? CALENDARIO_2026.at(-1);
  const passadas = CALENDARIO_2026.filter(p => p.dataSolta < hoje).length;
  const provaAtual = CALENDARIO_2026.find(p => p.num === provaNum);

  if (aba === "velocidade") return <Shell><CalcVelocidade onBack={() => setAba("hub")} /></Shell>;
  if (aba === "mapa") return <Shell><button onClick={() => setAba("hub")} style={{ ...T.btnGhost, marginBottom: 16 }}>← Voltar</button><MapaSolturas /></Shell>;
  if (aba === "clima") return <Shell><button onClick={() => setAba("hub")} style={{ ...T.btnGhost, marginBottom: 16 }}>← Voltar</button><PrevisaoTempo /></Shell>;
  if (aba === "detalhe" && provaAtual) return <Shell><Detalhe prova={provaAtual} onBack={() => setAba("calendario")} onClima={() => setAba("clima")} onMapa={() => setAba("mapa")} /></Shell>;
  if (aba === "calendario") return <Shell><Calendario passadas={passadas} proximaNum={proxima?.num} onBack={() => setAba("hub")} onOpen={num => { setProvaNum(num); setAba("detalhe"); }} /></Shell>;

  return <Shell>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
      <div><h1 style={T.h1}>🏁 Centro de Provas</h1><p style={{ ...T.small, marginTop: 4 }}>Todos os módulos do Nutri Pombos em um só lugar</p></div>
      <Link href="/" style={{ ...T.btnGhost, textDecoration: "none", whiteSpace: "nowrap" }}>← Nutri Pombos</Link>
    </div>
    {proxima && <Proxima prova={proxima} onOpen={() => { setProvaNum(proxima.num); setAba("detalhe"); }} />}
    <div className="two-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}><Stat label="📅 Provas 2026" value={CALENDARIO_2026.length} info={`${passadas} realizadas`} color={T.gold} /><Stat label="✅ Realizadas" value={passadas} info={`${CALENDARIO_2026.length - passadas} restantes`} color={T.green} /></div>
    <div style={{ ...T.card, background: "#eab3080f", borderColor: "#eab30855" }}><div style={{ display: "flex", justifyContent: "space-between", color: T.gold, fontWeight: 800, fontSize: 13 }}><span>📊 Temporada 2026</span><span>{passadas}/{CALENDARIO_2026.length}</span></div><div style={{ height: 9, borderRadius: 6, background: "#ffffff14", marginTop: 10 }}><div style={{ height: "100%", width: `${passadas / CALENDARIO_2026.length * 100}%`, background: T.gold, borderRadius: 6 }} /></div></div>

    <ModuleGroup title="🏁 Competição e Provas" subtitle="Calendário, clima, cálculos e operação da prova">
      <Module icon="📅" title="Calendário de Provas" description="Etapas e protocolo por prova" color={T.gold} onClick={() => setAba("calendario")} />
      <Link href="/centro-provas/gerenciar-calendario"><Module icon="🛠️" title="Gerenciar Calendário" description="Adicionar, editar e adiar" color="#f59e0b" /></Link>
      <Module icon="⚡" title="Calculadora de Velocidade" description="m/min, km/h e HH:MM:SS" color="#A78BFA" onClick={() => setAba("velocidade")} />
      <Module icon="🗺️" title="Mapa de Solturas" description="Rotas e cidades interativas" color={T.blue} onClick={() => setAba("mapa")} />
      <Module icon="🌤️" title="Previsão do Tempo" description="Clima, vento e sete dias" color={T.green} onClick={() => setAba("clima")} />
      <Link href="/centro-provas/simulador-vento"><Module icon="🌪️" title="Simulador de Vento" description="Aerodinâmica, deriva e tempo" color="#38bdf8" /></Link>
      <Link href="/centro-provas/geodesica"><Module icon="🗺️" title="Geodésica e Relevo" description="Cálculo ortodrômico de rota" color="#eab308" /></Link>
      <Link href="/centro-provas/geomagnetico"><Module icon="🌤️" title="Radar Geomagnético Kp" description="Tempestade solar e bússola" color="#f97316" /></Link>
      <Link href="/centro-provas/clima-avancado"><Module icon="🌤️" title="Radar Aero-Clima & Pressão" description="Barômetro, teto e cisalhamento" color="#22c55e" /></Link>
      <Link href="/centro-provas/dia-prova"><Module icon="🔴" title="Dia da Prova" description="Chegadas e constatação" color="#ef4444" /></Link>
      <Link href="/centro-provas/gps-chip"><Module icon="📡" title="GPS & Chip" description="ETS/RFID e importação" color="#06b6d4" /></Link>
    </ModuleGroup>

    <ModuleGroup title="📈 Desempenho e Treino" subtitle="Histórico, evolução, orientação e motivação">
      <Link href="/centro-provas/historico"><Module icon="📜" title="Histórico de Provas" description="Resultados, vitórias e pódios" color="#eab308" /></Link>
      <Link href="/centro-provas/performance"><Module icon="📊" title="Centro de Performance" description="Índices e evolução" color="#39e58c" /></Link>
      <Link href="/centro-provas/pombo-as"><Module icon="🏆" title="Pombo Ás Oficial (FCI)" description="Ranking das melhores 5 provas" color="#eab308" /></Link>
      <Link href="/centro-provas/classificacao"><Module icon="🏆" title="Classificação por Km" description="Coeficiente de aptidão e seleção" color="#eab308" /></Link>
      <Link href="/centro-provas/simulador-cruzamento"><Module icon="🧬" title="Simulador Genético" description="Cruzamentos, cores e vigor híbrido" color="#22c55e" /></Link>
      <Link href="/centro-provas/olho"><Module icon="👁️" title="Análise de Olho (Eye-Sign)" description="Teoria do Círculo de Adaptação" color="#a78bfa" /></Link>
      <Link href="/centro-provas/asa"><Module icon="🪶" title="Índice da Asa e Muda" description="10 penas primárias de voo" color="#f97316" /></Link>
      <Link href="/centro-provas/certificado"><Module icon="📜" title="Certificado de Leilão" description="Pedigree para vendas e leilão" color="#eab308" /></Link>
      <Link href="/centro-provas/treinamentos"><Module icon="🏋️" title="Treinamentos" description="Distância, tempo e velocidade" color="#60a5fa" /></Link>
      <Link href="/centro-provas/treinamento-orientacao"><Module icon="🧭" title="Treinamento de Orientação" description="Progressão e retorno seguro" color="#22c55e" /></Link>
      <Link href="/centro-provas/viuvez"><Module icon="❤️" title="Sistema de Viuvez" description="Casais, ciclos e checklist" color="#f472b6" /></Link>
    </ModuleGroup>

    <ModuleGroup title="🏆 Protocolos por Categoria" subtitle="Planos de competição, alimentação e recuperação">
      <Link href="/centro-provas/protocolos"><Module icon="🏆" title="Protocolos de Competição" description="Velocidade, meio fundo e fundo" color="#eab308" /></Link>
      <Link href="/centro-provas/velocidade-extrema"><Module icon="🚀" title="Velocidade Extrema" description="Sprint e mistura leve" color="#ef4444" /></Link>
      <Link href="/centro-provas/meio-fundo"><Module icon="🏃" title="Meio Fundo" description="Estratégia para 300–700km" color="#3b82f6" /></Link>
      <Link href="/centro-provas/fundo-extremo"><Module icon="🦅" title="Fundo Extremo" description="Resistência para 800–1200km" color="#f97316" /></Link>
      <Link href="/centro-provas/calculadora"><Module icon="🧮" title="Calculadora do Plantel" description="Sementes, mix e consumo" color="#fb7185" /></Link>
    </ModuleGroup>

    <ModuleGroup title="🌾 Nutrição e Saúde" subtitle="Receitas, suplementos, prevenção e rotina">
      <Link href="/centro-provas/receitas"><Module icon="🧪" title="Receitas Caseiras" description="Preparações personalizadas" color="#06b6d4" /></Link>
      <Link href="/centro-provas/suplementacao"><Module icon="💊" title="Suplementação" description="Produtos e planejamento" color="#a78bfa" /></Link>
      <Link href="/centro-provas/carbo-lipideo"><Module icon="🧪" title="Abastecimento Carbo-Lipídeo" description="Proporção Glicogênio vs Gordura" color="#38bdf8" /></Link>
      <Link href="/centro-provas/osmolaridade"><Module icon="💧" title="Hidratação & Osmolaridade" description="Evitar sede no cesto de enceste" color="#38bdf8" /></Link>
      <Link href="/centro-provas/guia-terapeutico"><Module icon="🏥" title="Guia Terapêutico" description="Triagem e orientação segura" color="#22c55e" /></Link>
      <Link href="/centro-provas/controle-sanitario"><Module icon="💉" title="Controle Sanitário" description="Vacinas, exames e farmácia" color="#ef4444" /></Link>
      <Link href="/centro-provas/alertas"><Module icon="🔔" title="Central de Alertas" description="Rotina e avisos dinâmicos" color="#f59e0b" /></Link>
      <Link href="/centro-provas/resgate"><Module icon="🚨" title="Protocolo de Resgate" description="Triagem de aves extraviadas" color="#ef4444" /></Link>
    </ModuleGroup>

    <ModuleGroup title="📆 Planejamento e Configuração" subtitle="Visões anuais e parâmetros do plantel">
      <Link href="/centro-provas/calendario-anual"><Module icon="🗓️" title="Calendário Nutricional" description="Muda, competição e recuperação" color="#c084fc" /></Link>
      <Link href="/centro-provas/planejamento-anual"><Module icon="📆" title="Planejamento Anual" description="Eventos e visão mensal" color="#f472b6" /></Link>
      <Link href="/centro-provas/configuracao"><Module icon="⚙️" title="Configuração do Plantel" description="Consumo, quantidade e condição" color="#94a3b8" /></Link>
      <Link href="/centro-provas/fotoperiodo"><Module icon="💡" title="Fotoperíodo (Darkness)" description="Controle de luz do pombal" color="#38bdf8" /></Link>
      <Link href="/centro-provas/custos"><Module icon="💸" title="Gestão Financeira & ROI" description="Custo do plantel e por pombo" color="#eab308" /></Link>
    </ModuleGroup>

    <ModuleGroup title="🤖 Assistentes" subtitle="Ajuda inteligente online e offline">
      <Link href="/centro-provas/nutribot"><Module icon="💬" title="NutriBot Offline" description="Respostas rápidas sem API" color="#f7bd00" /></Link>
    </ModuleGroup>
  </Shell>;
}

function Shell({ children }: { children: React.ReactNode }) { return <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "28px 24px 64px" }}><div style={{ maxWidth: 1120, margin: "0 auto" }}>{children}</div><style jsx global>{`button,input,select{font-family:inherit}button{color:inherit}.module-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}.module-grid>a{display:flex;text-decoration:none}.module-grid>a>button{height:100%}@media(max-width:1050px){.module-grid{grid-template-columns:1fr 1fr!important}}@media(max-width:680px){.module-grid,.two-grid{grid-template-columns:1fr!important}.three-grid{grid-template-columns:1fr 1fr 1fr!important}}`}</style></main>; }
function CardTitle({ children }: { children: React.ReactNode }) { return <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 14 }}>{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div style={{ marginBottom: 12 }}><div style={{ ...T.label, marginBottom: 6 }}>{label}</div>{children}</div>; }
function Metric({ label, value, color }: { label: string; value: string; color: string }) { return <div style={{ textAlign: "center", padding: 14, borderRadius: 10, background: `${color}15` }}><div style={{ ...T.small }}>{label}</div><div style={{ fontSize: 38, lineHeight: 1.1, color, fontWeight: 900 }}>{value}</div></div>; }
function Stat({ label, value, info, color }: { label: string; value: number; info: string; color: string }) { return <div style={{ ...T.card, marginBottom: 0 }}><div style={T.small}>{label}</div><div style={{ color, fontSize: 27, fontWeight: 900 }}>{value}</div><div style={T.small}>{info}</div></div>; }
function ModuleGroup({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <section style={{ marginTop: 22 }}><div style={{ marginBottom: 10 }}><h2 style={{ margin: 0, fontSize: 15, color: T.white }}>{title}</h2><p style={{ ...T.small, margin: "3px 0 0" }}>{subtitle}</p></div><div className="module-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{children}</div></section>; }
function Module({ icon, title, description, color, onClick }: { icon: string; title: string; description: string; color: string; onClick?: () => void }) { return <button onClick={onClick} style={{ width: "100%", minHeight: 96, padding: 14, borderRadius: 14, background: "linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018))", border: `1px solid ${color}30`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left", boxShadow: "0 10px 28px rgba(0,0,0,.08)" }}><span style={{ width: 42, height: 42, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 11, background: `${color}16`, fontSize: 21 }}>{icon}</span><span style={{ flex: 1, minWidth: 0 }}><b style={{ display: "block", color, fontSize: 13, marginBottom: 3 }}>{title}</b><span style={{ ...T.small, fontSize: 10.5, lineHeight: 1.4 }}>{description}</span></span><span style={{ color: T.dim2, fontSize: 18 }}>›</span></button>; }

function Proxima({ prova, onOpen }: { prova: (typeof CALENDARIO_2026)[number]; onOpen: () => void }) { const dias = diasParaProva(prova.dataSolta); const c = classificarProva(prova.km); return <div style={{ ...T.card, background: `${c.cor}0d`, border: `2px solid ${c.cor}55` }}><div style={{ color: c.cor, fontSize: 10, fontWeight: 900 }}>📍 PRÓXIMA PROVA</div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}><div><div style={{ fontSize: 20, fontWeight: 900 }}>#{prova.num} {prova.cidade} — {prova.estado}</div><div style={{ ...T.small, marginTop: 4 }}>{c.emoji} {c.tipo} • {prova.km}km • {fmt(prova.dataSolta)}</div></div><div style={{ color: c.cor, fontSize: 40, fontWeight: 900, textAlign: "center" }}>{Math.max(0, dias)}<div style={{ ...T.small, fontSize: 10 }}>dias</div></div></div><button onClick={onOpen} style={{ ...T.btn, marginTop: 12 }}>📋 Ver Protocolo Completo →</button></div>; }

function Calendario({ passadas, proximaNum, onBack, onOpen }: { passadas: number; proximaNum?: number; onBack: () => void; onOpen: (n: number) => void }) { return <div><button onClick={onBack} style={{ ...T.btnGhost, marginBottom: 16 }}>← Voltar</button><h1 style={T.h1}>📅 Calendário 2026</h1><p style={{ ...T.small, margin: "4px 0 15px" }}>Campeonato Adultos — clique para ver protocolo</p><div style={{ ...T.card, borderColor: "#eab30855" }}><b style={{ color: T.gold }}>Progresso da Temporada <span style={{ float: "right" }}>{passadas}/10</span></b><div style={{ height: 7, background: "#ffffff14", marginTop: 10, borderRadius: 5 }}><div style={{ width: `${passadas * 10}%`, height: "100%", background: T.gold }} /></div></div>{CALENDARIO_2026.map(p => { const d = diasParaProva(p.dataSolta); const c = classificarProva(p.km); const passou = d < 0; return <button key={p.num} onClick={() => onOpen(p.num)} style={{ width: "100%", marginBottom: 7, padding: "13px 14px", background: T.bgCard, border: `1px solid ${p.num === proximaNum ? c.cor : T.border}`, borderLeft: `4px solid ${passou ? T.green : c.cor}`, borderRadius: "0 11px 11px 0", textAlign: "left", cursor: "pointer", opacity: passou ? .7 : 1 }}><b>#{p.num} &nbsp;{p.cidade} — {p.estado}</b>{p.num === proximaNum && <em style={{ color: T.bg, background: T.gold, borderRadius: 10, padding: "2px 7px", fontSize: 9, marginLeft: 8 }}>PRÓXIMA</em>}<span style={{ float: "right", color: passou ? T.green : c.cor, fontWeight: 900 }}>{passou ? "✓" : `${d}d`}</span><div style={{ ...T.small, marginTop: 5, color: c.cor }}>{c.emoji} {c.tipo} • {p.km}km &nbsp; 📦 {fmt(p.dataEmbarque)} &nbsp; 🏁 {fmt(p.dataSolta)}</div></button>; })}</div>; }

function Detalhe({ prova, onBack, onClima, onMapa }: { prova: (typeof CALENDARIO_2026)[number]; onBack: () => void; onClima: () => void; onMapa: () => void }) { const c = classificarProva(prova.km); const dias = diasParaProva(prova.dataSolta); const mix = c.tipo === "Velocidade" ? "5g" : c.tipo === "Meio Fundo" ? "7g" : "10g"; const protocolo = [[7,"📋","Iniciar protocolo e ajustar alimentação"],[5,"🌾",`Mistura específica ${c.tipo}`],[3,"⚗️",`Carga energética e Mix Final ${mix}/pombo`],[2,"📊","Verificar condição física"],[1,"⭐","Embarque: alimentação leve e motivação"],[0,"🏁","Dia da prova: acompanhar o retorno"]] as const; return <div><button onClick={onBack} style={{ ...T.btnGhost, marginBottom: 16 }}>← Voltar</button><div style={{ ...T.card, border: `2px solid ${c.cor}55`, background: `${c.cor}0d` }}><small style={{ color: c.cor }}>PROVA #{prova.num}</small><h1 style={{ ...T.h1, marginTop: 5 }}>{prova.cidade} — {prova.estado}</h1><p style={T.small}>{c.emoji} {c.tipo} • {prova.km}km</p></div><div className="two-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><div style={T.card}>📦 Embarque<br/><b>{fmt(prova.dataEmbarque)}</b><div style={{ color: T.gold }}>{prova.diaEmbarque}</div></div><div style={T.card}>🏁 Solta<br/><b>{fmt(prova.dataSolta)}</b><div style={{ color: T.gold }}>{prova.diaSolta}</div></div></div><div style={T.card}><CardTitle>🌾 Alimentação Recomendada</CardTitle><div style={{ color: c.cor, fontWeight: 800 }}>{c.emoji} {c.tipo}</div><p style={T.small}>Mistura energética ajustada à distância e recuperação planejada.</p><div style={{ color: "#A78BFA" }}>⚗️ Mix Final: {mix}/pombo</div></div><div style={T.card}><CardTitle>📋 Protocolo de Preparação</CardTitle>{protocolo.map(([d, icon, action]) => <div key={d} style={{ padding: 10, marginBottom: 6, borderRadius: 9, border: `1px solid ${dias === d ? T.gold : T.border}`, background: dias === d ? "#eab30812" : "#ffffff05", opacity: dias < d ? .55 : 1 }}><b style={{ color: dias === d ? T.gold : T.dim }}>{icon} {d === 0 ? "DIA DA PROVA" : `${d} dias antes`}{dias === d ? " ← AGORA" : ""}</b><div style={{ ...T.small, marginTop: 3 }}>{action}</div></div>)}</div><button onClick={onClima} style={{ ...T.btn, marginBottom: 8 }}>🌤️ Ver Previsão do Tempo</button><button onClick={onMapa} style={{ ...T.btnGhost, width: "100%" }}>🗺️ Ver no Mapa de Solturas</button></div>; }
