"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../centro-provas/theme";

/**
 * 🏷️ FICHA PÚBLICA DE VENDA (premium) — aberta por QR Code, sem login.
 * Parâmetros na URL: ?anilha=1234567/26&tel=5519999999999&msg=texto
 *  - tel: WhatsApp do criador (gerado na página Pombos → QR de Venda)
 *  - msg: mensagem inicial pré-pronta pro WhatsApp
 */
type Mini = { anilha: string; nome: string | null } | null;
type Ficha = {
  anilha: string; nome: string | null; sexo: string; cor: string | null;
  dataNascimento: string | null;
  pai: Mini; mae: Mini;
  avosPai: { paterno: Mini; materno: Mini };
  avosMae: { paterno: Mini; materno: Mini };
};

const nomeDe = (m: Mini) => (m ? m.nome || m.anilha : null);

export default function FichaPublica() {
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [tel, setTel] = useState("");
  const [msg, setMsg] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const anilha = q.get("anilha")?.trim();
    setTel(q.get("tel")?.replace(/\D/g, "") || "");
    setMsg(q.get("msg") || "");
    if (!anilha) { setErro("Ficha acessada sem anilha — use o QR Code ou link completo."); setCarregando(false); return; }
    fetch(`/api/publico/pombo?anilha=${encodeURIComponent(anilha)}`)
      .then(async (r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setFicha)
      .catch(() => setErro("Pombo não encontrado. Confira o QR Code ou o link."))
      .finally(() => setCarregando(false));
  }, []);

  const idade = ficha?.dataNascimento
    ? `${Math.floor((Date.now() - new Date(ficha.dataNascimento).getTime()) / (365.25 * 86400000))} ano(s)`
    : null;

  async function compartilhar() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: `Pombo ${ficha?.anilha}`, text: `Veja a ficha do pombo ${ficha?.nome || ficha?.anilha}:`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        window.setTimeout(() => setCopiado(false), 2500);
      }
    } catch { /* usuário cancelou */ }
  }

  const zapLink = tel
    ? `https://wa.me/${tel}?text=${encodeURIComponent(msg || `Olá! Vi a ficha do pombo ${ficha?.nome || ficha?.anilha} (anilha ${ficha?.anilha}) no app Nutri Pombos e tenho interesse.`)}`
    : null;

  const LinhagemBox = ({ rotulo, m }: { rotulo: string; m: Mini }) => (
    <div style={{ padding: "8px 10px", borderRadius: 8, background: "#ffffff0a", border: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: T.dim2, letterSpacing: 0.5 }}>{rotulo}</div>
      <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 2 }}>{nomeDe(m) || <span style={{ color: T.dim2 }}>—</span>}</div>
      {m && <div style={{ fontFamily: "monospace", fontSize: 9, color: T.dim }}>{m.anilha}</div>}
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "24px 14px 40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 540, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 36 }}>🕊️</div>
          <b style={{ fontSize: 17 }}>Nutri Pombos</b>
          <div style={{ ...T.small, fontSize: 11 }}>Ficha pública do pombo</div>
        </div>

        {carregando && <div style={{ ...T.card, textAlign: "center" }}>⏳ Carregando ficha...</div>}
        {erro && <div style={{ ...T.card, textAlign: "center", color: T.orange }}>⚠️ {erro}</div>}

        {ficha && (
          <>
            {/* CARTÃO PRINCIPAL */}
            <div style={{ ...T.card, borderColor: `${T.gold}66`, background: `linear-gradient(160deg, ${T.bgCard}, ${T.gold}12)`, padding: 22, textAlign: "center" }}>
              <div style={{
                width: 92, height: 92, borderRadius: "50%", margin: "0 auto 10px",
                background: ficha.sexo === "macho" ? "#55a3ff22" : "#ff5d6218",
                border: `2.5px solid ${ficha.sexo === "macho" ? "#55a3ff" : "#ff5d62"}`,
                display: "grid", placeItems: "center", fontSize: 44,
              }}>
                {ficha.sexo === "macho" ? "♂️" : "♀️"}
              </div>
              <b style={{ fontSize: 26, letterSpacing: 0.3 }}>{ficha.nome || "Pombo"}</b>
              <div style={{ fontFamily: "monospace", color: T.gold, fontSize: 16, fontWeight: 800, marginTop: 2, letterSpacing: 1 }}>{ficha.anilha}</div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 10 }}>
                <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: ficha.sexo === "macho" ? "#55a3ff18" : "#ff5d6218", color: ficha.sexo === "macho" ? "#55a3ff" : "#ff5d62" }}>
                  {ficha.sexo === "macho" ? "Macho" : "Fêmea"}
                </span>
                {ficha.cor && <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: "#ffffff10", color: T.dim }}>🎨 {ficha.cor}</span>}
                {idade && <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: "#ffffff10", color: T.dim }}>📅 {idade}</span>}
              </div>
            </div>

            {/* PEDIGREE 2 GERAÇÕES */}
            <div style={{ ...T.card, marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🧬 PEDIGREE — 2 GERAÇÕES</div>
              <div style={{ display: "grid", gap: 8 }}>
                <LinhagemBox rotulo="PAI" m={ficha.pai} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <LinhagemBox rotulo="AVÔ (lado do pai)" m={ficha.avosPai?.paterno} />
                  <LinhagemBox rotulo="AVÓ (lado do pai)" m={ficha.avosPai?.materno} />
                </div>
                <LinhagemBox rotulo="MÃE" m={ficha.mae} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <LinhagemBox rotulo="AVÔ (lado da mãe)" m={ficha.avosMae?.paterno} />
                  <LinhagemBox rotulo="AVÓ (lado da mãe)" m={ficha.avosMae?.materno} />
                </div>
              </div>
              <div style={{ ...T.small, fontSize: 9.5, marginTop: 8, color: T.dim2, textAlign: "center" }}>
                Genealogia registrada pelo criador no app Nutri Pombos.
              </div>
            </div>

            {/* CONTATO / AÇÕES */}
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {zapLink && (
                <a href={zapLink} target="_blank" rel="noreferrer" style={{ textDecoration: "none", padding: "14px 16px", borderRadius: 12, textAlign: "center", fontWeight: 900, fontSize: 14, color: "#fff", background: "#25d366", border: "1px solid #1faa50" }}>
                  💬 Falar com o criador no WhatsApp
                </a>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={compartilhar} style={{ ...T.btnGhost, fontWeight: 800, padding: "11px 14px" }}>
                  {copiado ? "✅ Link copiado!" : "📤 Compartilhar"}
                </button>
                <button onClick={() => window.print()} style={{ ...T.btnGhost, fontWeight: 800, padding: "11px 14px" }}>
                  🖨️ Imprimir / PDF
                </button>
              </div>
            </div>

            <div style={{ ...T.small, fontSize: 10.5, textAlign: "center", marginTop: 14, lineHeight: 1.6, color: T.dim }}>
              🏁 Pombo do plantel gerenciado pelo app <b style={{ color: T.gold }}>Nutri Pombos</b> — o Centro de Provas do columófilo moderno.
            </div>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Link href="/" style={{ ...T.small, color: T.blue, textDecoration: "none", fontSize: 11 }}>Conheça o app Nutri Pombos →</Link>
        </div>
      </div>
    </main>
  );
}
