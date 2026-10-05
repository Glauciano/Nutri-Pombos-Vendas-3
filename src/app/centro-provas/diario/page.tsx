"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * 📓 Diário do Pombal — caderno digital de campo.
 * Guarda no aparelho (localStorage) na gaveta "nutripombos-diario-v1",
 * que o sistema de sincronização espelha automaticamente pra todos os aparelhos.
 */
const KEY = "nutripombos-diario-v1";

type Cat = "treino" | "saude" | "manejo" | "observacao" | "outro";
type Entrada = { id: string; data: string; cat: Cat; pomboId?: number | null; pomboNome?: string | null; texto: string };

const CATS: Record<Cat, { label: string; icon: string; cor: string }> = {
  treino: { label: "Treino", icon: "🏃", cor: "#55a3ff" },
  saude: { label: "Saúde", icon: "💊", cor: "#ff5d62" },
  manejo: { label: "Manejo", icon: "🧹", cor: "#f7bd00" },
  observacao: { label: "Observação", icon: "👀", cor: "#39e58c" },
  outro: { label: "Outro", icon: "📝", cor: "#9aa8bc" },
};

const hoje = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

function carregar(): Entrada[] {
  try { const d = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(d) ? d : []; } catch { return []; }
}
function salvar(e: Entrada[]) {
  try { localStorage.setItem(KEY, JSON.stringify(e)); } catch { /* cheio */ }
}

