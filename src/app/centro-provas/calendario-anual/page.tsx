"use client";

import { useState } from "react";
import Link from "next/link";
import { T } from "../theme";

const PERIODOS = [
  {
    id: "muda", titulo: "🪶 Muda das Penas", periodo: "Pós-temporada (Set–Nov)",
    cor: "#A78BFA", objetivo: "Renovar penas • Recuperar organismo • Reconstruir imunidade",
    duracao: "8–12 semanas",
    alimentacao: {
      base: "Cevada 30% + Trigo 25% + Ervilha 20% + Linhaça 10% + Arroz 10% + Girassol 5%",
      principio: "Rica em proteína moderada, minerais e gordura boa para crescimento das penas",
    },
    suplementos: [
      "Levedura de cerveja — vitaminas B para penas",
      "Spirulina — proteína + pigmentação das penas",
      "Alho — imunidade + anti-inflamatório",
      "Vitamina E — antioxidante",
      "Aminoácidos sulfurados — metionina e cistina (keratin)",
      "Ômega 3 / linhaça — qualidade das penas",
    ],
    mix: "3x por semana apenas — não sobrecarregar",
    treino: "Descanso quase total. Voos livres curtos 3x/semana. Sem solturas.",
    sinais: ["Penas novas crescendo uniformemente", "Comportamento calmo", "Bom apetite", "Fezes normais"],
    alertas: ["Penas quebrando = déficit de proteína ou trauma", "Muda lenta = problema sanitário ou nutricional", "Penas opacas = falta de vitaminas e minerais"],
  },
  {
    id: "inverno", titulo: "❄️ Descanso de Inverno", periodo: "Dezembro–Fevereiro",
    cor: "#60A5FA", objetivo: "Baixar estresse • Recuperar hormônios • Preservar longevidade",
    duracao: "10–12 semanas",
    alimentacao: {
      base: "Cevada 40% + Trigo 30% + Sorgo 20% + Milho pequeno 10%",
      principio: "Mais leve — menos energia, sem exigência de performance",
    },
    suplementos: [
      "Organew — probiótico para manter flora intestinal",
      "Vitaminas básicas — B complexo",
      "Eletrólitos — 2x/semana manutenção",
    ],
    mix: "1-2x por semana — manutenção mínima",
    treino: "Menos treino. Banho frequente. Sol e ventilação. Separação por sexo.",
    sinais: ["Pombos calmos e saudáveis", "Penas brilhantes completas", "Peso ideal mantido"],
    alertas: ["Pombal úmido = doença respiratória", "Frio extremo sem proteção = imunidade baixa"],
  },
  {
    id: "pretemporada1", titulo: "🔨 Pré-Temporada — Fase 1", periodo: "Fevereiro–Março (6–8 semanas antes)",
    cor: "#22C55E", objetivo: "Construir pulmão • Fortalecer musculatura • Retomar condicionamento",
    duracao: "4–6 semanas",
    alimentacao: {
      base: "Equilibrada: Milho 35% + Trigo 25% + Sorgo 20% + Arroz c/casca 15% + Ervilha 5%",
      principio: "Balanceada — nem muito energética nem muito leve",
    },
    suplementos: [
      "Bioxan 2mL/L — 3x/semana",
      "Aminomix 1g/L — pós-treino",
      "Mix Final 1g/pombo — 3x/semana",
      "Organew — toda semana",
    ],
    mix: "1g/pombo 3x/semana — construção gradual",
    treino: "Treinos: 10km → 20km → 30km progressivamente. Ritmo constante, sem forçar.",
    sinais: ["Retorno rápido e animado", "Lote coeso no voo", "Apetite aumentando", "Peito ganhando firmeza"],
    alertas: ["Não aumentar distância mais de 30% por semana", "Qualquer retorno atrasado = recuar a distância"],
  },
  {
    id: "pretemporada2", titulo: "💪 Pré-Temporada — Fase 2", periodo: "Março–Abril",
    cor: "#F97316", objetivo: "Construção física avançada • Testar resistência • Afinar forma",
    duracao: "4–6 semanas",
    alimentacao: {
      base: "Mais energética: Milho 40% + Sorgo 20% + Trigo 15% + Girassol 15% + Arroz 10%",
      principio: "Mais gordura boa — construção de reserva energética",
    },
    suplementos: [
      "Bioxan 2mL/L — 3x/semana",
      "Aminomix 1,5g/L — pós-treino",
      "Mix Final 3g/pombo — 3x/semana",
      "Eletrólitos — após treinos médios",
      "Potenfort — conforme necessidade (fundistas)",
    ],
    mix: "3g/pombo 3x/semana — construção avançada",
    treino: "50km → 80km → 120km. Misturar: treinos individuais e em grupo. Variar direções.",
    sinais: ["Peito firme e musculoso", "Retorno rápido mesmo em 120km", "Fezes normais pós-esforço", "Olhar vivo e agressivo"],
    alertas: ["Pombo pesado = reduzir gordura", "Pombo magro = aumentar oleaginosas"],
  },
  {
    id: "velocidade", titulo: "⚡ Temporada — Velocidade (100–300 km)", periodo: "Conforme calendário",
    cor: "#EAB308", objetivo: "Explosão e recuperação rápida",
    duracao: "Semana a semana",
    alimentacao: {
      base: "Milho 40% + Trigo 25% + Sorgo 20% + Ervilha 10% + Girassol 5%",
      principio: "Mais carboidrato, menos gordura — energia rápida e limpa",
    },
    suplementos: [
      "Beta-alanina — baixa dose (explosão)",
      "Beterraba — circulação e óxido nítrico",
      "Creatina — reserva energética muscular",
      "Eletrólitos — obrigatório pós-prova",
    ],
    mix: "5g/pombo — Quinta-feira",
    treino: "Solturas curtas 20-40km. Alta frequência. Individual. Variar direções.",
    sinais: ["Entra voando no pombal", "Quase não circula", "Peito seco e firme", "Olhar agressivo"],
    alertas: ["Pombo gordo não vence velocidade", "Mistura pesada na véspera = catástrofe"],
  },
  {
    id: "meiofundo", titulo: "🏃 Temporada — Meio Fundo (300–700 km)", periodo: "Conforme calendário",
    cor: "#3B82F6", objetivo: "Equilíbrio: potência + resistência",
    duracao: "Semana a semana",
    alimentacao: {
      base: "Milho 40% + Sorgo 20% + Trigo 15% + Arroz c/casca 10% + Girassol 10% + Ervilha 5%",
      principio: "Carboidrato + gordura boa — energia para 300-700km",
    },
    suplementos: [
      "Aminomix 1,5g/L — Terça e Quinta",
      "Bioxan 2mL/L — Dom e Qui",
      "Eletrólitos — pós-prova obrigatório",
      "Organew — toda semana",
    ],
    mix: "7g/pombo — Quinta-feira (DOSE PRINCIPAL)",
    treino: "80-150km em ritmo constante. Voos livres 45-60min. Treinos 3x/semana.",
    sinais: ["Peito elástico — não gordo nem seco", "Penas brilhantes", "Boa recuperação em 48h"],
    alertas: ["Excesso de proteína = pombo pesado", "Sem gordura = sem energia para 700km"],
  },
  {
    id: "fundo", titulo: "🦅 Temporada — Fundo Extremo (700–1200 km)", periodo: "Conforme calendário",
    cor: "#F97316", objetivo: "Máxima resistência e reserva energética",
    duracao: "Semana a semana",
    alimentacao: {
      base: "Milho 35% + Girassol 20% + Amendoim 15% + Linhaça 10% + Trigo 10% + Ervilha 10%",
      principio: "Alta energia lipídica — gorduras boas para voos de 700-1200km",
    },
    suplementos: [
      "Potenfort — 2-3 dias antes (fundistas)",
      "Eletrólitos + glicose — pós-prova",
      "Aminomix 1,5g/L — reconstrução muscular",
      "Bioxan 3mL/L — pós-prova 3 dias",
      "L-carnitina + CoQ10 — energia celular",
    ],
    mix: "10g/pombo — Sexta-feira (dose máxima)",
    treino: "200km → 300km → 500km progressivamente. Menos frequência, mais qualidade. Muito descanso.",
    sinais: ["Musculatura firme sem gordura", "Asa leve e deslizante", "Excelente recuperação", "Intestino funcionando bem"],
    alertas: ["Nunca exagerar distância de treino", "Fundo exige MAIS descanso que velocidade", "Pombo cansado = resultado ruim"],
  },
  {
    id: "recuperacao", titulo: "🔄 Recuperação Pós-Prova", periodo: "Após cada prova",
    cor: "#22C55E", objetivo: "As primeiras 24h são as MAIS IMPORTANTES do calendário",
    duracao: "3–5 dias",
    alimentacao: {
      base: "PRIMEIRAS 24h: Cevada depurativa 60% + Trigo 30% + Arroz c/casca 10%",
      principio: "Leve e depurativa primeiro. Depois volta gradual da energia.",
    },
    suplementos: [
      "⚡ IMEDIATO: Eletrólitos + glicose na água",
      "⚡ IMEDIATO: Aminoácidos — Aminomix 1,5g/L",
      "Bioxan 3mL/L — 3 dias consecutivos",
      "Organew 5g/ração — flora intestinal",
      "Vitamina E — recuperação muscular",
    ],
    mix: "Mínimo 2g/pombo — só a partir do 2º dia",
    treino: "ZERO nas primeiras 48h. Voo livre leve no 3º dia. Treino só após recuperação completa.",
    sinais: ["Fezes voltando ao normal em 24-48h", "Apetite retornando", "Penas limpas", "Comportamento ativo"],
    alertas: ["Pressa para treinar = próxima prova ruim", "Pombal úmido pós-prova = pneumonia", "Sem eletrólitos = recuperação lenta"],
  },
  {
    id: "controle", titulo: "📊 Controle Mensal", periodo: "Todo mês",
    cor: "#94A3B8", objetivo: "Monitorar saúde e ajustar manejo preventivamente",
    duracao: "1 dia/mês",
    alimentacao: {
      base: "Normal do período — sem alteração",
      principio: "Dia de observação e registro, não de mudança",
    },
    suplementos: ["Exame de fezes — parasitas", "Pesagem de todos os pombos", "Verificação das penas"],
    mix: "Normal do período",
    treino: "Dia de avaliação — treino leve apenas",
    sinais: ["Peso estável ou crescente", "Peito firme", "Fezes normais", "Respiração limpa", "Penas brilhantes", "Vitalidade alta"],
    alertas: [
      "⚠️ SINAIS DE EXCESSO DE TREINO:",
      "Peito seco demais — reserva esgotada",
      "Penas opacas — déficit nutricional",
      "Sede excessiva — desidratação crônica",
      "Queda de rendimento — overtraining",
      "Demora na recuperação — sistema exausto",
    ],
  },
];

