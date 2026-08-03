"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type PomboKm = {
  id: string;
  anilha: string;
  nome: string;
  sexo: "macho" | "femea";
  kmTotal: number;
  kmProvas: number;
  velocidadeMedia: number; // m/min
  participacoes: number;
  colocacaoMedia: number;
  concorrentes: number;
};

const KEY_RANKING = "nutripombos-ranking-km-v1";

const POMBOS_INICIAIS: PomboKm[] = [
  { id: "1", anilha: "BR-23-10492", nome: "Trovão Azul", sexo: "macho", kmTotal: 1420, kmProvas: 800, velocidadeMedia: 1340, participacoes: 6, colocacaoMedia: 4, concorrentes: 450 },
  { id: "2", anilha: "BR-22-99210", nome: "Rainha do Sul", sexo: "femea", kmTotal: 1680, kmProvas: 1100, velocidadeMedia: 1290, participacoes: 8, colocacaoMedia: 5, concorrentes: 500 },
  { id: "3", anilha: "BR-24-55412", nome: "Titan", sexo: "macho", kmTotal: 920, kmProvas: 500, velocidadeMedia: 1250, participacoes: 5, colocacaoMedia: 12, concorrentes: 400 },
  { id: "4", anilha: "BR-24-00123", nome: "Flecha", sexo: "macho", kmTotal: 380, kmProvas: 150, velocidadeMedia: 1410, participacoes: 2, colocacaoMedia: 2, concorrentes: 300 },
  { id: "5", anilha: "BR-23-77102", nome: "Estrela do Norte", sexo: "femea", kmTotal: 1150, kmProvas: 650, velocidadeMedia: 1220, participacoes: 6, colocacaoMedia: 18, concorrentes: 480 },
  { id: "6", anilha: "BR-24-33890", nome: "Furacão", sexo: "macho", kmTotal: 520, kmProvas: 250, velocidadeMedia: 1360, participacoes: 3, colocacaoMedia: 8, concorrentes: 350 },
  { id: "7", anilha: "BR-23-44111", nome: "Maratona", sexo: "femea", kmTotal: 1850, kmProvas: 1300, velocidadeMedia: 1180, participacoes: 7, colocacaoMedia: 9, concorrentes: 520 },
  { id: "8", anilha: "BR-25-11200", nome: "Novato de Ouro", sexo: "macho", kmTotal: 280, kmProvas: 100, velocidadeMedia: 1280, participacoes: 1, colocacaoMedia: 15, concorrentes: 280 },
];

type CategoriaDist = "Velocidade" | "Meio Fundo" | "Fundo" | "Fundo Extremo";

const CAT_INFO: Record<CategoriaDist, { label: string; kmRef: number; desc: string }> = {
  Velocidade: { label: "⚡ Velocidade (100–300 km)", kmRef: 200, desc: "Sprint rápido — valoriza velocidade alta (> 1300 m/min) e explosão" },
  "Meio Fundo": { label: "🏃 Meio Fundo (300–500 km)", kmRef: 400, desc: "Equilíbrio entre velocidade e resistência — base recomendada de 600+ km" },
  Fundo: { label: "🦅 Fundo (500–700 km)", kmRef: 600, desc: "Alta resistência e consistência em voo — base de 1000+ km" },
  "Fundo Extremo": { label: "🌍 Fundo Extremo (> 700 km)", kmRef: 850, desc: "Maratona — prioridade total para quilometragem acumulada e tenacidade" },
};

function readPombos(): PomboKm[] {
  try {
    const raw = localStorage.getItem(KEY_RANKING);
    if (!raw) return POMBOS_INICIAIS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : POMBOS_INICIAIS;
  } catch {
    return POMBOS_INICIAIS;
  }
}

function classificarEspecialidade(p: PomboKm): string {
  if (p.kmTotal >= 1400 || p.kmProvas >= 900) return "Fundo / Maratona";
  if (p.kmTotal >= 700 || p.kmProvas >= 400) return "Meio Fundo (300–500 km)";
  return "Velocidade / Sprint";
}

