"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * 💰 Caixa do Pombal — livro-caixa de verdade: lançamentos de gastos e ganhos.
 * Guarda na gaveta "nutripombos-caixa-v1" (sincronizada entre aparelhos).
 * Complementa o módulo "Custos e ROI" (que é a PROJEÇÃO teórica; aqui é o que saiu do bolso).
 */
const KEY = "nutripombos-caixa-v1";

type Tipo = "gasto" | "ganho";
type Lancamento = { id: string; data: string; tipo: Tipo; cat: string; valor: number; desc: string };

const CATS_GASTO = ["Ração", "Suplementos", "Medicamentos", "Anilhas / federação", "Inscrições de prova", "Cesto / ferragem", "Outro"];
const CATS_GANHO = ["Venda de pombo", "Prêmio de prova", "Outro"];

const hoje = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function carregar(): Lancamento[] {
  try { const d = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(d) ? d : []; } catch { return []; }
 }
function salvar(l: Lancamento[]) {
  try { localStorage.setItem(KEY, JSON.stringify(l)); } catch { /* cheio */ }
}

export default function CaixaPombal() {
  const [lanc, setLanc] = useState<Lancamento[]>([]);
  const [tipo, setTipo] = useState<Tipo>("gasto");
  const [data, setData] = useState(hoje());
  const [cat, setCat] = useState(CATS_GASTO[0]);
  const [valor, setValor] = useState("");
  const [desc, setDesc] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => { setLanc(carregar()); }, []);

  function trocarTipo(t: Tipo) {
    setTipo(t);
    setCat(t === "gasto" ? CATS_GASTO[0] : CATS_GANHO[0]);
  }

  function adicionar() {
    const v = parseFloat(valor.replace(",", "."));
    if (!Number.isFinite(v) || v <= 0) { setOk("⚠️ Digite um valor válido (ex: 120,50)."); return; }
    const novo: Lancamento = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), data, tipo, cat, valor: v, desc: desc.trim() };
    const novos = [novo, ...lanc];
    setLanc(novos); salvar(novos);
    setValor(""); setDesc("");
    setOk("✅ Lançamento anotado no caixa!");
    window.setTimeout(() => setOk(""), 2500);
  }

  function remover(id: string) {
    const novos = lanc.filter((l) => l.id !== id);
    setLanc(novos); salvar(novos);
  }

  const resumo = useMemo(() => {
    const mes = hoje().slice(0, 7);
    const ano = hoje().slice(0, 4);
    const tot = (ls: Lancamento[]) => ls.reduce((s, l) => s + l.valor, 0);
    const gastosMes = tot(lanc.filter((l) => l.tipo === "gasto" && l.data.startsWith(mes)));
    const ganhosMes = tot(lanc.filter((l) => l.tipo === "ganho" && l.data.startsWith(mes)));
    const gastosAno = tot(lanc.filter((l) => l.tipo === "gasto" && l.data.startsWith(ano)));
    const ganhosAno = tot(lanc.filter((l) => l.tipo === "ganho" && l.data.startsWith(ano)));

    // últimos 12 meses
    const meses: { chave: string; label: string; gasto: number; ganho: number }[] = [];
    const agora = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      meses.push({ chave, label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), gasto: 0, ganho: 0 });
    }
    lanc.forEach((l) => {
      const m = meses.find((x) => l.data.startsWith(x.chave));
      if (m) { if (l.tipo === "gasto") m.gasto += l.valor; else m.ganho += l.valor; }
    });

    // por categoria (gastos, ano)
    const porCat = new Map<string, number>();
    lanc.filter((l) => l.tipo === "gasto" && l.data.startsWith(ano)).forEach((l) => porCat.set(l.cat, (porCat.get(l.cat) || 0) + l.valor));

    return { gastosMes, ganhosMes, gastosAno, ganhosAno, meses, porCat: [...porCat.entries()].sort((a, b) => b[1] - a[1]) };
  }, [lanc]);

  const maxBarra = Math.max(1, ...resumo.meses.map((m) => Math.max(m.gasto, m.ganho)));

  function exportarCSV() {
    const linhas = [["data", "tipo", "categoria", "valor", "descricao"].join(";")].concat(
      lanc.map((l) => [l.data, l.tipo, l.cat, String(l.valor).replace(".", ","), l.desc].join(";"))
    );
    const blob = new Blob(["\uFEFF" + linhas.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `caixa-pombal-${hoje()}.csv`;
    a.click();
  }

  const input = { ...T.btnGhost, padding: "10px 12px", textAlign: "left" as const, fontWeight: 600, fontSize: 12.5, width: "100%" };

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>💰 Caixa do Pombal</h1>
            <p style={{ ...T.small, marginTop: 4 }}>O livro-caixa de verdade: o que saiu do bolso e o que entrou. (O módulo Custos e ROI faz a projeção teórica — este registra a realidade.)</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {/* PAINEL DO MÊS / ANO */}
        <section style={{ ...T.card, marginBottom: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          <div style={{ padding: 12, borderRadius: 10, background: "#ff5d6212", border: "1px solid #ff5d6244" }}>
            <div style={{ fontSize: 10, color: T.dim, fontWeight: 800 }}>GASTOS DO MÊS</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: T.red }}>{brl(resumo.gastosMes)}</div>
          </div>
          <div style={{ padding: 12, borderRadius: 10, background: "#39e58c12", border: "1px solid #39e58c44" }}>
            <div style={{ fontSize: 10, color: T.dim, fontWeight: 800 }}>GANHOS DO MÊS</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: T.green }}>{brl(resumo.ganhosMes)}</div>
          </div>
          <div style={{ padding: 12, borderRadius: 10, background: (resumo.ganhosMes - resumo.gastosMes) >= 0 ? "#39e58c12" : "#f7bd0012", border: `1px solid ${(resumo.ganhosMes - resumo.gastosMes) >= 0 ? "#39e58c44" : "#f7bd0044"}` }}>
            <div style={{ fontSize: 10, color: T.dim, fontWeight: 800 }}>SALDO DO MÊS</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: (resumo.ganhosMes - resumo.gastosMes) >= 0 ? T.green : T.gold }}>{brl(resumo.ganhosMes - resumo.gastosMes)}</div>
          </div>
          <div style={{ padding: 12, borderRadius: 10, background: "#ffffff08", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, color: T.dim, fontWeight: 800 }}>SALDO DO ANO</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: resumo.ganhosAno - resumo.gastosAno >= 0 ? T.green : T.red }}>{brl(resumo.ganhosAno - resumo.gastosAno)}</div>
            <div style={{ fontSize: 9.5, color: T.dim2 }}>gastos {brl(resumo.gastosAno)} · ganhos {brl(resumo.ganhosAno)}</div>
          </div>
        </section>

        {/* GRÁFICO 12 MESES */}
        <section style={{ ...T.card, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 12 }}>📊 Últimos 12 meses <span style={{ fontWeight: 600, fontSize: 10, color: T.dim }}>— barra vermelha = gastos · verde = ganhos</span></div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
            {resumo.meses.map((m) => (
              <div key={m.chave} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 2, height: "100%" }} title={`${m.label}: gastos ${brl(m.gasto)} · ganhos ${brl(m.ganho)}`}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: "100%", width: "100%", justifyContent: "center" }}>
                  <div style={{ width: "42%", maxWidth: 26, height: `${(m.gasto / maxBarra) * 100}%`, background: T.red, borderRadius: "4px 4px 0 0", minHeight: m.gasto > 0 ? 3 : 0 }} />
                  <div style={{ width: "42%", maxWidth: 26, height: `${(m.ganho / maxBarra) * 100}%`, background: T.green, borderRadius: "4px 4px 0 0", minHeight: m.ganho > 0 ? 3 : 0 }} />
                </div>
                <div style={{ fontSize: 9, color: T.dim, textTransform: "uppercase" }}>{m.label}</div>
              </div>
            ))}
          </div>
          {resumo.porCat.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.dim, marginBottom: 6 }}>GASTOS DO ANO POR CATEGORIA</div>
              {resumo.porCat.map(([nome, v]) => (
                <div key={nome} style={{ marginBottom: 5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span>{nome}</span>
                    <b style={{ color: T.red }}>{brl(v)}</b>
                  </div>
                  <div style={{ height: 5, borderRadius: 4, background: "#ffffff10", marginTop: 2 }}>
                    <div style={{ height: "100%", borderRadius: 4, background: T.red, width: `${(v / resumo.porCat[0][1]) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* LANÇAR */}
        <section style={{ ...T.card, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>✍️ Lançar no caixa</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button onClick={() => trocarTipo("gasto")} style={{ flex: 1, padding: "9px 0", borderRadius: 10, cursor: "pointer", fontWeight: 900, fontSize: 12.5, border: `1.5px solid ${tipo === "gasto" ? T.red : T.border}`, background: tipo === "gasto" ? "#ff5d6222" : T.bgInput, color: tipo === "gasto" ? T.red : T.dim }}>📉 GASTO</button>
            <button onClick={() => trocarTipo("ganho")} style={{ flex: 1, padding: "9px 0", borderRadius: 10, cursor: "pointer", fontWeight: 900, fontSize: 12.5, border: `1.5px solid ${tipo === "ganho" ? T.green : T.border}`, background: tipo === "ganho" ? "#39e58c22" : T.bgInput, color: tipo === "ganho" ? T.green : T.dim }}>📈 GANHO</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ ...T.small, fontSize: 10, marginBottom: 4 }}>📅 Data</div>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={input} />
            </div>
            <div>
              <div style={{ ...T.small, fontSize: 10, marginBottom: 4 }}>🏷️ Categoria</div>
              <select value={cat} onChange={(e) => setCat(e.target.value)} style={input}>
                {(tipo === "gasto" ? CATS_GASTO : CATS_GANHO).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ ...T.small, fontSize: 10, marginBottom: 4 }}>💵 Valor (R$)</div>
              <input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="ex: 120,50" style={input} />
            </div>
          </div>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descrição (ex: 6 sacos de ração 40kg, ou venda do filhote do Trovão)" style={{ ...input, marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={adicionar} style={{ ...T.btn, flex: 1, minWidth: 170 }}>💾 Lançar</button>
            <button onClick={exportarCSV} style={{ ...T.btnGhost, fontWeight: 800 }}>📄 Exportar CSV</button>
          </div>
          {ok && <div style={{ ...T.small, fontSize: 11.5, marginTop: 8, color: ok.startsWith("✅") ? T.green : T.orange }}>{ok}</div>}
        </section>

        {/* LISTA */}
        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🧾 Lançamentos ({lanc.length})</div>
          {lanc.length === 0 && <div style={{ ...T.small, fontSize: 12 }}>Nenhum lançamento ainda — comece anotando a próxima compra de ração!</div>}
          <div style={{ display: "grid", gap: 6 }}>
            {lanc.map((l) => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "#ffffff08", borderLeft: `3px solid ${l.tipo === "gasto" ? T.red : T.green}`, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 11, color: T.dim, fontWeight: 700 }}>{l.data.split("-").reverse().join("/")} · {l.cat}</div>
                  {l.desc && <div style={{ fontSize: 12, marginTop: 2 }}>{l.desc}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <b style={{ fontSize: 14.5, color: l.tipo === "gasto" ? T.red : T.green }}>{l.tipo === "gasto" ? "−" : "+"} {brl(l.valor)}</b>
                  <button onClick={() => remover(l.id)} style={{ ...T.btnGhost, padding: "3px 9px", fontSize: 10 }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ ...T.small, fontSize: 10, marginTop: 12, color: T.dim2, textAlign: "center" }}>
          ☁️ Lançamentos guardados no aparelho e sincronizados com seu login entre PC e celular.
        </div>
      </div>
    </main>
  );
}
