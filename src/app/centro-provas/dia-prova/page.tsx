"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CALENDARIO_2026, classificarProva, diasParaProva, type Prova } from "../data/calendario";
import { T } from "../theme";

type Tela = "hub" | "selecionar" | "ativo" | "encerrada";
type Pombo = { id: number; nome: string | null; anilha: string; status: string | null };
type Retorno = { pomboId: string; hora: string; velocidade: number; colocacao: number; obs?: string };
type Registro = { provaId: string; horaSoltura: string; clima: string; vento: string; velocidadeVento: number; temperatura: number; retornos: Retorno[]; obs: string; encerrada: boolean; dataRegistro: string };
type Resultado = { id: string; prova: string; data: string; distancia: number; pomboId: string; colocacao: number; velocidade: number; hora: string; observacoes: string };
type LinhaImportada = { anilha: string; hora: string; socio?: string; idSocio?: string; concurso?: string };

const DIA_KEY = "nutripombos-diaprova-v2";
const CHECK_KEY = "nutripombos-check-dia";
const HIST_KEY = "nutripombos-historico-provas-v1";
const CLIMAS = ["☀️ Ensolarado", "☁️ Nublado", "🌧️ Chuva", "🍃 Vento leve", "💨 Vento forte", "❄️ Frio", "🌡️ Quente"];
const VENTOS = ["⬆️ Norte", "↗️ Nordeste", "➡️ Leste", "↘️ Sudeste", "⬇️ Sul", "↙️ Sudoeste", "⬅️ Oeste", "↖️ Noroeste"];
const CHECKLIST = [
  ["c1", "🌾", "Alimentação leve feita (sem oleaginosas em excesso)"], ["c2", "💧", "Água fresca e limpa disponível"],
  ["c3", "⚗️", "Mix Final ofertado (dose correta por categoria)"], ["c4", "❤️", "Sistema de viuvez ativado"],
  ["c5", "⚖️", "Condição física verificada"], ["c6", "💊", "Sem medicamentos nas últimas 48h"],
  ["c7", "🧺", "Cesto de enceste limpo e identificado"], ["c8", "📋", "Ficha de anilha conferida"],
  ["c9", "🌤️", "Previsão do tempo verificada"], ["c10", "📱", "App pronto para registrar chegadas"],
];

