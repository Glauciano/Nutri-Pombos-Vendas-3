"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * ⚖️ Peso e Forma — a curva do atleta.
 * Gaveta "nutripombos-peso-v1" (sincronizada): pesagens {pomboId, data, peso, forma 1-5, obs}.
 * Gráfico SVG de linha + tendência + referências do criador.
 */
const KEY = "nutripombos-peso-v1";

type Medicao = { id: string; pomboId: number; data: string; peso: number; forma: number; obs?: string };

const hojeBR = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const br = (d: string) => d.split("-").reverse().join("/");

function carregar(): Medicao[] {
  try { const d = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(d) ? d : []; } catch { return []; }
}
function salvar(m: Medicao[]) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* cheio */ }
}

export default function PesoForma() {
  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [pombos, setPombos] = useState<{ id: number; anilha: string; nome: string | null; sexo: string }[]>([]);
  const [selId, setSelId] = useState<number | null>(null);
  const [data, setData] = useState(hojeBR());
  const [peso, setPeso] = useState("");
  const [forma, setForma] = useState(3);
  const [obs, setObs] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    setMedicoes(carregar());
    fetch("/api/pombos")
      .then(async (r) => (r.ok ? r.json() : []))
      .then((d) => {
        const lista = Array.isArray(d) ? d : [];
        setPombos(lista);
        if (lista.length) setSelId((s) => s ?? lista[0].id);
      })
      .catch(() => setPombos([]));
  }, []);

  function adicionar() {
    if (!selId) { setOk("⚠️ Selecione o pombo."); return; }
    const p = parseFloat(peso.replace(",", "."));
    if (!Number.isFinite(p) || p < 100 || p > 900) { setOk("⚠️ Peso inválido (pombo-correio fica entre ~300 e ~550 g)."); return; }
    const nova: Medicao = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), pomboId: selId, data, peso: p, forma, obs: obs.trim() || undefined };
    const novas = [nova, ...medicoes];
    setMedicoes(novas); salvar(novas);
    setPeso(""); setObs("");
    setOk("✅ Pesagem registrada!");
    window.setTimeout(() => setOk(""), 2500);
  }

  function remover(id: string) {
    const novas = medicoes.filter((m) => m.id !== id);
    setMedicoes(novas); salvar(novas);
  }

  const sel = pombos.find((p) => p.id === selId) || null;
  const doSel = useMemo(
    () => medicoes.filter((m) => m.pomboId === selId).sort((a, b) => (a.data < b.data ? -1 : 1)),
    [medicoes, selId]
  );

  // estatísticas
  const stats = useMemo(() => {
    if (!doSel.length) return null;
    const pesos = doSel.map((m) => m.peso);
    const ultimo = doSel[doSel.length - 1];
    const penultimo = doSel.length > 1 ? doSel[doSel.length - 2] : null;
    const delta = penultimo ? ultimo.peso - penultimo.peso : 0;
    return {
      ultimo,
      delta,
      media: pesos.reduce((a, b) => a + b, 0) / pesos.length,
      min: Math.min(...pesos),
      max: Math.max(...pesos),
      formaAtual: ultimo.forma,
    };
  }, [doSel]);

  // geometria do gráfico (SVG 640x180)
  const W = 640, H = 180, PAD = 28;
  const graf = useMemo(() => {
    if (doSel.length < 2) return null;
    const min = Math.min(...doSel.map((m) => m.peso)) - 15;
    const max = Math.max(...doSel.map((m) => m.peso)) + 15;
    const x = (i: number) => PAD + (i / (doSel.length - 1)) * (W - 2 * PAD);
    const y = (p: number) => PAD + (1 - (p - min) / (max - min || 1)) * (H - 2 * PAD);
    const pontos = doSel.map((m, i) => ({ x: x(i), y: y(m.peso), m }));
    const linha = pontos.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    return { pontos, linha, min, max };
  }, [doSel]);

  function exportarCSV() {
    const linhas = [["data", "pombo", "peso_g", "forma_1a5", "obs"].join(";")].concat(
      medicoes.map((m) => {
        const p = pombos.find((x) => x.id === m.pomboId);
        return [m.data, p ? p.nome || p.anilha : String(m.pomboId), String(m.peso).replace(".", ","), String(m.forma), m.obs || ""].join(";");
      })
    );
    const blob = new Blob(["\uFEFF" + linhas.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `peso-forma-${hojeBR()}.csv`;
    a.click();
  }

  const input = { ...T.btnGhost, padding: "10px 12px", textAlign: "left" as const, fontWeight: 600, fontSize: 12.5, width: "100%" };
  const lbl = { ...T.small, fontSize: 10, marginBottom: 4, color: T.dim };
  const nomeDe = (p: { nome: string | null; anilha: string }) => p.nome || p.anilha;

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>⚖️ Peso e Forma</h1>
            <p style={{ ...T.small, marginTop: 4 }}>A balança não mente: pesou ontem, pesa hoje, vê a curva. Pombo de prova é atleta — e atleta se mede em gramas e forma.</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {pombos.length === 0 && (
          <div style={T.card}>
            Nenhum pombo cadastrado ainda — <Link href="/centro-provas/pombos" style={{ color: T.blue }}>cadastre seu plantel →</Link>
          </div>
        )}

        {pombos.length > 0 && (
          <>
            {/* REGISTRAR */}
            <section style={{ ...T.card, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>✍️ Registrar pesagem</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={lbl}>🐦 Pombo</div>
                  <select value={selId ?? ""} onChange={(e) => setSelId(Number(e.target.value))} style={input}>
                    {pombos.map((p) => <option key={p.id} value={p.id}>{p.sexo === "macho" ? "♂" : "♀"} {nomeDe(p)} — {p.anilha}</option>)}
                  </select>
                </div>
                <div>
                  <div style={lbl}>📅 Data</div>
                  <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={input} />
                </div>
                <div>
                  <div style={lbl}>⚖️ Peso (gramas)</div>
                  <input inputMode="decimal" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="ex: 425" style={input} />
                </div>
                <div>
                  <div style={lbl}>💪 Forma (1 a 5)</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setForma(n)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, cursor: "pointer", fontWeight: 900, fontSize: 13, border: `1.5px solid ${forma === n ? T.gold : T.border}`, background: forma === n ? T.gold : T.bgInput, color: forma === n ? T.bg : T.dim }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observação (opcional): véspera de prova, pós-treino, muda..." style={{ ...input, marginTop: 8 }} />
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <button onClick={adicionar} style={{ ...T.btn, flex: 1, minWidth: 170 }}>💾 Registrar</button>
                <button onClick={exportarCSV} style={{ ...T.btnGhost, fontWeight: 800 }}>📄 Exportar CSV</button>
              </div>
              {ok && <div style={{ ...T.small, fontSize: 11.5, marginTop: 8, color: ok.startsWith("✅") ? T.green : T.orange }}>{ok}</div>}
            </section>

            {/* CURVA + STATS */}
            {sel && (
              <section style={{ ...T.card, marginBottom: 14, borderColor: `${T.gold}55` }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
                  📈 Curva de {nomeDe(sel)} <span style={{ fontFamily: "monospace", color: T.dim, fontWeight: 600 }}>({sel.anilha})</span>
                </div>

                {!stats && <div style={{ ...T.small, fontSize: 12 }}>Registre pelo menos 2 pesagens deste pombo pra ver a curva nascer.</div>}

                {stats && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginBottom: 12 }}>
                      <div style={{ padding: 10, borderRadius: 10, background: "#ffffff08" }}>
                        <div style={{ fontSize: 9.5, color: T.dim, fontWeight: 800 }}>ÚLTIMO PESO</div>
                        <div style={{ fontSize: 18, fontWeight: 900 }}>{stats.ultimo.peso} g</div>
                        <div style={{ fontSize: 9.5, color: T.dim2 }}>{br(stats.ultimo.data)}</div>
                      </div>
                      <div style={{ padding: 10, borderRadius: 10, background: "#ffffff08" }}>
                        <div style={{ fontSize: 9.5, color: T.dim, fontWeight: 800 }}>VARIAÇÃO</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: stats.delta > 0 ? T.orange : stats.delta < 0 ? T.blue : T.dim }}>
                          {stats.delta > 0 ? "▲" : stats.delta < 0 ? "▼" : "="} {Math.abs(stats.delta)} g
                        </div>
                        <div style={{ fontSize: 9.5, color: T.dim2 }}>vs pesagem anterior</div>
                      </div>
                      <div style={{ padding: 10, borderRadius: 10, background: "#ffffff08" }}>
                        <div style={{ fontSize: 9.5, color: T.dim, fontWeight: 800 }}>MÉDIA</div>
                        <div style={{ fontSize: 18, fontWeight: 900 }}>{stats.media.toFixed(0)} g</div>
                        <div style={{ fontSize: 9.5, color: T.dim2 }}>mín {stats.min} · máx {stats.max}</div>
                      </div>
                      <div style={{ padding: 10, borderRadius: 10, background: "#ffffff08" }}>
                        <div style={{ fontSize: 9.5, color: T.dim, fontWeight: 800 }}>FORMA ATUAL</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: stats.formaAtual >= 4 ? T.green : stats.formaAtual <= 2 ? T.red : T.gold }}>{"★".repeat(stats.formaAtual)}{"☆".repeat(5 - stats.formaAtual)}</div>
                        <div style={{ fontSize: 9.5, color: T.dim2 }}>{stats.formaAtual >= 4 ? "em forma!" : stats.formaAtual <= 2 ? "abaixo da forma" : "ok"}</div>
                      </div>
                    </div>

                    {graf && (
                      <div style={{ borderRadius: 10, background: "#0b1529", padding: 6, border: `1px solid ${T.border}` }}>
                        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
                          {/* linhas de referência */}
                          <line x1={PAD} y1={PAD} x2={W - PAD} y2={PAD} stroke="#ffffff18" strokeWidth="1" strokeDasharray="4 4" />
                          <text x={PAD + 4} y={PAD - 6} fontSize="9" fill="#64748b">{graf.max.toFixed(0)} g</text>
                          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#ffffff18" strokeWidth="1" strokeDasharray="4 4" />
                          <text x={PAD + 4} y={H - PAD + 12} fontSize="9" fill="#64748b">{graf.min.toFixed(0)} g</text>
                          {/* curva */}
                          <path d={graf.linha} fill="none" stroke="#f7bd00" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                          {graf.pontos.map((p, i) => (
                            <g key={i}>
                              <circle cx={p.x} cy={p.y} r="4" fill="#f7bd00" stroke="#0b1529" strokeWidth="1.5" />
                              {i === graf!.pontos.length - 1 && (
                                <>
                                  <circle cx={p.x} cy={p.y} r="8" fill="none" stroke="#f7bd00" strokeWidth="1.5" opacity="0.5" />
                                  <text x={Math.min(p.x + 8, W - 40)} y={p.y - 8} fontSize="11" fontWeight="800" fill="#f7bd00">{p.m.peso} g</text>
                                </>
                              )}
                            </g>
                          ))}
                          {/* datas primeiro/último */}
                          <text x={PAD} y={H - 4} fontSize="9" fill="#64748b">{br(graf.pontos[0].m.data)}</text>
                          <text x={W - PAD} y={H - 4} fontSize="9" fill="#64748b" textAnchor="end">{br(graf.pontos[graf.pontos.length - 1].m.data)}</text>
                        </svg>
                      </div>
                    )}
                  </>
                )}

                {/* TABELA */}
                {doSel.length > 0 && (
                  <div style={{ marginTop: 12, display: "grid", gap: 5 }}>
                    {[...doSel].reverse().map((m) => (
                      <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 11px", borderRadius: 8, background: "#ffffff08", fontSize: 12, flexWrap: "wrap" }}>
                        <span>
                          <b style={{ color: T.gold }}>{m.peso} g</b>
                          <span style={{ color: T.dim }}> · {br(m.data)} · {"★".repeat(m.forma)}{"☆".repeat(5 - m.forma)}</span>
                          {m.obs && <span style={{ color: T.dim2 }}> · {m.obs}</span>}
                        </span>
                        <button onClick={() => remover(m.id)} style={{ ...T.btnGhost, padding: "2px 8px", fontSize: 10, color: T.red, borderColor: `${T.red}44` }}>🗑️</button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ESCOLA */}
            <section style={T.card}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📖 A balança do criador</div>
              <div style={{ ...T.small, fontSize: 12, lineHeight: 1.85, color: T.dim }}>
                • <b style={{ color: T.white }}>Referência de peso</b> (varia com linhagem e porte): macho ~380–450 g · fêmea ~340–410 g. Pombo de fundo tende a ser um pouco maior que o de velocidade.
                <br />• <b style={{ color: T.white }}>O peso "de prova"</b> é o SEU pombo no SEU melhor histórico — anote após uma boa temporada e use como alvo da próxima.
                <br />• <b style={{ color: T.white }}>Forma 1–5</b> é o toque do criador: músculo do peito cheio e rosado, pena sedosa, olho vivo = 4–5. Peito "faca" (quilha saltada) = 1–2.
                <br />• Queda rápida de peso + forma baixa = primeira suspeita de <b>coccidiose/tricomoniase</b> — confira o <Link href="/centro-provas/guia-terapeutico" style={{ color: T.blue }}>guia terapêutico</Link> e o veterinário.
                <br />• Pese sempre <b style={{ color: T.white }}>no mesmo horário</b> (de manhã, antes da ração) — a comparação é o que vale.
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
