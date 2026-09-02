"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadConfig } from "../config";
import { T } from "../theme";

type Msg = { from: "user" | "bot"; text: string };
const SUGESTOES = ["Qual mistura ideal para velocidade?", "Mistura para fundo", "Custo para 50 pombos 10 dias", "Meu pombo tem diarreia", "Pombo espirrando muito", "Asa caída", "Não quer comer", "Suplementação pré-prova", "Ajuste de treino", "Mistura para dia quente", "Mistura para dia frio", "Como está meu estoque?", "Analise meu desempenho"];

function resposta(pergunta: string) {
  const q = pergunta.toLowerCase();
  if (q.includes("mistura") && q.includes("velocidade")) return "🌾 **Mistura de referência — Velocidade (10kg):**\n• 4kg milho pequeno\n• 2,5kg trigo\n• 2kg sorgo\n• 1kg ervilha\n• 0,5kg girassol\n\n⚗️ Mix Final do protocolo: **2g/pombo na quinta-feira**. Ajuste ao consumo, clima e condição corporal.";
  if (q.includes("mistura") && q.includes("fundo")) return "🌾 **Mistura de referência — Fundo (10kg):**\n• 3kg milho\n• 2kg ervilha\n• 1,5kg trigo\n• 1,5kg girassol\n• 1kg sorgo\n• 0,5kg amendoim\n• 0,5kg linhaça\n\n⚗️ Mix Final: **3g/pombo** no protocolo de fundo. Faça a transição gradualmente.";
  if (q.includes("custo") || q.includes("custar")) return "💰 **Estimativa para 50 pombos por 10 dias:**\n• Consumo de referência: 30g/pombo/dia\n• Total: 15kg de mistura\n• A R$3,50/kg: **R$52,50**\n• Por pombo: R$1,05\n\nUse a Configuração do Plantel para ajustar o consumo real.";
  if (q.includes("diarreia") || q.includes("fezes")) return "🏥 **Diarreia exige avaliação da causa.**\n\n• Isole a ave e mantenha água limpa\n• Fotografe as fezes e observe apetite, peso e comportamento\n• Suspenda treinos e evite medicar sem diagnóstico\n• Higienize bebedouro e comedouro\n• Procure um veterinário para exame de fezes\n\n🚨 Sangue, fraqueza intensa, desidratação ou piora rápida são urgências.";
  if (q.includes("espirr") || q.includes("respirat")) return "🏥 **Sinais respiratórios:**\n• Isole a ave\n• Reduza poeira e amônia e melhore a ventilação sem corrente de ar\n• Não treine nem administre antibióticos por conta própria\n• Observe secreção, ruído e esforço respiratório\n\n🚨 Respiração de bico aberto, coloração arroxeada ou prostração exigem atendimento imediato.";
  if (q.includes("asa") && (q.includes("caída") || q.includes("caida"))) return "🏥 **Asa caída pode indicar trauma, luxação ou fratura.**\n\n• Restrinja o voo e mantenha a ave em caixa segura\n• Não tente reposicionar ou imobilizar sem treinamento\n• Não ofereça analgésicos humanos\n• Procure um veterinário para exame e, se necessário, radiografia\n\n🚨 Ferida aberta, sangramento ou osso exposto são emergências.";
  if (q.includes("não come") || q.includes("nao come") || q.includes("apetite")) return "🏥 **Perda de apetite:**\n• Isole e mantenha a ave aquecida e tranquila\n• Confira água, papo, boca, fezes e peso\n• Não force alimento ou medicamento se houver dificuldade para engolir\n• Procure avaliação veterinária se persistir ou houver fraqueza\n\n🚨 Dificuldade respiratória, regurgitação contínua ou incapacidade de ficar em pé exigem urgência.";
  if (q.includes("pré-prova") || q.includes("suplement") || q.includes("antes da prova")) return "🏁 **Preparação pré-prova:**\n• 48h antes: hidratação e alimentação compatível com a categoria\n• 24h antes: refeição leve, água limpa e observação individual\n• Evite testar produtos novos perto da prova\n• Mix Final conforme protocolo e consumo configurado\n• Não enceste aves com sinais clínicos ou recuperação incompleta.";
  if (q.includes("treino")) return "🏋️ **Plano semanal de referência:**\n• Domingo: recuperação\n• Segunda: voo livre leve\n• Terça: soltura curta\n• Quarta: treino principal\n• Quinta: descanso e carga\n• Sexta: observação e preparação\n• Sábado: enceste/prova\n\nAumente a distância gradualmente e recue se a recuperação piorar.";
  if (q.includes("quente") || q.includes("calor")) return "🌡️ **Dia quente:**\n• Água limpa em mais de um ponto\n• Alimentação mais leve e redução de excesso de oleaginosas\n• Treino nas primeiras horas da manhã\n• Sombra e ventilação segura\n\n⚠️ Em calor extremo ou aves ofegantes, suspenda o treino.";
  if (q.includes("frio") || q.includes("inverno")) return "❄️ **Dia frio:**\n• Proteja o pombal de correntes de ar e umidade\n• Mantenha água em temperatura ambiente\n• Ajuste energia e quantidade conforme condição corporal\n• Observe perda de peso e sinais respiratórios.";
  if (q.includes("estoque")) return "📦 **Controle de estoque:**\n• Mantenha margem para pelo menos 30 dias\n• Guarde grãos em local seco, ventilado e protegido de roedores\n• Descarte produtos com mofo, odor ou umidade\n• Registre validade e consumo médio.";
  if (q.includes("desempenho") || q.includes("performance") || q.includes("resultado")) return "📊 **Análise de desempenho:**\n• Compare velocidade, colocação e recuperação\n• Separe resultados por distância e clima\n• Observe consistência em pelo menos quatro semanas\n• Use o Histórico de Provas e o Dia da Prova para registrar dados reais.";
  if (q.includes("oi") || q.includes("olá") || q.includes("ola")) return "Olá! 🐦 Sou o **NutriBot**, assistente offline do Nutri Pombos. Posso ajudar com protocolos, alimentação, treino, custos e orientações seguras de triagem.";
  return "🤖 Posso ajudar com:\n\n🌾 **Nutrição e misturas**\n🏥 **Triagem segura de saúde**\n🌤️ **Ajustes para clima**\n💰 **Estimativas de custo**\n🏋️ **Treinos e protocolos**\n\nEscolha uma sugestão ou reformule sua pergunta.";
}

