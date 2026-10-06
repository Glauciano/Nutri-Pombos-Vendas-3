"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * 📊 Desempenho por Linhagem — qual SANGUE entrega mais resultado?
 * Cruza o plantel (/api/pombos, com pedigree) com o histórico de provas
 * (gaveta "nutripombos-historico-provas-v1"): sobe a árvore até o ancestral
 * mais antigo e agrupa os resultados por raiz de linhagem.
 */
const HIST_KEY = "nutripombos-historico-provas-v1";

type Pombo = { id: number; anilha: string; nome: string | null; sexo: string; paiId: number | null; maeId: number | null };
type ProvaHist = { id?: string; data: string; competicao?: string; prova?: string; distancia: number; colocacao: number; velocidade: number; pomboId?: string; observacoes?: string };

function carregarHist(): ProvaHist[] {
  try { const d = JSON.parse(localStorage.getItem(HIST_KEY) || "[]"); return Array.isArray(d) ? d : []; } catch { return []; }
}

/** raiz da linhagem: ancestral mais antigo alcançável subindo pai/mãe */
function raizDe(p: Pombo | undefined, mapa: Map<number, Pombo>, prof = 0): string {
  if (!p || prof > 8) return "—";
  const pai = p.paiId != null ? mapa.get(p.paiId) : undefined;
  const mae = p.maeId != null ? mapa.get(p.maeId) : undefined;
  // sobe pelo lado que tiver pedigree; se os dois tiverem, pela raiz do pai (e menciona a mãe no caminho)
  if (pai) return raizDe(pai, mapa, prof + 1);
  if (mae) return raizDe(mae, mapa, prof + 1);
  return p.nome || p.anilha; // chegou no topo: este é o tronco
}

