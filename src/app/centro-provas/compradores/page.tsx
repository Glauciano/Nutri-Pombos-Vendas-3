"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * 👥 Compradores (CRM) — cadastro de interessados e compradores de pombos.
 * Gaveta "nutripombos-compradores-v1" (sincronizada entre aparelhos).
 * Destaques: botão WhatsApp direto, "registrei contato" e alerta de follow-up.
 */
const KEY = "nutripombos-compradores-v1";

type Comprador = {
  id: string; nome: string; zap: string; cidade: string;
  anilhas: string; obs: string;
  ultimoContato: string; proximoContato: string;
};

const hojeBR = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const br = (d: string) => d ? d.split("-").reverse().join("/") : "";

function carregar(): Comprador[] {
  try { const d = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(d) ? d : []; } catch { return []; }
}
function salvar(c: Comprador[]) {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* cheio */ }
}

const vazio = (): Comprador => ({ id: "", nome: "", zap: "", cidade: "", anilhas: "", obs: "", ultimoContato: "", proximoContato: "" });

export default function CompradoresCRM() {
  const [lista, setLista] = useState<Comprador[]>([]);
  const [form, setForm] = useState<Comprador>(vazio());
  const [editando, setEditando] = useState(false);
  const [busca, setBusca] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => { setLista(carregar()); }, []);

  function persistir(nova: Comprador[]) {
    setLista(nova);
    salvar(nova);
  }

  function salvarForm() {
    if (!form.nome.trim()) { setOk("⚠️ Pelo menos o nome do comprador."); return; }
    if (editando) {
      persistir(lista.map((c) => (c.id === form.id ? form : c)));
      setOk("✅ Comprador atualizado!");
    } else {
      persistir([{ ...form, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }, ...lista]);
      setOk("✅ Comprador anotado!");
    }
    setForm(vazio());
    setEditando(false);
    window.setTimeout(() => setOk(""), 2500);
  }

  function editar(c: Comprador) {
    setForm(c);
    setEditando(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function remover(id: string) { persistir(lista.filter((c) => c.id !== id)); }

  function registreiContato(c: Comprador) {
    persistir(lista.map((x) => (x.id === c.id ? { ...x, ultimoContato: hojeBR(), proximoContato: "" } : x)));
  }

  const diasAte = (d: string) => {
    if (!d) return 999;
    return Math.round((new Date(d + "T12:00:00").getTime() - new Date(hojeBR() + "T12:00:00").getTime()) / 86_400_000);
  };

  const filtrada = useMemo(() => {
    const q = busca.toLowerCase();
    return lista
      .filter((c) => (q ? c.nome.toLowerCase().includes(q) || c.zap.includes(q) || c.cidade.toLowerCase().includes(q) || c.anilhas.toLowerCase().includes(q) : true))
      .sort((a, b) => diasAte(a.proximoContato) - diasAte(b.proximoContato));
  }, [lista, busca]);

  const praContarHoje = lista.filter((c) => diasAte(c.proximoContato) <= 0).length;

  function exportarCSV() {
    const linhas = [["nome", "whatsapp", "cidade", "anilhas", "ultimo_contato", "proximo_contato", "obs"].join(";")].concat(
      lista.map((c) => [c.nome, c.zap, c.cidade, c.anilhas, c.ultimoContato, c.proximoContato, c.obs.replace(/\n/g, " ")].join(";"))
    );
    const blob = new Blob(["\uFEFF" + linhas.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `compradores-${hojeBR()}.csv`;
    a.click();
  }

  const input = { ...T.btnGhost, padding: "10px 12px", textAlign: "left" as const, fontWeight: 600, fontSize: 12.5, width: "100%" };
  const lbl = { ...T.small, fontSize: 10, marginBottom: 4, color: T.dim };

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>👥 Compradores (CRM)</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Quem já comprou, quem quer comprar, e quando dar o próximo alô — vendedor bom é o que dá atenção DEPOIS da venda.</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {praContarHoje > 0 && (
          <div style={{ ...T.card, borderColor: `${T.gold}66`, background: `${T.gold}0d`, marginBottom: 12 }}>
            🔔 <b>{praContarHoje} contato(s) pra fazer hoje ou atrasado(s)</b> — veja marcados com o selo amarelo na lista abaixo.
          </div>
        )}

        {/* FORM */}
        <section style={{ ...T.card, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>{editando ? "✏️ Editando comprador" : "➕ Novo comprador / interessado"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8 }}>
            <div>
              <div style={lbl}>👤 Nome</div>
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="ex: Seu Zé Ribeirão" style={input} />
            </div>
            <div>
              <div style={lbl}>💬 WhatsApp (com DDI+DDD)</div>
              <input value={form.zap} onChange={(e) => setForm({ ...form, zap: e.target.value.replace(/\D/g, "") })} placeholder="5519999999999" inputMode="numeric" style={input} />
            </div>
            <div>
              <div style={lbl}>🏙️ Cidade</div>
              <input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="ex: Franca/SP" style={input} />
            </div>
            <div>
              <div style={lbl}>🐦 Anilha(s) comprada(s) / de interesse</div>
              <input value={form.anilhas} onChange={(e) => setForm({ ...form, anilhas: e.target.value })} placeholder="ex: 1234567/26 e 7654321/25" style={input} />
            </div>
            <div>
              <div style={lbl}>📅 Último contato</div>
              <input type="date" value={form.ultimoContato} onChange={(e) => setForm({ ...form, ultimoContato: e.target.value })} style={input} />
            </div>
            <div>
              <div style={lbl}>🔁 Próximo contato (follow-up)</div>
              <input type="date" value={form.proximoContato} onChange={(e) => setForm({ ...form, proximoContato: e.target.value })} style={input} />
            </div>
          </div>
          <textarea value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} rows={2} placeholder="Observações: o que ele cria, o que procura, combinado de preço..." style={{ ...input, marginTop: 8, resize: "vertical" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={salvarForm} style={{ ...T.btn, flex: 1, minWidth: 160 }}>{editando ? "💾 Salvar alterações" : "💾 Anotar comprador"}</button>
            {editando && <button onClick={() => { setForm(vazio()); setEditando(false); }} style={{ ...T.btnGhost, fontWeight: 800 }}>✖ Cancelar edição</button>}
            <button onClick={exportarCSV} style={{ ...T.btnGhost, fontWeight: 800 }}>📄 CSV</button>
          </div>
          {ok && <div style={{ ...T.small, fontSize: 11.5, marginTop: 8, color: ok.startsWith("✅") ? T.green : T.orange }}>{ok}</div>}
        </section>

        {/* BUSCA */}
        <section style={{ ...T.card, marginBottom: 14 }}>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="🔎 Buscar por nome, cidade, anilha, telefone..." style={input} />
        </section>

        {/* LISTA */}
        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📇 Lista ({filtrada.length})</div>
          {filtrada.length === 0 && <div style={{ ...T.small, fontSize: 12 }}>Nenhum comprador anotado ainda — comece pelo primeiro!</div>}
          <div style={{ display: "grid", gap: 8 }}>
            {filtrada.map((c) => {
              const d = diasAte(c.proximoContato);
              const atrasado = d <= 0;
              return (
                <div key={c.id} style={{ padding: 12, borderRadius: 10, background: "#ffffff08", border: `1px solid ${atrasado ? `${T.gold}66` : T.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8, flexWrap: "wrap" }}>
                    <div>
                      <b style={{ fontSize: 13.5 }}>{c.nome}</b>
                      {atrasado && <span style={{ marginLeft: 8, padding: "2px 9px", borderRadius: 8, fontSize: 10, fontWeight: 900, color: T.gold, background: `${T.gold}1a` }}>🔔 dar um alô</span>}
                      <div style={{ ...T.small, fontSize: 11, marginTop: 3, color: T.dim }}>
                        {c.cidade && <>{c.cidade} · </>}
                        {c.zap && <>💬 {c.zap} · </>}
                        {c.anilhas && <>🐦 {c.anilhas}</>}
                      </div>
                      {c.ultimoContato && <div style={{ ...T.small, fontSize: 10.5, marginTop: 3, color: T.dim2 }}>último contato: {br(c.ultimoContato)}{c.proximoContato ? ` · próximo: ${br(c.proximoContato)}` : ""}</div>}
                      {c.obs && <div style={{ ...T.small, fontSize: 11, marginTop: 4, whiteSpace: "pre-wrap" }}>📝 {c.obs}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {c.zap && (
                        <a href={`https://wa.me/${c.zap}`} target="_blank" rel="noreferrer" style={{ padding: "7px 11px", borderRadius: 8, fontSize: 11, fontWeight: 800, textDecoration: "none", color: "#fff", background: "#25d366" }}>💬 WhatsApp</a>
                      )}
                      <button onClick={() => registreiContato(c)} style={{ padding: "7px 11px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer", border: `1px solid ${T.green}66`, background: `${T.green}15`, color: T.green }}>✅ Falei hoje</button>
                      <button onClick={() => editar(c)} style={{ ...T.btnGhost, padding: "7px 11px", fontSize: 11 }}>✏️</button>
                      <button onClick={() => remover(c.id)} style={{ ...T.btnGhost, padding: "7px 11px", fontSize: 11, color: T.red, borderColor: `${T.red}44` }}>🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div style={{ ...T.small, fontSize: 10, marginTop: 12, color: T.dim2, textAlign: "center" }}>
          ☁️ Sua carteira de compradores sincroniza entre PC e celular com seu login.
        </div>
      </div>
    </main>
  );
}
