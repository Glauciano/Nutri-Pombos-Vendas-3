"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";
import { DISTRIBUICAO } from "../calculadora/page";
import { DEFAULT_CONFIG, loadConfig, saveConfig, type ConfigPlantel } from "../config";
import { getPombal, salvarPombal } from "../lib/apis-gratis";

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

  // 🏠 Localização do pombal
  const [pombal, setPombalState] = useState({ lat: -23.55, lon: -46.63, nome: "Pombal (sua base)" });
  const [pombalNome, setPombalNome] = useState("");
  const [pombalSalvo, setPombalSalvo] = useState(false);
  const [gpsMsg, setGpsMsg] = useState("");

  useEffect(() => {
    const stored = loadConfig();
    setCfg(stored);
    setCustom(![25, 28, 30, 32, 35].includes(stored.consumoDiario));
    const p = getPombal();
    setPombalState(p);
    setPombalNome(p.nome === "Pombal (sua base)" ? "" : p.nome);
  }, []);

  const usarGps = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) { setGpsMsg("⚠️ GPS não suportado neste aparelho — digite manualmente."); return; }
    setGpsMsg("⏳ Detectando localização...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPombalState((atual) => ({ ...atual, lat: +pos.coords.latitude.toFixed(6), lon: +pos.coords.longitude.toFixed(6) }));
        setGpsMsg("✅ Localização detectada! Confira e toque em 💾 Salvar localização.");
      },
      () => setGpsMsg("⚠️ Não foi possível obter o GPS (verifique a permissão) — digite manualmente."),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // 💾 Backup dos dados (exportar/importar JSON)
  const [backupMsg, setBackupMsg] = useState("");

  const exportarBackup = () => {
    try {
      const dados: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith("nutripombos")) continue;
        try { dados[k] = JSON.parse(localStorage.getItem(k) || "null"); } catch { dados[k] = localStorage.getItem(k); }
      }
      const blob = new Blob([JSON.stringify({ app: "nutri-pombos", versao: 1, exportadoEm: new Date().toISOString(), dados }, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `nutri-pombos-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      setBackupMsg(`✅ Backup exportado com ${Object.keys(dados).length} itens!`);
    } catch { setBackupMsg("⚠️ Falha ao exportar o backup."); }
  };

  const importarBackup = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const j = JSON.parse(String(reader.result)) as { dados?: Record<string, unknown> };
        const dados = j?.dados;
        if (!dados || typeof dados !== "object") { setBackupMsg("⚠️ Este arquivo não parece um backup do Nutri Pombos."); return; }
        let n = 0;
        Object.entries(dados).forEach(([k, v]) => {
          if (k.startsWith("nutripombos")) { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); n++; }
        });
        setBackupMsg(`✅ ${n} itens restaurados! Recarregando a página...`);
        window.setTimeout(() => window.location.reload(), 1400);
      } catch { setBackupMsg("⚠️ Falha ao ler o arquivo de backup."); }
    };
    reader.readAsText(f);
    ev.target.value = "";
  };

  const salvarLocalPombal = () => {
    if (Math.abs(pombal.lat) > 90 || Math.abs(pombal.lon) > 180 || !Number.isFinite(pombal.lat) || !Number.isFinite(pombal.lon)) {
      setGpsMsg("⚠️ Latitude/longitude inválidas.");
      return;
    }
    salvarPombal(pombal.lat, pombal.lon, pombalNome);
    setPombalSalvo(true);
    setGpsMsg("");
    window.setTimeout(() => setPombalSalvo(false), 2500);
  };

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

        {/* 🏠 LOCALIZAÇÃO DO POMBAL — latitude e longitude configuráveis */}
        <section style={{ ...T.card, borderColor: `${T.gold}55`, background: `${T.gold}0d` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 8 }}>🏠 Localização do Pombal (latitude e longitude)</div>
          <div style={{ ...T.small, fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
            Todas as ferramentas usam essa posição: <b>rota da prova</b> (distância, vento, altimetria, radar), <b>clima avançado</b>, <b>nascer/pôr do sol</b> e <b>clima × desempenho</b>. Troque o padrão (São Paulo) pela localização real do seu pombal.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div>
              <label style={T.label}>Latitude</label>
              <input aria-label="Latitude do pombal" type="number" step="any" min="-90" max="90" value={pombal.lat} onChange={(e) => setPombalState((atual) => ({ ...atual, lat: Number(e.target.value) }))} style={{ ...T.input, textAlign: "center", fontSize: 16, fontWeight: 700 }} />
            </div>
            <div>
              <label style={T.label}>Longitude</label>
              <input aria-label="Longitude do pombal" type="number" step="any" min="-180" max="180" value={pombal.lon} onChange={(e) => setPombalState((atual) => ({ ...atual, lon: Number(e.target.value) }))} style={{ ...T.input, textAlign: "center", fontSize: 16, fontWeight: 700 }} />
            </div>
            <div>
              <label style={T.label}>Nome do pombal (opcional)</label>
              <input aria-label="Nome do pombal" type="text" value={pombalNome} placeholder="Ex.: Meu Pombal" onChange={(e) => setPombalNome(e.target.value)} style={T.input} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={usarGps} style={T.btnGhost}>📍 Detectar pelo GPS</button>
            <button type="button" onClick={salvarLocalPombal} style={{ ...T.btn, flex: 1 }}>{pombalSalvo ? "✅ Salvo! Todas as páginas atualizam sozinhas" : "💾 Salvar localização"}</button>
          </div>
          {gpsMsg && <div style={{ ...T.small, fontSize: 12, marginTop: 10, color: gpsMsg.startsWith("✅") ? T.green : T.orange }}>{gpsMsg}</div>}
          {pombal.lat > 0 && <div style={{ ...T.small, fontSize: 12, marginTop: 10, color: T.red }}>⚠️ Latitude positiva fica no hemisfério NORTE — no Brasil ela é negativa (ex.: Limeira = <b>-22.8864</b>). Confira antes de salvar!</div>}
          {pombal.lat >= -34 && pombal.lat <= 5 && pombal.lon >= -74 && pombal.lon <= -30 ? null : <div style={{ ...T.small, fontSize: 12, marginTop: 10, color: T.orange }}>⚠️ Essas coordenadas estão fora do Brasil — confira os sinais (sul = latitude negativa, oeste = longitude negativa).</div>}
          <div style={{ ...T.small, fontSize: 11, marginTop: 10, lineHeight: 1.6 }}>
            💡 Não sabe as coordenadas? Abra o <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer" style={{ color: T.blue }}>OpenStreetMap</a>, clique com o botão direito no seu pombal → "Mostrar endereço" e copie os números (ex.: Limeira ≈ latitude <b>-22.8864</b>, longitude <b>-47.4017</b>). Negativo = sul/oeste.
          </div>
        </section>

        {/* 🏁 HORÁRIO DA SOLTURA — automático (pós nascer do sol) ou manual */}
        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 8 }}>🏁 Horário da Soltura</div>
          <div style={{ ...T.small, fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
            A previsão de chegada na <b>Rota da Prova</b> usa este horário. No modo automático, o app soma os minutos ao <b>nascer do sol real</b> da cidade da soltura naquele dia.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
            {([["auto", "☀️ Automático (após o nascer do sol)"], ["manual", "✏️ Manual (horário fixo)"]] as const).map(([val, lbl]) => (
              <button key={val} type="button" onClick={() => setCfg((prev) => ({ ...prev, soltaModo: val }))} style={{ padding: "12px 8px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 800, background: (cfg.soltaModo || "auto") === val ? T.gold : T.bgInput, color: (cfg.soltaModo || "auto") === val ? T.bg : T.dim, border: (cfg.soltaModo || "auto") === val ? `2px solid ${T.gold}` : `1px solid ${T.border}` }}>{lbl}</button>
            ))}
          </div>
          {(cfg.soltaModo || "auto") === "auto" ? (
            <div>
              <label style={T.label}>Minutos após o nascer do sol</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6, marginBottom: 8 }}>
                {[0, 10, 15, 20, 30, 45].map((m) => (
                  <button key={m} type="button" onClick={() => setCfg((prev) => ({ ...prev, soltaMinAposNascer: m }))} style={{ padding: "10px 4px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 800, background: (cfg.soltaMinAposNascer ?? 20) === m ? T.gold : T.bgInput, color: (cfg.soltaMinAposNascer ?? 20) === m ? T.bg : T.dim, border: (cfg.soltaMinAposNascer ?? 20) === m ? `2px solid ${T.gold}` : `1px solid ${T.border}` }}>{m === 0 ? "Junto" : `+${m}`}</button>
                ))}
              </div>
              <input aria-label="Minutos após o nascer do sol" type="number" min={0} max={180} value={cfg.soltaMinAposNascer ?? 20} onChange={(e) => setCfg((prev) => ({ ...prev, soltaMinAposNascer: Math.max(0, Math.min(180, Number(e.target.value))) }))} style={{ ...T.input, textAlign: "center", fontSize: 16, fontWeight: 700 }} />
              <div style={{ ...T.small, fontSize: 11, marginTop: 6 }}>Ex.: nascer às 06:22 + {cfg.soltaMinAposNascer ?? 20}min = solta às <b style={{ color: T.gold }}>{(() => { const [h, m] = "06:22".split(":").map(Number); const t = h * 60 + m + (cfg.soltaMinAposNascer ?? 20); return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; })()}</b></div>
            </div>
          ) : (
            <div>
              <label style={T.label}>Horário fixo da soltura</label>
              <input aria-label="Horário fixo da soltura" type="time" value={cfg.soltaHoraManual || "07:00"} onChange={(e) => setCfg((prev) => ({ ...prev, soltaHoraManual: e.target.value }))} style={{ ...T.input, textAlign: "center", fontSize: 20, fontWeight: 800 }} />
            </div>
          )}
        </section>

        {/* 🗺️ MAPA DE SATÉLITE (Google) — opcional, com API Key própria */}
        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 8 }}>🗺️ Mapa de Satélite (opcional)</div>
          <div style={{ ...T.small, fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
            📣 O mapa de <b>satélite real já é GRATUITO e sem chave</b> (Esri World Imagery) — disponível na Rota da Prova, botão 🗺️ Satélite. Esta chave do Google é <b>opcional</b>: só adiciona o modo 🧭 Rota Google (por estrada).
          </div>
          <label style={T.label}>Google Maps API Key (opcional)</label>
          <input aria-label="Google Maps API Key" type="text" placeholder="AIza..." value={cfg.mapaApiKey || ""} onChange={(e) => setCfg((prev) => ({ ...prev, mapaApiKey: e.target.value.trim() }))} style={{ ...T.input, fontSize: 14 }} />
          <div style={{ ...T.small, fontSize: 11, marginTop: 8, lineHeight: 1.6 }}>
            Como obter: <a href="https://console.cloud.google.com/google/maps-embed-api" target="_blank" rel="noreferrer" style={{ color: T.blue }}>console.cloud.google.com</a> → ativar <b>Maps Embed API</b> → Credenciais → Criar chave. Depois toque em <b>💾 Salvar Configuração</b> lá embaixo.
          </div>
        </section>

        {/* 💾 BACKUP DOS DADOS — exportar / importar */}
        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 8 }}>💾 Backup dos Dados</div>
          <div style={{ ...T.small, fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
            Histórico, calendário, mapa, alertas, chips, treinos e configurações ficam salvos neste aparelho. Exporte um arquivo de backup de vez em quando — e use a importação para transferir tudo para outro celular sem perder nada.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={exportarBackup} style={T.btnGhost}>📤 Exportar backup (.json)</button>
            <input id="importar-backup" type="file" accept=".json,application/json" onChange={importarBackup} style={{ display: "none" }} />
            <button type="button" onClick={() => document.getElementById("importar-backup")?.click()} style={{ ...T.btn, flex: 1 }}>📥 Importar backup</button>
          </div>
          {backupMsg && <div style={{ ...T.small, fontSize: 12, marginTop: 10, color: backupMsg.startsWith("✅") ? T.green : T.orange }}>{backupMsg}</div>}
        </section>

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
