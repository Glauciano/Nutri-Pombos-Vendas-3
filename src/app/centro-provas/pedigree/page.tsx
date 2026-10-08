"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * 📄 Pedigree Imprimível — o leque clássico de 3 gerações (15 caixas):
 * o pombo, pais, avós e bisavós, pronto pra imprimir e entregar na venda.
 * Usa o pedigree completo da API (/api/pombos?id=X&pedigree=1).
 */
type No = { id: number; anilha: string; nome: string | null; pai: No | null; mae: No | null } | null;
type PomboLista = { id: number; anilha: string; nome: string | null; sexo: string };

function Caixa({ no, destaque }: { no: No; destaque?: boolean }) {
  return (
    <div className="ped-box" style={{ border: `1.5px solid ${destaque ? "#8a6a00" : "#4a5560"}`, borderRadius: 9, padding: "8px 9px", background: destaque ? "#fff8e0" : "#fff", textAlign: "center", minWidth: 0 }}>
      <div className="ped-nome" style={{ fontSize: 11.5, fontWeight: 900, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {no ? no.nome || "Pombo" : "?"}
      </div>
      <div className="ped-anilha" style={{ fontFamily: "monospace", fontSize: 10, color: "#444", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {no ? no.anilha : "—"}
      </div>
    </div>
  );
}

export default function PedigreeImprimivel() {
  const [pombos, setPombos] = useState<PomboLista[]>([]);
  const [id, setId] = useState("");
  const [arvore, setArvore] = useState<No>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    fetch("/api/pombos")
      .then(async (r) => (r.ok ? r.json() : []))
      .then((d) => setPombos(Array.isArray(d) ? d : []))
      .catch(() => setPombos([]));
  }, []);

  useEffect(() => {
    if (!id) { setArvore(null); return; }
    setCarregando(true);
    fetch(`/api/pombos?id=${id}&pedigree=1`)
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => setArvore(d))
      .catch(() => setArvore(null))
      .finally(() => setCarregando(false));
  }, [id]);

  // monta as 4 colunas do leque
  const cols: No[][] = (() => {
    if (!arvore) return [];
    const pai = arvore.pai ?? null;
    const mae = arvore.mae ?? null;
    const avos = [pai?.pai ?? null, pai?.mae ?? null, mae?.pai ?? null, mae?.mae ?? null];
    const bis = avos.flatMap((a) => [a?.pai ?? null, a?.mae ?? null]);
    return [[arvore], [pai, mae], avos, bis];
  })();

  const sel = pombos.find((p) => String(p.id) === id);
  const semGenealogia = arvore && !arvore.pai && !arvore.mae;
  const contagem = arvore ? [arvore, arvore.pai, arvore.mae, ...(arvore.pai ? [arvore.pai.pai, arvore.pai.mae] : [null, null]), ...(arvore.mae ? [arvore.mae.pai, arvore.mae.mae] : [null, null])].filter(Boolean).length : 0;

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <style>{`@media print { .nao-imprimir { display: none !important; } body { background: #fff !important; } .ped-folha { border-color: #8a6a00 !important; box-shadow: none !important; } .ped-titulo { color: #111 !important; } }`}</style>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div className="nao-imprimir" style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>📄 Pedigree Imprimível</h1>
            <p style={{ ...T.small, marginTop: 4 }}>O leque clássico de 3 gerações (15 posições) — imprima e entregue junto com o pombo vendido. Quanto mais pais você cadastrar, mais completo o leque.</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section className="nao-imprimir" style={{ ...T.card, marginBottom: 14, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select value={id} onChange={(e) => setId(e.target.value)} style={{ ...T.btnGhost, padding: "10px 12px", fontWeight: 700, fontSize: 12.5, flex: 1, minWidth: 220, textAlign: "left" }}>
            <option value="">— escolha o pombo —</option>
            {pombos.map((p) => <option key={p.id} value={p.id}>{p.sexo === "macho" ? "♂" : "♀"} {p.nome || p.anilha} — {p.anilha}</option>)}
          </select>
          {sel && <button type="button" onClick={() => window.print()} style={{ ...T.btn, padding: "10px 18px", fontSize: 12 }}>🖨️ Imprimir / PDF</button>}
        </section>

        {carregando && <div style={T.card}>⏳ Montando a árvore...</div>}

        {!id && <div style={{ ...T.card, ...T.small, fontSize: 12 }}>☝️ Escolha o pombo pra montar o leque de pedigree.</div>}

        {semGenealogia && (
          <div className="nao-imprimir" style={{ ...T.card, borderColor: `${T.orange}55`, background: `${T.orange}0d`, ...T.small, fontSize: 12, lineHeight: 1.7 }}>
            ⚠️ Este pombo ainda não tem pai/mãe cadastrados — o leque sai com os lacunos vazios. Complete em <Link href="/centro-provas/pombos" style={{ color: T.blue }}>Pombos → ✏️ Editar → pai e mãe →</Link>
          </div>
        )}

        {/* FOLHA DO PEDIGREE */}
        {arvore && (
          <section className="ped-folha" style={{ ...T.card, background: "#fff", borderColor: "#8a6a0066", padding: 22 }}>
            <div className="ped-titulo" style={{ textAlign: "center", color: "#111", marginBottom: 4 }}>
              <b style={{ fontSize: 17, letterSpacing: 0.5 }}>PEDIGREE — {arvore.nome || arvore.anilha}</b>
            </div>
            <div className="ped-titulo" style={{ textAlign: "center", color: "#555", fontSize: 11.5, marginBottom: 16 }}>
              anilha <b style={{ fontFamily: "monospace" }}>{arvore.anilha}</b> · {sel?.sexo === "macho" ? "Macho" : "Fêmea"} · {contagem > 1 ? `${contografia(contagem)} registrados no pedigree` : "sem ancestrais registrados"}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1.15fr 1fr 1fr", gap: 8, alignItems: "stretch" }}>
              {cols.map((col, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", gap: 6 }}>
                  {col.map((no, j) => <Caixa key={j} no={no} destaque={i === 0} />)}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 18, color: "#777", fontSize: 9 }}>
              <span>Gerado pelo app Nutri Pombos — Centro de Provas do columófilo</span>
              <span style={{ fontSize: 18 }}>🕊️</span>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function contografia(n: number): string {
  return n === 1 ? "1 ancestral" : `${n} ancestrais`;
}
