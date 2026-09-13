"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadCalendario, type ProvaCalendario } from "../data/calendario";
import { T } from "../theme";

const KEY = "nutripombos-checklist-encestamento-v1";

const ITENS_PADRAO: { id: string; emoji: string; txt: string }[] = [
  { id: "i1", emoji: "🌾", txt: "Mistura final cargada (quinta = carga máxima)" },
  { id: "i2", emoji: "⚗️", txt: "Mix aplicado na ração da sexta de manhã (2–3g/pombo)" },
  { id: "i3", emoji: "💧", txt: "Água fresca nos cestos/bebedouros de transporte" },
  { id: "i4", emoji: "⚡", txt: "Eletrólito preparado pra recepção" },
  { id: "i5", emoji: "🔢", txt: "Anilhas conferidas uma a uma (legíveis)" },
  { id: "i6", emoji: "🕊️", txt: "Pombos selecionados (ver Seleção de Equipe)" },
  { id: "i7", emoji: "🧺", txt: "Cestos higienizados e secos" },
  { id: "i8", emoji: "👀", txt: "Condição conferida: peito firme, asa leve, penas fechadas" },
  { id: "i9", emoji: "📱", txt: "Rota da prova conferida (clima, janela de soltura)" },
  { id: "i10", emoji: "📋", txt: "Lista da equipe copiada pro grupo do clube" },
  { id: "i11", emoji: "🚗", txt: "Transporte combinado + horário de entrega no clube" },
  { id: "i12", emoji: "🧾", txt: "Documentação/inscrição da prova em dia" },
];

type Estado = Record<string, string[]>; // provaId -> ids marcados

export default function ChecklistEncestamento() {
  const [provas, setProvas] = useState<ProvaCalendario[]>([]);
  const [provaSel, setProvaSel] = useState<ProvaCalendario | null>(null);
  const [estado, setEstado] = useState<Estado>({});
  const [custom, setCustom] = useState<Record<string, { id: string; txt: string }[]>>({});
  const [novoTxt, setNovoTxt] = useState("");

  useEffect(() => {
    const lista = loadCalendario().filter((p) => !p.cancelada);
    setProvas(lista);
    const hoje = new Date().toISOString().slice(0, 10);
    setProvaSel(lista.find((p) => p.dataSolta >= hoje) || lista[lista.length - 1] || null);
    try { setEstado(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { /* ignora */ }
    try { const c = JSON.parse(localStorage.getItem(KEY + "-custom") || "{}"); setCustom(c); } catch { /* ignora */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(estado));
      localStorage.setItem(KEY + "-custom", JSON.stringify(custom));
    } catch { /* ignora */ }
  }, [estado, custom]);

  const pid = provaSel?.id || "";
  const marcados = estado[pid] || [];
  const itens: { id: string; emoji?: string; txt: string }[] = [...ITENS_PADRAO, ...(custom[pid] || [])];
  const prontos = itens.filter((i) => marcados.includes(i.id)).length;
  const toggle = (id: string) => setEstado((e) => ({ ...e, [pid]: e[pid]?.includes(id) ? e[pid].filter((x) => x !== id) : [...(e[pid] || []), id] }));

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>📋 Checklist de Encestamento</h1>
            <p style={{ ...T.small, marginTop: 4 }}>A sexta-feira sem esquecer nada — marcado por prova, salvo e sincronizado</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={T.card}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {provas.map((p) => (
              <button key={p.id} onClick={() => setProvaSel(p)} style={{ padding: "7px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800, cursor: "pointer", color: provaSel?.id === p.id ? T.bg : T.dim, background: provaSel?.id === p.id ? T.gold : T.bgInput, border: `1px solid ${provaSel?.id === p.id ? T.gold : T.border}` }}>
                #{p.num} {p.cidade}
              </button>
            ))}
          </div>
        </section>

        {provaSel && (
          <>
            <section style={{ ...T.card, borderColor: prontos === itens.length ? `${T.green}66` : `${T.gold}55` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b style={{ fontSize: 15 }}>🧺 Prova #{provaSel.num} — {provaSel.cidade} ({provaSel.km}km)</b>
                <b style={{ color: prontos === itens.length ? T.green : T.gold, fontSize: 16 }}>{prontos}/{itens.length}</b>
              </div>
              <div style={{ height: 8, background: "#ffffff12", borderRadius: 4, marginTop: 8 }}>
                <div style={{ height: "100%", width: `${(prontos / Math.max(1, itens.length)) * 100}%`, background: prontos === itens.length ? T.green : T.gold, borderRadius: 4, transition: "width .3s" }} />
              </div>
              {prontos === itens.length && <div style={{ marginTop: 8, color: T.green, fontWeight: 800, fontSize: 13 }}>✅ Tudo pronto — bons voos! 🏁</div>}
            </section>

            <section style={T.card}>
              {itens.map((i) => {
                const feito = marcados.includes(i.id);
                return (
                  <button key={i.id} onClick={() => toggle(i.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", marginBottom: 5, textAlign: "left", borderRadius: 9, cursor: "pointer", color: feito ? T.green : T.white, background: feito ? `${T.green}12` : "#ffffff05", border: `1px solid ${feito ? T.green : T.border}` }}>
                    <span style={{ width: 27, height: 27, display: "grid", placeItems: "center", borderRadius: "50%", background: feito ? T.green : T.bgInput, color: T.bg }}>{feito ? "✓" : (i.emoji || "📌")}</span>
                    <span style={{ flex: 1, fontSize: 13, textDecoration: feito ? "line-through" : "none" }}>{i.txt}</span>
                  </button>
                );
              })}
              {custom[pid]?.map((c) => null)}
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <input value={novoTxt} onChange={(e) => setNovoTxt(e.target.value)} placeholder="Adicionar item seu (ex.: conferir pombo do Zé)" style={{ ...T.input, flex: 1 }} />
                <button type="button" onClick={() => { if (!novoTxt.trim()) return; const id = "c" + Date.now(); setCustom((c) => ({ ...c, [pid]: [...(c[pid] || []), { id, txt: novoTxt.trim() }] })); setNovoTxt(""); }} style={T.btnSm}>➕</button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
