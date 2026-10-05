"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * 📦 Estoque de Ração — controla o que tem no pombal e quando acaba.
 * Gavetas sincronizadas:
 *  - "nutripombos-estoque-v1": itens (nome, qtd, consumo semanal)
 *  - o robô das 06h30 (/api/push/diario) lê a lista e avisa quando algo chega a ≤7 dias.
 */
const KEY = "nutripombos-estoque-v1";

type Item = { id: string; nome: string; unidade: string; qtd: number; consumoSemana: number; obs?: string };
type Mov = { id: string; data: string; nome: string; tipo: "compra" | "consumo"; qtd: number };
const KEY_MOV = "nutripombos-estoque-mov-v1";

const hojeBR = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

function carregar<T>(chave: string): T[] {
  try { const d = JSON.parse(localStorage.getItem(chave) || "[]"); return Array.isArray(d) ? d : []; } catch { return []; }
}
function guardar(chave: string, v: unknown[]) {
  try { localStorage.setItem(chave, JSON.stringify(v)); } catch { /* cheio */ }
}

const PRESETS: { nome: string; unidade: string; consumoSemana: number }[] = [
  { nome: "Ração de prova (saco 40kg)", unidade: "saco", consumoSemana: 0.5 },
  { nome: "Milho (kg)", unidade: "kg", consumoSemana: 5 },
  { nome: "Girassol (kg)", unidade: "kg", consumoSemana: 2 },
  { nome: "Grit / mineral (kg)", unidade: "kg", consumoSemana: 0.5 },
];

