"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

const KEY = "nutripombos-vendas-v1";

type Venda = { id: string; anilha: string; nome: string; comprador: string; contato: string; preco: number; data: string; obs: string };

const VAZIO = (): Venda => ({ id: "", anilha: "", nome: "", comprador: "", contato: "", preco: 0, data: new Date().toISOString().slice(0, 10), obs: "" });

export default function ControleVendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [form, setForm] = useState<Venda>(VAZIO);
  const [editando, setEditando] = useState(false);
  const [msg, setMsg] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => { try { setVendas(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* ignora */ } }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(vendas)); } catch { /* ignora */ } }, [vendas]);

  const salvar = () => {
    if (!form.anilha.trim() || !form.comprador.trim()) { setMsg("⚠️ Preencha anilha e comprador."); return; }
    if (editando) setVendas((v) => v.map((x) => (x.id === form.id ? form : x)));
    else setVendas((v) => [{ ...form, id: String(Date.now()) }, ...v]);
    setForm(VAZIO()); setEditando(false);
    setMsg("✅ Venda registrada!"); window.setTimeout(() => setMsg(""), 2500);
  };

  const total = vendas.reduce((s, v) => s + (v.preco || 0), 0);
  const ano = new Date().getFullYear();
  const doAno = vendas.filter((v) => v.data.startsWith(String(ano)));
  const totalAno = doAno.reduce((s, v) => s + (v.preco || 0), 0);
  const filtradas = vendas.filter((v) => (v.anilha + v.nome + v.comprador + v.contato).toLowerCase().includes(busca.toLowerCase()));

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>💰 Controle de Vendas</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Pombos vendidos, compradores e o caixa da temporada — o app finalmente honra o nome! 😄</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={{ ...T.card, borderColor: `${T.green}55`, background: `${T.green}0d` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
            {([
              ["🐦 Vendidos", String(vendas.length)],
              [`📅 Em ${ano}`, String(doAno.length)],
              ["💵 Total geral", `R$ ${total.toFixed(2).replace(".", ",")}`],
              [`🏆 Caixa ${ano}`, `R$ ${totalAno.toFixed(2).replace(".", ",")}`],
              ["📊 Preço médio", vendas.length ? `R$ ${(total / vendas.length).toFixed(2).replace(".", ",")}` : "—"],
            ] as const).map(([l, v]) => (
              <div key={l} style={{ padding: 10, borderRadius: 9, background: "#ffffff08", textAlign: "center" }}>
                <div style={{ ...T.small, fontSize: 10 }}>{l}</div>
                <b style={{ color: T.green, fontSize: 15 }}>{v}</b>
              </div>
            ))}
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>{editando ? "✏️ Editar venda" : "➕ Registrar venda"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
            <div><label style={T.label}>Anilha *</label><input value={form.anilha} onChange={(e) => setForm({ ...form, anilha: e.target.value })} style={T.input} placeholder="BRP-2024-1234" /></div>
            <div><label style={T.label}>Pombo (nome)</label><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} style={T.input} /></div>
            <div><label style={T.label}>Comprador *</label><input value={form.comprador} onChange={(e) => setForm({ ...form, comprador: e.target.value })} style={T.input} /></div>
            <div><label style={T.label}>Contato (WhatsApp)</label><input value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} style={T.input} placeholder="(19) 99999-9999" /></div>
            <div><label style={T.label}>Preço (R$)</label><input type="number" step="0.01" value={form.preco || ""} onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })} style={T.input} /></div>
            <div><label style={T.label}>Data</label><input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} style={T.input} /></div>
          </div>
          <div style={{ marginTop: 8 }}><label style={T.label}>Observações</label><input value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} style={T.input} placeholder="Ex.: casal junto, com pedigree e nota de garantia" /></div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="button" onClick={salvar} style={{ ...T.btn, flex: 2 }}>{editando ? "💾 Salvar alterações" : "➕ Registrar venda"}</button>
            {editando && <button type="button" onClick={() => { setForm(VAZIO()); setEditando(false); }} style={{ ...T.btnGhost, flex: 1 }}>Cancelar</button>}
          </div>
          {msg && <div style={{ ...T.small, marginTop: 10, color: msg.startsWith("✅") ? T.green : T.orange }}>{msg}</div>}
        </section>

        <section style={T.card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>📖 Vendas registradas</div>
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="🔎 buscar anilha/comprador" style={{ ...T.input, width: "auto", minHeight: 34, padding: "5px 10px", fontSize: 12 }} />
          </div>
          {filtradas.length === 0 && <div style={{ ...T.small, textAlign: "center", padding: 24 }}>Nenhuma venda registrada ainda.</div>}
          {filtradas.map((v) => (
            <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <b style={{ fontSize: 13 }}>🐦 {v.nome || v.anilha}</b> <span style={{ ...T.small, fontSize: 11 }}>({v.anilha})</span>
                <div style={{ ...T.small, fontSize: 11 }}>
                  👤 {v.comprador}{v.contato ? ` · 📱 ${v.contato}` : ""} · 📅 {v.data.split("-").reverse().slice(0, 2).join("/")}{v.obs ? ` · ${v.obs}` : ""}
                </div>
              </div>
              <b style={{ color: T.green, fontSize: 14 }}>R$ {(v.preco || 0).toFixed(2).replace(".", ",")}</b>
              <button type="button" onClick={() => { setForm(v); setEditando(true); window.scrollTo({ top: 0 }); }} style={T.btnGhost}>✏️</button>
              <button type="button" onClick={() => { if (window.confirm("Apagar esta venda?")) setVendas((l) => l.filter((x) => x.id !== v.id)); }} style={{ ...T.btnGhost, color: T.red }}>🗑️</button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