const SUPLEMENTOS_TOP = [
  { emoji: "🍺", nome: "Levedura de cerveja", eff: "⭐⭐⭐⭐⭐", cat: "Base" },
  { emoji: "🌊", nome: "Spirulina", eff: "⭐⭐⭐⭐⭐", cat: "Base" },
  { emoji: "⚡", nome: "Eletrólitos", eff: "⭐⭐⭐⭐⭐", cat: "Base" },
  { emoji: "💊", nome: "Vitamina E", eff: "⭐⭐⭐⭐", cat: "Base" },
  { emoji: "🐟", nome: "Ômega 3", eff: "⭐⭐⭐⭐", cat: "Base" },
  { emoji: "🧄", nome: "Alho", eff: "⭐⭐⭐⭐", cat: "Base" },
  { emoji: "🦠", nome: "Probióticos (Organew)", eff: "⭐⭐⭐⭐⭐", cat: "Base" },
  { emoji: "🏃", nome: "L-carnitina", eff: "⭐⭐⭐⭐", cat: "Avançado" },
  { emoji: "🔋", nome: "CoQ10", eff: "⭐⭐⭐", cat: "Avançado" },
  { emoji: "💙", nome: "Taurina", eff: "⭐⭐⭐", cat: "Avançado" },
  { emoji: "⚗️", nome: "Beta-alanina", eff: "⭐⭐⭐⭐", cat: "Avançado" },
];