function calcularAptidao(p: PomboKm, kmAlvo: number, clima: "normal" | "contra" | "calor") {
  const metaKm = kmAlvo * (clima === "normal" ? 1.8 : 2.2);
  const scoreKm = Math.min(45, Math.round((p.kmTotal / Math.max(1, metaKm)) * 45));
  const scoreExp = Math.min(30, Math.round((p.kmProvas / Math.max(1, p.participacoes * (kmAlvo * 0.7))) * 30));
  const fciCoef = p.participacoes > 0 ? (p.colocacaoMedia / Math.max(1, p.concorrentes)) * 1000 : 999;
  const scoreTec = Math.min(25, Math.max(5, Math.round(25 - (fciCoef / 10))));

  const aptidao = Math.min(100, Math.max(10, scoreKm + scoreExp + scoreTec));

  let recomendacao: "Titular" | "Apto" | "Poupar" = "Apto";
  if (aptidao >= 78) recomendacao = "Titular";
  else if (aptidao < 58) recomendacao = "Poupar";

  return {
    aptidao,
    scoreKm,
    scoreExp,
    scoreTec,
    fciCoef: fciCoef < 900 ? fciCoef.toFixed(2) : "—",
    recomendacao,
    especialidade: classificarEspecialidade(p),
  };
}

