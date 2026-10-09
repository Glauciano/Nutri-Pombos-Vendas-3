"use client";

import { useEffect, useState } from "react";

/**
 * 🧭 Tour de Boas-vindas — o guia de 1ª vez para quem acabou de entrar.
 * Aparece 1x por aparelho (flag local) no Painel principal, e pode ser
 * revisto a qualquer momento pela Configuração (evento "nutripombos:tour").
 */
const KEY_TOUR = "nutripombos-tour-visto-v1";

const PASSOS: { emoji: string; titulo: string; texto: string }[] = [
  {
    emoji: "🕊️",
    titulo: "Bem-vindo ao Nutri Pombos!",
    texto: "Este é o Centro de Provas do columófilo — o app completo que acompanha seu plantel do ovo à taça. Vou te mostrar em 1 minuto onde fica cada coisa.",
  },
  {
    emoji: "☰",
    titulo: "Tudo mora no menu",
    texto: "Toque no ☰ (canto superior). São mais de 50 módulos organizados em grupos: Visão geral, Plantel, Resultados, Provas, Alimentação, Saúde e Vendas. Achou muito? No começo você só precisa de 3 coisinhas...",
  },
  {
    emoji: "🐦",
    titulo: "1. Cadastre seus pombos",
    texto: "Em Plantel → Pombos: anilha, nome, pai e mãe (pedigree!), e as fotos do corpo e do OLHO. Com o pedigree preenchido, o Casamenteiro, a Genética 75% e as Linhagens ganham vida sozinhos.",
  },
  {
    emoji: "🏁",
    titulo: "2. Marque suas provas",
    texto: "Em Provas → Calendário: embarque e solta de cada prova. O app monta a rota cidade a cidade com clima e vento de verdade, a janela ideal de soltura, o checklist de encestamento e o telão do clube.",
  },
  {
    emoji: "🔔",
    titulo: "O app te avisa sozinho",
    texto: "Ative as notificações na Configuração: todo dia às 06h30 chega o avisinho no celular — véspera de embarque, dia de prova, madrugada fria, manejo do plantel e até ração acabando.",
  },
  {
    emoji: "💰",
    titulo: "3. Na hora de vender",
    texto: "Em Vendas: ficha premium com QR Code, pedigree imprimível, contrato pronto, etiquetas de cesto, CRM de compradores e a Vitrine entre criadores. Seu pombo vira produto com um toque.",
  },
  {
    emoji: "🎓",
    titulo: "Perdeu algo? Comece por aqui",
    texto: "Em Visão geral tem o 🎓 Primeiros passos (checklist de configuração) e o Guia do iniciante. E este tour pode ser revisto quando quiser na Configuração. Agora bora — os pombos esperam!",
  },
];

export default function TourBoasVindas() {
  const [abrir, setAbrir] = useState(false);
  const [passo, setPasso] = useState(0);

  useEffect(() => {
    // 1ª vez neste aparelho, no painel principal → mostra o tour
    try {
      if (!localStorage.getItem(KEY_TOUR) && window.location.pathname === "/centro-provas") {
        setAbrir(true);
      }
    } catch { /* ignora */ }
    // reabrir pela Configuração
    const replay = () => { setPasso(0); setAbrir(true); };
    window.addEventListener("nutripombos:tour", replay);
    return () => window.removeEventListener("nutripombos:tour", replay);
  }, []);

  function fechar() {
    setAbrir(false);
    try { localStorage.setItem(KEY_TOUR, "1"); } catch { /* ignora */ }
  }

  if (!abrir) return null;
  const p = PASSOS[passo];
  const ultimo = passo === PASSOS.length - 1;

  return (
    <div
      onClick={fechar}
      style={{ position: "fixed", inset: 0, background: "rgba(4,10,20,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 90, padding: 14, cursor: "pointer" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 430, width: "100%", background: "#1b283c", border: "1.5px solid #f7bd0066", borderRadius: 18, padding: "26px 22px 18px", textAlign: "center", cursor: "default" }}
      >
        <div style={{ fontSize: 52, lineHeight: 1 }}>{p.emoji}</div>
        <div style={{ fontSize: 17, fontWeight: 900, color: "#f8fafc", marginTop: 10 }}>{p.titulo}</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.75, color: "#9aa8bc", marginTop: 10, minHeight: 88 }}>{p.texto}</div>

        {/* bolinhas */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "14px 0" }}>
          {PASSOS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPasso(i)}
              aria-label={`passo ${i + 1}`}
              style={{ width: i === passo ? 20 : 8, height: 8, borderRadius: 99, border: 0, cursor: "pointer", background: i === passo ? "#f7bd00" : "#31415a", transition: "width .25s" }}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={fechar} style={{ flex: 1, padding: "11px 0", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 800, color: "#9aa8bc", background: "#0b1529", border: "1px solid #31415a" }}>
            Pular
          </button>
          <button
            type="button"
            onClick={() => (ultimo ? fechar() : setPasso((s) => s + 1))}
            style={{ flex: 2, padding: "11px 0", borderRadius: 10, cursor: "pointer", fontSize: 12.5, fontWeight: 900, color: "#0b1426", background: "#f7bd00", border: "1px solid #f7bd00" }}
          >
            {ultimo ? "🚀 Começar!" : "Próximo →"}
          </button>
        </div>
        <div style={{ fontSize: 9.5, color: "#64748b", marginTop: 10 }}>toque fora para fechar · 🎓 Primeiros passos e 🧭 rever tour na Configuração</div>
      </div>
    </div>
  );
}