export default function CalendarioAnual() {
  const [sel, setSel] = useState("muda");
  const periodo = PERIODOS.find((p) => p.id === sel)!;

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "18px 12px 48px" }}>
      <div style={{ width: "100%", maxWidth: 760, margin: "0 auto" }}>
        <Link href="/centro-provas" style={{ display: "inline-block", color: T.dim, textDecoration: "none", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px 12px", fontSize: 11, marginBottom: 18 }}>← Voltar</Link>

        <header style={{ background: "linear-gradient(135deg,#1a0a30,#0a1628)", border: "2px solid #A78BFA", borderRadius: 14, padding: 20, marginBottom: 16, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>📅</div>
          <h1 style={{ ...T.h1, margin: 0, fontSize: 22, color: "#A78BFA" }}>Calendário Anual Completo</h1>
          <p style={{ ...T.small, marginTop: 6, color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            Pombos de Fundo Extremo (800–1200 km)<br />
            <b style={{ color: "#A78BFA" }}>Sistema baseado nos campeões da Bélgica, Holanda e Portugal</b>
          </p>
        </header>

        <section style={{ ...T.card, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#A78BFA", marginBottom: 10 }}>🗓️ Selecione o período</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {PERIODOS.map((p) => (
              <button key={p.id} type="button" onClick={() => setSel(p.id)} style={{ textAlign: "left", padding: "10px 14px", borderRadius: 10, cursor: "pointer", background: sel === p.id ? `${p.cor}15` : T.bgInput, border: sel === p.id ? `2px solid ${p.cor}60` : `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12, color: T.white }}>
                <span style={{ width: 4, height: 36, borderRadius: 2, background: p.cor, flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 800, fontSize: 13, color: sel === p.id ? p.cor : T.white }}>{p.titulo}</span>
                  <span style={{ ...T.small, display: "block", marginTop: 1 }}>{p.periodo}</span>
                </span>
                <span style={{ fontSize: 10, color: p.cor, fontWeight: 700, flexShrink: 0 }}>{p.duracao}</span>
              </button>
            ))}
          </div>
        </section>

        <section style={{ background: `${periodo.cor}0D`, border: `2px solid ${periodo.cor}40`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4, color: periodo.cor }}>{periodo.titulo}</div>
          <div style={{ ...T.small, marginBottom: 10 }}>{periodo.periodo} • {periodo.duracao}</div>
          <div style={{ padding: "8px 12px", borderRadius: 8, background: `${periodo.cor}15`, fontSize: 13, color: T.white, fontWeight: 600, marginBottom: 12 }}>🎯 {periodo.objetivo}</div>

          <InfoBox title="🌾 ALIMENTAÇÃO BASE" color={T.gold} background="rgba(234,179,8,0.08)" border="rgba(234,179,8,0.25)">
            <div style={{ fontSize: 13, color: T.white, fontWeight: 700, marginBottom: 4 }}>{periodo.alimentacao.base}</div>
            <div style={{ fontSize: 12, color: T.dim }}>{periodo.alimentacao.principio}</div>
          </InfoBox>

          <InfoBox title="💊 SUPLEMENTAÇÃO" color="#A78BFA" background="rgba(167,139,250,0.08)" border="rgba(167,139,250,0.25)">
            {periodo.suplementos.map((s, i) => (
              <div key={s} style={{ display: "flex", gap: 8, padding: "4px 0", borderBottom: i < periodo.suplementos.length - 1 ? "1px solid rgba(167,139,250,0.1)" : "none" }}>
                <span style={{ color: "#A78BFA", flexShrink: 0 }}>•</span>
                <span style={{ fontSize: 12, color: s.startsWith("⚠️") || s.startsWith("⚡") ? "#FBBF24" : "rgba(255,255,255,0.8)" }}>{s}</span>
              </div>
            ))}
          </InfoBox>

          <div className="period-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(167,139,250,0.1)" }}><div style={{ fontSize: 10, color: "#A78BFA", fontWeight: 800, marginBottom: 3 }}>⚗️ MIX FINAL</div><div style={{ fontSize: 12, color: T.white }}>{periodo.mix}</div></div>
            <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(59,130,246,0.1)" }}><div style={{ fontSize: 10, color: T.blue, fontWeight: 800, marginBottom: 3 }}>🏋️ TREINO</div><div style={{ fontSize: 12, color: T.white }}>{periodo.treino}</div></div>
          </div>

          <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)", marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: T.green, fontWeight: 800, marginBottom: 6 }}>✅ SINAIS NORMAIS DO PERÍODO</div>
            {periodo.sinais.map((s) => <div key={s} style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", padding: "2px 0" }}>✓ {s}</div>)}
          </div>

          <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div style={{ fontSize: 11, color: T.red, fontWeight: 800, marginBottom: 6 }}>⚠️ ALERTAS</div>
            {periodo.alertas.map((a) => <div key={a} style={{ fontSize: 12, color: a.startsWith("⚠️") ? "#FBBF24" : "rgba(255,255,255,0.7)", padding: "2px 0" }}>• {a}</div>)}
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.gold, marginBottom: 12 }}>🏆 Suplementos que Mais Valem a Pena</div>
          <div style={{ fontSize: 12, color: "#22C55E", fontWeight: 700, marginBottom: 8 }}>TOP — Realmente Eficazes</div>
          {SUPLEMENTOS_TOP.filter((s) => s.cat === "Base").map((s) => <SupplementRow key={s.nome} item={s} />)}
          <div style={{ fontSize: 12, color: "#F97316", fontWeight: 700, marginTop: 10, marginBottom: 8 }}>Avançados — Para Fundistas Experientes</div>
          {SUPLEMENTOS_TOP.filter((s) => s.cat === "Avançado").map((s) => <SupplementRow key={s.nome} item={s} />)}
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", fontSize: 12, color: "#FBBF24", lineHeight: 1.7 }}>
            💡 <b style={{ color: T.white }}>Segredo dos grandes campeões:</b><br />
            Recuperação + intestino saudável + hidratação + reserva energética + descanso correto<br />
            <b>Muito mais importante do que excesso de suplementos!</b>
          </div>
        </section>
      </div>
      <style jsx global>{`@media (max-width: 560px) { .period-grid { grid-template-columns: 1fr !important; } } button { font-family: inherit; }`}</style>
    </main>
  );
}

function InfoBox({ title, color, background, border, children }: { title: string; color: string; background: string; border: string; children: React.ReactNode }) {
  return <div style={{ padding: "12px 14px", borderRadius: 10, background, border: `1px solid ${border}`, marginBottom: 10 }}><div style={{ fontSize: 11, color, fontWeight: 800, marginBottom: 7 }}>{title}</div>{children}</div>;
}

function SupplementRow({ item }: { item: { emoji: string; nome: string; eff: string } }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${T.border}`, gap: 8 }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 18 }}>{item.emoji}</span><span style={{ fontSize: 13, fontWeight: 600 }}>{item.nome}</span></div><span style={{ fontSize: 12, whiteSpace: "nowrap" }}>{item.eff}</span></div>;
}
