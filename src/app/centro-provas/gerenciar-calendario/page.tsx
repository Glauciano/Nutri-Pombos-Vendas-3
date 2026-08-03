"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { atualizarCalendarioGlobal, classificarProva, diaDaSemana, diasParaProva, loadCalendario, resetCalendario, saveCalendario, uid, type ProvaCalendario } from "../data/calendario";
import { T } from "../theme";

type Tela = "lista" | "form" | "detalhe";
const VAZIO: Partial<ProvaCalendario> = { cidade: "", estado: "SP", categoria: "Campeonato Adultos", km: 300, dataEmbarque: "", diaEmbarque: "Sábado", dataSolta: "", diaSolta: "Domingo", adiada: false, cancelada: false, obs: "" };
const ESTADOS = ["SP","MG","GO","DF","RJ","PR","SC","RS","BA","MT","MS","ES","RO","TO","PA","AM"];
function fmt(d: string) { if (!d) return "—"; const [a,m,dd] = d.split("-"); return `${dd}/${m}/${a}`; }

export default function GerenciarCalendario() {
  const [provas, setProvas] = useState<ProvaCalendario[]>([]);
  const [ready, setReady] = useState(false);
  const [tela, setTela] = useState<Tela>("lista");
  const [editId, setEditId] = useState<string | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ProvaCalendario>>(VAZIO);
  const [msg, setMsg] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => { const stored = loadCalendario(); setProvas(stored); atualizarCalendarioGlobal(stored); setReady(true); }, []);
  useEffect(() => { if (ready) { saveCalendario(provas); atualizarCalendarioGlobal(provas); } }, [provas, ready]);
  const flash = (value: string) => { setMsg(value); window.setTimeout(() => setMsg(""), 3000); };
  const abrirNovo = () => { setForm({ ...VAZIO, num: provas.length ? Math.max(...provas.map(p => p.num)) + 1 : 1 }); setEditId(null); setTela("form"); };
  const abrirEdit = (p: ProvaCalendario) => { setForm({ ...p }); setEditId(p.id); setTela("form"); };
  const salvar = () => {
    if (!form.cidade?.trim() || !form.dataSolta || !form.km || form.km <= 0) { window.alert("Preencha cidade, data de solta e distância."); return; }
    const values = { ...form, diaSolta: diaDaSemana(form.dataSolta), diaEmbarque: form.dataEmbarque ? diaDaSemana(form.dataEmbarque) : diaDaSemana(form.dataSolta) };
    if (editId) setProvas(prev => prev.map(p => p.id === editId ? { ...p, ...values } as ProvaCalendario : p));
    else setProvas(prev => [...prev, { ...VAZIO, ...values, id: uid(), num: form.num || prev.length + 1, cidade: form.cidade!, estado: form.estado || "SP", categoria: form.categoria || "Campeonato Adultos", km: form.km!, dataEmbarque: form.dataEmbarque || form.dataSolta!, dataSolta: form.dataSolta!, adiada: false, cancelada: false, obs: form.obs || "" } as ProvaCalendario].sort((a,b) => a.dataSolta.localeCompare(b.dataSolta)));
    setTela("lista"); flash(editId ? "✅ Prova atualizada com sucesso!" : "✅ Prova adicionada com sucesso!");
  };
  const excluir = (id: string) => { if (!window.confirm("Excluir esta prova do calendário?")) return; setProvas(prev => prev.filter(p => p.id !== id).map((p,i) => ({ ...p, num:i+1 }))); setTela("lista"); flash("🗑️ Prova removida."); };
  const status = (id: string, tipo: "adiada" | "cancelada") => { setProvas(prev => prev.map(p => p.id === id ? { ...p, adiada: tipo === "adiada" ? !p.adiada : false, cancelada: tipo === "cancelada" ? !p.cancelada : false } : p)); flash("Status atualizado."); };
  const selecionada = provas.find(p => p.id === selId);

  if (!ready) return <Shell><div style={{...T.card,textAlign:"center"}}>Carregando calendário...</div></Shell>;
  if (tela === "form") return <Shell><Form form={form} setForm={setForm} edit={!!editId} onCancel={() => setTela("lista")} onSave={salvar}/></Shell>;
  if (tela === "detalhe" && selecionada) return <Shell><Detalhe prova={selecionada} onBack={() => setTela("lista")} onEdit={() => abrirEdit(selecionada)} onStatus={tipo => status(selecionada.id,tipo)} onDelete={() => excluir(selecionada.id)}/></Shell>;

  const ordenadas = [...provas].sort((a,b) => a.dataSolta.localeCompare(b.dataSolta));
  return <Shell>
    <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"start",marginBottom:20}}><div><Link href="/centro-provas" style={{...T.small,textDecoration:"none"}}>← Centro de Provas</Link><h1 style={{...T.h1,marginTop:9}}>📅 Calendário de Provas</h1><p style={{...T.small,marginTop:4}}>{provas.length} provas • Totalmente editável</p></div><button onClick={abrirNovo} style={T.btnSm}>+ Nova prova</button></div>
    {msg && <div style={{padding:11,marginBottom:12,borderRadius:9,color:T.green,background:"#4ade8014",border:`1px solid ${T.green}55`}}>{msg}</div>}
    <div className="stats" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}><Stat label="Total" value={provas.length} color={T.gold}/><Stat label="Adiadas" value={provas.filter(p=>p.adiada).length} color="#FBBF24"/><Stat label="Canceladas" value={provas.filter(p=>p.cancelada).length} color={T.red}/></div>
    {ordenadas.map(p => <ProvaRow key={p.id} prova={p} onEdit={() => abrirEdit(p)} onView={() => {setSelId(p.id);setTela("detalhe");}} onDelete={() => excluir(p.id)}/>) }
    {!provas.length && <div style={{textAlign:"center",padding:40,color:T.dim}}>📅<h3>Nenhuma prova cadastrada</h3><p style={T.small}>Clique em “+ Nova prova” para adicionar.</p></div>}
    <section style={{...T.card,marginTop:16}}><b style={{color:T.dim}}>⚙️ Gerenciamento</b>{!confirmReset ? <button onClick={()=>setConfirmReset(true)} style={{...T.btnGhost,width:"100%",marginTop:10}}>🔄 Restaurar calendário original (2026)</button> : <div style={{padding:13,marginTop:10,borderRadius:9,background:"#ef444414",border:`1px solid ${T.red}55`}}><b style={{color:T.red}}>Todas as edições serão perdidas.</b><div style={{display:"flex",gap:8,marginTop:10}}><button onClick={()=>setConfirmReset(false)} style={{...T.btnGhost,flex:1}}>Cancelar</button><button onClick={()=>{setProvas(resetCalendario());setConfirmReset(false);flash("✅ Calendário restaurado.");}} style={{...T.btnDanger,flex:2}}>🔄 Restaurar</button></div></div>}</section>
  </Shell>;
}

