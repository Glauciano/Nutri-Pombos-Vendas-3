"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPombal, loadParceiros } from "../lib/apis-gratis";
import { loadConfig } from "../config";
import { loadCalendario } from "../data/calendario";
import { T } from "../theme";

type PassoEstado = "ok" | "pend";

const KEY_FEITO = "nutripombos-onboarding-feito";

export default function PrimeirosPassos() {
  const [pombal, setPombal] = useState<{ nome: string; lat: number; lon: number } | null>(null);
  const [temProvas, setTemProvas] = useState(false);
  const [temParceiros, setTemParceiros] = useState(false);
  const [consumo, setConsumo] = useState(30);
  const [soltaOk, setSoltaOk] = useState(false);
  const [feito, setFeito] = useState(true);
  const [windowOK, setWindowOK] = useState(false);

  useEffect(() => {
    setWindowOK(true);
    setPombal(getPombal());
    setTemProvas(loadCalendario().length > 0);
    setTemParceiros(loadParceiros().length > 0);
    const cfg = loadConfig();
    setConsumo(cfg.consumoDiario);
    setSoltaOk(cfg.soltaModo === "manual" || typeof cfg.soltaMinAposNascer === "number");
    try { setFeito(JSON.parse(localStorage.getItem(KEY_FEITO) || "false")); } catch { setFeito(false); }
  }, []);

  if (!windowOK) return null;

  const passos: { titulo: string; desc: string; estado: PassoEstado; link: string; linkLabel: string; emoji: string }[] = [
    {
      emoji: "🏠", titulo: "Cadastre onde fica seu pombal",
      desc: "Digite o nome da sua cidade e salve — rota, clima, nascer do sol e radar passam a usar SUA posição.",
      estado: pombal && pombal.lat !== -23.55 ? "ok" : "pend",
      link: "/centro-provas/configuracao", linkLabel: "Configurar pombal",
    },
    {
      emoji: "📅", titulo: "Confira o calendário de provas",
      desc: "Edite datas, adicione provas novas (escolha a cidade na listinha 📍) — todas as telas atualizam sozinhas.",
      estado: temProvas ? "ok" : "pend",
      link: "/centro-provas/gerenciar-calendario", linkLabel: "Abrir calendário",
    },
    {
      emoji: "🏁", titulo: "Ajuste o horário da soltura",
      desc: "Automático (nascer do sol + X minutos) ou fixo — usado na previsão de chegada e na janela ideal.",
      estado: soltaOk ? "ok" : "pend",
      link: "/centro-provas/configuracao", linkLabel: "Ajustar soltura",
    },
    {
      emoji: "🤝", titulo: "Adicione cidades parceiras (opcional)",
      desc: "Sócios e amigos aparecem no mapa e ganham previsão do tempo completa.",
      estado: temParceiros ? "ok" : "pend",
      link: "/centro-provas/configuracao", linkLabel: "Adicionar parceiros",
    },
    {
      emoji: "🌾", titulo: "Ajuste o consumo do plantel (opcional)",
      desc: "Gramas por pombo/dia — recalcula misturas, mix e compras da semana.",
      estado: consumo !== 30 ? "ok" : "pend",
      link: "/centro-provas/configuracao", linkLabel: "Ajustar consumo",
    },
  ];

  const prontos = passos.filter((p) => p.estado === "ok").length;

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🎓 Primeiros Passos</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Configure seu app em 5 passos — depois é só voar!</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={{ ...T.card, borderColor: prontos === passos.length ? `${T.green}66` : `${T.gold}55` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <b style={{ fontSize: 15 }}>{prontos === passos.length ? "🎉 Tudo configurado!" : "Seu progresso"}</b>
            <b style={{ color: prontos === passos.length ? T.green : T.gold, fontSize: 18 }}>{prontos}/{passos.length}</b>
          </div>
          <div style={{ height: 8, background: "#ffffff12", borderRadius: 4, marginTop: 8 }}>
            <div style={{ height: "100%", width: `${(prontos / passos.length) * 100}%`, background: prontos === passos.length ? T.green : T.gold, borderRadius: 4, transition: "width .4s" }} />
          </div>
        </section>

        {passos.map((p, i) => (
          <section key={p.titulo} style={{ ...T.card, borderLeft: `4px solid ${p.estado === "ok" ? T.green : T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <b style={{ fontSize: 14 }}>{p.emoji} {i + 1}. {p.titulo} {p.estado === "ok" && <span style={{ color: T.green, fontSize: 12 }}>✓ feito</span>}</b>
                <div style={{ ...T.small, marginTop: 5, lineHeight: 1.6 }}>{p.desc}</div>
              </div>
              <Link href={p.link} style={{ ...T.btnGhost, textDecoration: "none", fontSize: 11, whiteSpace: "nowrap" }}>{p.linkLabel} →</Link>
            </div>
          </section>
        ))}

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 8 }}>🧭 E depois, como uso no dia a dia?</div>
          <div style={{ ...T.small, lineHeight: 1.9, fontSize: 12 }}>
            • <b>Na véspera:</b> Rota da Prova → confira clima cidade a cidade, janela de soltura e a comparação sábado × domingo<br />
            • <b>Na sexta:</b> Seleção de Equipe → escolha quem embarca e copie a lista pro WhatsApp<br />
            • <b>No dia:</b> Rota da Prova → ligue o 🔔 alarme de chegada e a 🧭 bússola (onde olhar no céu)<br />
            • <b>Depois:</b> Dia da Prova/Histórico → registre os retornos (ou cole o resultado do clube no 📥 importador)<br />
            • <b>Na semana:</b> Mistura Semanal + Mix Energético → as receitas com as gramas certas do SEU plantel
          </div>
        </section>

        <button
          type="button"
          onClick={() => { try { localStorage.setItem(KEY_FEITO, JSON.stringify(true)); } catch { /* ignora */ } setFeito(true); }}
          style={{ ...T.btn, marginTop: 4, opacity: feito ? 0.6 : 1 }}
        >
          {feito ? "✅ Concluído" : "Marcar como concluído"}
        </button>
      </div>
    </main>
  );
}
