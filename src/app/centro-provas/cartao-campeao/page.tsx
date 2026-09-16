"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

const HIST_KEY = "nutripombos-historico-provas-v1";
const FOTOS_KEY = "nutripombos-fotos-v1";

type Pombo = { id: number; anilha: string; nome: string | null; sexo?: string };
type Hist = { data: string; distancia?: number; colocacao?: number; velocidade?: number; observacoes?: string; pomboId?: string };

export default function CartaoCampeao() {
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [hist, setHist] = useState<Hist[]>([]);
  const [sel, setSel] = useState<Pombo | null>(null);
  const [msg, setMsg] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch("/api/pombos").then((r) => r.json()).then((v) => setPombos(Array.isArray(v) ? v : [])).catch(() => setPombos([]));
    try { setHist(JSON.parse(localStorage.getItem(HIST_KEY) || "[]")); } catch { /* ignora */ }
  }, []);

  const dados = useMemo(() => {
    if (!sel) return null;
    const fotos: Record<string, string> = (() => { try { return JSON.parse(localStorage.getItem(FOTOS_KEY) || "{}"); } catch { return {}; } })();
    const meus = hist.filter((h) => {
      const anilhaObs = (h.observacoes || "").match(/anilha ([A-Z0-9-]+)/i)?.[1];
      return (h.pomboId && String(h.pomboId) === String(sel.id)) || (anilhaObs && anilhaObs.replace(/\s/g, "") === sel.anilha.replace(/\s/g, ""));
    });
    const vels = meus.map((h) => h.velocidade || 0).filter(Boolean);
    const cols = meus.map((h) => h.colocacao || 999).filter((c) => c < 999);
    return {
      provas: meus.length,
      velMedia: vels.length ? Math.round(vels.reduce((a, b) => a + b, 0) / vels.length) : 0,
      velMax: vels.length ? Math.max(...vels) : 0,
      melhorCol: cols.length ? Math.min(...cols) : null,
      foto: fotos[sel.anilha] ?? null,
    };
  }, [sel, hist]);

  const desenhar = () => {
    const c = canvasRef.current;
    if (!c || !sel || !dados) return;
    const ctx = c.getContext("2d");
    if (!ctx || !sel || !dados) return;
    const nome = sel.nome || sel.anilha;
    const anilha = sel.anilha;
    const W = 800, H = 450;
    // fundo
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#0b1426"); g.addColorStop(1, "#1b283c");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // moldura dourada
    ctx.strokeStyle = "#f7bd00"; ctx.lineWidth = 6; ctx.strokeRect(12, 12, W - 24, H - 24);
    ctx.strokeStyle = "#f7bd0055"; ctx.lineWidth = 2; ctx.strokeRect(26, 26, W - 52, H - 52);
    // título
    ctx.fillStyle = "#f7bd00"; ctx.font = "900 26px Arial"; ctx.textAlign = "center";
    ctx.fillText("🏆 CAMPEÃO DO PLANTEL", W / 2, 70);
    // foto/círculo
    const cx = 190, cy = 210, r = 95;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = "#0b1529"; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = "#f7bd00"; ctx.stroke();
    const assinar = () => {
      // nome e anilha
      ctx.textAlign = "left";
      ctx.fillStyle = "#f8fafc"; ctx.font = "900 40px Arial";
      ctx.fillText(nome, 320, 160);
      ctx.fillStyle = "#9aa8bc"; ctx.font = "700 20px monospace";
      ctx.fillText(anilha, 320, 190);
      // métricas
      const linhas: [string, string][] = [
        ["📊 Provas", String(dados.provas)],
        ["⚡ Vel. média", dados.velMedia ? `${dados.velMedia} m/min` : "—"],
        ["🚀 Vel. máxima", dados.velMax ? String(dados.velMax) : "—"],
        ["🥇 Melhor colocação", dados.melhorCol ? `${dados.melhorCol}º lugar` : "—"],
      ];
      linhas.forEach(([l, v], i) => {
        const y = 235 + i * 42;
        ctx.fillStyle = "#9aa8bc"; ctx.font = "700 18px Arial"; ctx.fillText(l, 320, y);
        ctx.fillStyle = "#f7bd00"; ctx.font = "900 24px Arial"; ctx.fillText(v, 560, y);
      });
      // rodapé
      ctx.textAlign = "center"; ctx.fillStyle = "#64748b"; ctx.font = "600 14px Arial";
      ctx.fillText("Nutri Pombos — Centro de Provas · " + new Date().toLocaleDateString("pt-BR"), W / 2, H - 48);
      ctx.fillStyle = "#f7bd0088"; ctx.font = "600 13px Arial";
      ctx.fillText("dados: histórico do plantel · open-meteo + noaa", W / 2, H - 28);
    };
    if (dados.foto) {
      const img = new Image();
      img.onload = () => { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 3, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2); ctx.restore(); assinar(); };
      img.src = dados.foto;
    } else {
      ctx.font = "70px Arial"; ctx.fillText("🕊️", cx, cy + 25);
      assinar();
    }
  };

  useEffect(() => { if (sel) desenhar(); }, [sel]);

  const baixar = () => {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `campeao-${(sel?.nome || sel?.anilha || "pombo").replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
    setMsg("✅ Imagem baixada! Poste no WhatsApp/Instagram do plantel 📱");
    window.setTimeout(() => setMsg(""), 3000);
  };

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🃏 Cartão do Campeão</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Escolha o pombo, gere a imagem bonita e poste no WhatsApp/Instagram — marketing grátis do seu plantel</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🐦 Escolha o campeão</div>
          <select onChange={(e) => setSel(pombos.find((p) => String(p.id) === e.target.value) || null)} value={sel?.id ?? ""} style={T.input}>
            <option value="">— selecione o pombo —</option>
            {pombos.map((p) => <option key={p.id} value={p.id}>{p.nome || p.anilha} ({p.anilha})</option>)}
          </select>
          {pombos.length === 0 && <div style={{ ...T.small, marginTop: 8 }}>Cadastre pombos na página 🐦 Pombos — eles aparecem aqui.</div>}
          {sel && dados && (
            <div style={{ ...T.small, fontSize: 11, marginTop: 8 }}>
              📊 {dados.provas} prova(s) registrada(s){dados.provas === 0 && " — registre resultados no 📜 Histórico pra encher o cartão!"}
            </div>
          )}
        </section>

        {sel && dados && (
          <section style={T.card}>
            <canvas ref={canvasRef} width={800} height={450} style={{ width: "100%", borderRadius: 12, border: `1px solid ${T.border}` }} />
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button type="button" onClick={baixar} style={{ ...T.btn, flex: 1, minWidth: 170 }}>📥 Baixar imagem (PNG)</button>
            </div>
            {msg && <div style={{ ...T.small, marginTop: 10, color: T.green, textAlign: "center" }}>{msg}</div>}
          </section>
        )}
      </div>
    </main>
  );
}