export default function ClassificacaoPombos() {
  const [pombos, setPombos] = useState<PomboKm[]>(POMBOS_INICIAIS);
  const [ready, setReady] = useState(false);
  const [categoria, setCategoria] = useState<CategoriaDist>("Meio Fundo");
  const [distanciaAlvo, setDistanciaAlvo] = useState(400);
  const [clima, setClima] = useState<"normal" | "contra" | "calor">("normal");
  const [filtro, setFiltro] = useState<"todos" | "Titular" | "Apto" | "Poupar">("todos");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<PomboKm>>({
    anilha: "",
    nome: "",
    sexo: "macho",
    kmTotal: 500,
    kmProvas: 250,
    velocidadeMedia: 1250,
    participacoes: 4,
    colocacaoMedia: 10,
    concorrentes: 400,
  });

  useEffect(() => {
    setPombos(readPombos());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY_RANKING, JSON.stringify(pombos));
  }, [pombos, ready]);

  function handleCatChange(cat: CategoriaDist) {
    setCategoria(cat);
    setDistanciaAlvo(CAT_INFO[cat].kmRef);
  }

  const pombosClassificados = useMemo(() => {
    return pombos
      .map(p => ({
        ...p,
        calc: calcularAptidao(p, distanciaAlvo, clima),
      }))
      .sort((a, b) => b.calc.aptidao - a.calc.aptidao);
  }, [pombos, distanciaAlvo, clima]);

  const pombosFiltrados = useMemo(() => {
    if (filtro === "todos") return pombosClassificados;
    return pombosClassificados.filter(p => p.calc.recomendacao === filtro);
  }, [pombosClassificados, filtro]);

  const stats = useMemo(() => {
    const titulares = pombosClassificados.filter(p => p.calc.recomendacao === "Titular").length;
    const aptos = pombosClassificados.filter(p => p.calc.recomendacao === "Apto").length;
    const poupar = pombosClassificados.filter(p => p.calc.recomendacao === "Poupar").length;
    const totalKmPlantel = pombos.reduce((s, p) => s + p.kmTotal, 0);
    return { titulares, aptos, poupar, totalKmPlantel };
  }, [pombosClassificados, pombos]);

  function handleSalvar() {
    if (!form.anilha?.trim()) {
      alert("Informe a anilha do pombo.");
      return;
    }
    const novoPombo: PomboKm = {
      id: editId || crypto.randomUUID(),
      anilha: form.anilha.trim(),
      nome: form.nome?.trim() || "Pombo",
      sexo: form.sexo || "macho",
      kmTotal: Number(form.kmTotal) || 0,
      kmProvas: Number(form.kmProvas) || 0,
      velocidadeMedia: Number(form.velocidadeMedia) || 1200,
      participacoes: Number(form.participacoes) || 0,
      colocacaoMedia: Number(form.colocacaoMedia) || 1,
      concorrentes: Number(form.concorrentes) || 400,
    };
    setPombos(prev => editId ? prev.map(p => p.id === editId ? novoPombo : p) : [...prev, novoPombo]);
    setShowForm(false);
    setEditId(null);
  }

  function handleEditar(p: PomboKm) {
    setForm({ ...p });
    setEditId(p.id);
    setShowForm(true);
  }

  function handleExcluir(id: string) {
    if (confirm("Excluir registro deste pombo?")) {
      setPombos(prev => prev.filter(p => p.id !== id));
    }
  }

  function handleResetar() {
    if (confirm("Restaurar plantel de demonstração original?")) {
      setPombos(POMBOS_INICIAIS);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={T.h1}>🏆 Classificação e Seleção de Pombos</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Coeficiente técnico baseado nas quilometragens para indicar qual pombo encestar na próxima prova e temporada
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleResetar} style={{ ...T.btnGhost, fontSize: 12 }}>🔄 Resetar Demo</button>
            <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
          </div>
        </div>

        {/* 1. SELETOR DA PRÓXIMA PROVA */}
        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 12 }}>
            🏁 Próxima Prova / Especialidade Alvo
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginBottom: 14 }}>
            {(Object.keys(CAT_INFO) as CategoriaDist[]).map(cat => (
              <button
                key={cat}
                onClick={() => handleCatChange(cat)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  textAlign: "left",
                  background: categoria === cat ? `${T.gold}18` : T.bgCard,
                  border: `2px solid ${categoria === cat ? T.gold : T.border}`,
                  color: categoria === cat ? T.gold : T.white,
                  fontWeight: categoria === cat ? 800 : 500,
                  cursor: "pointer",
                }}
              >
                <div>{CAT_INFO[cat].label}</div>
                <div style={{ fontSize: 11, color: T.dim, marginTop: 4 }}>
                  Distância referência: {CAT_INFO[cat].kmRef} km
                </div>
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "center" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.dim, marginBottom: 6 }}>
                📏 Distância Exata da Próxima Prova (km):
              </label>
              <input
                type="number"
                min={50}
                max={1500}
                value={distanciaAlvo}
                onChange={e => setDistanciaAlvo(Math.max(50, Number(e.target.value)))}
                style={{ ...T.input, width: 140, textAlign: "center", fontSize: 16, fontWeight: 800 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.dim, marginBottom: 6 }}>
                🌤️ Condição de Voo / Clima Esperado:
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {([
                  ["normal", "✅ Normal"],
                  ["contra", "💨 Vento Contra"],
                  ["calor", "☀️ Calor Intenso"],
                ] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setClima(val)}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      background: clima === val ? T.blue : T.bgInput,
                      color: clima === val ? "#fff" : T.dim,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, background: "#ffffff06", fontSize: 12, color: T.gold }}>
            📌 <b>Aptidão calculada para prova de {distanciaAlvo} km</b> — {CAT_INFO[categoria].desc}
          </div>
        </section>

        {/* 2. RESUMO E INDICADORES DO PLANTEL */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 16 }}>
          <StatBox emoji="🏆" label="Prontos / Encestar" value={`${stats.titulares} aves`} color="#22C55E" />
          <StatBox emoji="✅" label="Aptos com ressalvas" value={`${stats.aptos} aves`} color={T.blue} />
          <StatBox emoji="⚠️" label="Poupar / Base" value={`${stats.poupar} aves`} color="#FBBF24" />
          <StatBox emoji="✈️" label="Km Total Plantel" value={`${stats.totalKmPlantel} km`} color={T.gold} />
        </div>

        {/* 3. BARRA DE FILTROS E ADIÇÃO */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {([
              ["todos", "Todos os Pombos"],
              ["Titular", "🏆 Titulares (Encestar)"],
              ["Apto", "✅ Aptos (Reserva)"],
              ["Poupar", "⚠️ Poupar (Treino Base)"],
            ] as const).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFiltro(k)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  background: filtro === k ? T.gold : T.bgCard,
                  color: filtro === k ? T.bg : T.dim,
                  border: `1px solid ${filtro === k ? T.gold : T.border}`,
                  cursor: "pointer",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setForm({ anilha: "", nome: "", sexo: "macho", kmTotal: 500, kmProvas: 250, velocidadeMedia: 1250, participacoes: 4, colocacaoMedia: 10, concorrentes: 400 });
              setEditId(null);
              setShowForm(true);
            }}
            style={{ ...T.btn, fontSize: 13 }}
          >
            ➕ Adicionar Pombo ao Ranking
          </button>
        </div>

        {/* FORMULÁRIO DE ADIÇÃO / EDIÇÃO */}
        {showForm && (
          <section style={{ ...T.card, border: `2px solid ${T.gold}`, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.gold, marginBottom: 12 }}>
              {editId ? "✏️ Editar Dados de Quilometragem do Pombo" : "➕ Novo Pombo no Ranking de Quilometragem"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={T.label}>Anilha *</label>
                <input value={form.anilha || ""} onChange={e => setForm({ ...form, anilha: e.target.value })} style={T.input} placeholder="BR-24-12345" />
              </div>
              <div>
                <label style={T.label}>Nome ou Apelido</label>
                <input value={form.nome || ""} onChange={e => setForm({ ...form, nome: e.target.value })} style={T.input} placeholder="Campeão" />
              </div>
              <div>
                <label style={T.label}>Sexo</label>
                <select value={form.sexo || "macho"} onChange={e => setForm({ ...form, sexo: e.target.value as "macho" | "femea" })} style={{ ...T.input, background: T.bgInput, color: T.white }}>
                  <option value="macho">Macho ♂️</option>
                  <option value="femea">Fêmea ♀️</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 14 }}>
              <div>
                <label style={T.label}>Km Total Acumulado</label>
                <input type="number" value={form.kmTotal ?? ""} onChange={e => setForm({ ...form, kmTotal: +e.target.value })} style={T.input} />
              </div>
              <div>
                <label style={T.label}>Km em Provas Oficiais</label>
                <input type="number" value={form.kmProvas ?? ""} onChange={e => setForm({ ...form, kmProvas: +e.target.value })} style={T.input} />
              </div>
              <div>
                <label style={T.label}>Melhor Vel. Média (m/min)</label>
                <input type="number" value={form.velocidadeMedia ?? ""} onChange={e => setForm({ ...form, velocidadeMedia: +e.target.value })} style={T.input} />
              </div>
              <div>
                <label style={T.label}>Nº Provas Competidas</label>
                <input type="number" value={form.participacoes ?? ""} onChange={e => setForm({ ...form, participacoes: +e.target.value })} style={T.input} />
              </div>
              <div>
                <label style={T.label}>Colocação Média</label>
                <input type="number" value={form.colocacaoMedia ?? ""} onChange={e => setForm({ ...form, colocacaoMedia: +e.target.value })} style={T.input} />
              </div>
              <div>
                <label style={T.label}>Média Concorrentes</label>
                <input type="number" value={form.concorrentes ?? ""} onChange={e => setForm({ ...form, concorrentes: +e.target.value })} style={T.input} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowForm(false)} style={{ ...T.btnGhost, flex: 1 }}>Cancelar</button>
              <button onClick={handleSalvar} style={{ ...T.btn, flex: 2 }}>💾 Salvar no Ranking</button>
            </div>
          </section>
        )}

        {/* 4. TABELA DE CLASSIFICAÇÃO DOS POMBOS */}
        <section style={T.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>
              📋 Ranking para Próxima Prova de {distanciaAlvo} km ({pombosFiltrados.length} aves)
            </div>
            <div style={{ fontSize: 11, color: T.dim }}>
              Ordenado por Índice de Aptidão (Quilometragem + Coef. Técnico FCI)
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}`, background: "#ffffff04", textAlign: "left", color: T.dim }}>
                  <th style={{ padding: "10px 8px" }}>Pos.</th>
                  <th style={{ padding: "10px 8px" }}>Pombo</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>Quilometragem</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>Vel. Média</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>Coef. FCI</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>Aptidão</th>
                  <th style={{ padding: "10px 8px" }}>Recomendação / Próxima Prova</th>
                  <th style={{ padding: "10px 8px", textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pombosFiltrados.map((p, idx) => {
                  const isTitular = p.calc.recomendacao === "Titular";
                  const isPoupar = p.calc.recomendacao === "Poupar";
                  const corRec = isTitular ? "#22C55E" : isPoupar ? "#FBBF24" : T.blue;
                  const bgRec = isTitular ? "rgba(34,197,94,0.12)" : isPoupar ? "rgba(251,191,36,0.12)" : "rgba(59,130,246,0.12)";

                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${T.border}`, background: idx === 0 ? "rgba(234,179,8,0.06)" : "transparent" }}>
                      <td style={{ padding: "12px 8px", fontWeight: 800, color: idx < 3 ? T.gold : T.dim }}>
                        {idx + 1}º
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ fontWeight: 800, color: T.white }}>{p.anilha}</div>
                        <div style={{ fontSize: 11, color: T.dim }}>
                          {p.nome} • {p.sexo === "macho" ? "♂️" : "♀️"}
                        </div>
                        <div style={{ fontSize: 10, color: "#A78BFA", marginTop: 2 }}>
                          {p.calc.especialidade}
                        </div>
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <div style={{ fontWeight: 800, color: T.gold }}>{p.kmTotal} km</div>
                        <div style={{ fontSize: 11, color: T.dim }}>{p.kmProvas} km em provas</div>
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 700 }}>
                        {p.velocidadeMedia} m/min
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <span style={{ fontWeight: 700, color: Number(p.calc.fciCoef) < 2 ? "#22C55E" : T.white }}>
                          {p.calc.fciCoef}
                        </span>
                        <div style={{ fontSize: 10, color: T.dim }}>{p.participacoes} prova(s)</div>
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: corRec }}>
                          {p.calc.aptidao}%
                        </div>
                        <div style={{ width: 60, height: 5, background: "#ffffff14", borderRadius: 3, margin: "4px auto 0", overflow: "hidden" }}>
                          <div style={{ width: `${p.calc.aptidao}%`, height: "100%", background: corRec }} />
                        </div>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 800,
                            background: bgRec,
                            color: corRec,
                            border: `1px solid ${corRec}44`,
                          }}
                        >
                          {isTitular ? "🏆 ENCESTAR (TITULAR)" : isPoupar ? "⚠️ POUPAR / BASE" : "✅ RESERVA APTO"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <button onClick={() => handleEditar(p)} style={{ ...T.btnGhost, padding: "5px 8px", fontSize: 11, marginRight: 4 }}>
                          ✏️
                        </button>
                        <button onClick={() => handleExcluir(p.id)} style={{ ...T.btnDanger, padding: "5px 8px", fontSize: 11 }}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. EXPLICAÇÃO TÉCNICA DA FÓRMULA */}
        <section style={{ ...T.card, background: "#ffffff04", border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
            📖 Entendendo o Coeficiente de Classificação e Seleção
          </div>
          <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.7 }}>
            <p style={{ marginBottom: 8 }}>
              O sistema calcula o <b>Índice de Aptidão (0 a 100%)</b> ponderando três fatores essenciais da columbofilia moderna:
            </p>
            <ul style={{ paddingLeft: 18, marginBottom: 10 }}>
              <li>
                <b>45% — Base de Quilometragem Acumulada (km Total):</b> Compara a soma de km voados (treinos + provas) com a distância da próxima prova. O ideal columbófilo é ter pelo menos 1,8× a distância da prova como bagagem na temporada.
              </li>
              <li>
                <b>30% — Experiência Competitiva (km em Provas):</b> Recompensa aves com maior volume de quilômetros disputados em concorrência oficial.
              </li>
              <li>
                <b>25% — Coeficiente Técnico FCI & Velocidade:</b> Aplica o Coeficiente Oficial FCI <code>((Posição Média / Concorrentes) × 1000)</code> combinado com a melhor velocidade (m/min), valorizando aves constantes no topo da tabela.
              </li>
            </ul>
            <p>
              <b>Como usar:</b> Selecione a distância da próxima prova no topo do painel. Os pombos no topo da lista com selo <b style={{ color: "#22C55E" }}>🏆 ENCESTAR (TITULAR)</b> têm a melhor relação entre base de treino e qualidade técnica para representar seu pombal.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatBox({ emoji, label, value, color }: { emoji: string; label: string; value: string; color: string }) {
  return (
    <div style={{ ...T.card, margin: 0, padding: 14, textAlign: "center" }}>
      <div style={{ fontSize: 22 }}>{emoji}</div>
      <div style={{ ...T.small, marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}