function Form({form,setForm,edit,onCancel,onSave}:{form:Partial<ProvaCalendario>;setForm:(v:Partial<ProvaCalendario>)=>void;edit:boolean;onCancel:()=>void;onSave:()=>void}) {
  const change=(v:Partial<ProvaCalendario>)=>setForm({...form,...v}); const classe=classificarProva(form.km||0);
  return <><button onClick={onCancel} style={{...T.btnGhost,marginBottom:16}}>← Cancelar</button><h1 style={T.h1}>{edit?"✏️ Editar Prova":"➕ Nova Prova"}</h1><p style={{...T.small,margin:"4px 0 16px"}}>Preencha os dados da prova</p><section style={T.card}>
    <div className="form-grid" style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}><Field label="Nº da Prova"><input type="number" value={form.num||""} onChange={e=>change({num:+e.target.value})} style={T.input}/></Field><Field label="Categoria"><input value={form.categoria||""} onChange={e=>change({categoria:e.target.value})} style={T.input}/></Field></div>
    <div className="form-grid" style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}><Field label="Cidade *"><input value={form.cidade||""} onChange={e=>change({cidade:e.target.value})} style={T.input}/></Field><Field label="Estado"><select value={form.estado||"SP"} onChange={e=>change({estado:e.target.value})} style={T.input}>{ESTADOS.map(v=><option key={v}>{v}</option>)}</select></Field></div>
    <Field label="Distância (km) *"><input type="number" value={form.km||""} onChange={e=>change({km:+e.target.value})} style={{...T.input,textAlign:"center",fontSize:21,fontWeight:900}}/>{(form.km||0)>0&&<div style={{color:classe.cor,marginTop:5,fontSize:12}}>{classe.emoji} {classe.tipo}</div>}</Field>
    <Field label="📦 Data de Embarque"><input type="date" value={form.dataEmbarque||""} onChange={e=>change({dataEmbarque:e.target.value,diaEmbarque:diaDaSemana(e.target.value)})} style={T.input}/><small style={{color:T.gold}}>{form.diaEmbarque}</small></Field>
    <Field label="🏁 Data de Solta *"><input type="date" value={form.dataSolta||""} onChange={e=>change({dataSolta:e.target.value,diaSolta:diaDaSemana(e.target.value)})} style={T.input}/><small style={{color:T.gold}}>{form.diaSolta}</small></Field>
    <Field label="📝 Observações"><textarea rows={3} value={form.obs||""} onChange={e=>change({obs:e.target.value})} style={{...T.input,height:80}}/></Field><div style={{display:"flex",gap:8}}><button onClick={onCancel} style={{...T.btnGhost,flex:1}}>Cancelar</button><button onClick={onSave} style={{...T.btn,flex:2}}>💾 Salvar Prova</button></div>
  </section></>;
}

