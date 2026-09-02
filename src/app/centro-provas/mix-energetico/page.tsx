"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadConfig } from "../config";
import { T } from "../theme";

type Cat = "base" | "proteina" | "functional" | "suplemento";
type Ing = { nome: string; g: number; cat: Cat; papel: string };

const CAT_INFO: Record<Cat, { label: string; emoji: string; cor: string }> = {
  base: { label: "Base energética", emoji: "⚡", cor: "#EAB308" },
  proteina: { label: "Proteína", emoji: "💪", cor: "#22C55E" },
  functional: { label: "Funcional", emoji: "🌿", cor: "#55a3ff" },
  suplemento: { label: "Suplemento (validar vet)", emoji: "⚠️", cor: "#f97316" },
};

const RECEITA: Ing[] = [
  { nome: "Aveia descascada", g: 250, cat: "base", papel: "Energia de liberação lenta — sustenta o voo longo (12-16h)" },
  { nome: "Amido de batata", g: 150, cat: "base", papel: "Carboidrato de rápida absorção — carga imediata" },
  { nome: "Farinha de amendoim", g: 140, cat: "base", papel: "Gordura + proteína — reserva de fundo" },
  { nome: "Proteína isolada de soja", g: 120, cat: "proteina", papel: "Proteína vegetal concentrada — reconstrução" },
  { nome: "Farinha de girassol", g: 90, cat: "base", papel: "Gordura boa + vitamina E — qualidade de pena" },
  { nome: "Levedura de cerveja", g: 60, cat: "functional", papel: "Complexo B + flora intestinal" },
  { nome: "Leite em pó desnatado", g: 60, cat: "proteina", papel: "Cálcio e proteína — estrutura óssea e muscular" },
  { nome: "Farinha de linhaça", g: 60, cat: "base", papel: "Ômega-3 — anti-inflamatório natural" },
  { nome: "Spirulina", g: 30, cat: "proteina", papel: "Proteína completa + antioxidantes" },
  { nome: "Farinha de peixe", g: 25, cat: "proteina", papel: "Proteína animal + ômega-3 (DHA)" },
  { nome: "Beterraba em pó", g: 20, cat: "functional", papel: "Circulação e oxigenação sanguínea" },
  { nome: "Cenoura em pó", g: 15, cat: "functional", papel: "Carotenoides — pigmento e visão" },
  { nome: "Espinafre em pó", g: 15, cat: "functional", papel: "Ferro e micronutrientes — hemoglobina" },
  { nome: "Alho em pó", g: 5, cat: "functional", papel: "Imunidade natural" },
  { nome: "Cebola em pó", g: 3, cat: "functional", papel: "Flavonoides — circulação" },
  { nome: "Creatina monoidratada", g: 8, cat: "suplemento", papel: "Reserva energética muscular — validar com veterinário" },
  { nome: "Beta-alanina", g: 5, cat: "suplemento", papel: "Reduz fadiga aeróbica — validar com veterinário" },
];

const DOSE_SEMANA: { dias: string; emoji: string; g: number; nota: string; cor: string }[] = [
  { dias: "Domingo", emoji: "💙", g: 0, nota: "Sem mix — depuração pós-prova", cor: "#55a3ff" },
  { dias: "Segunda", emoji: "🟢", g: 1.5, nota: "Reconstrução muscular", cor: "#39e58c" },
  { dias: "Terça", emoji: "🟡", g: 2, nota: "Treino leve", cor: "#fbbf24" },
  { dias: "Quarta", emoji: "🔵", g: 2, nota: "Resistência aeróbica", cor: "#55a3ff" },
  { dias: "Quinta", emoji: "🟠", g: 3, nota: "CARGA MÁXIMA — nunca mais que isso", cor: "#f97316" },
  { dias: "Sexta", emoji: "🟣", g: 2, nota: "Manhã — última dose antes do cesto", cor: "#a78bfa" },
  { dias: "Sábado", emoji: "⭐", g: 0, nota: "Sem mix — dia da prova (energia vem dos grãos)", cor: "#f7bd00" },
];