export default function Linhagens() {
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [hist, setHist] = useState<ProvaHist[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setHist(carregarHist());
    fetch("/api/pombos")
      .then(async (r) => (r.ok ? r.json() : []))
      .then((d) => setPombos(Array.isArray(d) ? d : []))
      .catch(() => setPombos([]))
      .finally(() => setCarregando(false));
  }, []);

  const dados = useMemo(() => {
    const mapa = new Map<number, Pombo>();
    pombos.forEach((p) => mapa.set(p.id, p));

    // raiz de cada pombo (cache)
    const raizDoPombo = new Map<number, string>();
    pombos.forEach((p) => raizDoPombo.set(p.id, raizDe(p, mapa)));

    type Lin = { raiz: string; pombos: number; provas: number; vitorias: number; top10: number; melhor: number; velSum: number; velN: number; melhoresProvas: string[] };
    const linhas = new Map<string, Lin>();
    const garante = (raiz: string): Lin => {
      let l = linhas.get(raiz);
      if (!l) { l = { raiz, pombos: 0, provas: 0, vitorias: 0, top10: 0, melhor: 999999, velSum: 0, velN: 0, melhoresProvas: [] }; linhas.set(raiz, l); }
      return l;
    };

    // pombos por linhagem
    const porRaiz = new Map<string, Set<number>>();
    pombos.forEach((p) => {
      const r = raizDoPombo.get(p.id) || "—";
      if (!porRaiz.has(r)) porRaiz.set(r, new Set());
      porRaiz.get(r)!.add(p.id);
    });
    porRaiz.forEach((set, r) => { garante(r).pombos = set.size; });

    // resultados do histórico
    let semVinculo = 0;
    hist.forEach((h) => {
      const pid = h.pomboId != null ? Number(h.pomboId) : NaN;
      const p = mapa.get(pid) || pombos.find((x) => x.anilha === h.pomboId);
      if (!p) { semVinculo++; return; }
      const l = garante(raizDoPombo.get(p.id) || "—");
      l.provas++;
      if (h.colocacao === 1) l.vitorias++;
      if (h.colocacao <= 10) l.top10++;
      l.melhor = Math.min(l.melhor, h.colocacao);
      if (h.velocidade > 0) { l.velSum += h.velocidade; l.velN++; }
      if (h.colocacao <= 3) l.melhoresProvas.push(`${h.colocacao}º ${h.prova || h.competicao || ""} (${h.distancia}km)`.trim());
    });

    const lista = [...linhas.values()]
      .filter((l) => l.pombos > 0)
      .map((l) => ({ ...l, media: l.velN ? Math.round(l.velSum / l.velN) : 0, melhoresProvas: l.melhoresProvas.slice(0, 3) }))
      .sort((a, b) => (b.vitorias * 1000 + b.top10) - (a.vitorias * 1000 + a.top10) || b.provas - a.provas);

    return { lista, semVinculo };
  }, [pombos, hist]);

  const comPedigree = pombos.filter((p) => p.paiId || p.maeId).length;
  const maxProv = Math.max(1, ...dados.lista.map((l) => l.provas));

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>📊 Desempenho por Linhagem</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Qual sangue entrega taça? Agrupa os resultados do histórico pelos troncos de pedigree — pra decidir quem entra na reprodução (e quem sai).</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {carregando && <div style={T.card}>⏳ Carregando plantel...</div>}

        {!carregando && pombos.length > 0 && comPedigree === 0 && (
          <div style={{ ...T.card, borderColor: `${T.orange}55`, background: `${T.orange}0d` }}>
            ⚠️ <b>A análise vive de pedigree:</b> nenhum pombo tem pai/mãe cadastrado. Edite seus pombos em <Link href="/centro-provas/pombos" style={{ color: T.blue }}>Pombos e Pedigree →</Link> informando os pais — aí cada resultado já nasce amarrado à linhagem certa.
          </div>
        )}

        {!carregando && hist.length === 0 && (
          <div style={{ ...T.card, borderColor: `${T.orange}55`, background: `${T.orange}0d`, marginBottom: 12 }}>
            ⚠️ <b>Sem histórico de provas ainda.</b> Registre os resultados em <Link href="/centro-provas/historico" style={{ color: T.blue }}>Histórico →</Link> (com o pombo vinculado) e volte aqui pra ver o ranking dos sangues.
          </div>
        )}

        {!carregando && dados.lista.length > 0 && (
          <>
            {/* TABELA RANKING */}
            <section style={{ ...T.card, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 12 }}>🩸 Ranking das linhagens <span style={{ fontWeight: 600, fontSize: 10, color: T.dim }}>(tronco mais antigo do pedigree)</span></div>
              <div style={{ display: "grid", gap: 10 }}>
                {dados.lista.map((l, i) => (
                  <div key={l.raiz} style={{ padding: 13, borderRadius: 12, background: "#ffffff08", border: `1px solid ${i === 0 ? `${T.gold}66` : T.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        {i === 0 && l.provas > 0 && <span style={{ padding: "2px 8px", borderRadius: 8, fontSize: 9.5, fontWeight: 900, background: T.gold, color: T.bg, marginRight: 6 }}>MELHOR SANGUE</span>}
                        <b style={{ fontSize: 14.5 }}>{l.raiz}</b>
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", textAlign: "center", fontSize: 11 }}>
                        <div><div style={{ fontSize: 17, fontWeight: 900, color: T.gold }}>{l.vitorias}</div><div style={{ color: T.dim2, fontSize: 9 }}>vitórias</div></div>
                        <div><div style={{ fontSize: 17, fontWeight: 900, color: T.green }}>{l.top10}</div><div style={{ color: T.dim2, fontSize: 9 }}>top 10</div></div>
                        <div><div style={{ fontSize: 17, fontWeight: 900 }}>{l.provas}</div><div style={{ color: T.dim2, fontSize: 9 }}>provas</div></div>
                        <div><div style={{ fontSize: 17, fontWeight: 900, color: l.melhor < 999999 ? T.blue : T.dim }}>{l.melhor < 999999 ? `${l.melhor}º` : "—"}</div><div style={{ color: T.dim2, fontSize: 9 }}>melhor</div></div>
                        <div><div style={{ fontSize: 17, fontWeight: 900, color: T.dim }}>{l.pombos}</div><div style={{ color: T.dim2, fontSize: 9 }}>pombos</div></div>
                        {l.media > 0 && <div><div style={{ fontSize: 17, fontWeight: 900, color: T.dim }}>{l.media}</div><div style={{ color: T.dim2, fontSize: 9 }}>vel. méd.</div></div>}
                      </div>
                    </div>
                    {l.provas > 0 && (
                      <div style={{ height: 6, borderRadius: 4, background: "#ffffff10", marginTop: 10 }}>
                        <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${T.gold}, ${T.orange})`, width: `${(l.provas / maxProv) * 100}%` }} />
                      </div>
                    )}
                    {l.melhoresProvas.length > 0 && (
                      <div style={{ ...T.small, fontSize: 10.5, marginTop: 8, color: T.dim }}>
                        🏁 Destaques: {l.melhoresProvas.join(" · ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {dados.semVinculo > 0 && (
                <div style={{ ...T.small, fontSize: 10.5, marginTop: 10, color: T.dim2 }}>
                  ℹ️ {dados.semVinculo} resultado(s) do histórico estão sem pombo vinculado e não entraram na conta — vincule no Histórico.
                </div>
              )}
            </section>

            {/* ESCOLA */}
            <section style={T.card}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📖 Como usar isso na reprodução</div>
              <div style={{ ...T.small, fontSize: 12, lineHeight: 1.85, color: T.dim }}>
                • A análise sobe o pedigree até o <b style={{ color: T.white }}>tronco mais antigo cadastrado</b> — quanto mais gerações você cadastrar, mais fina a leitura (avô vira "linhagem" se o bisavô não estiver registrado).
                <br />• Linhagem com muitas provas e poucas vitórias: sangue de <b style={{ color: T.white }}>enchedor de cesto</b> — bom pra treinar, pensar bem antes de reproduzir.
                <br />• Poucas provas e muitas vitórias: <b style={{ color: T.white }}>ouro puro</b> — candidatíssimo a entrar no Casamenteiro pra fixar o sangue.
                <br />• Combine com a <Link href="/centro-provas/casamenteiro" style={{ color: T.blue }}>análise de parentesco</Link> e o <Link href="/centro-provas/quiz-eyesign" style={{ color: T.blue }}>eye-sign</Link>: resultado + sangue + olho = decisão de campeão.
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