function agoraHMS() { const n = new Date(); return [n.getHours(), n.getMinutes(), n.getSeconds()].map(v => String(v).padStart(2, "0")).join(":"); }
function normalizarHora(h: string) { const p = h.split(":"); return p.length === 2 ? `${h}:00` : h; }
function hmsParaSeg(h: string) { const [a = 0, b = 0, c = 0] = h.split(":").map(Number); return a * 3600 + b * 60 + c; }
function tempoVoo(solta: string, chegada: string) { const d = hmsParaSeg(chegada) - hmsParaSeg(solta); if (d <= 0) return "—"; return `${String(Math.floor(d / 3600)).padStart(2, "0")}:${String(Math.floor(d % 3600 / 60)).padStart(2, "0")}:${String(d % 60).padStart(2, "0")}`; }
function calcVel(km: number, solta: string, chegada: string) { const segundos = hmsParaSeg(chegada) - hmsParaSeg(solta); return segundos > 0 ? Math.round(km * 1000 / (segundos / 60)) : 0; }
function classVel(v: number) { if (v >= 1400) return ["🏆 Excepcional", T.gold]; if (v >= 1300) return ["🥇 Excelente", T.green]; if (v >= 1200) return ["🥈 Muito boa", T.blue]; if (v >= 1100) return ["🥉 Boa", "#A78BFA"]; if (v >= 1000) return ["📊 Regular", T.orange]; return ["⚠️ Baixa", "#FBBF24"]; }
function provaId(p: Prova) { return p.id ?? String(p.num); }
function parsearConstatacao(texto: string): LinhaImportada[] {
  const result: LinhaImportada[] = [];
  let socio = "";
  let idSocio = "";
  let concurso = "";
  const linhas = texto.split(/\r?\n/);

  for (const line of linhas) {
    const limpa = line.trim();
    if (!limpa || limpa.startsWith("#") || limpa.startsWith("//") || (limpa.startsWith("[") && limpa.endsWith("]"))) continue;

    // Detectar Sócio no formato INI (SocioNome=...) ou TXT
    if (limpa.startsWith("SocioNome=") || limpa.match(/^S[oó]cio[:\s]+/i)) {
      socio = limpa.split("=").length > 1 ? limpa.split("=")[1].trim() : limpa.replace(/^S[oó]cio[:\s]+/i, "").trim();
      continue;
    }
    if (limpa.startsWith("SocioID=")) {
      idSocio = limpa.split("=")[1].trim();
      continue;
    }
    if (limpa.startsWith("Concurso=")) {
      concurso = limpa.split("=")[1].trim();
      continue;
    }
    if (limpa.includes("=") && !limpa.match(/^Band\d+=/i)) {
      continue;
    }

    // 1. Formato Pigeon Master INI "Band1=008488920|11:27:24|Normal"
    if (limpa.match(/^Band\d+=/i) || (limpa.includes("|") && limpa.includes(":"))) {
      const parteDados = limpa.includes("=") ? limpa.split("=")[1] : limpa;
      const colunas = parteDados.split("|").map(v => v.trim());
      if (colunas.length >= 2) {
        const idChip = colunas[0];
        const hora = normalizarHora(colunas[1]);
        if (idChip && hora.match(/^\d{2}:\d{2}/)) {
          result.push({ anilha: idChip, hora, socio, idSocio, concurso });
          continue;
        }
      }
    }

    // 2. Formato barra, Benzing, Bricon, vírgulas ou espaços
    const m = limpa.match(/([0-9A-Z\-\/]{5,})[;,\s\|]+(\d{2}:\d{2}(?::\d{2})?)/i);
    if (m) {
      result.push({ anilha: m[1].trim(), hora: normalizarHora(m[2].trim()), socio, idSocio, concurso });
      continue;
    }
  }
  return result;
}
function readLocal<T>(key: string, fallback: T): T { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }

