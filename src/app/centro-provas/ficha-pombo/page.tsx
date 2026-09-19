"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";
import { getFoto } from "../lib/fotos";

const HIST_KEY = "nutripombos-historico-provas-v1";

type Pombo = { id: number; anilha: string; nome: string | null; sexo: string; cor: string | null; dataNascimento: string | null; paiId: number | null; maeId: number | null };
type Hist = { data: string; velocidade?: number; colocacao?: number; observacoes?: string; pomboId?: string; distancia?: number };

export default function FichaAvaliacao() {
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [hist, setHist] = useState<Hist[]>([]);
  const [sel, setSel] = useState<Pombo | null>(null);
  const [qrAberto, setQrAberto] = useState(false);

  useEffect(() => {
    fetch("/api/pombos").then((r) => r.json()).then((v) => setPombos(Array.isArray(v) ? v : [])).catch(() => setPombos([]));
    try { setHist(JSON.parse(localStorage.getItem(HIST_KEY) || "[]")); } catch { /* ignora */ }
  }, []);

  const analise = useMemo(() => {
    if (!sel) return null;
    const meus = hist.filter((h) => {
      const obs = (h.observacoes || "").match(/anilha ([A-Z0-9-]+)/i)?.[1];
      const porId = h.pomboId ? String(h.pomboId) === String(sel.id) : false;
      return porId || (obs && obs.replace(/\s/g, "") === sel.anilha.replace(/\s/g, ""));
    });
    const vels = meus.map((h) => h.velocidade || 0).filter(Boolean);
    const cols = meus.map((h) => h.colocacao || 999).filter((c) => c < 999);
    const itens = [
      { nome: "📋 Cadastro", ok: !!(sel.sexo && sel.cor && sel.dataNascimento), detalhe: `${[sel.sexo === "macho" ? "sexo ✓" : sel.sexo === "femea" ? "sexo ✓" : "sexo —", sel.cor ? "cor ✓" : "cor —", sel.dataNascimento ? "nascimento ✓" : "nascimento —"].join(" · ")}` },
      { nome: "📷 Foto", ok: !!getFoto(sel.anilha), detalhe: getFoto(sel.anilha) ? "foto cadastrada" : "adicione na lista de Pombos (botão +)" },
      { nome: "🧬 Pedigree", ok: !!(sel.paiId && sel.maeId), detalhe: sel.paiId && sel.maeId ? "pai e mãe vinculados" : sel.paiId || sel.maeId ? "parcial — falta um dos pais" : "sem pais vinculados" },
      { nome: "🏁 Resultados", ok: meus.length > 0, detalhe: meus.length ? `${meus.length} prova(s) · vel. máx ${Math.max(...vels, 0)} m/min${cols.length ? ` · melhor ${Math.min(...cols)}º` : ""}` : "registre no Histórico" },
    ];
    const prontos = itens.filter((i) => i.ok).length;
    return { itens, prontos, completo: prontos === itens.length };
  }, [sel, hist]);

  const urlFicha = sel ? `${typeof window !== "undefined" ? window.location.origin : ""}/ficha?anilha=${encodeURIComponent(sel.anilha)}` : "";

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>📋 Ficha de Avaliação do Pombo</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Tudo que um pombo precisa ter em ordem pra valer dinheiro — com selo de ficha completa e QR de venda</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🐦 Escolher pombo</div>
          <select value={sel?.id ?? ""} onChange={(e) => { setSel(pombos.find((p) => String(p.id) === e.target.value) || null); setQrAberto(false); }} style={T.input}>
            <option value="">— selecione —</option>
            {pombos.map((p) => <option key={p.id} value={p.id}>{p.nome || p.anilha} ({p.anilha})</option>)}
          </select>
        </section>

        {sel && analise && (
          <>
            <section style={{ ...T.card, border: `2px solid ${analise.completo ? T.green : T.gold}55`, background: analise.completo ? `${T.green}0d` : undefined }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <b style={{ fontSize: 16 }}>{analise.completo ? "🏅 FICHA COMPLETA — pronto pra vender/valorizar!" : `Ficha ${analise.prontos}/4 — complete os itens abaixo`}</b>
                <b style={{ color: analise.completo ? T.green : T.gold, fontSize: 18 }}>{analise.prontos}/4</b>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "#ffffff12", marginTop: 10 }}>
                <div style={{ height: "100%", width: `${(analise.prontos / 4) * 100}%`, background: analise.completo ? T.green : T.gold, borderRadius: 4, transition: "width .3s" }} />
              </div>
            </section>

            <section style={T.card}>
              {analise.itens.map((i) => (
                <div key={i.nome} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", background: i.ok ? T.green : T.bgInput, color: T.bg, fontSize: 13, fontWeight: 900 }}>{i.ok ? "✓" : "•"}</span>
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 13, color: i.ok ? T.green : T.white }}>{i.nome}</b>
                    <div style={{ ...T.small, fontSize: 11 }}>{i.detalhe}</div>
                  </div>
                </div>
              ))}
            </section>

            <section style={{ ...T.card, borderColor: `${T.gold}55`, background: `${T.gold}0d` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <b style={{ color: T.gold, fontSize: 14 }}>🏷️ QR de venda</b>
                  <div style={{ ...T.small, fontSize: 11 }}>Compreensível por QR: ficha pública com linhagem — cole no box/cesto ou mande no WhatsApp</div>
                </div>
                <button type="button" onClick={() => setQrAberto((v) => !v)} style={T.btnSm}>{qrAberto ? "fechar" : "gerar QR"}</button>
              </div>
              {qrAberto && (
                <div style={{ textAlign: "center", marginTop: 14 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(urlFicha)}`} alt={`QR ${sel.anilha}`} style={{ borderRadius: 12, background: "#fff", padding: 6 }} />
                  <div style={{ ...T.small, fontSize: 11, marginTop: 8, wordBreak: "break-all" }}>{urlFicha}</div>
                  <a href={urlFicha} target="_blank" rel="noreferrer" style={{ ...T.small, color: T.blue, fontSize: 12 }}> abrir ficha pública ↗</a>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
