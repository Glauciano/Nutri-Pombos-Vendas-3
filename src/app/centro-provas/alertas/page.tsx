"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { diasParaProva, loadCalendario, type ProvaCalendario } from "../data/calendario";
import { T } from "../theme";

type Tab="hoje"|"semana"|"preventivo";
type Pombo={id:number;status:string|null};
type Estoque={ingrediente?:string;kg?:number};
type Medicamento={produto:string;validade:string};
type RotinaItem={id:string;hora:string;emoji:string;titulo:string;desc:string};

const KEY_FEITOS="nutripombos-alertas-feitos-v1";
const KEY_ROTINA="nutripombos-alertas-rotina-v1";
const KEY_SEMANA="nutripombos-alertas-semana-v1";

const ROTINA_PADRAO:RotinaItem[]=[
  {id:"r0",hora:"06:00",emoji:"🌅",titulo:"Abrir o pombal",desc:"Iniciar a rotina e avaliar as condições climáticas."},
  {id:"r1",hora:"06:30",emoji:"🌾",titulo:"Alimentação matinal",desc:"Oferecer a ração prevista no protocolo."},
  {id:"r2",hora:"07:00",emoji:"💧",titulo:"Trocar a água",desc:"Água fresca e higienização dos bebedouros."},
  {id:"r3",hora:"08:00",emoji:"👁️",titulo:"Observar o plantel",desc:"Verificar fezes, apetite, comportamento e respiração."},
  {id:"r4",hora:"09:00",emoji:"🏋️",titulo:"Treino programado",desc:"Executar somente se clima e recuperação permitirem."},
  {id:"r5",hora:"12:00",emoji:"📋",titulo:"Revisar o protocolo",desc:"Confirmar alimentação e produtos já validados."},
  {id:"r6",hora:"16:00",emoji:"🌾",titulo:"Alimentação da tarde",desc:"Ajustar quantidade conforme consumo e condição."},
  {id:"r7",hora:"17:00",emoji:"🚿",titulo:"Banho opcional",desc:"Disponibilizar água limpa para banho em condições adequadas."},
  {id:"r8",hora:"18:00",emoji:"🔒",titulo:"Fechar o pombal",desc:"Conferir o retorno de todas as aves e proteger o ambiente."},
  {id:"r9",hora:"18:30",emoji:"📝",titulo:"Registrar o dia",desc:"Anotar treino, alimentação, saúde e observações."},
];

const SEMANA_PADRAO=[
  {id:"s0",emoji:"🚿",titulo:"Banho conforme necessidade e clima"},
  {id:"s1",emoji:"🧹",titulo:"Limpeza do pombal"},
  {id:"s2",emoji:"💊",titulo:"Conferir protocolo e rótulos"},
  {id:"s3",emoji:"🏋️",titulo:"Revisar treinos programados"},
  {id:"s4",emoji:"📊",titulo:"Verificar condição corporal"},
  {id:"s5",emoji:"📝",titulo:"Atualizar registros"},
  {id:"s6",emoji:"🌾",titulo:"Verificar estoque de grãos"},
  {id:"s7",emoji:"💉",titulo:"Verificar validade dos produtos"},
];

const PREVENTIVO=[
  {periodo:"Semanal",emoji:"🚿",titulo:"Banho e observação das penas",desc:"Oferecer água limpa; não usar aditivos sem orientação."},
  {periodo:"Semanal",emoji:"🧹",titulo:"Limpeza do pombal",desc:"Remover fezes, controlar umidade e ventilar."},
  {periodo:"Periódico",emoji:"🔬",titulo:"Avaliação parasitológica",desc:"Realizar exame de fezes antes de vermífugos quando indicado."},
  {periodo:"Conforme risco",emoji:"🛡️",titulo:"Revisão vacinal",desc:"Confirmar vacinas e reforços com médico-veterinário."},
  {periodo:"Mensal",emoji:"⚖️",titulo:"Peso e condição corporal",desc:"Registrar variações e investigar perdas."},
  {periodo:"Pós-temporada",emoji:"🏥",titulo:"Avaliação sanitária",desc:"Revisar plantel, histórico e necessidade de exames."},
];