export default function NutriBot() {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: "Olá! Sou o **NutriBot** 🤖\n\nSou o assistente offline do Nutri Pombos. Posso ajudar com alimentação, protocolos, treino, custos e triagem segura.\n\nEscolha uma sugestão ou faça sua pergunta!" }]);
  const [input, setInput] = useState("");
  const [plantel, setPlantel] = useState(0);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => { setPlantel(loadConfig().quantidadePombos); }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = (value: string) => { const text = value.trim(); if (!text) return; setMsgs(m => [...m, { from: "user", text }]); window.setTimeout(() => setMsgs(m => [...m, { from: "bot", text: resposta(text) }]), 350); };

  return <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "18px 12px 50px" }}><div style={{ maxWidth: 760, margin: "0 auto" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}><div><h1 style={T.h1}>🤖 NutriBot</h1><p style={{ ...T.small, marginTop: 4 }}>Assistente offline de columbofilia • Plantel: {plantel} pombos</p></div><Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link></div>
    <div style={{ padding: "9px 12px", marginBottom: 10, borderRadius: 9, color: T.blue, background: `${T.blue}12`, border: `1px solid ${T.blue}44`, fontSize: 11 }}>ℹ️ Orientações de saúde são informativas e não substituem diagnóstico veterinário.</div>
    <section style={{ ...T.card, minHeight: "65vh", display: "flex", flexDirection: "column" }}><div style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>{msgs.map((m, i) => <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start", gap: 8, marginBottom: 10 }}>{m.from === "bot" && <span style={{ width: 32, height: 32, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: "50%", background: T.gold }}>🤖</span>}<div style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: m.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", color: m.from === "user" ? T.bg : T.white, background: m.from === "user" ? T.gold : "#ffffff0d" }}>{render(m.text)}</div></div>)}<div ref={bottom}/></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, paddingTop: 12, marginBottom: 12, borderTop: `1px solid ${T.border}` }}>{SUGESTOES.map(s => <button key={s} onClick={() => send(s)} style={{ padding: "6px 9px", borderRadius: 20, cursor: "pointer", fontSize: 11, color: T.dim, background: T.bgInput, border: `1px solid ${T.border}` }}>{s}</button>)}</div>
      <form onSubmit={e => { e.preventDefault(); send(input); setInput(""); }} style={{ display: "flex", gap: 8 }}><input value={input} onChange={e => setInput(e.target.value)} placeholder="Pergunte ao NutriBot..." style={{ ...T.input, flex: 1 }}/><button type="submit" style={T.btnSm}>Enviar</button></form>
    </section>
  </div><style jsx global>{`button,input{font-family:inherit}`}</style></main>;
}
function render(text: string) { return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => part.startsWith("**") && part.endsWith("**") ? <b key={i} style={{ color: T.gold }}>{part.slice(2, -2)}</b> : <span key={i}>{part}</span>); }
