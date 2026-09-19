"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../centro-provas/theme";

type Ficha = {
  anilha: string; nome: string | null; sexo: string; cor: string | null;
  dataNascimento: string | null;
  pai: { anilha: string; nome: string | null } | null;
  mae: { anilha: string; nome: string | null } | null;
};

export default function FichaPublica() {
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const anilha = new URLSearchParams(window.location.search).get("anilha")?.trim();
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

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "24px 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40 }}>🕊️</div>
          <b style={{ fontSize: 18 }}>Nutri Pombos</b>
          <div style={{ ...T.small, fontSize: 11 }}>Ficha pública do pombo</div>
        </div>

        {carregando && <div style={{ ...T.card, textAlign: "center" }}>⏳ Carregando ficha...</div>}
        {erro && <div style={{ ...T.card, textAlign: "center", color: T.orange }}>⚠️ {erro}</div>}

        {ficha && (
          <div style={{ ...T.card, borderColor: `${T.gold}55`, background: `${T.gold}0d` }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.bgInput, border: `2px solid ${T.gold}66`, display: "grid", placeItems: "center", fontSize: 30 }}>
                {ficha.sexo === "macho" ? "♂️" : ficha.sexo === "femea" ? "♀️" : "🐦"}
              </div>
              <div>
                <b style={{ fontSize: 22 }}>{ficha.nome || "Pombo"}</b>
                <div style={{ fontFamily: "monospace", color: T.gold, fontSize: 14 }}>{ficha.anilha}</div>
                <div style={{ ...T.small, fontSize: 12 }}>
                  {ficha.sexo === "macho" ? "Macho" : ficha.sexo === "femea" ? "Fêmea" : ""}{ficha.cor ? ` · ${ficha.cor}` : ""}{idade ? ` · ${idade}` : ""}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#ffffff08" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.gold, marginBottom: 8 }}>🧬 LINHAGEM</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                <div>
                  <div style={{ ...T.small, fontSize: 10 }}>PAI</div>
                  <b>{ficha.pai ? ficha.pai.nome || ficha.pai.anilha : "—"}</b>
                  {ficha.pai && <div style={{ ...T.small, fontSize: 10, fontFamily: "monospace" }}>{ficha.pai.anilha}</div>}
                </div>
                <div>
                  <div style={{ ...T.small, fontSize: 10 }}>MÃE</div>
                  <b>{ficha.mae ? ficha.mae.nome || ficha.mae.anilha : "—"}</b>
                  {ficha.mae && <div style={{ ...T.small, fontSize: 10, fontFamily: "monospace" }}>{ficha.mae.anilha}</div>}
                </div>
              </div>
            </div>

            <div style={{ ...T.small, fontSize: 11, textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
              🏁 Pombo do plantel gerenciado pelo app <b style={{ color: T.gold }}>Nutri Pombos</b><br />
              Interessado? Fale direto com o criador que compartilhou este QR Code 🤝
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Link href="/" style={{ ...T.small, color: T.blue, textDecoration: "none", fontSize: 11 }}>Conheça o app Nutri Pombos →</Link>
        </div>
      </div>
    </main>
  );
}