function readLS<T>(key:string,fallback:T):T{try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch{return fallback}}
function horaStr(d:Date){return[d.getHours(),d.getMinutes(),d.getSeconds()].map(v=>String(v).padStart(2,"0")).join(":")}
function diasValidade(data:string){if(!data)return null;return Math.ceil((new Date(`${data}T12:00:00`).getTime()-new Date().setHours(12,0,0,0))/86400000)}
function sortRotina(items:RotinaItem[]):RotinaItem[]{return[...items].sort((a,b)=>a.hora.localeCompare(b.hora))}

export default function Alertas(){
  const[tab,setTab]=useState<Tab>("hoje");
  const[feitos,setFeitos]=useState<string[]>([]);
  const[agora,setAgora]=useState(new Date());
  const[pombos,setPombos]=useState<Pombo[]>([]);
  const[provas,setProvas]=useState<ProvaCalendario[]>([]);
  const[estoque,setEstoque]=useState<Estoque[]>([]);
  const[farmacia,setFarmacia]=useState<Medicamento[]>([]);
  const[ready,setReady]=useState(false);
  const[rotina,setRotina]=useState<RotinaItem[]>(ROTINA_PADRAO);
  const[editHora,setEditHora]=useState<string|null>(null);

  useEffect(()=>{
    setFeitos(readLS(KEY_FEITOS,[]));
    setRotina(readLS(KEY_ROTINA,ROTINA_PADRAO));
    setProvas(loadCalendario());
    setEstoque(readLS("nutripombos-estoque-v1",[]));
    setFarmacia(readLS("nutripombos-farmacia-v1",[]));
    fetch("/api/pombos").then(r=>r.json()).then(v=>setPombos(Array.isArray(v)?v:[])).catch(()=>setPombos([]));
    const timer=setInterval(()=>setAgora(new Date()),1000);
    setReady(true);
    return()=>clearInterval(timer);
  },[]);

  useEffect(()=>{if(ready)localStorage.setItem(KEY_FEITOS,JSON.stringify(feitos))},[feitos,ready]);
  useEffect(()=>{if(ready)localStorage.setItem(KEY_ROTINA,JSON.stringify(rotina))},[rotina,ready]);

  const salvarHora=useCallback((id:string,novaHora:string)=>{
    if(!/^\d{2}:\d{2}$/.test(novaHora))return;
    const[h,m]=novaHora.split(":").map(Number);
    if(h<0||h>23||m<0||m>59)return;
    setRotina(prev=>sortRotina(prev.map(r=>r.id===id?{...r,hora:novaHora}:r)));
    setEditHora(null);
  },[]);

  const rotinaSorted=sortRotina(rotina);
  const hhmm=horaStr(agora).slice(0,5),minuto=agora.getHours()*60+agora.getMinutes();
  const atual=rotinaSorted.find(t=>{const[h,m]=t.hora.split(":").map(Number),diff=minuto-(h*60+m);return diff>=0&&diff<60});
  const proxima=rotinaSorted.find(t=>t.hora>hhmm)||rotinaSorted[0];

  const hoje=new Date().toISOString().slice(0,10),prova=provas.find(p=>p.dataSolta>=hoje&&!p.cancelada),dias=prova?diasParaProva(prova.dataSolta):null;
  const tratamento=pombos.filter(p=>p.status?.toLowerCase().includes("tratamento")).length;
  const baixo=estoque.filter(e=>Number(e.kg||0)<15).length;
  const vencendo=farmacia.filter(f=>{const d=diasValidade(f.validade);return d!==null&&d<30}).length;
  const avisos:{cor:string;texto:string}[]=[];
  if(tratamento)avisos.push({cor:T.orange,texto:`⚠️ ${tratamento} pombo(s) em tratamento ou acompanhamento`});
  if(baixo)avisos.push({cor:T.red,texto:`🔴 ${baixo} item(ns) de estoque abaixo de 15kg`});
  if(vencendo)avisos.push({cor:T.red,texto:`💊 ${vencendo} produto(s) vencido(s) ou perto do vencimento`});
  if(dias!==null&&dias>=0&&dias<=3)avisos.push({cor:T.gold,texto:`🏁 Prova em ${dias} dia(s): ${prova?.cidade}`});
  if(agora.getDay()===4)avisos.push({cor:T.gold,texto:"📋 Quinta-feira: revise carga, clima e condição corporal"});

  const toggle=(id:string)=>setFeitos(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);

  const resetarRotina=()=>{setRotina(ROTINA_PADRAO);localStorage.setItem(KEY_ROTINA,JSON.stringify(ROTINA_PADRAO))};

  return <main style={{minHeight:"100vh",background:T.bg,color:T.white,padding:"18px 12px 50px"}}><div style={{maxWidth:760,margin:"0 auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:14}}><h1 style={T.h1}>🔔 Central de Alertas</h1><Link href="/centro-provas" style={{...T.btnGhost,textDecoration:"none"}}>← Centro</Link></div>
    <VesperaProva provas={provas.filter(p=>!p.cancelada)}/>
    <section style={{...T.card,display:"flex",justifyContent:"space-between",alignItems:"center",borderColor:`${T.gold}55`,background:`${T.gold}0d`}}><div><div style={{fontSize:40,lineHeight:1,fontWeight:900,color:T.gold,fontVariantNumeric:"tabular-nums"}}>{horaStr(agora)}</div><div style={{...T.small,marginTop:5}}>{agora.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})}</div></div>{avisos.length>0&&<b style={{padding:"4px 10px",borderRadius:20,background:T.red}}>{avisos.length} alertas</b>}</section>
    <section style={{...T.card,border:`2px solid ${atual?T.gold:T.blue}`,background:atual?`${T.gold}12`:`${T.blue}0d`}}><small style={{color:atual?T.gold:T.blue,fontWeight:800}}>{atual?"🔴 TAREFA DE REFERÊNCIA AGORA":"🔵 PRÓXIMA TAREFA"}</small><h3 style={{margin:"5px 0"}}>{(atual||proxima).emoji} {(atual||proxima).titulo}</h3><div style={T.small}>{(atual||proxima).desc}</div><div style={{color:T.gold,fontSize:11,marginTop:5}}>⏰ {(atual||proxima).hora}</div></section>
    {avisos.length>0&&<section style={T.card}><Title color={T.red}>⚠️ Alertas Ativos</Title>{avisos.map(a=><div key={a.texto} style={{padding:"6px 0",borderBottom:`1px solid ${T.border}`,color:a.cor,fontSize:12}}>{a.texto}</div>)}</section>}
    <nav style={{display:"flex",gap:6,marginBottom:12}}>{([['hoje','⏰ Hoje'],['semana','📆 Semana'],['preventivo','🗓️ Preventivo']] as const).map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:9,borderRadius:9,fontWeight:800,color:tab===k?T.bg:T.dim,background:tab===k?T.gold:T.bgCard,border:`1px solid ${tab===k?T.gold:T.border}`}}>{l}</button>)}</nav>

    {tab==="hoje"&&<><div style={{padding:8,marginBottom:10,borderRadius:9,color:T.blue,background:`${T.blue}12`,border:`1px solid ${T.blue}44`,fontSize:11,lineHeight:1.5}}>💡 <b>Clique no horário</b> para editar. Os horários ficam salvos no seu navegador. A ordem é automática por hora.</div>
      {rotinaSorted.map(t=>{
        const id=t.id,feito=feitos.includes(id),isAtual=atual?.id===t.id,passou=t.hora<hhmm;
        const editing=editHora===id;
        return <div key={id} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 13px",marginBottom:5,textAlign:"left",borderRadius:9,opacity:passou&&!feito&&!isAtual?.55:1,color:feito?T.green:isAtual?T.gold:T.white,background:feito?`${T.green}12`:isAtual?`${T.gold}12`:"#ffffff05",border:`1px solid ${feito?T.green:isAtual?T.gold:T.border}`}}>
          <button onClick={()=>toggle(id)} style={{width:27,height:27,display:"grid",placeItems:"center",borderRadius:"50%",background:feito?T.green:isAtual?T.gold:T.bgInput,color:T.bg,border:0,cursor:"pointer",fontSize:12}}>{feito?"✓":t.emoji}</button>
          <span style={{flex:1}}><b style={{fontSize:13}}>{t.titulo}{isAtual?" ← AGORA":""}</b><span style={{...T.small,display:"block",marginTop:2}}>{t.desc}</span></span>
          {editing?(
            <input type="time" defaultValue={t.hora} autoFocus onBlur={e=>salvarHora(id,e.target.value)} onKeyDown={e=>{if(e.key==="Enter")salvarHora(id,(e.target as HTMLInputElement).value);if(e.key==="Escape")setEditHora(null)}} style={{width:80,padding:4,borderRadius:6,border:`1px solid ${T.gold}`,background:T.bgInput,color:T.gold,fontSize:13,fontWeight:800,textAlign:"center"}}/>
          ):(
            <button onClick={()=>setEditHora(id)} style={{padding:"4px 10px",borderRadius:8,border:`1px solid ${isAtual?T.gold:T.border}`,background:isAtual?`${T.gold}18`:"#ffffff05",color:isAtual?T.gold:T.dim,fontSize:12,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>⏰ {t.hora}</button>
          )}
        </div>})}
    </>}

    {tab==="semana"&&SEMANA_PADRAO.map(s=><Check key={s.id} id={`sem-${s.id}`} feito={feitos.includes(`sem-${s.id}`)} emoji={s.emoji} title={s.titulo} toggle={toggle}/>)}
    {tab==="preventivo"&&<><div style={{padding:10,marginBottom:10,borderRadius:9,color:T.blue,background:`${T.blue}12`,fontSize:11}}>ℹ️ Frequências são lembretes de manejo. Vacinas, vermífugos e tratamentos devem seguir avaliação veterinária e risco local.</div>{PREVENTIVO.map((p,i)=><Check key={p.titulo} id={`prev-${i}`} feito={feitos.includes(`prev-${i}`)} emoji={p.emoji} title={p.titulo} desc={p.desc} time={p.periodo} toggle={toggle}/>)}</>}
    <div style={{display:"flex",gap:8,marginTop:12}}>
      <button onClick={()=>setFeitos([])} style={{flex:1,padding:12,borderRadius:9,color:T.dim,background:"#ffffff05",border:`1px solid ${T.border}`}}>🔄 Resetar itens marcados</button>
      {tab==="hoje"&&<button onClick={()=>{if(confirm("Restaurar horários padrão?"))resetarRotina()}} style={{padding:12,borderRadius:9,color:T.red,background:"#ffffff05",border:`1px solid ${T.border}`}}>⏰ Horários padrão</button>}
    </div>
  </div><style jsx global>{`button{font-family:inherit;cursor:pointer}input[type=time]{font-family:inherit}`}</style></main>
}

function Check({id,feito,emoji,title,desc,time,toggle}:{id:string;feito:boolean;emoji:string;title:string;desc?:string;time?:string;toggle:(id:string)=>void}){return <button onClick={()=>toggle(id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 13px",marginBottom:5,textAlign:"left",borderRadius:9,color:feito?T.green:T.white,background:feito?`${T.green}12`:"#ffffff05",border:`1px solid ${feito?T.green:T.border}`}}><span style={{width:27,height:27,display:"grid",placeItems:"center",borderRadius:"50%",background:feito?T.green:T.bgInput,color:T.bg}}>{feito?"✓":emoji}</span><span style={{flex:1}}><b style={{fontSize:13}}>{title}</b>{desc&&<span style={{...T.small,display:"block",marginTop:2}}>{desc}</span>}</span>{time&&<small style={{color:T.dim}}>{time}</small>}</button>}
function Title({children,color=T.gold}:{children:React.ReactNode;color?:string}){return <div style={{fontSize:13,fontWeight:800,color,marginBottom:8}}>{children}</div>}

/* 🔔 Alerta de véspera de prova — notifica no navegador (gratuito, sem servidor) */
const KEY_VESPERA="nutripombos-alerta-vespera-v1";
function VesperaProva({provas}:{provas:ProvaCalendario[]}){
  const[perm,setPerm]=useState<string>("default");
  const[enviado,setEnviado]=useState(true);
  useEffect(()=>{
    setPerm(typeof Notification!=="undefined"?Notification.permission:"sem-suporte");
    const hoje=new Date().toISOString().slice(0,10);
    try{const st=JSON.parse(localStorage.getItem(KEY_VESPERA)||"{}");setEnviado(st.data===hoje)}catch{setEnviado(false)}
  },[]);
  const proximas=provas.filter(p=>{const d=diasParaProva(p.dataSolta);return d>=0&&d<=2});
  const notificar=async(forcar=false)=>{
    if(typeof Notification==="undefined")return;
    const hoje=new Date().toISOString().slice(0,10);
    try{const st=JSON.parse(localStorage.getItem(KEY_VESPERA)||"{}");if(!forcar&&st.data===hoje)return;localStorage.setItem(KEY_VESPERA,JSON.stringify({data:hoje}))}catch{}
    setEnviado(true);
    const p0=proximas[0];
    const titulo=proximas.length?(diasParaProva(p0.dataSolta)===0?`🏁 Prova #${p0.num} ${p0.cidade} É HOJE!`:`⏰ Amanhã: prova #${p0.num} ${p0.cidade} (${p0.km}km)`):"✅ Sem provas nos próximos dias";
    const corpo=proximas.length?"Toque para ver as condições da rota cidade por cidade":"Tudo tranquilo no calendário";
    try{
      const reg=await navigator.serviceWorker?.getRegistration();
      if(reg)reg.showNotification(titulo,{body:corpo,icon:"/icon.svg",tag:"nutripombos-vespera"});
      else new Notification(titulo,{body:corpo,icon:"/icon.svg"});
    }catch{}
  };
  const ativar=async()=>{
    if(typeof Notification==="undefined"){alert("Este navegador não suporta notificações.");return}
    const p=await Notification.requestPermission();setPerm(p);
    if(p==="granted")notificar(true);
  };
  return <section style={{...T.card,borderColor:`${T.gold}55`,background:`${T.gold}0d`,marginBottom:10}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
      <Title>🔔 Alerta de Véspera de Prova (grátis, no próprio celular)</Title>
      {perm==="granted"?<button onClick={()=>notificar(true)} style={T.btnSm}>{enviado?"🔔 Testar":"🔔 Enviar agora"}</button>:<button onClick={ativar} style={T.btnSm}>🔔 Ativar notificações</button>}
    </div>
    {proximas.length===0&&<div style={{...T.small,fontSize:12}}>Nenhuma soltura nos próximos 2 dias. Quando chegar a véspera de uma prova, você recebe o alerta automático ao abrir o app.</div>}
    {proximas.map(p=>{const d=diasParaProva(p.dataSolta);return <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
      <span style={{fontSize:24}}>{d===0?"🏁":"⏰"}</span>
      <div style={{flex:1}}><b style={{fontSize:13}}>#{p.num} {p.cidade} — {p.km}km</b><div style={T.small}>Solta em {p.diaSolta} {p.dataSolta.split("-").reverse().slice(0,2).join("/")} • {d===0?"É HOJE!":"faltam "+d+" dia(s)"}</div></div>
      <Link href="/centro-provas/rota" style={{...T.btnGhost,textDecoration:"none",fontSize:11}}>🛣️ Ver rota</Link>
    </div>})}
    {perm==="denied"&&<div style={{...T.small,fontSize:11,color:T.orange,marginTop:8}}>⚠️ Notificações bloqueadas neste navegador — libere nas configurações do site para receber os alertas.</div>}
    {perm==="default"&&<div style={{...T.small,fontSize:11,color:T.dim,marginTop:8}}>ℹ️ Toque em "Ativar" e permita as notificações — o alerta dispara na véspera e no dia da prova.</div>}
  </section>;
}