function Detalhe({prova,onBack,onEdit,onStatus,onDelete}:{prova:ProvaCalendario;onBack:()=>void;onEdit:()=>void;onStatus:(v:"adiada"|"cancelada")=>void;onDelete:()=>void}) { const c=classificarProva(prova.km);const dias=diasParaProva(prova.dataSolta);return <><button onClick={onBack} style={{...T.btnGhost,marginBottom:16}}>← Voltar</button><section style={{...T.card,border:`2px solid ${c.cor}66`,background:`${c.cor}0d`}}><small style={{color:c.cor}}>PROVA #{prova.num} — {prova.categoria}</small><h1 style={{...T.h1,marginTop:5}}>{prova.cidade} — {prova.estado}</h1><p style={T.small}>{c.emoji} {c.tipo} • {prova.km}km</p><b style={{float:"right",color:dias<0?T.green:c.cor}}>{dias<0?"Realizada":prova.adiada?"ADIADA":prova.cancelada?"CANCELADA":dias===0?"HOJE!":`${dias} dias`}</b></section><div className="dates" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><DateCard label="📦 Embarque" date={prova.dataEmbarque} day={prova.diaEmbarque}/><DateCard label="🏁 Solta" date={prova.dataSolta} day={prova.diaSolta}/></div>{prova.obs&&<section style={T.card}>📝 {prova.obs}</section>}<button onClick={onEdit} style={{...T.btn,marginBottom:8}}>✏️ Editar dados desta prova</button><div className="dates" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><button onClick={()=>onStatus("adiada")} style={{...T.btnGhost,color:"#FBBF24"}}>{prova.adiada?"Desmarcar adiamento":"⚠️ Marcar ADIADA"}</button><button onClick={()=>onStatus("cancelada")} style={{...T.btnGhost,color:T.red}}>{prova.cancelada?"Desmarcar cancelamento":"❌ Marcar CANCELADA"}</button></div><button onClick={onDelete} style={{...T.btnDanger,width:"100%",marginTop:8}}>🗑️ Excluir esta prova</button></>}
function ProvaRow({prova,onEdit,onView,onDelete}:{prova:ProvaCalendario;onEdit:()=>void;onView:()=>void;onDelete:()=>void}) { const dias=diasParaProva(prova.dataSolta),passou=dias<0,c=classificarProva(prova.km),cor=prova.cancelada?T.red:prova.adiada?"#FBBF24":passou?T.green:c.cor;return <div style={{padding:14,marginBottom:8,borderRadius:"0 11px 11px 0",background:T.bgCard,border:`1px solid ${cor}44`,borderLeft:`4px solid ${cor}`,opacity:prova.cancelada?.65:1}}><div style={{display:"flex",gap:9,justifyContent:"space-between"}}><div><b>#{prova.num} {prova.cidade} — {prova.estado}</b>{prova.adiada&&<Tag color="#FBBF24">ADIADA</Tag>}{prova.cancelada&&<Tag color={T.red}>CANCELADA</Tag>}<div style={{...T.small,marginTop:5,color:c.cor}}>{c.emoji} {c.tipo} • {prova.km}km <span style={{color:T.dim}}>• 🏁 {fmt(prova.dataSolta)} {!passou&&!prova.adiada&&!prova.cancelada?`• ${dias}d`:""}</span></div>{prova.obs&&<div style={{...T.small,color:"#FBBF24"}}>📝 {prova.obs}</div>}</div><div style={{display:"flex",gap:5}}><button onClick={onEdit} style={T.btnGhost}>✏️</button><button onClick={onView} style={T.btnGhost}>👁️</button><button onClick={onDelete} style={T.btnDanger}>🗑️</button></div></div></div>}
function Shell({children}:{children:React.ReactNode}){return <main style={{minHeight:"100vh",background:T.bg,color:T.white,padding:"18px 12px 50px"}}><div style={{maxWidth:760,margin:"0 auto"}}>{children}</div><style jsx global>{`button,input,select,textarea{font-family:inherit}select option{background:${T.bgInput}}@media(max-width:540px){.form-grid,.dates{grid-template-columns:1fr!important}.stats{grid-template-columns:repeat(3,1fr)!important}}`}</style></main>}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label style={{display:"block",marginBottom:12}}><span style={{...T.label,display:"block",marginBottom:5}}>{label}</span>{children}</label>}
function Stat({label,value,color}:{label:string;value:number;color:string}){return <div style={{...T.card,margin:0,textAlign:"center",padding:11}}><div style={T.small}>{label}</div><b style={{display:"block",fontSize:24,color}}>{value}</b></div>}
function DateCard({label,date,day}:{label:string;date:string;day:string}){return <section style={{...T.card,marginBottom:8}}><div style={T.small}>{label}</div><b>{fmt(date)}</b><div style={{color:T.gold,fontSize:12}}>{day}</div></section>}
function Tag({children,color}:{children:React.ReactNode;color:string}){return <span style={{marginLeft:7,padding:"2px 7px",borderRadius:12,fontSize:9,color,background:`${color}22`}}>{children}</span>}
