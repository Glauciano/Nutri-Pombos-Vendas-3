"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";
import { getFoto } from "../lib/fotos";

/**
 * 🏷️ Etiquetas de Cesto — folha pronta pra imprimir: foto, nome, anilha e QR
 * da ficha pública de cada pombo. Cole no box/cesto de prova ou de venda.
 */
type Pombo = { id: number; anilha: string; nome: string | null; sexo: string };
const ZAP_KEY = "nutripombos-whatsapp-v1";

export default function EtiquetasCesto() {
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [zap, setZap] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    fetch("/api/pombos")
      .then(async (r) => (r.ok ? r.json() : []))
      .then((d) => setPombos(Array.isArray(d) ? d : []))
      .catch(() => setPombos([]));
    try { setZap(localStorage.getItem(ZAP_KEY) || ""); } catch { /* ignora */ }
    setOrigin(window.location.origin);
  }, []);

  const alternar = (anilha: string) => {
    setSelecionados((s) => {
      const n = new Set(s);
      if (n.has(anilha)) n.delete(anilha);
      else n.add(anilha);
      return n;
    });
  };

  const todos = () => {
    setSelecionados((s) => (s.size === pombos.length ? new Set() : new Set(pombos.map((p) => p.anilha))));
  };

  const lista = pombos.filter((p) => selecionados.has(p.anilha));
  const qrDe = (anilha: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=4&data=${encodeURIComponent(`${origin}/ficha?anilha=${encodeURIComponent(anilha)}${zap ? `&tel=${zap}` : ""}`)}`;

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <style>{`@media print { .nao-imprimir { display: none !important; } body { background: #fff !important; } .etiqueta { break-inside: avoid; border-color: #4a5568 !important; background: #fff !important; } .etq-nome, .etq-anilha { color: #111 !important; } .etq-pe { color: #555 !important; } }`}</style>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="nao-imprimir" style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🏷️ Etiquetas de Cesto</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Folha pronta pra imprimir: foto, nome, anilha e QR da ficha de cada pombo — cole no box/cesto de prova ou entrega junto na venda.</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {/* CONTROLES */}
        <section className="nao-imprimir" style={{ ...T.card, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>✅ Selecionar pombos ({selecionados.size}/{pombos.length})</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={todos} style={{ ...T.btnGhost, padding: "6px 12px", fontSize: 11, fontWeight: 800 }}>{selecionados.size === pombos.length ? "☑️ limpar" : "🌍 todos"}</button>
              <button type="button" onClick={() => window.print()} disabled={!lista.length} style={{ ...T.btn, padding: "6px 14px", fontSize: 11, opacity: lista.length ? 1 : 0.5 }}>🖨️ Imprimir ({lista.length})</button>
            </div>
          </div>
          <input value={zap} onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setZap(v); try { localStorage.setItem(ZAP_KEY, v); } catch { /* ignora */ } }} placeholder="💬 Seu WhatsApp no QR (5519999999999) — opcional" inputMode="numeric" style={{ ...T.btnGhost, padding: "9px 12px", fontWeight: 600, fontSize: 12.5, width: "100%", textAlign: "left", marginBottom: 10 }} />
          {pombos.length === 0 && <div style={{ ...T.small, fontSize: 12 }}>Nenhum pombo cadastrado — <Link href="/centro-provas/pombos" style={{ color: T.blue }}>cadastre o plantel →</Link></div>}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {pombos.map((p) => (
              <button key={p.id} type="button" onClick={() => alternar(p.anilha)} style={{ padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontSize: 11.5, fontWeight: 700, border: `1.5px solid ${selecionados.has(p.anilha) ? T.gold : T.border}`, background: selecionados.has(p.anilha) ? `${T.gold}1a` : T.bgInput, color: selecionados.has(p.anilha) ? T.gold : T.dim }}>
                {selecionados.has(p.anilha) ? "☑ " : ""}{p.sexo === "macho" ? "♂" : "♀"} {p.nome || p.anilha}
              </button>
            ))}
          </div>
        </section>

        {/* FOLHA DE ETIQUETAS */}
        {lista.length > 0 && (
          <section style={{ ...T.card, background: "#fff" }}>
            <div className="nao-imprimir" style={{ fontSize: 11, fontWeight: 800, color: "#8a6a00", marginBottom: 10 }}>👁️ Pré-visualização (a folha sai sem os botões, só as etiquetas)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
              {lista.map((p) => {
                const foto = getFoto(p.anilha);
                return (
                  <div key={p.anilha} className="etiqueta" style={{ border: "1.5px dashed #4a5560", borderRadius: 12, padding: 12, textAlign: "center", display: "grid", placeItems: "center", gap: 6 }}>
                    {foto ? (
                      <img src={foto} alt={p.anilha} style={{ width: 74, height: 74, borderRadius: "50%", objectFit: "cover", border: "2px solid #f7bd0088" }} />
                    ) : (
                      <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#f1f5f9", display: "grid", placeItems: "center", fontSize: 32, border: "2px dashed #cbd5e1" }}>🐦</div>
                    )}
                    <div className="etq-nome" style={{ fontSize: 15, fontWeight: 900, color: "#111" }}>{p.nome || "Pombo"}</div>
                    <div className="etq-anilha" style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: "#333" }}>{p.anilha}</div>
                    <div className="etq-anilha" style={{ fontSize: 11, color: "#555", fontWeight: 700 }}>{p.sexo === "macho" ? "♂ MACHO" : "♀ FÊMEA"}</div>
                    <img src={qrDe(p.anilha)} alt={`QR ${p.anilha}`} style={{ width: 88, height: 88, background: "#fff", padding: 3, border: "1px solid #e2e8f0", borderRadius: 8 }} />
                    <div className="etq-pe" style={{ fontSize: 8.5, color: "#888", fontWeight: 700, letterSpacing: 0.4 }}>NUTRI POMBOS · escaneie e veja a ficha</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
