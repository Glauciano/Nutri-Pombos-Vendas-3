"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type Pombo = {
  id: number;
  anilha: string;
  nome: string | null;
  sexo: "macho" | "femea";
  cor: string | null;
  dataNascimento: string | null;
  paiId: number | null;
  maeId: number | null;
  status: string | null;
  observacoes: string | null;
};

export default function CertificadoVenda() {
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [pomboId, setPomboId] = useState<string>("");

  useEffect(() => {
    fetch("/api/pombos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPombos(data);
          if (data[0]) setPomboId(String(data[0].id));
        }
      })
      .catch(() => {});
  }, []);

  const sel = pombos.find((p) => String(p.id) === pomboId);
  const pai = pombos.find((p) => sel?.paiId && p.id === sel.paiId);
  const mae = pombos.find((p) => sel?.maeId && p.id === sel.maeId);
  const avoPP = pombos.find((p) => pai?.paiId && p.id === pai.paiId);
  const avoPM = pombos.find((p) => pai?.maeId && p.id === pai.maeId);
  const avoMP = pombos.find((p) => mae?.paiId && p.id === mae.paiId);
  const avoMM = pombos.find((p) => mae?.maeId && p.id === mae.maeId);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>📜 Certificado Oficial de Pedigree para Leilões</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Gere a ficha de linhagem e origem de reprodutores para leilões e vendas de borrachos do pombal
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              style={{ ...T.btn, background: "#EAB308", color: "#111", fontSize: 13, fontWeight: 900 }}
            >
              🖨️ Imprimir / Salvar PDF
            </button>
            <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
              ← Centro
            </Link>
          </div>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
            🐦 Selecione a Ave para Emissão de Certificado:
          </div>
          <select
            value={pomboId}
            onChange={(e) => setPomboId(e.target.value)}
            style={{ ...T.input, background: T.bgInput, color: T.white }}
          >
            <option value="">Selecione...</option>
            {pombos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.anilha} — {p.nome || "Sem nome"} ({p.cor || "Cor não inf."})
              </option>
            ))}
          </select>
        </section>

        {sel ? (
          <div
            id="certificado-print"
            style={{
              padding: 28,
              borderRadius: 16,
              background: "#0a1324",
              border: `4px solid ${T.gold}`,
              boxShadow: "0 10px 40px rgba(234,179,8,0.15)",
              color: "#fff",
            }}
          >
            <div style={{ textAlign: "center", borderBottom: `2px solid ${T.gold}66`, paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.gold, letterSpacing: 2 }}>
                CERTIFICADO DE ORIGEM E GENEALOGIA COLUMBÓFILA
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, margin: "6px 0", color: "#fff" }}>
                PLANTEL NUTRI POMBOS
              </h2>
              <div style={{ fontSize: 12, color: T.dim }}>
                Linhagem Selecionada para Competição de Alta Velocidade e Fundo
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, color: T.dim }}>ANILHA OFICIAL</span>
                <div style={{ fontSize: 32, fontWeight: 900, color: T.gold }}>{sel.anilha}</div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: T.dim }}>NOME / LINHAGEM</span>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{sel.nome || "Atleta de Elite"}</div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: T.dim }}>SEXO</span>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>
                  {sel.sexo === "macho" ? "♂ Macho" : "♀ Fêmea"}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: T.dim }}>PLUMAGEM</span>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{sel.cor || "Padrão"}</div>
              </div>
            </div>

            <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.gold, marginBottom: 12 }}>
                🌳 PEDIGREE DE 3 GERAÇÕES DO REPRODUTOR
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* LINHA PATERNAL */}
                <div style={{ padding: 12, borderRadius: 10, background: "rgba(59,130,246,0.1)", borderLeft: "4px solid #3B82F6" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#3B82F6" }}>♂ PAI (SIRE)</span>
                  <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>
                    {pai ? `${pai.anilha} ${pai.nome ? `"${pai.nome}"` : ""}` : "— Sem registro de Pai —"}
                  </div>
                  <div style={{ fontSize: 11, color: T.dim }}>{pai?.cor || ""}</div>

                  <div style={{ marginTop: 10, paddingLeft: 8, borderLeft: "1px solid #3B82F655", fontSize: 12 }}>
                    <div>
                      <b>Avô:</b> {avoPP ? `${avoPP.anilha} (${avoPP.nome || "Macho"})` : "Linhagem Base"}
                    </div>
                    <div style={{ marginTop: 2 }}>
                      <b>Avó:</b> {avoPM ? `${avoPM.anilha} (${avoPM.nome || "Fêmea"})` : "Linhagem Base"}
                    </div>
                  </div>
                </div>

                {/* LINHA MATERNAL */}
                <div style={{ padding: 12, borderRadius: 10, background: "rgba(236,72,153,0.1)", borderLeft: "4px solid #EC4899" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#EC4899" }}>♀ MÃE (DAM)</span>
                  <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>
                    {mae ? `${mae.anilha} ${mae.nome ? `"${mae.nome}"` : ""}` : "— Sem registro de Mãe —"}
                  </div>
                  <div style={{ fontSize: 11, color: T.dim }}>{mae?.cor || ""}</div>

                  <div style={{ marginTop: 10, paddingLeft: 8, borderLeft: "1px solid #EC489955", fontSize: 12 }}>
                    <div>
                      <b>Avô:</b> {avoMP ? `${avoMP.anilha} (${avoMP.nome || "Macho"})` : "Linhagem Base"}
                    </div>
                    <div style={{ marginTop: 2 }}>
                      <b>Avó:</b> {avoMM ? `${avoMM.anilha} (${avoMM.nome || "Fêmea"})` : "Linhagem Base"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {sel.observacoes && (
              <div style={{ padding: 14, borderRadius: 10, background: "#ffffff08", fontSize: 13, marginBottom: 20 }}>
                <b>📝 Laudo & Observações:</b> {sel.observacoes}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${T.border}`, paddingTop: 16, fontSize: 11, color: T.dim }}>
              <div>Emissão por Nutri Pombos Vendas • Sistema Profissional</div>
              <div>Data da Emissão: {new Date().toLocaleDateString("pt-BR")}</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 40, color: T.dim }}>
            Selecione uma ave cadastrada para visualizar seu certificado de pedigree.
          </div>
        )}
      </div>
    </main>
  );
}
