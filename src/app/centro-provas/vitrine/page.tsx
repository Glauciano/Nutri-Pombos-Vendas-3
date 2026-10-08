"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * 🛒 Vitrine entre Criadores — o classificado do app.
 * Publique pombos à venda (dono do plantel + plano pago) e veja os anúncios
 * de todos os usuários, com botão direto no WhatsApp do vendedor.
 */
type Pombo = { id: number; anilha: string; nome: string | null; sexo: string; cor: string | null };
type Anuncio = {
  id: number; usuario_id: number; anilha: string; nome: string | null; sexo: string | null;
  cor: string | null; nascimento: string | null; preco: string | null; obs: string | null;
  whatsapp: string | null; criador: string;
};

const ZAP_KEY = "nutripombos-whatsapp-v1";

export default function VitrineCriadores() {
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [anuncios, setAnuncios] = useState<Anuncio[] | null>(null);
  const [meuId, setMeuId] = useState<number | null>(null);
  const [anilha, setAnilha] = useState("");
  const [preco, setPreco] = useState("");
  const [obs, setObs] = useState("");
  const [zap, setZap] = useState("");
  const [msg, setMsg] = useState("");
  const [pub, setPub] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [rv, rp] = await Promise.all([
        fetch("/api/vitrine").then(async (r) => (r.ok ? r.json() : { meuId: null, anuncios: [] })),
        fetch("/api/pombos").then(async (r) => (r.ok ? r.json() : [])),
      ]);
      setAnuncios(Array.isArray(rv.anuncios) ? rv.anuncios : []);
      setMeuId(rv.meuId ?? null);
      setPombos(Array.isArray(rp) ? rp : []);
    } catch {
      setAnuncios([]);
    }
  }, []);

  useEffect(() => {
    void carregar();
    try { setZap(localStorage.getItem(ZAP_KEY) || ""); } catch { /* ignora */ }
  }, [carregar]);

  async function publicar() {
    if (!anilha) { setMsg("⚠️ Escolha o pombo do seu plantel."); return; }
    setPub(true);
    try {
      const r = await fetch("/api/vitrine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anilha, preco, obs, whatsapp: zap }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg("⚠️ " + (j.error || "falhou")); return; }
      try { localStorage.setItem(ZAP_KEY, zap.replace(/\D/g, "")); } catch { /* ignora */ }
      setPreco(""); setObs("");
      setMsg("✅ Anúncio publicado na vitrine!");
      window.setTimeout(() => setMsg(""), 2500);
      void carregar();
    } catch { setMsg("⚠️ Sem conexão."); }
    setPub(false);
  }

  async function remover(id: number) {
    try {
      await fetch(`/api/vitrine?id=${id}`, { method: "DELETE" });
      void carregar();
    } catch { /* ignora */ }
  }

  const input = { ...T.btnGhost, padding: "10px 12px", textAlign: "left" as const, fontWeight: 600, fontSize: 12.5, width: "100%" };
  const lbl = { ...T.small, fontSize: 10, marginBottom: 4, color: T.dim };
  const meus = (anuncios || []).filter((a) => a.usuario_id === meuId);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🛒 Vitrine entre Criadores</h1>
            <p style={{ ...T.small, marginTop: 4 }}>O classificado do app: publique pombos à venda e veja os anúncios dos outros criadores — interessado fala direto no WhatsApp do vendedor.</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {/* PUBLICAR */}
        <section style={{ ...T.card, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>➕ Publicar pombo à venda <span style={{ fontSize: 10, fontWeight: 600, color: T.dim2 }}>(recurso do plano pago · máx. 10 anúncios)</span></div>
          {pombos.length === 0 ? (
            <div style={{ ...T.small, fontSize: 12 }}>Nenhum pombo no seu plantel ainda — <Link href="/centro-provas/pombos" style={{ color: T.blue }}>cadastre pombos →</Link></div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 8 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={lbl}>🐦 Pombo do SEU plantel</div>
                  <select value={anilha} onChange={(e) => setAnilha(e.target.value)} style={input}>
                    <option value="">— escolher —</option>
                    {pombos.map((p) => <option key={p.id} value={p.anilha}>{p.sexo === "macho" ? "♂" : "♀"} {p.nome || p.anilha} — {p.anilha}</option>)}
                  </select>
                </div>
                <div>
                  <div style={lbl}>💰 Preço (ex: R$ 800)</div>
                  <input value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="R$ 800" style={input} />
                </div>
                <div>
                  <div style={lbl}>💬 Seu WhatsApp (DDI+DDD)</div>
                  <input value={zap} onChange={(e) => setZap(e.target.value.replace(/\D/g, ""))} placeholder="5519999999999" inputMode="numeric" style={input} />
                </div>
              </div>
              <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observações do anúncio: resultados, linhagem, eye-sign... (opcional)" style={{ ...input, marginBottom: 10 }} />
              <button onClick={publicar} disabled={pub} style={{ ...T.btn, opacity: pub ? 0.5 : 1 }}>{pub ? "⏳ Publicando..." : "📣 Publicar na vitrine"}</button>
              {msg && <div style={{ ...T.small, fontSize: 11.5, marginTop: 8, color: msg.startsWith("✅") ? T.green : T.orange }}>{msg}</div>}
            </>
          )}
        </section>

        {/* MEUS ANÚNCIOS */}
        {meus.length > 0 && (
          <section style={{ ...T.card, marginBottom: 14, borderColor: `${T.gold}55` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>⭐ Seus anúncios ({meus.length})</div>
            <div style={{ display: "grid", gap: 6 }}>
              {meus.map((a) => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, background: "#ffffff08", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12.5 }}><b>{a.nome || a.anilha}</b> <span style={{ fontFamily: "monospace", color: T.dim, fontSize: 11 }}>{a.anilha}</span>{a.preco ? <b style={{ color: T.green, marginLeft: 8 }}>{a.preco}</b> : null}</span>
                  <button onClick={() => remover(a.id)} style={{ ...T.btnGhost, padding: "4px 10px", fontSize: 10.5, color: T.red, borderColor: "#ff5d6244" }}>🗑️ remover anúncio</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* QUADRO DE ANÚNCIOS */}
        <section style={T.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>🛒 Anúncios de todos os criadores ({(anuncios || []).length})</div>
            <button type="button" onClick={() => void carregar()} style={{ ...T.btnGhost, padding: "5px 12px", fontSize: 11, fontWeight: 700 }}>🔄 atualizar</button>
          </div>
          {anuncios === null && <div style={{ ...T.small, fontSize: 12 }}>⏳ Carregando vitrine...</div>}
          {anuncios !== null && anuncios.length === 0 && (
            <div style={{ ...T.small, fontSize: 12, textAlign: "center", padding: 20, lineHeight: 1.7 }}>
              🛒 A vitrine está vazia — <b>seja o primeiro a anunciar!</b><br />Quando outros criadores entrarem no app, os anúncios deles aparecem aqui também.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 10 }}>
            {(anuncios || []).map((a) => (
              <div key={a.id} style={{ padding: 13, borderRadius: 12, background: "#ffffff08", border: `1px solid ${a.usuario_id === meuId ? `${T.gold}55` : T.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 6 }}>
                  <b style={{ fontSize: 14 }}>{a.nome || "Pombo"}</b>
                  {a.preco && <b style={{ color: T.green, fontSize: 14, whiteSpace: "nowrap" }}>{a.preco}</b>}
                </div>
                <div style={{ fontFamily: "monospace", color: T.gold, fontSize: 11.5, marginTop: 2 }}>{a.anilha}</div>
                <div style={{ ...T.small, fontSize: 11, marginTop: 4, color: T.dim }}>
                  {a.sexo === "macho" ? "♂ Macho" : a.sexo === "femea" ? "♀ Fêmea" : ""}{a.cor ? ` · ${a.cor}` : ""}{a.nascimento ? ` · ${a.nascimento.slice(0, 4)}` : ""}
                </div>
                {a.obs && <div style={{ ...T.small, fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>📝 {a.obs}</div>}
                <div style={{ ...T.small, fontSize: 10.5, marginTop: 8, color: T.dim2 }}>👤 {a.criador}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
                  {a.whatsapp && (
                    <a href={`https://wa.me/${a.whatsapp}?text=${encodeURIComponent(`Olá ${a.criador}! Vi o anúncio do pombo ${a.nome || a.anilha} (${a.anilha}) na Vitrine do app Nutri Pombos e tenho interesse.`)}`} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: "center", padding: "8px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800, textDecoration: "none", color: "#fff", background: "#25d366", minWidth: 100 }}>💬 WhatsApp</a>
                  )}
                  <a href={`/ficha?anilha=${encodeURIComponent(a.anilha)}`} target="_blank" rel="noreferrer" style={{ ...T.btnGhost, padding: "8px 10px", fontSize: 11, fontWeight: 800, textDecoration: "none", display: "inline-block" }}>📄 ficha ↗</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ ...T.small, fontSize: 10, marginTop: 12, color: T.dim2, textAlign: "center", lineHeight: 1.6 }}>
          🛒 Cada criador anuncia só pombos do próprio plantel (o app confere). Negociação e pagamento são combinados direto entre comprador e vendedor — o app é o quadro de avisos.
        </div>
      </div>
    </main>
  );
}
