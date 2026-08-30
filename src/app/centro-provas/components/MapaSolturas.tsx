"use client";

import { useEffect, useState } from "react";
import { classificarProva, diasParaProva, loadCalendario, type ProvaCalendario } from "../data/calendario";
import { Coords, geocodeCidade, getPombal } from "../lib/apis-gratis";
import { loadConfig } from "../config";
import { T } from "../theme";

const MAPA_KEY = "nutripombos-mapa-v3";
const DIRECOES = ["Norte", "Nordeste", "Leste", "Sudeste", "Sul", "Sudoeste", "Oeste", "Noroeste"];
const DIR_EMOJI: Record<string, string> = { Norte: "⬆️", Nordeste: "↗️", Leste: "➡️", Sudeste: "↘️", Sul: "⬇️", Sudoeste: "↙️", Oeste: "⬅️", Noroeste: "↖️" };
const POMBAL = { x: 310, y: 470 };
const POSICOES = [
  { x: 215, y: 420 }, { x: 202, y: 405 }, { x: 186, y: 382 }, { x: 172, y: 358 }, { x: 188, y: 320 },
  { x: 196, y: 280 }, { x: 190, y: 242 }, { x: 175, y: 205 }, { x: 178, y: 165 }, { x: 182, y: 118 },
];

type Local = { id: string; nome: string; estado: string; distancia: number; tempoMedio: number; direcao: string; provaId: string };
function idProva(p: ProvaCalendario) { return p.id || String(p.num); }
function novoLocal(p: ProvaCalendario): Local { return { id: crypto.randomUUID(), nome: p.cidade, estado: p.estado, distancia: p.km, tempoMedio: 0, direcao: "Norte", provaId: idProva(p) }; }
function fmt(data: string) { const [a, m, d] = data.split("-"); return `${d}/${m}/${a}`; }
function velocidade(local?: Local) { return local?.tempoMedio ? (local.distancia / local.tempoMedio * 60).toFixed(1) : null; }

