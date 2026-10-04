"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type Pombo = { id: number; anilha: string; nome: string | null; sexo: string; paiId: number | null; maeId: number | null };
type Ninhada = { id: string; paiId: number; maeId: number; acasalamento: string; ovos: number; nascidos: number; anilhados: string; obs: string; sangueAlvo?: { nome: string; pct: number } | null };

const KEY = "nutripombos-ninhadas-v1";

const VAZIA = (): Ninhada => ({ id: "", paiId: 0, maeId: 0, acasalamento: new Date().toISOString().slice(0, 10), ovos: 2, nascidos: 2, anilhados: "", obs: "", sangueAlvo: null });

export default function ControleNinhadas() {
  const [ninhadas, setNinhadas] = useState<Ninhada[]>([]);
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [form, setForm] = useState<Ninhada>(VAZIA());
  const [editando, setEditando] = useState(false);
  const [msg, setMsg] = useState("");
  const [doadorId, setDoadorId] = useState("");

  useEffect(() => {
    fetch("/api/pombos").then((r) => r.json()).then((v) => setPombos(Array.isArray(v) ? v : [])).catch(() => setPombos([]));
    try { setNinhadas(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* ignora */ }
  }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(ninhadas)); } catch { /* ignora */ } }, [ninhadas]);

  const mapa = useMemo(() => new Map(pombos.map((p) => [p.id, p])), [pombos]);
  const machos = pombos.filter((p) => p.sexo === "macho");
  const femeas = pombos.filter((p) => p.sexo === "femea");

  /** % de sangue do doador num pombo (pedigree até 6 gerações) */
  const fracao = (p: Pombo | undefined, alvoId: number, prof = 6): number => {
    if (!p || prof < 0) return 0;
    if (p.id === alvoId) return 1;
    const paiF = p.paiId ? fracao(mapa.get(p.paiId), alvoId, prof - 1) : 0;
    const maeF = p.maeId ? fracao(mapa.get(p.maeId), alvoId, prof - 1) : 0;
    return (paiF + maeF) / 2;
  };

  const doador = pombos.find((p) => String(p.id) === doadorId);
  const paiSel = pombos.find((p) => p.id === form.paiId);
  const maeSel = pombos.find((p) => p.id === form.maeId);
  const sanguePrevisto = useMemo(() => {
    if (!doador || !paiSel || !maeSel) return null;
    return (fracao(paiSel, doador.id) + fracao(maeSel, doador.id)) / 2;
  }, [doadorId, form.paiId, form.maeId, pombos]);

  const salvar = () => {
    if (!form.paiId || !form.maeId) { setMsg("⚠️ Escolha o pai e a mãe."); return; }
    if (editando) setNinhadas((l) => l.map((n) => (n.id === form.id ? { ...form, sangueAlvo: doador && sanguePrevisto ? { nome: doador.nome || doador.anilha, pct: sanguePrevisto } : null } : n)));
    else setNinhadas((l) => [{ ...form, id: String(Date.now()), sangueAlvo: doador && sanguePrevisto ? { nome: doador.nome || doador.anilha, pct: sanguePrevisto } : null }, ...l]);
    setForm(VAZIA()); setEditando(false); setDoadorId("");
    setMsg("✅ Ninhada registrada!"); window.setTimeout(() => setMsg(""), 2500);
  };

  const totalAnilhados = ninhadas.reduce((s, n) => s + (n.anilhados ? n.anilhados.split(",").filter(Boolean).length : 0), 0);
  const totalNascidos = ninhadas.reduce((s, n) => s + (n.nascidos || 0), 0);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🥚 Controle de Ninhadas</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Registre acasalamentos, ovos, nascidos e anilhagens — com % de sangue do doador previsto na Genética</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={{ ...T.card, borderColor: `${T.green}55`, background: `${T.green}0d` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
            {([["🥚 Ninhadas", String(ninhadas.length)], ["🐣 Nascidos", String(totalNascidos)], ["🔖 Anilhados", String(totalAnilhados)], ["📈 Nasc./ninhada", ninhadas.length ? (totalNascidos / ninhadas.length).toFixed(1) : "—"]] as const).map(([l, v]) => (
              <div key={l} style={{ padding: 10, borderRadius: 9, background: "#ffffff08", textAlign: "center" }}>
                <div style={{ ...T.small, fontSize: 10 }}>{l}</div>
                <b style={{ color: T.green, fontSize: 16 }}>{v}</b>
              </div>
            ))}
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 12 }}>{editando ? "✏️ Editar ninhada" : "➕ Registrar ninhada"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
            <div>
              <label style={T.label}>♂ PAI</label>
              <select value={form.paiId || ""} onChange={(e) => setForm({ ...form, paiId: Number(e.target.value) })} style={T.input}>
                <option value="">— escolher —</option>
                {machos.map((p) => <option key={p.id} value={p.id}>{p.nome || p.anilha}</option>)}
              </select>
            </div>
            <div>
              <label style={T.label}>♀ MÃE</label>
              <select value={form.maeId || ""} onChange={(e) => setForm({ ...form, maeId: Number(e.target.value) })} style={T.input}>
                <option value="">— escolher —</option>
                {femeas.map((p) => <option key={p.id} value={p.id}>{p.nome || p.anilha}</option>)}
              </select>
            </div>
            <div>
              <label style={T.label}>🏆 Doador (p/ % sangue)</label>
              <select value={doadorId} onChange={(e) => setDoadorId(e.target.value)} style={T.input}>
                <option value="">— opcional —</option>
                {pombos.map((p) => <option key={p.id} value={p.id}>{p.nome || p.anilha}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginTop: 8 }}>
            <div><label style={T.label}>Acasalamento</label><input type="date" value={form.acasalamento} onChange={(e) => setForm({ ...form, acasalamento: e.target.value })} style={T.input} /></div>
            <div><label style={T.label}>Ovos</label><input type="number" min={0} max={4} value={form.ovos} onChange={(e) => setForm({ ...form, ovos: Number(e.target.value) })} style={T.input} /></div>
            <div><label style={T.label}>Nascidos</label><input type="number" min={0} max={4} value={form.nascidos} onChange={(e) => setForm({ ...form, nascidos: Number(e.target.value) })} style={T.input} /></div>
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={T.label}>Anilhas dos filhotes (separadas por vírgula)</label>
            <input value={form.anilhados} onChange={(e) => setForm({ ...form, anilhados: e.target.value })} placeholder="BR-25-111, BR-25-112" style={T.input} />
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={T.label}>Observações</label>
            <input value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} placeholder="Ex.: 2º postura, casal adotou bem" style={T.input} />
          </div>

          {sanguePrevisto !== null && doador && (
            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "#f7bd0015", border: "1px solid #f7bd0055", fontSize: 12 }}>
              🧬 <b>Previsão genética:</b> os filhotes terão <b style={{ color: T.gold }}>{(sanguePrevisto * 100).toFixed(1)}%</b> do sangue de <b>{doador.nome || doador.anilha}</b>
              {sanguePrevisto >= 0.7 ? " — cruzamento ~75% 🏆" : sanguePrevisto >= 0.5 ? " — meio sangue do doador" : ""}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="button" onClick={salvar} style={{ ...T.btn, flex: 2 }}>{editando ? "💾 Salvar" : "➕ Registrar"}</button>
            {editando && <button type="button" onClick={() => { setForm(VAZIA()); setEditando(false); setDoadorId(""); }} style={{ ...T.btnGhost, flex: 1 }}>Cancelar</button>}
          </div>
          {msg && <div style={{ ...T.small, marginTop: 10, color: msg.startsWith("✅") ? T.green : T.orange }}>{msg}</div>}
        </section>

        {ninhadas.length > 0 && (
          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📖 Ninhadas registradas</div>
            {ninhadas.map((n) => {
              const pai = mapa.get(n.paiId);
              const mae = mapa.get(n.maeId);
              const anilhados = n.anilhados ? n.anilhados.split(",").map((a) => a.trim()).filter(Boolean) : [];
              return (
                <div key={n.id} style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <b style={{ fontSize: 14 }}>♂ {pai?.nome || pai?.anilha || "?"} × ♀ {mae?.nome || mae?.anilha || "?"}</b>
                      <div style={{ ...T.small, fontSize: 11, marginTop: 3 }}>
                        📅 acasalou {n.acasalamento.split("-").reverse().slice(0, 2).join("/")} · 🥚 {n.ovos} ovos · 🐣 {n.nascidos} nascidos · 🔖 {anilhados.length} anilhado(s)
                        {n.sangueAlvo && ` · 🧬 ${n.sangueAlvo.pct ? (n.sangueAlvo.pct * 100).toFixed(0) : "?"}% de ${n.sangueAlvo.nome}`}
                      </div>
                      {anilhados.length > 0 && (
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 6 }}>
                          {anilhados.map((a) => <span key={a} style={{ padding: "3px 9px", borderRadius: 12, fontSize: 10, fontFamily: "monospace", color: T.blue, background: `${T.blue}12`, border: `1px solid ${T.blue}44` }}>{a}</span>)}
                        </div>
                      )}
                      {n.obs && <div style={{ ...T.small, fontSize: 10.5, marginTop: 6, color: T.dim }}>{n.obs}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" onClick={() => { setForm(n); setEditando(true); window.scrollTo({ top: 0 }); }} style={T.btnGhost}>✏️</button>
                      <button type="button" onClick={() => { if (window.confirm("Apagar esta ninhada?")) setNinhadas((l) => l.filter((x) => x.id !== n.id)); }} style={{ ...T.btnGhost, color: T.red }}>🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
