"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

const KEY_CRON = "nutripombos-cronicas-v1";
const HIST_KEY = "nutripombos-historico-provas-v1";

type Cronica = {
  provaId: string; num: number; cidade: string; estado: string; km: number;
  dataSolta: string; geradoEm: string; modo: string;
  scoreMedio: number | null;
  piorTrecho: { nome: string; pts: number | null } | null;
  idp: { valor: number; label: string } | null;
  kp: number | null;
  chegadaPrevista: string | null;
  veloEstimada: number;
  passagens: string[];
  resumo: string;
};

type HistItem = { data: string; velocidade?: number; colocacao?: number; distancia?: number };

function fmt(d: string) { return d.split("-").reverse().slice(0, 2).join("/"); }

export default function Cronicas() {
  const [lista, setLista] = useState<Cronica[]>([]);
  const [hist, setHist] = useState<HistItem[]>([]);
  const [aberta, setAberta] = useState<string | null>(null);

  useEffect(() => {
    try { setLista(JSON.parse(localStorage.getItem(KEY_CRON) || "[]")); } catch { setLista([]); }
    try { setHist(JSON.parse(localStorage.getItem(HIST_KEY) || "[]")); } catch { setHist([]); }
  }, []);

  const realizadoDe = (c: Cronica) => hist.find((h) => h.data === c.dataSolta && Math.abs((h.distancia ?? c.km) - c.km) <= 30);
  const apagar = (id: string) => {
    if (!confirm("Apagar esta crônica?")) return;
    const nova = lista.filter((c) => c.provaId !== id);
    setLista(nova);
    try { localStorage.setItem(KEY_CRON, JSON.stringify(nova)); } catch { /* ignora */ }
  };

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>📖 Crônicas da Temporada</h1>
            <p style={{ ...T.small, marginTop: 4 }}>O diário das provas: panorama arquivado antes da soltura × resultado realizado</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {lista.length === 0 && (
          <section style={T.card}>
            <div style={{ ...T.small, lineHeight: 1.7, fontSize: 13 }}>
              Nenhuma crônica ainda. Na <b>Rota da Prova</b>, toque em <b>📖 Arquivar crônica</b> (perto dos botões de WhatsApp/relatório) para guardar o panorama da prova — score, IDP, Kp, passagens previstas e chegada estimada.
              <br /><br />
              Depois da prova, quando você registrar o resultado no <b>Histórico</b>, a crônica mostra aqui o comparativo <b>previsto × realizado</b> 🎯
            </div>
          </section>
        )}

        {lista.map((c) => {
          const realizado = realizadoDe(c);
          const detalhe = aberta === c.provaId;
          return (
            <section key={c.provaId} style={{ ...T.card, borderColor: c.idp ? `${c.idp.valor > 7 ? "#ff5d62" : c.idp.valor > 5 ? "#f97316" : "#39e58c"}44` : T.border }}>
              <div onClick={() => setAberta(detalhe ? null : c.provaId)} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <b style={{ fontSize: 15 }}>🏁 #{c.num} {c.cidade}/{c.estado} — {c.km}km</b>
                    <div style={{ ...T.small, fontSize: 11 }}>
                      Solta {fmt(c.dataSolta)} • arquivada em {new Date(c.geradoEm).toLocaleString("pt-BR", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })} ({c.modo === "prova" ? "previsão do dia" : "condições do momento"})
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    {c.idp && <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800, color: "#0b1426", background: c.idp.valor > 7 ? "#ff5d62" : c.idp.valor > 5 ? "#f97316" : "#39e58c" }}>🎯 IDP {c.idp.valor.toFixed(1)}</span>}
                    {c.scoreMedio != null && <span style={{ ...T.small, fontSize: 11 }}>score {c.scoreMedio}%</span>}
                    <small style={{ color: T.dim }}>{detalhe ? "▲" : "▼"}</small>
                  </div>
                </div>
                {realizado && (
                  <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: `${T.green}12`, border: `1px solid ${T.green}44`, fontSize: 12 }}>
                    🏆 <b>Realizado:</b> {realizado.colocacao ?? "—"}º lugar • {realizado.velocidade ?? "—"} m/min
                    {c.veloEstimada ? <> • previsto ~{c.veloEstimada} m/min → <b style={{ color: (realizado.velocidade ?? 0) >= c.veloEstimada ? T.green : T.gold }}>{(realizado.velocidade ?? 0) >= c.veloEstimada ? "superou" : "abaixo"} ({(realizado.velocidade ?? 0) - c.veloEstimada > 0 ? "+" : ""}{(realizado.velocidade ?? 0) - c.veloEstimada} m/min)</b></> : null}
                  </div>
                )}
              </div>
              {detalhe && (
                <div style={{ marginTop: 12 }}>
                  {c.chegadaPrevista && <div style={{ ...T.small, marginBottom: 6 }}>⏱️ Chegada prevista na época: <b style={{ color: T.gold }}>{c.chegadaPrevista}</b></div>}
                  {c.kp != null && <div style={{ ...T.small, marginBottom: 6 }}>🧲 Kp na época: <b>{c.kp.toFixed(2)}</b></div>}
                  {c.piorTrecho && <div style={{ ...T.small, marginBottom: 6 }}>⚠️ Pior trecho previsto: <b>{c.piorTrecho.nome}{c.piorTrecho.pts != null ? ` (${c.piorTrecho.pts}%)` : ""}</b></div>}
                  {c.passagens.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ ...T.small, marginBottom: 4 }}>⏳ Passagens previstas:</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 6 }}>
                        {c.passagens.map((pp, i) => (
                          <div key={i} style={{ padding: "6px 9px", borderRadius: 7, background: "#ffffff08", fontSize: 11 }}>{pp}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard?.writeText(c.resumo).catch(() => {}); }}
                      style={{ ...T.btnGhost, flex: 1 }}
                    >📋 Copiar resumo da época</button>
                    <button type="button" onClick={() => apagar(c.provaId)} style={{ ...T.btnGhost, color: T.red }}>🗑️</button>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
