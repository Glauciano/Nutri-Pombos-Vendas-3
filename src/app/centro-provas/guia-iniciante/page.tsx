"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type Usuario = { id: number; nome: string; email: string; plano: string; acessoAtivo: boolean; acessoAte: string | null; createdAt: string };

export default function GuiaIniciante() {
  const [passo, setPasso] = useState(1);
  const etapas = [
    {
      t: "🏠 1. Seu pombal",
      emoji: "🏠",
      txt: "O pombal é o coração do app: cadastre a localização (pelo nome da cidade — o mais fácil) em Configuração. Rota, clima, nascer do sol e radar passam a usar SUA posição automaticamente. Depois ajuste o horário de soltura (automático = nascer do sol + X minutos).",
      links: [["⚙️ Configuração", "/centro-provas/configuracao"], ["🎓 Primeiros Passos", "/centro-provas/primeiros-passos"]],
    },
    {
      t: "🐦 2. Cadastre seus pombos",
      emoji: "🐦",
      txt: "Todo o sistema gira em torno dos seus pombos: anilha, nome, sexo, cor — e o PEDIGREE (pai e mãe), que alimenta a Genética dos 75%, o Assistente de Acasalamento e o Comparador. Adicione foto (botãozinho + na lista) pra ficha valorizar.",
      links: [["🐦 Pombos", "/centro-provas/pombos"], ["📋 Ficha de avaliação", "/centro-provas/ficha-pombo"]],
    },
    {
      t: "📅 3. Calendário de provas",
      emoji: "📅",
      txt: "Cadastre as provas da temporada: cidade (ESCOLHA NA LISTA que aparece ao digitar — garante o mapa certo!), distância e datas de embarque/solta. Tudo no app se alimenta deste calendário: painel, alertas, rota, telão, notificações.",
      links: [["📅 Calendário", "/centro-provas/gerenciar-calendario"]],
    },
    {
      t: "🛣️ 4. A Rota da Prova (seu cockpit)",
      emoji: "🛣️",
      txt: "Na véspera, abra a Rota da Prova: clima cidade a cidade, vento a favor/contra em cada trecho, chuva, melhor janela de soltura, hora prevista de chegada, radar de chuva AO VIVO e comparação sábado × domingo. É a página que vai te acompanhar no dia da corrida.",
      links: [["🛣️ Rota da Prova", "/centro-provas/rota"]],
    },
    {
      t: "🕊️ 5. Sexta: equipe e checklist",
      emoji: "🕊️",
      txt: "Na véspera do embarque: escolha quem vai no cesto na Seleção de Equipe (com nota de forma de cada um) e siga o Checklist de Encestamento pra não esquecer nada — água nos cestos, anilhas conferidas, mix na medida.",
      links: [["🕊️ Seleção de Equipe", "/centro-provas/equipe"], ["📋 Checklist", "/centro-provas/checklist"]],
    },
    {
      t: "🏁 6. Dia da prova",
      emoji: "🏁",
      txt: "No dia: ligue o 🔔 Alarme de Chegada (avisa 15 min antes da hora prevista), a 🧭 Bússola da Chegada mostra o lado do céu pra vigiar, e o radar mostra a chuva em tempo real na rota. Registre os retornos no Dia da Prova ou cole o resultado do clube no importador do Histórico.",
      links: [["🏁 Dia da Prova", "/centro-provas/dia-prova"], ["📜 Histórico", "/centro-provas/historico"]],
    },
    {
      t: "🥚 7. Criando: genética e ninhadas",
      emoji: "🥚",
      txt: "Na entressafra, o app vira assistente de criador: a Genética dos 75% mostra quanto sangue do campeão vai pro filhote, o Assistente de Acasalamento sugere casais (consanguinidade + eye-sign), e o Controle de Ninhadas registra ovos, nascidos e anilhas.",
      links: [["🧬 Genética 75%", "/centro-provas/genetica75"], ["💘 Acasalamento", "/centro-provas/acasalamento"], ["🥚 Ninhadas", "/centro-provas/ninhadas"]],
    },
    {
      t: "📊 8. Acompanhe a temporada",
      emoji: "📊",
      txt: "Ranking do plantel, comparador de pombos, gráficos, crônicas das provas e o Relatório da Temporada (PDF pronto pra imprimir). Quanto mais você registra, mais essas ferramentas revelam.",
      links: [["🏆 Ranking", "/centro-provas/ranking"], ["📊 Relatório", "/centro-provas/relatorio-temporada"]],
    },
    {
      t: "🌾 9. Nutrição sem mistério",
      emoji: "🌾",
      txt: "A Mistura Semanal dá a receita de sementes de cada dia (em lote pra pesar uma vez) e o Mix Energético o complemento em pó com doses reais (1,5–3g/pombo). A calculadora usa o consumo do SEU plantel. Domingo e sábado: sem mix — energia vem dos grãos.",
      links: [["🌾 Mistura Semanal", "/centro-provas/mistura-semanal"], ["⚗️ Mix Energético", "/centro-provas/mix-energetico"]],
    },
    {
      t: "⚕️ 10. Saúde com responsabilidade",
      emoji: "⚕️",
      txt: "Guia terapêutico e suplementação são referências de manejo — doses de medicamentos são SEMPRE com veterinário. Para pombo que não voltou: Modo Extravio calcula pra onde o vento do dia provavelmente desviou. Resgate: protocolo de recepção do exausto.",
      links: [["💊 Guia Terapêutico", "/centro-provas/guia-terapeutico"], ["🚨 Modo Extravio", "/centro-provas/alertas"]],
    },
  ];

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🎓 Guia do Iniciante</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Do primeiro pombo à primeira prova — 10 passos com os links certos pra cada etapa</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginBottom: 16 }}>
          {etapas.map((_, i) => (
            <button key={i} type="button" onClick={() => setPasso(i + 1)} style={{ padding: "9px 2px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 900, color: passo === i + 1 ? "#0b1426" : "#9aa8bc", background: passo === i + 1 ? "#f7bd00" : passo > i + 1 ? "#39e58c22" : "#1b283c", border: `1.5px solid ${passo === i + 1 ? "#f7bd00" : passo > i + 1 ? "#39e58c66" : "#31415a"}` }}>
              {passo > i + 1 ? "✓" : i + 1}
            </button>
          ))}
        </div>

        <section style={{ ...T.card, borderColor: `${T.gold}55`, background: `${T.gold}0d` }}>
          <div style={{ fontSize: 40 }}>{etapas[passo - 1].emoji}</div>
          <h2 style={{ margin: "8px 0 10px", fontSize: 20 }}>{etapas[passo - 1].t.replace(/^\S+\s/, "")}</h2>
          <div style={{ ...T.small, fontSize: 13, lineHeight: 1.9 }}>{etapas[passo - 1].txt}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            {etapas[passo - 1].links.map(([lbl, href]) => (
              <Link key={href} href={href} style={{ ...T.btnGhost, textDecoration: "none", fontSize: 12 }}>{lbl} →</Link>
            ))}
          </div>
        </section>

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button type="button" disabled={passo === 1} onClick={() => setPasso((p) => p - 1)} style={{ ...T.btnGhost, flex: 1, opacity: passo === 1 ? 0.4 : 1 }}>← Anterior</button>
          <button type="button" disabled={passo === etapas.length} onClick={() => setPasso((p) => p + 1)} style={{ ...T.btn, flex: 2, opacity: passo === etapas.length ? 0.4 : 1 }}>{passo === etapas.length ? "🎓 Pronto pra voar!" : "Próximo passo →"}</button>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 12, fontWeight: 800, color: T.gold, marginBottom: 8 }}>🗺️ Todos os 10 passos</div>
          <div style={{ display: "grid", gap: 5 }}>
            {etapas.map((e, i) => (
              <button key={i} type="button" onClick={() => setPasso(i + 1)} style={{ padding: "8px 11px", borderRadius: 8, textAlign: "left", cursor: "pointer", fontSize: 12, color: passo === i + 1 ? "#0b1426" : T.white, background: passo === i + 1 ? "#f7bd00" : "#ffffff08", border: `1px solid ${passo === i + 1 ? "#f7bd00" : "#31415a"}` }}>
                <span style={{ fontSize: 15, marginRight: 6 }}>{e.emoji}</span><b>{i + 1}. {e.t.replace(/^\S+\s\d+\.\s/, "")}</b>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
