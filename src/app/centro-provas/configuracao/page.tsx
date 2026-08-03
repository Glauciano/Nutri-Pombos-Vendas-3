"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";
import { DISTRIBUICAO } from "../calculadora/page";
import { DEFAULT_CONFIG, loadConfig, saveConfig, type ConfigPlantel } from "../config";

function escalar(base: number, consumo: number) {
  return Math.round((base / 30) * consumo * 10) / 10;
}

function ajustar(sementes: number, condicao: string) {
  if (condicao === "Magro") return Math.round(sementes * 1.05 * 10) / 10;
  if (condicao === "Pesado") return Math.round(sementes * 0.95 * 10) / 10;
  return sementes;
}

export default function Configuracao() {
  const [cfg, setCfg] = useState<ConfigPlantel>(DEFAULT_CONFIG);
  const [custom, setCustom] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = loadConfig();
    setCfg(stored);
    setCustom(![25, 28, 30, 32, 35].includes(stored.consumoDiario));
  }, []);

  const salvar = () => {
    saveConfig(cfg);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "18px 12px 50px" }}>
      <div style={{ width: "100%", maxWidth: 760, margin: "0 auto" }}>
        <Link href="/centro-provas" style={{ display: "inline-block", ...T.btnGhost, textDecoration: "none", marginBottom: 16 }}>← Voltar</Link>

        <div style={{ marginBottom: 20 }}>
          <h1 style={T.h1}>⚙️ Configuração do Plantel</h1>
          <p style={{ ...T.small, marginTop: 4 }}>Configure o consumo base — todos os protocolos recalculam automaticamente</p>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 12 }}>🌾 Consumo médio por pombo/dia</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 10 }}>
            {[25, 28, 30, 32, 35].map((value) => (
              <button key={value} type="button" onClick={() => { setCfg((previous) => ({ ...previous, consumoDiario: value })); setCustom(false); }} style={{ padding: "12px 6px", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: cfg.consumoDiario === value && !custom ? 900 : 600, background: cfg.consumoDiario === value && !custom ? T.gold : T.bgInput, color: cfg.consumoDiario === value && !custom ? T.bg : T.dim, border: cfg.consumoDiario === value && !custom ? `2px solid ${T.gold}` : `1px solid ${T.border}`, textAlign: "center" }}>{value}g</button>
            ))}
            <button type="button" onClick={() => setCustom(true)} style={{ padding: "12px 6px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: custom ? 900 : 500, background: custom ? T.gold : T.bgInput, color: custom ? T.bg : T.dim, border: custom ? `2px solid ${T.gold}` : `1px solid ${T.border}`, textAlign: "center", gridColumn: "span 3" }}>✏️ Personalizado</button>
          </div>
          {custom && <input aria-label="Consumo diário personalizado" type="number" min={10} max={60} value={cfg.consumoDiario} onChange={(event) => setCfg((previous) => ({ ...previous, consumoDiario: Number(event.target.value) }))} style={{ ...T.input, textAlign: "center", fontSize: 20, fontWeight: 700, marginBottom: 10 }} />}
          <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)", fontSize: 13, color: T.gold, fontWeight: 700 }}>Consumo configurado: {cfg.consumoDiario}g por pombo/dia</div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 10 }}>🐦 Quantidade de pombos</div>
          <input aria-label="Quantidade de pombos" type="number" min={1} max={500} value={cfg.quantidadePombos} onChange={(event) => setCfg((previous) => ({ ...previous, quantidadePombos: Number(event.target.value) }))} style={{ ...T.input, textAlign: "center", fontSize: 20, fontWeight: 700 }} />
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 12 }}>📊 Condição Corporal</div>
          {[
            { value: "Magro", emoji: "⬆️", color: T.red, description: "+5% sementes" },
            { value: "Ideal", emoji: "✅", color: T.green, description: "Protocolo padrão" },
            { value: "Pesado", emoji: "⬇️", color: "#FBBF24", description: "-5% sementes" },
          ].map(({ value, emoji, color, description }) => (
            <button key={value} type="button" onClick={() => setCfg((previous) => ({ ...previous, condicaoCorporal: value }))} style={{ width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 10, cursor: "pointer", marginBottom: 6, background: cfg.condicaoCorporal === value ? `${color}20` : T.bgInput, color: cfg.condicaoCorporal === value ? color : T.dim, border: cfg.condicaoCorporal === value ? `2px solid ${color}` : `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>{emoji}</span><span><b style={{ display: "block", fontSize: 14 }}>{value}</b><span style={{ fontSize: 11, opacity: 0.7 }}>{description}</span></span>
            </button>
          ))}
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 10 }}>👁️ Preview — Quinta-feira (carga energética)</div>
          {["Velocidade", "Meio Fundo", "Fundo"].map((categoria) => {
            const dados = DISTRIBUICAO[categoria]?.Quinta || { sementes: 25, mix: 5, obs: "" };
            const sementes = ajustar(escalar(dados.sementes, cfg.consumoDiario), cfg.condicaoCorporal);
            const mix = escalar(dados.mix, cfg.consumoDiario);
            return <div className="preview-row" key={categoria} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.border}` }}><span style={{ fontSize: 13, color: T.dim }}>{categoria}</span><span style={{ fontSize: 13, fontWeight: 700, textAlign: "right" }}><span style={{ color: T.gold }}>{sementes}g sementes</span> + <span style={{ color: "#A78BFA" }}>{mix}g mix</span><span style={{ color: T.green, marginLeft: 8 }}>= {(sementes + mix).toFixed(1)}g</span></span></div>;
          })}
        </section>

        <button type="button" onClick={salvar} style={{ ...T.btn, padding: 15, fontSize: 16 }}>{saved ? "✅ Salvo!" : "💾 Salvar Configuração"}</button>
      </div>
      <style jsx global>{`button,input{font-family:inherit}@media(max-width:520px){.preview-row{align-items:flex-start;flex-direction:column}.preview-row>span:last-child{text-align:left!important}}`}</style>
    </main>
  );
}