export default function DiaProva() {
  const [tela, setTela] = useState<Tela>("hub");
  const [reg, setReg] = useState<Registro | null>(null);
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [checks, setChecks] = useState<string[]>([]);
  const [novo, setNovo] = useState({ pomboId: "", hora: agoraHMS(), obs: "" });
  const [showImport, setShowImport] = useState(false);
  const [importTxt, setImportTxt] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => { setReg(readLocal<Registro | null>(DIA_KEY, null)); setChecks(readLocal<string[]>(CHECK_KEY, [])); fetch("/api/pombos").then(r => r.json()).then(v => setPombos(Array.isArray(v) ? v : [])).catch(() => setPombos([])); const timer = window.setInterval(() => setHoraAtual(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { if (reg) localStorage.setItem(DIA_KEY, JSON.stringify(reg)); else localStorage.removeItem(DIA_KEY); }, [reg]);

  const ativos = pombos.filter(p => !p.status || p.status === "ativo" || p.status === "Ativo" || p.status === "Em tratamento");
  const hoje = new Date().toISOString().slice(0, 10);
  const provaHoje = CALENDARIO_2026.find(p => p.dataSolta === hoje);
  const proxima = CALENDARIO_2026.find(p => p.dataSolta >= hoje) ?? CALENDARIO_2026.at(-1);
  const prova = reg ? CALENDARIO_2026.find(p => provaId(p) === reg.provaId || String(p.num) === reg.provaId) : undefined;

  function iniciar(p: Prova) { setReg({ provaId: provaId(p), horaSoltura: "", clima: CLIMAS[0], vento: VENTOS[0], velocidadeVento: 5, temperatura: 24, retornos: [], obs: "", encerrada: false, dataRegistro: new Date().toISOString() }); setTela("ativo"); }
  function toggle(id: string) { const next = checks.includes(id) ? checks.filter(v => v !== id) : [...checks, id]; setChecks(next); localStorage.setItem(CHECK_KEY, JSON.stringify(next)); }
  function ordenar(retornos: Retorno[]) { return retornos.sort((a, b) => hmsParaSeg(a.hora) - hmsParaSeg(b.hora)).map((r, i) => ({ ...r, colocacao: i + 1 })); }
  function addRetorno() { if (!reg || !prova || !novo.pomboId || !reg.horaSoltura) return; const hora = normalizarHora(novo.hora); const retorno = { pomboId: novo.pomboId, hora, velocidade: calcVel(prova.km, normalizarHora(reg.horaSoltura), hora), colocacao: 0, obs: novo.obs }; setReg({ ...reg, retornos: ordenar([...reg.retornos, retorno]) }); setNovo({ pomboId: "", hora: agoraHMS(), obs: "" }); }
  function importar() { if (!reg || !prova || !reg.horaSoltura) { setMessage("⚠️ Registre a hora de soltura antes de importar!"); return; } const linhas = parsearConstatacao(importTxt); if (!linhas.length) { setMessage("❌ Nenhum registro encontrado no arquivo ou texto."); return; } const lista = [...reg.retornos]; let count = 0; for (const linha of linhas) { const alvo = linha.anilha.trim(); const pombo = pombos.find(p => p.anilha.trim() === alvo || p.anilha.replace(/\D/g, "") === alvo.replace(/\D/g, "") || p.anilha.includes(alvo) || alvo.includes(p.anilha)); const id = pombo ? String(pombo.id) : `anilha:${alvo}`; if (lista.some(r => r.pomboId === id && r.hora === linha.hora)) continue; const obsMeta = [pombo ? "" : `Anilha/Chip: ${linha.anilha}`, linha.socio ? `Sócio: ${linha.socio}${linha.idSocio ? ` (#${linha.idSocio})` : ""}` : "", linha.concurso ? `Concurso: ${linha.concurso}` : ""].filter(Boolean).join(" | "); lista.push({ pomboId: id, hora: linha.hora, velocidade: calcVel(prova.km, normalizarHora(reg.horaSoltura), linha.hora), colocacao: 0, obs: obsMeta }); count++; } setReg({ ...reg, retornos: ordenar(lista) }); setImportTxt(""); setMessage(`✅ ${count} registro(s) importado(s)!`); }
  function salvarHistorico() { if (!reg || !prova) return; const anteriores = readLocal<Resultado[]>(HIST_KEY, []); const novos = reg.retornos.map(r => ({ id: crypto.randomUUID(), prova: `${prova.cidade}/${prova.estado} — #${prova.num}`, data: prova.dataSolta, distancia: prova.km, pomboId: r.pomboId, colocacao: r.colocacao, velocidade: r.velocidade, hora: r.hora, observacoes: r.obs ?? "" })); localStorage.setItem(HIST_KEY, JSON.stringify([...anteriores, ...novos])); setReg(null); setTela("hub"); setMessage(`${novos.length} resultado(s) salvos no histórico.`); }

  if (tela === "selecionar") return <Shell><Back onClick={() => setTela("hub")} /><h1 style={{ ...T.h1, marginBottom: 16 }}>📅 Selecionar Prova</h1>{CALENDARIO_2026.map(p => { const c = classificarProva(p.km); return <button key={p.num} onClick={() => iniciar(p)} style={{ width: "100%", textAlign: "left", padding: 14, marginBottom: 7, borderRadius: 11, cursor: "pointer", color: T.white, background: T.bgCard, border: `1px solid ${c.cor}55`, borderLeft: `4px solid ${c.cor}` }}><b>#{p.num} {p.cidade} — {p.estado}</b><span style={{ float: "right", color: T.dim }}>›</span><div style={{ ...T.small, marginTop: 4 }}>{c.emoji} {c.tipo} • {p.km}km • {p.dataSolta}</div></button>; })}</Shell>;
  if (tela === "ativo" && reg && prova) return <Shell><TelaAtiva reg={reg} setReg={setReg} prova={prova} pombos={ativos} horaAtual={horaAtual} novo={novo} setNovo={setNovo} addRetorno={addRetorno} showImport={showImport} setShowImport={setShowImport} importTxt={importTxt} setImportTxt={setImportTxt} importar={importar} message={message} onBack={() => setTela("hub")} onEnd={() => { setReg({ ...reg, encerrada: true }); setTela("encerrada"); }} /></Shell>;
  if (tela === "encerrada" && reg && prova) return <Shell><TelaEncerrada reg={reg} prova={prova} pombos={ativos} onSave={salvarHistorico} onEdit={() => setTela("ativo")} onDiscard={() => { setReg(null); setTela("hub"); }} /></Shell>;

  return <Shell><div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}><div><h1 style={T.h1}>🔴 Dia da Prova</h1><p style={{ ...T.small, marginTop: 4 }}>Controle em tempo real da competição</p></div><Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link></div>
    <div style={{ padding: 17, margin: "18px 0 13px", textAlign: "center", borderRadius: 14, background: "#ef444414", border: "2px solid #ef444466" }}><div style={{ fontSize: 48, lineHeight: 1, fontWeight: 900, color: T.red, fontVariantNumeric: "tabular-nums" }}>{agoraHMSFrom(horaAtual)}</div><div style={{ ...T.small, marginTop: 7 }}>{horaAtual.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div></div>
    {message && <div style={{ ...T.card, color: T.green }}>{message}</div>}
    {provaHoje && <RaceNotice prova={provaHoje} onClick={() => iniciar(provaHoje)} />}
    {reg && prova && <div style={{ ...T.card, borderColor: reg.encerrada ? T.green : T.orange }}><div style={{ color: reg.encerrada ? T.green : T.orange, fontSize: 11 }}>{reg.encerrada ? "✅ PROVA ENCERRADA" : "⚠️ PROVA EM ANDAMENTO"}</div><b>{prova.cidade} — {prova.estado}</b><div style={T.small}>{reg.retornos.length} retorno(s)</div><button onClick={() => setTela(reg.encerrada ? "encerrada" : "ativo")} style={{ ...T.btn, marginTop: 10 }}>{reg.encerrada ? "Ver resultado" : "Continuar registrando →"}</button></div>}
    {!provaHoje && proxima && <div style={T.card}><div style={T.small}>Próxima prova</div><b>{proxima.cidade} — {proxima.estado}</b><div style={T.small}>{proxima.dataSolta} • {proxima.km}km • {diasParaProva(proxima.dataSolta)} dias</div><button onClick={() => setTela("selecionar")} style={{ ...T.btnGhost, width: "100%", marginTop: 10 }}>Selecionar prova manualmente</button></div>}
    <Checklist checks={checks} toggle={toggle} />
  </Shell>;
}

function TelaAtiva({ reg, setReg, prova, pombos, horaAtual, novo, setNovo, addRetorno, showImport, setShowImport, importTxt, setImportTxt, importar, message, onBack, onEnd }: { reg: Registro; setReg: (r: Registro) => void; prova: Prova; pombos: Pombo[]; horaAtual: Date; novo: { pomboId: string; hora: string; obs: string }; setNovo: (v: { pomboId: string; hora: string; obs: string }) => void; addRetorno: () => void; showImport: boolean; setShowImport: (v: boolean) => void; importTxt: string; setImportTxt: (v: string) => void; importar: () => void; message: string; onBack: () => void; onEnd: () => void }) {
  const c = classificarProva(prova.km); const preview = reg.horaSoltura ? calcVel(prova.km, normalizarHora(reg.horaSoltura), normalizarHora(novo.hora)) : 0; const classe = classVel(preview); const melhor = Math.max(0, ...reg.retornos.map(r => r.velocidade));
  return <><div style={{ padding: 16, marginBottom: 12, borderRadius: 14, background: "linear-gradient(135deg,#7f1d1d,#1a0505)", border: `2px solid ${T.red}` }}><small style={{ color: T.red }}>🔴 MODO DIA DA PROVA ATIVO</small><div style={{ display: "flex", justifyContent: "space-between" }}><div><h2>{prova.cidade} — {prova.estado}</h2><div style={T.small}>{c.emoji} {c.tipo} • {prova.km}km</div></div><b style={{ color: T.red, fontSize: 27 }}>{agoraHMSFrom(horaAtual)}</b></div></div>
    <section style={T.card}><Title>🚀 Hora de Soltura (HH:MM:SS)</Title><div style={{ display: "flex", gap: 7 }}><input value={reg.horaSoltura} placeholder="HH:MM:SS" onChange={e => setReg({ ...reg, horaSoltura: e.target.value })} style={{ ...T.input, textAlign: "center", color: T.gold, fontFamily: "monospace", fontSize: 19 }} /><button onClick={() => setReg({ ...reg, horaSoltura: agoraHMS() })} style={T.btnSm}>⏱️ Agora</button></div></section>
    <section style={T.card}><Title>🌤️ Condições</Title><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{CLIMAS.map(v => <Chip key={v} active={reg.clima === v} color={T.gold} onClick={() => setReg({ ...reg, clima: v })}>{v}</Chip>)}</div><div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 9 }}>{VENTOS.map(v => <Chip key={v} active={reg.vento === v} color={T.blue} onClick={() => setReg({ ...reg, vento: v })}>{v}</Chip>)}</div><div className="condition-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}><label style={T.label}>🌬️ Velocidade do vento: {reg.velocidadeVento} km/h<input type="range" min={0} max={80} value={reg.velocidadeVento} onChange={e => setReg({ ...reg, velocidadeVento: +e.target.value })} style={{ width: "100%", accentColor: T.blue, marginTop: 8 }} /></label><label style={T.label}>🌡️ Temperatura: {reg.temperatura}°C<input type="range" min={0} max={45} value={reg.temperatura} onChange={e => setReg({ ...reg, temperatura: +e.target.value })} style={{ width: "100%", accentColor: T.gold, marginTop: 8 }} /></label></div></section>
    <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 12 }}><Mini label="Chegados" value={reg.retornos.length} color={T.green} /><Mini label="Melhor m/min" value={melhor.toLocaleString("pt-BR")} color={T.gold} /><Mini label="Faltam" value={Math.max(0, pombos.length - reg.retornos.length)} color={T.orange} /></div>
    <section style={T.card}><Title>🐦 Registrar Chegada</Title><div className="arrival-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><select value={novo.pomboId} onChange={e => setNovo({ ...novo, pomboId: e.target.value })} style={T.input}><option value="">Selecionar pombo...</option>{pombos.filter(p => !reg.retornos.some(r => r.pomboId === String(p.id))).map(p => <option key={p.id} value={p.id}>{p.nome || "Sem nome"} — {p.anilha}</option>)}</select><div style={{ display: "flex", gap: 5 }}><input value={novo.hora} onChange={e => setNovo({ ...novo, hora: e.target.value })} style={{ ...T.input, color: T.green, fontFamily: "monospace" }} /><button onClick={() => setNovo({ ...novo, hora: agoraHMS() })} style={T.btnSm}>⏱️</button></div></div>{preview > 0 && <div style={{ color: classe[1], padding: 9, marginTop: 8, background: `${classe[1]}12`, borderRadius: 8 }}><b>{classe[0]}</b><strong style={{ float: "right" }}>{preview.toLocaleString("pt-BR")} m/min</strong></div>}<input placeholder="Observação (opcional)" value={novo.obs} onChange={e => setNovo({ ...novo, obs: e.target.value })} style={{ ...T.input, margin: "8px 0" }} /><button disabled={!novo.pomboId || !reg.horaSoltura} onClick={addRetorno} style={{ ...T.btn, opacity: !novo.pomboId || !reg.horaSoltura ? .4 : 1 }}>✅ Registrar Chegada</button><button onClick={() => setShowImport(!showImport)} style={{ ...T.btnGhost, width: "100%", color: T.blue, marginTop: 8 }}>📥 Importar Constatação Remota / ETS</button>{showImport && <div style={{ padding: 12, marginTop: 9, borderRadius: 10, background: "#3b82f612", border: `1px solid ${T.blue}55` }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}><p style={{ ...T.small, margin: 0 }}>Cole o texto ou carregue o arquivo (.ini, .txt, .csv, .log):</p><label style={{ ...T.btnGhost, padding: "5px 10px", fontSize: 11, cursor: "pointer", display: "inline-block" }}>📂 Abrir Arquivo ETS<input type="file" accept=".ini,.txt,.csv,.log,.json" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setImportTxt(String(ev.target?.result || "")); r.readAsText(f); } }} /></label></div><textarea rows={6} value={importTxt} onChange={e => setImportTxt(e.target.value)} placeholder={"[PIGEON_MASTER_RACE_CLOCK]\nBand1=008488920|11:27:24|Normal\n-- ou --\n0084701/20 - 13:07:03"} style={{ ...T.input, height: 130, fontFamily: "monospace" }} /><button onClick={importar} style={{ ...T.btn, marginTop: 8 }}>📥 Importar ({parsearConstatacao(importTxt).length} encontrados)</button>{message && <p style={{ color: message.startsWith("✅") ? T.green : T.red, marginTop: 6 }}>{message}</p>}</div>}</section>
    {reg.retornos.length > 0 && <Retornos reg={reg} setReg={setReg} pombos={pombos} />}
    <section style={T.card}><Title>📝 Observações</Title><textarea value={reg.obs} onChange={e => setReg({ ...reg, obs: e.target.value })} style={{ ...T.input, height: 75 }} /></section><div style={{ display: "flex", gap: 8 }}><button onClick={onBack} style={{ ...T.btnGhost, flex: 1 }}>← Voltar</button><button onClick={onEnd} style={{ ...T.btn, flex: 2, background: T.green, borderColor: T.green }}>🏁 Encerrar Prova</button></div>
  </>;
}

function TelaEncerrada({ reg, prova, pombos, onSave, onEdit, onDiscard }: { reg: Registro; prova: Prova; pombos: Pombo[]; onSave: () => void; onEdit: () => void; onDiscard: () => void }) { const c = classificarProva(prova.km); const media = reg.retornos.length ? Math.round(reg.retornos.reduce((s, r) => s + r.velocidade, 0) / reg.retornos.length) : 0; return <><div style={{ padding: 20, textAlign: "center", borderRadius: 14, background: "linear-gradient(135deg,#14532d,#052e16)", border: `2px solid ${T.green}` }}><div style={{ fontSize: 44 }}>🏆</div><small style={{ color: T.green }}>PROVA ENCERRADA</small><h1>{prova.cidade} — {prova.estado}</h1><div style={T.small}>{c.emoji} {c.tipo} • {prova.km}km</div></div><div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, margin: "12px 0" }}><Mini label="🐦 Chegados" value={`${reg.retornos.length} de ${pombos.length}`} color={T.green} /><Mini label="⚡ Velocidade média" value={`${media} m/min`} color={T.gold} /><Mini label="🚀 Soltura" value={reg.horaSoltura || "—"} color={T.blue} /><Mini label="🌬️ Vento" value={`${reg.vento} • ${reg.velocidadeVento}km/h`} color={T.white} /></div>{reg.retornos.length > 0 && <Retornos reg={reg} setReg={() => {}} pombos={pombos} readonly />}<button onClick={onSave} style={{ ...T.btn, marginBottom: 8 }}>💾 Salvar no Histórico de Provas</button><button onClick={onEdit} style={{ ...T.btnGhost, width: "100%", marginBottom: 8 }}>← Voltar para editar</button><button onClick={onDiscard} style={{ ...T.btnDanger, width: "100%" }}>🗑️ Descartar resultado</button></>; }

function Retornos({ reg, setReg, pombos, readonly = false }: { reg: Registro; setReg: (r: Registro) => void; pombos: Pombo[]; readonly?: boolean }) { return <section style={T.card}><Title>🏆 Pombos Chegados ({reg.retornos.length})</Title>{reg.retornos.map((r, i) => { const p = pombos.find(x => String(x.id) === r.pomboId); const classe = classVel(r.velocidade); return <div key={`${r.pomboId}-${r.hora}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}><b style={{ fontSize: 21 }}>{["🥇", "🥈", "🥉"][i] ?? `${i + 1}º`}</b><div style={{ flex: 1 }}><b style={{ color: p ? T.white : "#FBBF24" }}>{p?.nome || r.obs || "Anilha não cadastrada"}</b><div style={{ ...T.small, fontFamily: "monospace" }}>{p?.anilha} • {r.hora} • voo {tempoVoo(normalizarHora(reg.horaSoltura), r.hora)}</div><div style={{ color: classe[1], fontSize: 12, fontWeight: 800 }}>⚡ {r.velocidade.toLocaleString("pt-BR")} m/min — {classe[0]}</div></div>{!readonly && <button onClick={() => { const next = reg.retornos.filter((_, index) => index !== i).map((x, index) => ({ ...x, colocacao: index + 1 })); setReg({ ...reg, retornos: next }); }} style={T.btnDanger}>✕</button>}</div>; })}</section>; }
function Checklist({ checks, toggle }: { checks: string[]; toggle: (id: string) => void }) { return <section style={T.card}><Title>✅ Checklist Pré-Prova <span style={{ float: "right" }}>{checks.length}/{CHECKLIST.length}</span></Title><div style={{ height: 6, background: "#ffffff14", borderRadius: 4, marginBottom: 10 }}><div style={{ height: "100%", width: `${checks.length / CHECKLIST.length * 100}%`, background: checks.length === CHECKLIST.length ? T.green : T.gold }} /></div>{CHECKLIST.map(([id, emoji, text]) => { const active = checks.includes(id); return <button key={id} onClick={() => toggle(id)} style={{ width: "100%", display: "flex", gap: 9, textAlign: "left", padding: 9, marginBottom: 4, borderRadius: 8, cursor: "pointer", color: active ? T.green : T.dim, background: active ? "#4ade8012" : "#ffffff05", border: `1px solid ${active ? T.green : T.border}` }}><span>{active ? "✅" : emoji}</span><span>{text}</span></button>; })}</section>; }
function RaceNotice({ prova, onClick }: { prova: Prova; onClick: () => void }) { const c = classificarProva(prova.km); return <div style={{ ...T.card, border: `2px solid ${T.gold}`, background: "#eab30812" }}><small style={{ color: T.gold }}>🏁 PROVA HOJE!</small><h2>{prova.cidade} — {prova.estado}</h2><div style={T.small}>{c.emoji} {c.tipo} • {prova.km}km</div><button onClick={onClick} style={{ ...T.btn, marginTop: 10 }}>🚀 Iniciar Modo Dia da Prova</button></div>; }
function Shell({ children }: { children: React.ReactNode }) { return <main style={{ minHeight: "100vh", padding: "18px 12px 50px", background: T.bg, color: T.white }}><div style={{ maxWidth: 760, margin: "0 auto" }}>{children}</div><style jsx global>{`button,input,select,textarea{font-family:inherit}select option{background:${T.bgInput}}@media(max-width:560px){.arrival-grid,.condition-grid{grid-template-columns:1fr!important}.stats-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style></main>; }
function Back({ onClick }: { onClick: () => void }) { return <button onClick={onClick} style={{ ...T.btnGhost, marginBottom: 16 }}>← Voltar</button>; }
function Title({ children }: { children: React.ReactNode }) { return <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 11 }}>{children}</div>; }
function Chip({ children, active, color, onClick }: { children: React.ReactNode; active: boolean; color: string; onClick: () => void }) { return <button onClick={onClick} style={{ padding: "6px 9px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 700, color: active ? T.bg : T.dim, background: active ? color : T.bgInput, border: `1px solid ${active ? color : T.border}` }}>{children}</button>; }
function Mini({ label, value, color }: { label: string; value: string | number; color: string }) { return <div style={{ ...T.card, margin: 0, padding: 12, textAlign: "center" }}><div style={T.small}>{label}</div><div style={{ color, fontSize: 20, fontWeight: 900, marginTop: 4 }}>{value}</div></div>; }
function agoraHMSFrom(d: Date) { return [d.getHours(), d.getMinutes(), d.getSeconds()].map(v => String(v).padStart(2, "0")).join(":"); }