export default function MapaSolturas() {
  const [provas, setProvas] = useState<ProvaCalendario[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [editando, setEditando] = useState<Local | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const calendario = loadCalendario();
    let salvos: Local[] = [];
    try { salvos = JSON.parse(localStorage.getItem(MAPA_KEY) || "[]"); } catch { salvos = []; }
    const sincronizados = calendario.map((p) => salvos.find((l) => l.provaId === idProva(p)) || novoLocal(p));
    setProvas(calendario); setLocais(sincronizados); setReady(true);
    const sync = () => { const next = loadCalendario(); setProvas(next); setLocais((current) => next.map(p => current.find(l => l.provaId === idProva(p)) || novoLocal(p))); };
    window.addEventListener("nutripombos:calendario", sync);
    return () => window.removeEventListener("nutripombos:calendario", sync);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(MAPA_KEY, JSON.stringify(locais)); }, [locais, ready]);

  const hoje = new Date().toISOString().slice(0, 10);
  const proxima = provas.find(p => p.dataSolta >= hoje && !p.cancelada);
  const provaSel = provas.find(p => idProva(p) === selecionada);
  const localSel = provaSel ? locais.find(l => l.provaId === idProva(provaSel)) : undefined;

  if (editando) return <div><button onClick={() => setEditando(null)} style={{ ...T.btnGhost, marginBottom: 16 }}>← Voltar</button><h2 style={{ color: T.gold }}>✏️ Editar Dados da Soltura</h2><section style={T.card}>
    <div style={{ ...T.small, marginBottom: 12 }}>{editando.nome} — {editando.estado} • {editando.distancia}km</div>
    <label style={{ display: "block", marginBottom: 14 }}><span style={{ ...T.label, display: "block", marginBottom: 6 }}>⏱️ Tempo médio de retorno (minutos)</span><input type="number" min={0} value={editando.tempoMedio || ""} onChange={e => setEditando({ ...editando, tempoMedio: +e.target.value })} style={T.input} />{editando.tempoMedio > 0 && <div style={{ color: T.green, fontSize: 12, marginTop: 6 }}>⚡ Velocidade: {(editando.distancia / editando.tempoMedio * 60).toFixed(1)} km/h</div>}</label>
    <div style={{ ...T.label, marginBottom: 8 }}>🧭 Direção da soltura</div><div className="direction-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>{DIRECOES.map(d => <button key={d} onClick={() => setEditando({ ...editando, direcao: d })} style={{ padding: "10px 3px", borderRadius: 8, cursor: "pointer", fontSize: 10, color: editando.direcao === d ? T.bg : T.dim, background: editando.direcao === d ? T.gold : T.bgInput, border: `1px solid ${editando.direcao === d ? T.gold : T.border}` }}>{DIR_EMOJI[d]}<br />{d}</button>)}</div>
    <div style={{ display: "flex", gap: 8, marginTop: 15 }}><button onClick={() => setEditando(null)} style={{ ...T.btnGhost, flex: 1 }}>Cancelar</button><button onClick={() => { setLocais(v => v.map(l => l.id === editando.id ? editando : l)); setEditando(null); }} style={{ ...T.btn, flex: 2 }}>💾 Salvar</button></div>
  </section></div>;

  return <div><div style={{ marginBottom: 16 }}><h1 style={T.h1}>🗺️ Mapa de Solturas</h1><p style={{ ...T.small, marginTop: 4 }}>Calendário editável — toque nos pinos para detalhes</p></div>
    <section style={T.card}><Title>📏 Linha de Solturas</Title><div style={{ overflowX: "auto", minHeight: 115 }}><div style={{ minWidth: 650, height: 100, position: "relative", paddingTop: 24 }}><div style={{ position: "absolute", top: 37, left: 25, right: 25, height: 3, background: `linear-gradient(90deg,${T.gold},${T.orange},${T.red})`, opacity: .55 }} /><div style={{ position: "absolute", left: 0, top: 20, textAlign: "center" }}><div style={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", background: T.gold, border: `3px solid ${T.goldDark}` }}>🏠</div><small style={{ color: T.gold }}>Pombal</small></div>
      {provas.map((p, i) => { const c = classificarProva(p.km), passou = diasParaProva(p.dataSolta) < 0, ativo = selecionada === idProva(p), cor = passou ? T.green : c.cor, pct = (i + 1) / (provas.length + 1) * 100; return <button key={idProva(p)} onClick={() => setSelecionada(ativo ? null : idProva(p))} style={{ position: "absolute", left: `${pct}%`, top: 5, transform: "translateX(-50%)", background: "none", border: 0, cursor: "pointer", color: T.white, textAlign: "center" }}><div style={{ width: 3, height: ativo ? 26 : 20, background: cor, margin: "0 auto" }} /><div style={{ width: ativo ? 28 : 23, height: ativo ? 28 : 23, display: "grid", placeItems: "center", margin: "-2px auto 4px", borderRadius: "50%", color: T.bg, background: cor, border: ativo ? "2px solid white" : 0, boxShadow: p.num === proxima?.num ? `0 0 14px ${cor}` : "none", fontWeight: 900, fontSize: 9 }}>{passou ? "✓" : p.num}</div><small style={{ fontSize: 7 }}>{p.cidade.split(" ")[0]}<br /><b style={{ color: T.gold }}>{p.km}km</b></small></button>; })}
    </div></div><p style={{ ...T.small, marginBottom: 0 }}>💡 Verde = realizada • brilho = próxima prova</p></section>

    <section style={T.card}><Title>📍 Mapa Geográfico — Rota</Title><div style={{ borderRadius: 12, overflow: "hidden", background: "linear-gradient(#071524,#0c1e32)", border: `1px solid ${T.gold}44` }}><svg viewBox="0 0 400 520" style={{ width: "100%", display: "block" }}><defs><radialGradient id="map-gold"><stop offset="0" stopColor={T.gold} stopOpacity=".8"/><stop offset="1" stopColor={T.gold} stopOpacity="0"/></radialGradient><radialGradient id="map-blue"><stop offset="0" stopColor={T.blue} stopOpacity=".7"/><stop offset="1" stopColor={T.blue} stopOpacity="0"/></radialGradient></defs>
      <path d="M100 510L390 510 390 420Q350 400 310 395T240 400Q200 415 155 375 110 350 100 410Z" fill="#0d2210" stroke="#1a3a18"/><path d="M125 370Q155 300 175 290T225 225Q230 180 195 142T138 170Q125 230 142 325Z" fill="#102820" stroke="#183528"/><rect x="178" y="104" width="34" height="26" rx="4" fill="#200840" stroke="#4a1a80"/><text x="275" y="460" fill="#ffffff18" fontSize="11">SÃO PAULO</text><text x="160" y="340" fill="#ffffff18" fontSize="9">MINAS GERAIS</text><text x="135" y="210" fill="#ffffff18" fontSize="9">GOIÁS</text>
      <polyline points={`${POMBAL.x},${POMBAL.y} ${provas.slice(0,10).map((_,i)=>`${POSICOES[i].x},${POSICOES[i].y}`).join(" ")}`} fill="none" stroke={T.gold} strokeWidth="2.5" strokeDasharray="9 5" opacity=".5"/><circle cx={POMBAL.x} cy={POMBAL.y} r="20" fill="url(#map-gold)"/><circle cx={POMBAL.x} cy={POMBAL.y} r="12" fill={T.gold}/><text x={POMBAL.x} y={POMBAL.y+4} textAnchor="middle" fontSize="13">🏠</text><text x={POMBAL.x} y={POMBAL.y+28} textAnchor="middle" fill={T.gold} fontSize="8">SEU POMBAL</text>
      {provas.slice(0,10).map((p,i)=>{const pos=POSICOES[i],c=classificarProva(p.km),passou=diasParaProva(p.dataSolta)<0,ativo=selecionada===idProva(p),cor=passou?T.green:c.cor,r=ativo?14:p.num===proxima?.num?12:10;return <g key={idProva(p)} onClick={()=>setSelecionada(ativo?null:idProva(p))} style={{cursor:"pointer"}}>{p.num===proxima?.num&&<circle cx={pos.x} cy={pos.y} r="26" fill="url(#map-gold)"/>}{ativo&&<circle cx={pos.x} cy={pos.y} r="23" fill="url(#map-blue)"/>}<line x1={pos.x} y1={pos.y+r} x2={pos.x} y2={pos.y+r+14} stroke={cor} strokeWidth="3"/><circle cx={pos.x} cy={pos.y} r={r} fill={cor} stroke={ativo?"white":"#0006"} strokeWidth="2"/><text x={pos.x} y={pos.y+3} textAnchor="middle" fill={T.bg} fontSize="9" fontWeight="900">{passou?"✓":p.num}</text><text x={pos.x+r+5} y={pos.y-2} fill={ativo?"white":cor} fontSize="8" fontWeight="bold">{p.cidade}</text><text x={pos.x+r+5} y={pos.y+9} fill="#ffffff77" fontSize="7">{p.km}km — {p.estado}</text></g>})}
    </svg></div><div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 9 }}>{[[T.gold,"⚡ Velocidade"],[T.blue,"🏃 Meio Fundo"],[T.orange,"🦅 Fundo"],[T.green,"✓ Realizada"]].map(([cor,label])=><small key={label} style={{color:T.dim}}><i style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:cor,marginRight:4}}/>{label}</small>)}</div></section>

    {provaSel && <Painel prova={provaSel} local={localSel} onEdit={() => localSel && setEditando({...localSel})}/>} 
    <section style={T.card}><Title>📋 Todas as Cidades</Title>{provas.map(p=>{const c=classificarProva(p.km),local=locais.find(l=>l.provaId===idProva(p)),vel=velocidade(local),passou=diasParaProva(p.dataSolta)<0;return <div key={idProva(p)} onClick={()=>setSelecionada(selecionada===idProva(p)?null:idProva(p))} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer",opacity:passou?.65:1}}><span style={{width:30,height:30,display:"grid",placeItems:"center",borderRadius:"50%",color:c.cor,border:`2px solid ${c.cor}`,fontWeight:900,fontSize:10}}>{passou?"✓":p.num}</span><div style={{flex:1}}><b style={{fontSize:13}}>{p.cidade} — {p.estado}</b><div style={T.small}><span style={{color:c.cor}}>{c.emoji} {c.tipo}</span> • {p.km}km {local?.tempoMedio?`• ⏱️ ${local.tempoMedio}min`:""} {vel&&<span style={{color:T.green}}>• ⚡ {vel}km/h</span>}</div></div><button onClick={e=>{e.stopPropagation();if(local)setEditando({...local})}} style={T.btnGhost}>✏️</button></div>})}</section>
    <style jsx global>{`button,input{font-family:inherit}@media(max-width:520px){.direction-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
  </div>;
}

function Painel({prova,local,onEdit}:{prova:ProvaCalendario;local?:Local;onEdit:()=>void}){
  const c=classificarProva(prova.km),dias=diasParaProva(prova.dataSolta),vel=velocidade(local);
  // 🗺️ Mapa real (OpenStreetMap — gratuito, sem chave)
  const [coordsMapa,setCoordsMapa]=useState<Coords|null|false>(null);
  const [mapaAberto,setMapaAberto]=useState(false);
  const [carregandoMapa,setCarregandoMapa]=useState(false);
  const abrirMapaReal=async()=>{
    setMapaAberto(true);
    if(coordsMapa!==null) return;
    setCarregandoMapa(true);
    const co=await geocodeCidade(`${prova.cidade}`);
    setCoordsMapa(co||false);
    setCarregandoMapa(false);
  };
  return <section style={{...T.card,border:`2px solid ${c.cor}55`,background:`${c.cor}0d`}}><div style={{display:"flex",justifyContent:"space-between"}}><div><small style={{color:c.cor}}>#{prova.num} — {prova.categoria}</small><h2 style={{margin:"4px 0"}}>{prova.cidade} — {prova.estado}</h2><div style={T.small}>{c.emoji} {c.tipo} • {prova.km}km</div></div><b style={{color:dias<0?T.green:c.cor,fontSize:24}}>{dias<0?"✓":dias===0?"🏁":`${dias}d`}</b></div><div className="map-details" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,margin:"12px 0"}}>{[["📦 Embarque",`${prova.diaEmbarque} ${fmt(prova.dataEmbarque)}`],["🏁 Solta",`${prova.diaSolta} ${fmt(prova.dataSolta)}`],["⏱️ Tempo",local?.tempoMedio?`${local.tempoMedio} min`:"—"],["⚡ Velocidade",vel?`${vel} km/h`:"—"],["🧭 Direção",local?`${DIR_EMOJI[local.direcao]} ${local.direcao}`:"—"]].map(([l,v])=><div key={l} style={{padding:8,borderRadius:8,background:"#ffffff08"}}><div style={T.small}>{l}</div><b style={{color:T.gold,fontSize:12}}>{v}</b></div>)}</div>
  <div style={{display:"flex",gap:8}}>
    <button onClick={onEdit} style={{...T.btn,flex:1}}>✏️ Editar dados</button>
    <button onClick={abrirMapaReal} style={{...T.btn,flex:1,background:T.blue,borderColor:T.blue}}>🗺️ Mapa real</button>
  </div>
  {carregandoMapa&&<div style={{...T.small,textAlign:"center",marginTop:10}}>⏳ Localizando {prova.cidade} no mapa...</div>}
  {mapaAberto&&!carregandoMapa&&coordsMapa&&<div style={{marginTop:12}}>
    {(() => {
      const gKey = (loadConfig().mapaApiKey || "").trim();
      const pombal = getPombal();
      if (gKey) {
        return <div>
          <iframe title={`Satélite de ${prova.cidade}`} src={`https://www.google.com/maps/embed/v1/directions?key=${encodeURIComponent(gKey)}&origin=${coordsMapa.lat},${coordsMapa.lon}&destination=${pombal.lat},${pombal.lon}&language=pt-BR&region=br`} style={{width:"100%",height:320,border:0,borderRadius:12,marginTop:4}} loading="lazy" allowFullScreen />
          <div style={{...T.small,fontSize:11,marginTop:6,textAlign:"center"}}>🛰️ Satélite/rota Google (estrada — referência) • o voo real é linha reta até o pombal</div>
        </div>;
      }
      return <div>
        <iframe title={`Mapa de ${prova.cidade}`} src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordsMapa.lon-0.35},${coordsMapa.lat-0.25},${coordsMapa.lon+0.35},${coordsMapa.lat+0.25}&layer=mapnik&marker=${coordsMapa.lat},${coordsMapa.lon}`} style={{width:"100%",height:300,border:0,borderRadius:12,marginTop:4}} loading="lazy" />
        <a href={`https://www.openstreetmap.org/?mlat=${coordsMapa.lat}&mlon=${coordsMapa.lon}#map=11/${coordsMapa.lat}/${coordsMapa.lon}`} target="_blank" rel="noreferrer" style={{...T.small,color:T.blue,display:"block",textAlign:"center",marginTop:8}}>📍 Abrir no OpenStreetMap ↗</a>
        <div style={{...T.small,fontSize:10,marginTop:6,textAlign:"center",color:T.dim}}>💡 Quer satélite do Google aqui? Configure em Configuração → 🗺️ Mapa de Satélite</div>
      </div>;
    })()}
  </div>}
  {mapaAberto&&!carregandoMapa&&coordsMapa===false&&<div style={{...T.small,color:T.orange,marginTop:10}}>⚠️ Não foi possível localizar {prova.cidade} automaticamente. <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(prova.cidade+" "+prova.estado)}`} target="_blank" rel="noreferrer" style={{color:T.blue}}>Pesquisar manualmente ↗</a></div>}
  </section>}
function Title({children}:{children:React.ReactNode}){return <div style={{fontSize:13,fontWeight:800,color:T.gold,marginBottom:10}}>{children}</div>}