export default function EstoqueRacao() {
  const [itens, setItens] = useState<Item[]>([]);
  const [movs, setMovs] = useState<Mov[]>([]);
  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("saco");
  const [qtd, setQtd] = useState("");
  const [consumo, setConsumo] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    setItens(carregar<Item>(KEY));
    setMovs(carregar<Mov>(KEY_MOV));
  }, []);

  function persistir(novosItens: Item[], novosMovs?: Mov[]) {
    setItens(novosItens);
    guardar(KEY, novosItens);
    if (novosMovs) { setMovs(novosMovs); guardar(KEY_MOV, novosMovs); }
  }

  function adicionar(n = nome, u = unidade, q = parseFloat(qtd.replace(",", ".")), c = parseFloat(consumo.replace(",", "."))) {
    if (!n.trim()) { setOk("⚠️ Nome do item (ex: Ração de prova)."); return; }
    if (!Number.isFinite(q) || q < 0) { setOk("⚠️ Quantidade atual inválida."); return; }
    if (!Number.isFinite(c) || c <= 0) { setOk("⚠️ Informe o consumo semanal — é ele que calcula quando acaba."); return; }
    persistir([{ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), nome: n.trim(), unidade: u, qtd: q, consumoSemana: c }, ...itens]);
    setNome(""); setQtd(""); setConsumo("");
    setOk("✅ Item no estoque!");
    window.setTimeout(() => setOk(""), 2500);
  }

  function movimentar(item: Item, tipo: "compra" | "consumo") {
    const delta = tipo === "compra" ? 1 : -1;
    const novos = itens.map((i) => (i.id === item.id ? { ...i, qtd: Math.max(0, +(i.qtd + delta).toFixed(2)) } : i));
    const mov: Mov = { id: Date.now().toString(36), data: hojeBR(), nome: item.nome, tipo, qtd: 1 };
    persistir(novos, [mov, ...movs].slice(0, 60));
  }

  function remover(id: string) { persistir(itens.filter((i) => i.id !== id)); }

  const info = (i: Item) => {
    const dias = Math.floor(i.qtd / (i.consumoSemana / 7));
    if (i.qtd <= 0) return { cor: "#ff5d62", selo: "⛔ ESGOTADO", dias };
    if (dias <= 7) return { cor: "#ff5d62", selo: `🔴 acaba em ~${dias} dia(s)`, dias };
    if (dias <= 15) return { cor: "#f7bd00", selo: `🟡 acaba em ~${dias} dia(s)`, dias };
    return { cor: "#39e58c", selo: `🟢 dura ~${dias} dia(s)`, dias };
  };

  const criticos = useMemo(() => itens.filter((i) => info(i).dias <= 7).length, [itens]);

  const input = { ...T.btnGhost, padding: "10px 12px", textAlign: "left" as const, fontWeight: 600, fontSize: 12.5, width: "100%" };
  const lbl = { ...T.small, fontSize: 10, marginBottom: 4, color: T.dim };

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>📦 Estoque do Pombal</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Ração, milho, girassol, grit... registre o que tem e o consumo — o app calcula <b>quantos dias faltam</b> e o robô das 06h30 avisa quando algo tá acabando.</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {criticos > 0 && (
          <div style={{ ...T.card, borderColor: "#ff5d6266", background: "#ff5d620d", marginBottom: 12 }}>
            🚨 <b>{criticos} item(ns) acabando ou esgotado(s)</b> — o robô das 06h30 também vai avisar no celular.
          </div>
        )}

        {/* ADICIONAR */}
        <section style={{ ...T.card, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>➕ Item no estoque</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={lbl}>🏷️ Item</div>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="ex: Ração de manutenção (saco 40kg)" style={input} />
            </div>
            <div>
              <div style={lbl}>📐 Unidade</div>
              <select value={unidade} onChange={(e) => setUnidade(e.target.value)} style={input}>
                <option value="saco">saco</option>
                <option value="kg">kg</option>
                <option value="un">unidade</option>
                <option value="L">litro</option>
              </select>
            </div>
            <div>
              <div style={lbl}>📊 Tem agora</div>
              <input inputMode="decimal" value={qtd} onChange={(e) => setQtd(e.target.value)} placeholder="ex: 2,5" style={input} />
            </div>
            <div>
              <div style={lbl}>📅 Consumo por semana</div>
              <input inputMode="decimal" value={consumo} onChange={(e) => setConsumo(e.target.value)} placeholder="ex: 0,5" style={input} />
            </div>
          </div>
          <button onClick={() => adicionar()} style={{ ...T.btn, marginTop: 10 }}>💾 Guardar no estoque</button>
          {ok && <div style={{ ...T.small, fontSize: 11.5, marginTop: 8, color: ok.startsWith("✅") ? T.green : T.orange }}>{ok}</div>}

          <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 14, paddingTop: 12 }}>
            <div style={{ ...T.small, fontSize: 11, fontWeight: 800, marginBottom: 8, color: T.dim }}>⚡ Sugestões (toque pra adicionar — depois ajuste a quantidade):</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PRESETS.map((p) => (
                <button key={p.nome} onClick={() => adicionar(p.nome, p.unidade, 1, p.consumoSemana)} style={{ padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontSize: 11, fontWeight: 700, border: `1px solid ${T.border}`, background: T.bgInput, color: T.dim }}>
                  + {p.nome}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* LISTA */}
        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📋 Meu estoque ({itens.length})</div>
          {itens.length === 0 && <div style={{ ...T.small, fontSize: 12 }}>Estoque vazio — comece pelas sugestões! 👆</div>}
          <div style={{ display: "grid", gap: 8 }}>
            {itens.map((i) => {
              const f = info(i);
              return (
                <div key={i.id} style={{ padding: 12, borderRadius: 10, background: "#ffffff08", border: `1px solid ${f.cor}44` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div>
                      <b style={{ fontSize: 13 }}>{i.nome}</b>
                      <span style={{ marginLeft: 8, padding: "2px 9px", borderRadius: 8, fontSize: 10, fontWeight: 900, color: f.cor, background: `${f.cor}18` }}>{f.selo}</span>
                      <div style={{ ...T.small, fontSize: 10.5, marginTop: 3, color: T.dim }}>
                        Tem: <b>{i.qtd} {i.unidade}(s)</b> · consumo {i.consumoSemana} {i.unidade}(s)/semana
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => movimentar(i, "compra")} title="comprou/repôs 1" style={{ padding: "7px 11px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer", border: `1px solid ${T.green}66`, background: `${T.green}15`, color: T.green }}>➕ comprei 1</button>
                      <button onClick={() => movimentar(i, "consumo")} title="abriu/consumiu 1" style={{ padding: "7px 11px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer", border: `1px solid ${T.orange}66`, background: `${T.orange}15`, color: T.orange }}>➖ consumi 1</button>
                      <button onClick={() => remover(i.id)} style={{ ...T.btnGhost, padding: "7px 10px", fontSize: 11, color: T.red, borderColor: `${T.red}44` }}>🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* HISTÓRICO */}
        {movs.length > 0 && (
          <section style={{ ...T.card, marginTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🕘 Últimas movimentações</div>
            <div style={{ display: "grid", gap: 4 }}>
              {movs.slice(0, 15).map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: T.dim, borderBottom: `1px solid ${T.border}44`, paddingBottom: 4 }}>
                  <span>{br2(m.data)} · {m.nome}</span>
                  <b style={{ color: m.tipo === "compra" ? T.green : T.orange }}>{m.tipo === "compra" ? "＋" : "－"}{m.qtd}</b>
                </div>
              ))}
            </div>
          </section>
        )}

        <div style={{ ...T.small, fontSize: 10, marginTop: 12, color: T.dim2, textAlign: "center", lineHeight: 1.6 }}>
          ☁️ Estoque e movimentações sincronizam entre PC e celular · 🔔 aviso push quando faltar ≤7 dias (robô das 06h30)
        </div>
      </div>
    </main>
  );
}

function br2(d: string) { return d ? d.split("-").reverse().join("/") : ""; }