export default function MixEnergetico() {
  const [cfg, setCfg] = useState({ consumoDiario: 30, quantidadePombos: 20 });
  const [lote, setLote] = useState(1); // multiplicador da receita base (1056g)
  useEffect(() => { const c = loadConfig(); setCfg({ consumoDiario: c.consumoDiario, quantidadePombos: c.quantidadePombos }); }, []);

  const totalBase = useMemo(() => RECEITA.reduce((s, i) => s + i.g, 0), []); // 1056
  const escala = lote * totalBase;
  const consumoSemana = useMemo(() => DOSE_SEMANA.reduce((s, d) => s + d.g, 0) * cfg.quantidadePombos, [cfg]); // g/plantel/semana
  const duracaoLote = consumoSemana > 0 ? (escala / consumoSemana) : 0; // semanas

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>⚗️ Mix Energético — Lote Profissional</h1>
            <p style={{ ...T.small, marginTop: 4 }}>O complemento em pó do fundista: lote escalável, dose real por dia da semana e o modo correto de servir</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={{ ...T.card, borderColor: "#f9731655", background: "#f973160d" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#f97316", marginBottom: 8 }}>⚠️ A regra de ouro do mix</div>
          <div style={{ ...T.small, fontSize: 12, lineHeight: 1.7 }}>
            O mix é <b>COMPLEMENTO, não refeição</b>: ele vai <b>misturado na ração</b> (nunca sozinho), grudando nos grãos com um fio de óleo. Dose real: <b style={{ color: T.gold }}>1,5 a 3g por pombo</b> — no máximo <b>~10% do consumo diário</b>. Pombo come 30g/dia no total; dar 10g de pó (como dizia a receita antiga) é erro — ele para de comer os grãos que dão a energia de verdade!
          </div>
        </section>

        <section style={T.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>📅 Dose do mix por dia da semana (g/pombo)</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 6 }}>
            {DOSE_SEMANA.map((d) => (
              <div key={d.dias} style={{ padding: "9px 4px", borderRadius: 10, textAlign: "center", background: `${d.cor}12`, border: `1px solid ${d.cor}44` }}>
                <div style={{ fontSize: 16 }}>{d.emoji}</div>
                <div style={{ fontSize: 10, color: T.dim }}>{d.dias}</div>
                <b style={{ fontSize: 15, color: d.g === 0 ? T.dim : d.cor }}>{d.g === 0 ? "—" : `${d.g}g`}</b>
                <div style={{ fontSize: 8.5, color: T.dim, lineHeight: 1.3, marginTop: 3 }}>{d.nota}</div>
              </div>
            ))}
          </div>
          <div style={{ ...T.small, fontSize: 11, marginTop: 10, lineHeight: 1.6 }}>
            🥄 Planta de <b>{cfg.quantidadePombos} pombos</b> → total do dia: <b style={{ color: T.gold }}>{(3 * cfg.quantidadePombos).toFixed(0)}g</b> na quinta (máx.) • consumo da semana: <b style={{ color: T.gold }}>{(consumoSemana / 1000).toFixed(2)}kg</b>
          </div>
        </section>

        <section style={T.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>🧪 Receita do lote ({RECEITA.length} ingredientes)</div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span style={{ ...T.small, fontSize: 10 }}>lote:</span>
              {[1, 2, 4].map((k) => (
                <button key={k} type="button" onClick={() => setLote(k)} style={{ padding: "4px 10px", borderRadius: 7, fontSize: 10, fontWeight: 800, cursor: "pointer", color: lote === k ? "#0b1426" : T.dim, background: lote === k ? T.gold : T.bgInput, border: `1px solid ${lote === k ? T.gold : T.border}` }}>{k}× ({(k * totalBase / 1000).toFixed(1)}kg)</button>
              ))}
            </div>
          </div>
          {RECEITA.map((i) => (
            <div key={i.nome} style={{ padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <b style={{ fontSize: 12.5 }}>{CAT_INFO[i.cat].emoji} {i.nome}</b>
                <b style={{ color: CAT_INFO[i.cat].cor, fontSize: 12.5 }}>{Math.round(i.g * lote)}g</b>
              </div>
              <div style={{ height: 4, background: "#ffffff12", borderRadius: 2, margin: "4px 0" }}>
                <div style={{ height: "100%", width: `${(i.g / 250) * 100}%`, background: CAT_INFO[i.cat].cor, borderRadius: 2 }} />
              </div>
              <div style={{ ...T.small, fontSize: 10.5 }}>{i.papel} • <b style={{ color: CAT_INFO[i.cat].cor }}>{((i.g / totalBase) * 100).toFixed(1)}%</b> do lote</div>
            </div>
          ))}
          <div style={{ padding: "10px 12px", borderRadius: 9, background: "#ffffff08", marginTop: 10, fontSize: 12 }}>
            ⚗️ <b>Total do lote: {escala}g</b> • dura ~<b style={{ color: T.gold }}>{duracaoLote.toFixed(1)} semanas</b> pro plantel de {cfg.quantidadePombos} • armazenar em pote fechado, escuro e seco — usar em até 30-45 dias
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🥄 Modo correto de servir</div>
          {[
            "1️⃣ Pese a dose do dia: plantel × gramas do dia (ex.: 20 pombos × 3g = 60g do mix)",
            "2️⃣ Misture nos grãos da TARDE com um fio de óleo (girassol ou alho) — o óleo faz o pó grudar nos grãos em vez de ficar no fundo do comedouro",
            "3️⃣ Mexa bem e sirva na hora — pombo limpa a tigela sem desperdício",
            "4️⃣ Água limpa à parte; nunca misture o pó na água",
            "5️⃣ Comece com meia dose (1,5g) na primeira semana pra adaptar o intestino, depois a dose cheia",
          ].map((p, i) => (
            <div key={i} style={{ padding: "8px 12px", borderRadius: 8, background: "#ffffff08", fontSize: 12, marginBottom: 5, lineHeight: 1.6 }}>{p}</div>
          ))}
          <div style={{ ...T.small, fontSize: 11, marginTop: 8, lineHeight: 1.6, color: "#f97316" }}>
            ⚠️ Creatina e beta-alanina são suplementos esportivos com uso ainda em estudo em pombos — valide doses com veterinário/consultor antes de incluir no lote. Sem orientação, faça o lote sem elas (o mix segue completo).
          </div>
        </section>
      </div>
    </main>
  );
}