export default function DiarioPombal() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [pombos, setPombos] = useState<{ id: number; anilha: string; nome: string | null }[]>([]);
  const [data, setData] = useState(hoje());
  const [cat, setCat] = useState<Cat>("treino");
  const [pomboId, setPomboId] = useState("");
  const [texto, setTexto] = useState("");
  const [filtroPombo, setFiltroPombo] = useState("");
  const [filtroCat, setFiltroCat] = useState<"todas" | Cat>("todas");
  const [busca, setBusca] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    setEntradas(carregar());
    fetch("/api/pombos")
      .then(async (r) => (r.ok ? r.json() : []))
      .then((d) => setPombos(Array.isArray(d) ? d : []))
      .catch(() => setPombos([]));
  }, []);

  function adicionar() {
    if (!texto.trim()) { setOk("⚠️ Escreva o que aconteceu antes de salvar."); return; }
    const p = pombos.find((x) => String(x.id) === pomboId);
    const nova: Entrada = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      data, cat,
      pomboId: p ? p.id : null,
      pomboNome: p ? p.nome || p.anilha : null,
      texto: texto.trim(),
    };
    const novas = [nova, ...entradas];
    setEntradas(novas); salvar(novas);
    setTexto(""); setPomboId("");
    setOk("✅ Anotado no diário! (sincroniza pros outros aparelhos)");
    window.setTimeout(() => setOk(""), 2500);
  }

  function remover(id: string) {
    const novas = entradas.filter((e) => e.id !== id);
    setEntradas(novas); salvar(novas);
  }

  const lista = useMemo(() => {
    return entradas
      .filter((e) => (filtroCat === "todas" ? true : e.cat === filtroCat))
      .filter((e) => (filtroPombo ? String(e.pomboId || "") === filtroPombo : true))
      .filter((e) => (busca ? e.texto.toLowerCase().includes(busca.toLowerCase()) || (e.pomboNome || "").toLowerCase().includes(busca.toLowerCase()) : true))
      .sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
  }, [entradas, filtroCat, filtroPombo, busca]);

  const mesAtual = hoje().slice(0, 7);
  const doMes = entradas.filter((e) => e.data.startsWith(mesAtual));

  function exportarCSV() {
    const linhas = [["data", "categoria", "pombo", "anotacao"].join(";")].concat(
      entradas.map((e) => [e.data, CATS[e.cat]?.label || e.cat, e.pomboNome || "", e.texto.replace(/\n/g, " ")].join(";"))
    );
    const blob = new Blob(["\uFEFF" + linhas.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `diario-pombal-${hoje()}.csv`;
    a.click();
  }

  const input = { ...T.btnGhost, padding: "10px 12px", textAlign: "left" as const, fontWeight: 600, fontSize: 12.5, width: "100%" };

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>📓 Diário do Pombal</h1>
            <p style={{ ...T.small, marginTop: 4 }}>O caderno de campo digital: treinos, saúde, manejo e observações — tudo com data, buscável e sincronizado entre aparelhos.</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {/* ANOTAR */}
        <section style={{ ...T.card, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>✍️ Anotar no diário</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ ...T.small, fontSize: 10, marginBottom: 4 }}>📅 Data</div>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={input} />
            </div>
            <div>
              <div style={{ ...T.small, fontSize: 10, marginBottom: 4 }}>🐦 Pombo (opcional)</div>
              <select value={pomboId} onChange={(e) => setPomboId(e.target.value)} style={input}>
                <option value="">— do plantel em geral —</option>
                {pombos.map((p) => <option key={p.id} value={p.id}>{p.nome || p.anilha}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {(Object.keys(CATS) as Cat[]).map((c) => (
              <button key={c} onClick={() => setCat(c)} style={{ padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontSize: 11.5, fontWeight: 800, border: `1.5px solid ${cat === c ? CATS[c].cor : T.border}`, background: cat === c ? `${CATS[c].cor}22` : T.bgInput, color: cat === c ? CATS[c].cor : T.dim }}>
                {CATS[c].icon} {CATS[c].label}
              </button>
            ))}
          </div>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="O que aconteceu hoje? Ex: soltei 12 pombos em Pirassununga 06h40, vento fraco nordeste, todos voltaram até 10h. Trovão Azul chegou 1º e de pena feia..." rows={3} style={{ ...input, resize: "vertical" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={adicionar} style={{ ...T.btn, flex: 1, minWidth: 180 }}>💾 Salvar no diário</button>
            <button onClick={exportarCSV} style={{ ...T.btnGhost, fontWeight: 800 }}>📄 Exportar CSV</button>
          </div>
          {ok && <div style={{ ...T.small, fontSize: 11.5, marginTop: 8, color: ok.startsWith("✅") ? T.green : T.orange }}>{ok}</div>}
        </section>

        {/* RESUMO DO MÊS */}
        <section style={{ ...T.card, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 8 }}>📅 Resumo do mês</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ padding: "6px 12px", borderRadius: 10, background: "#ffffff08", fontSize: 12, fontWeight: 700 }}>{doMes.length} anotações</span>
            {(Object.keys(CATS) as Cat[]).filter((c) => doMes.some((e) => e.cat === c)).map((c) => (
              <span key={c} style={{ padding: "6px 12px", borderRadius: 10, background: `${CATS[c].cor}15`, color: CATS[c].cor, fontSize: 12, fontWeight: 700 }}>
                {CATS[c].icon} {doMes.filter((e) => e.cat === c).length} {CATS[c].label.toLowerCase()}
              </span>
            ))}
            {doMes.length === 0 && <span style={{ ...T.small, fontSize: 11.5 }}>Nada anotado este mês ainda — o diário de quem vence começa na segunda-feira! 😄</span>}
          </div>
        </section>

        {/* FILTROS */}
        <section style={{ ...T.card, marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
            <select value={filtroPombo} onChange={(e) => setFiltroPombo(e.target.value)} style={input}>
              <option value="">🐦 Todos os pombos</option>
              {pombos.map((p) => <option key={p.id} value={p.id}>{p.nome || p.anilha}</option>)}
            </select>
            <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value as "todas" | Cat)} style={input}>
              <option value="todas">🗂️ Todas as categorias</option>
              {(Object.keys(CATS) as Cat[]).map((c) => <option key={c} value={c}>{CATS[c].icon} {CATS[c].label}</option>)}
            </select>
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="🔎 Buscar no diário..." style={input} />
          </div>
        </section>

        {/* LISTA */}
        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📚 Histórico ({lista.length})</div>
          {lista.length === 0 && <div style={{ ...T.small, fontSize: 12 }}>Nenhuma anotação encontrada.</div>}
          <div style={{ display: "grid", gap: 8 }}>
            {lista.map((e) => {
              const c = CATS[e.cat] || CATS.outro;
              return (
                <div key={e.id} style={{ padding: 12, borderRadius: 10, background: "#ffffff08", borderLeft: `3px solid ${c.cor}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: c.cor }}>
                      {c.icon} {e.data.split("-").reverse().join("/")}
                      {e.pomboNome && <span style={{ color: T.dim, fontWeight: 600 }}> · {e.pomboNome}</span>}
                    </div>
                    <button onClick={() => remover(e.id)} style={{ ...T.btnGhost, padding: "3px 9px", fontSize: 10, color: T.red, borderColor: `${T.red}44` }}>🗑️ apagar</button>
                  </div>
                  <div style={{ ...T.small, fontSize: 12.5, lineHeight: 1.65, marginTop: 5, whiteSpace: "pre-wrap" }}>{e.texto}</div>
                </div>
              );
            })}
          </div>
        </section>

        <div style={{ ...T.small, fontSize: 10, marginTop: 12, color: T.dim2, textAlign: "center" }}>
          ☁️ As anotações ficam no aparelho e sincronizam com seu login (Configuração → Sincronização).
        </div>
      </div>
    </main>
  );
}
