"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadCalendario } from "../data/calendario";
import { loadConfig } from "../config";
import { T } from "../theme";

const HIST_KEY = "nutripombos-historico-provas-v1";
const VENDAS_KEY = "nutripombos-vendas-v1";
const CRON_KEY = "nutripombos-cronicas-v1";

type Hist = { data: string; competicao?: string; distancia: number; colocacao: number; velocidade: number };
type Venda = { data: string; preco: number; anilha: string };
type Cronica = { provaId: string; dataSolta: string; idp?: { valor: number } | null; scoreMedio?: number | null; kp?: number | null };

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function RelatorioTemporada() {
  const [hist, setHist] = useState<Hist[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [cronicas, setCronicas] = useState<Cronica[]>([]);
  const [ano, setAno] = useState<string>(String(new Date().getFullYear()));
  const [cfg, setCfg] = useState({ consumoDiario: 30, quantidadePombos: 20 });

  useEffect(() => {
    try { setHist(JSON.parse(localStorage.getItem(HIST_KEY) || "[]")); } catch { /* ignora */ }
    try { setVendas(JSON.parse(localStorage.getItem(VENDAS_KEY) || "[]")); } catch { /* ignora */ }
    try { setCronicas(JSON.parse(localStorage.getItem(CRON_KEY) || "[]")); } catch { /* ignora */ }
    const c = loadConfig(); setCfg({ consumoDiario: c.consumoDiario, quantidadePombos: c.quantidadePombos });
    const provas = loadCalendario();
    if (provas.length) setAno(provas.find((p) => p.dataSolta >= new Date().toISOString().slice(0, 10))?.dataSolta.slice(0, 4) || String(new Date().getFullYear()));
  }, []);

  const anos = useMemo(() => Array.from(new Set([...hist.map((h) => h.data.slice(0, 4)), ...vendas.map((v) => v.data.slice(0, 4)), String(new Date().getFullYear())])).sort().reverse(), [hist, vendas]);
  const histAno = hist.filter((h) => h.data.startsWith(ano));
  const vendasAno = vendas.filter((v) => v.data.startsWith(ano));
  const cronicasAno = cronicas.filter((c) => c.dataSolta?.startsWith(ano));

  const provasUnicas = useMemo(() => {
    const m = new Map<string, Hist[]>();
    histAno.forEach((h) => { const k = h.data; m.set(k, [...(m.get(k) || []), h]); });
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [histAno]);

  const porMes = useMemo(() => {
    const linhas = MESES.map((m) => ({ mes: m, n: 0, vel: [] as number[], melhor: 999 }));
    histAno.forEach((h) => {
      const mi = Number(h.data.slice(5, 7)) - 1;
      if (mi < 0 || mi > 11) return;
      linhas[mi].n++;
      if (h.velocidade) linhas[mi].vel.push(h.velocidade);
      if (h.colocacao) linhas[mi].melhor = Math.min(linhas[mi].melhor, h.colocacao);
    });
    return linhas.map((l) => ({ ...l, media: l.vel.length ? Math.round(l.vel.reduce((a, b) => a + b, 0) / l.vel.length) : 0 }));
  }, [histAno]);

  const totalVendas = vendasAno.reduce((s, v) => s + (v.preco || 0), 0);
  const velMedia = histAno.length ? Math.round(histAno.reduce((s, h) => s + h.velocidade, 0) / histAno.length) : 0;
  const velMax = histAno.length ? Math.max(...histAno.map((h) => h.velocidade)) : 0;
  const melhorCol = histAno.length ? Math.min(...histAno.map((h) => h.colocacao || 999)) : 999;
  const consumoAnoKg = Math.round((cfg.consumoDiario * cfg.quantidadePombos * 365) / 1000);

  const imprimir = () => {
    const linhasMes = porMes.filter((m) => m.n > 0).map((m) => `<tr><td>${m.mes}</td><td>${m.n}</td><td>${m.media || "—"}</td><td>${m.melhor < 999 ? m.melhor + "º" : "—"}</td></tr>`).join("");
    const provasTb = provasUnicas.map(([data, hs]) => `<tr><td>${data.split("-").reverse().slice(0, 2).join("/")}</td><td>${hs[0]?.competicao || "Prova"}</td><td>${hs[0]?.distancia || "—"} km</td><td>${Math.min(...hs.map((h) => h.colocacao || 999)) < 999 ? Math.min(...hs.map((h) => h.colocacao || 999)) + "º" : "—"}</td><td>${Math.max(...hs.map((h) => h.velocidade || 0))}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório Temporada ${ano}</title><style>body{font-family:Arial,sans-serif;color:#111;margin:24px;max-width:820px}h1{font-size:20px;margin:0 0 2px}.sub{color:#555;font-size:11px;margin-bottom:12px}h2{font-size:14px;margin:16px 0 6px;color:#333}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #ccc;padding:5px 7px;text-align:left}th{background:#f3f3f3}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px}.card{border:1px solid #ddd;border-radius:8px;padding:9px;text-align:center}.card b{display:block;font-size:16px}</style></head><body>
      <h1>🕊️ Nutri Pombos — Relatório da Temporada ${ano}</h1>
      <div class="sub">Gerado em ${new Date().toLocaleString("pt-BR")} • plantel de ${cfg.quantidadePombos} pombos</div>
      <div class="cards">
        <div class="card">Provas registradas<b>${provasUnicas.length}</b></div>
        <div class="card">Velocidade média<b>${velMedia || "—"} m/min</b></div>
        <div class="card">Melhor velocidade<b>${velMax || "—"}</b></div>
        <div class="card">Melhor colocação<b>${melhorCol < 999 ? melhorCol + "º" : "—"}</b></div>
        <div class="card">Vendas<b>${vendasAno.length} pombo(s)</b></div>
        <div class="card">Caixa de vendas<b>R$ ${totalVendas.toFixed(2).replace(".", ",")}</b></div>
        <div class="card">Crônicas arquivadas<b>${cronicasAno.length}</b></div>
        <div class="card">Ração estimada/ano<b>~${consumoAnoKg} kg</b></div>
      </div>
      <h2>📅 Provas do ano</h2><table><tr><th>Data</th><th>Prova</th><th>Dist.</th><th>Melhor col.</th><th>Vel. máx</th></tr>${provasTb || "<tr><td colspan=5>—</td></tr>"}</table>
      <h2>📊 Resumo por mês</h2><table><tr><th>Mês</th><th>Voos</th><th>Vel. média</th><th>Melhor col.</th></tr>${linhasMes || "<tr><td colspan=4>—</td></tr>"}</table>
      <div class="sub" style="margin-top:14px">Gerado pelo app Nutri Pombos</div>
      <script>window.onload=()=>{window.print()}</script></body></html>`;
    const win = window.open("", "_blank");
    if (!win) { window.alert("Permita pop-ups para gerar o PDF (ou toque novamente)."); return; }
    win.document.write(html); win.document.close();
  };

  const velMaxBarra = Math.max(...porMes.map((m) => m.media), 1);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>📊 Relatório da Temporada</h1>
            <p style={{ ...T.small, marginTop: 4 }}>O resumo da diretoria: desempenho, vendas e crônicas do ano — pronto pra imprimir ou salvar PDF</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={T.card}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ ...T.small, fontSize: 11 }}>Temporada:</span>
            {anos.map((a) => (
              <button key={a} onClick={() => setAno(a)} type="button" style={{ padding: "7px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, cursor: "pointer", color: ano === a ? T.bg : T.dim, background: ano === a ? T.gold : T.bgInput, border: `1px solid ${ano === a ? T.gold : T.border}` }}>{a}</button>
            ))}
            <button type="button" onClick={imprimir} style={{ ...T.btnGhost, marginLeft: "auto", fontWeight: 800 }}>🖨️ Salvar PDF</button>
          </div>
        </section>

        <section style={T.card}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
            {([
              ["🏁 Provas", String(provasUnicas.length)],
              ["⚡ Vel. média", velMedia ? `${velMedia} m/min` : "—"],
              ["🚀 Vel. máxima", velMax ? String(velMax) : "—"],
              ["🥇 Melhor col.", melhorCol < 999 ? `${melhorCol}º` : "—"],
              ["💰 Vendas", `${vendasAno.length} pombo(s)`],
              ["💵 Caixa", `R$ ${totalVendas.toFixed(2).replace(".", ",")}`],
              ["📖 Crônicas", String(cronicasAno.length)],
              ["🌾 Ração/ano (est.)", `~${consumoAnoKg} kg`],
            ] as const).map(([l, v]) => (
              <div key={l} style={{ padding: 10, borderRadius: 9, background: "#ffffff08", textAlign: "center" }}>
                <div style={{ ...T.small, fontSize: 10 }}>{l}</div>
                <b style={{ color: T.gold, fontSize: 14 }}>{v}</b>
              </div>
            ))}
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📅 Provas do ano ({provasUnicas.length})</div>
          {provasUnicas.length === 0 && <div style={{ ...T.small }}>Nenhum resultado registrado em {ano} — registre no 📜 Histórico (na mão ou pelo 📥 importador) e o relatório monta sozinho.</div>}
          {provasUnicas.map(([data, hs]) => (
            <div key={data} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "9px 0", borderBottom: `1px solid ${T.border}`, flexWrap: "wrap" }}>
              <div>
                <b style={{ fontSize: 13 }}>{data.split("-").reverse().slice(0, 2).join("/")} — {hs[0]?.competicao || "Prova"}</b>
                <div style={{ ...T.small, fontSize: 11 }}>{hs[0]?.distancia || "—"}km · {hs.length} retorno(s) · melhor col.: {Math.min(...hs.map((h) => h.colocacao || 999)) < 999 ? `${Math.min(...hs.map((h) => h.colocacao || 999))}º` : "—"}</div>
              </div>
              <b style={{ color: T.gold, fontSize: 13 }}>{Math.max(...hs.map((h) => h.velocidade || 0))} m/min</b>
            </div>
          ))}
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📊 Desempenho por mês</div>
          {porMes.map((m) => (
            <div key={m.mes} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
              <b style={{ width: 38, fontSize: 12, color: m.n ? T.white : T.dim }}>{m.mes}</b>
              <div style={{ height: 10, flex: 1, background: "#ffffff12", borderRadius: 5 }}>
                <div style={{ height: "100%", width: `${(m.media / velMaxBarra) * 100}%`, background: m.n ? T.gold : "transparent", borderRadius: 5 }} />
              </div>
              <span style={{ ...T.small, fontSize: 11, width: 110, textAlign: "right" }}>{m.n ? `${m.n} voo(s) · ${m.media} m/min` : "—"}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
