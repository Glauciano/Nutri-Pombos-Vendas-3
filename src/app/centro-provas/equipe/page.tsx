"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadCalendario, type ProvaCalendario } from "../data/calendario";
import { T } from "../theme";

const KEY_EQUIPES = "nutripombos-equipes-v1";
const HIST_KEY = "nutripombos-historico-provas-v1";

type Pombo = { id: number; anilha: string; nome?: string | null; sexo?: string; status?: string | null };
type Selecao = { anilha: string; nome: string; obs: string };
type Equipe = { provaId: string; selecionados: Selecao[] };
type HistItem = { data: string; distancia?: number; velocidade?: number; colocacao?: number; observacoes?: string };

function fmt(d: string) { return d.split("-").reverse().slice(0, 2).join("/"); }

export default function SelecaoEquipe() {
  const [provas, setProvas] = useState<ProvaCalendario[]>([]);
  const [provaSel, setProvaSel] = useState<ProvaCalendario | null>(null);
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [obs, setObs] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const lista = loadCalendario().filter((p) => !p.cancelada);
    setProvas(lista);
    const hoje = new Date().toISOString().slice(0, 10);
    setProvaSel(lista.find((p) => p.dataSolta >= hoje) || lista[lista.length - 1] || null);
    fetch("/api/pombos").then((r) => r.json()).then((v) => setPombos(Array.isArray(v) ? v : [])).catch(() => setPombos([]));
    try { setEquipes(JSON.parse(localStorage.getItem(KEY_EQUIPES) || "[]")); } catch { setEquipes([]); }
  }, []);

  useEffect(() => { try { localStorage.setItem(KEY_EQUIPES, JSON.stringify(equipes)); } catch { /* ignora */ } }, [equipes]);

  const equipe = provaSel ? equipes.find((e) => e.provaId === provaSel.id) : undefined;
  const selecionados = equipe?.selecionados || [];

  const toggle = (p: Pombo) => {
    if (!provaSel) return;
    setEquipes((atuais) => {
      const idx = atuais.findIndex((e) => e.provaId === provaSel.id);
      const base = idx >= 0 ? atuais[idx] : { provaId: provaSel.id, selecionados: [] as Selecao[] };
      const jaTem = base.selecionados.some((s) => s.anilha === p.anilha);
      base.selecionados = jaTem
        ? base.selecionados.filter((s) => s.anilha !== p.anilha)
        : [...base.selecionados, { anilha: p.anilha, nome: p.nome || p.anilha, obs: obs[p.anilha] || "" }];
      const nova = idx >= 0 ? atuais.map((e, i) => (i === idx ? base : e)) : [...atuais, base];
      return nova;
    });
  };

  const salvarObs = (anilha: string, texto: string) => {
    setObs((o) => ({ ...o, [anilha]: texto }));
    if (!provaSel) return;
    setEquipes((atuais) => atuais.map((e) => e.provaId === provaSel.id
      ? { ...e, selecionados: e.selecionados.map((s) => (s.anilha === anilha ? { ...s, obs: texto } : s)) }
      : e));
  };

  const ativos = pombos.filter((p) => !p.status || p.status === "ativo" || p.status === "Ativo");
  const ultResultado = (anilha: string): HistItem | undefined => {
    try {
      const hist: HistItem[] = JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
      return hist.find((h) => (h.observacoes || "").includes(anilha));
    } catch { return undefined; }
  };

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🕊️ Seleção de Equipe</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Escolha quem embarca em cada prova, com nota de forma/motivação — o registro de quem voou o quê</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🏁 Prova</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {provas.map((p) => (
              <button key={p.id} onClick={() => setProvaSel(p)} style={{ padding: "7px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800, cursor: "pointer", color: provaSel?.id === p.id ? T.bg : T.dim, background: provaSel?.id === p.id ? T.gold : T.bgInput, border: `1px solid ${provaSel?.id === p.id ? T.gold : T.border}` }}>
                #{p.num} {p.cidade} · {p.km}km
              </button>
            ))}
          </div>
          {provaSel && (
            <div style={{ ...T.small, fontSize: 12, marginTop: 10, lineHeight: 1.5 }}>
              Solta {provaSel.diaSolta} {fmt(provaSel.dataSolta)} • embarque {provaSel.diaEmbarque} {fmt(provaSel.dataEmbarque)} • <b style={{ color: T.gold }}>{selecionados.length} pombo(s) selecionado(s)</b> pra esta prova
            </div>
          )}
        </section>

        {provaSel && (
          <>
            <section style={T.card}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📋 Toque nos pombos que embarcam ({ativos.length} ativos no plantel)</div>
              {ativos.length === 0 && (
                <div style={{ ...T.small, lineHeight: 1.7 }}>
                  Nenhum pombo cadastrado ainda. Cadastre seus pombos em <b>Pombos</b> (menu principal) — anilha, nome e sexo — e eles aparecem aqui pra seleção.
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 6 }}>
                {ativos.map((p) => {
                  const sel = selecionados.some((s) => s.anilha === p.anilha);
                  const ur = ultResultado(p.anilha);
                  return (
                    <button key={p.id} onClick={() => toggle(p)} style={{ padding: 10, borderRadius: 10, textAlign: "left", cursor: "pointer", background: sel ? `${T.green}18` : T.bgInput, border: `1.5px solid ${sel ? T.green : T.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <b style={{ fontSize: 12 }}>{p.nome || p.anilha}</b>
                        <span style={{ fontSize: 13 }}>{sel ? "✅" : "⬜"}</span>
                      </div>
                      <div style={{ ...T.small, fontSize: 10 }}>{p.anilha} · {p.sexo === "macho" ? "♂" : p.sexo === "femea" ? "♀" : "—"}{ur?.velocidade ? ` · últ.: ${ur.velocidade} m/min` : ""}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {selecionados.length > 0 && (
              <section style={{ ...T.card, borderColor: `${T.green}55`, background: `${T.green}0d` }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.green, marginBottom: 10 }}>✈️ Equipe da #{provaSel.num} — anote a forma/motivação de cada um</div>
                {selecionados.map((s) => (
                  <div key={s.anilha} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4 }}>🐦 {s.nome} <span style={{ color: T.dim, fontWeight: 600 }}>({s.anilha})</span></div>
                    <input type="text" placeholder="Ex.: no pico da viuvez · voltou forte da última · asa dura · 3º ano" value={obs[s.anilha] ?? s.obs} onChange={(e) => salvarObs(s.anilha, e.target.value)} style={T.input} />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `🕊️ Equipe prova #${provaSel.num} — ${provaSel.cidade} (${provaSel.km}km)\n` +
                        selecionados.map((s) => `• ${s.nome}${s.obs ? ` — ${s.obs}` : ""}`).join("\n")
                      ).catch(() => {});
                      setMsg("✅ Lista copiada! Cole no WhatsApp do clube 📋");
                      window.setTimeout(() => setMsg(""), 2500);
                    }}
                    style={{ ...T.btn, flex: 1 }}
                  >
                    📋 Copiar lista da equipe
                  </button>
                </div>
                {msg && <div style={{ ...T.small, marginTop: 10, color: T.green, textAlign: "center" }}>{msg}</div>}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
