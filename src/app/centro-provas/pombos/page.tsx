"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { T } from "../theme";

type Pombo = {
  id:number; anilha:string; nome:string|null; sexo:string; cor:string|null;
  dataNascimento:string|null; status:string|null; paiId:number|null; maeId:number|null;
  observacoes:string|null;
  pai?:Pombo|null; mae?:Pombo|null;
};

type Tab = "lista" | "pedigree" | "novo" | "editar";

const KEY_CUSTOM = "nutripombos-pombos-custom-v1";

const SEXO_COR:Record<string,string> = { macho:"#3B82F6", femea:"#EC4899" };
const STATUS_COR:Record<string,string> = { ativo:"#4ADE80", inativo:"#94A3B8", vendido:"#FBBF24", morto:"#EF4444", tratamento:"#F97316" };

function calcInbreeding(p:Pombo|null, ancestors:Set<number>=new Set(), depth=0):number{
  if(!p||depth>6)return 0;
  if(ancestors.has(p.id))return 1/Math.pow(2,depth+1);
  const s=new Set(ancestors);s.add(p.id);
  return calcInbreeding(p.pai??null,s,depth+1)+calcInbreeding(p.mae??null,s,depth+1);
}

function linhagem(p:Pombo|null, depth=0):string{
  if(!p||depth>3)return "—";
  if(p.pai&&p.mae)return `${linhagem(p.pai,depth+1)} × ${linhagem(p.mae,depth+1)}`;
  if(p.pai)return `${linhagem(p.pai,depth+1)} × ?`;
  if(p.mae)return `? × ${linhagem(p.mae,depth+1)}`;
  return p.nome||p.anilha;
}

function calcCoef(p:Pombo|null):number{
  if(!p||!p.pai||!p.mae)return 0;
  const s=new Set<number>();
  const shared=calcInbreeding(p.pai,s,0);
  return shared>0?shared*0.5:0;
}

export default function PombosPage(){
  const[pombos,setPombos]=useState<Pombo[]>([]);
  const[loading,setLoading]=useState(true);
  const[tab,setTab]=useState<Tab>("lista");
  const[sel,setSel]=useState<Pombo|null>(null);
  const[busca,setBusca]=useState("");
  const[filtroSexo,setFiltroSexo]=useState("");
  const[filtroStatus,setFiltroStatus]=useState("");
  const[pedigreeData,setPedigreeData]=useState<Pombo|null>(null);
  const[editPombo,setEditPombo]=useState<Pombo|null>(null);

  const loadPombos=useCallback(async()=>{
    setLoading(true);
    try{const r=await fetch("/api/pombos");if(r.ok){const d=await r.json();setPombos(Array.isArray(d)?d:[])}else setPombos([])}catch{setPombos([])}
    setLoading(false);
  },[]);

  const loadPedigree=useCallback(async(id:number)=>{
    try{const r=await fetch(`/api/pombos?id=${id}&pedigree=1`);if(r.ok){const d=await r.json();setPedigreeData(d)}}catch{}
  },[]);

  useEffect(()=>{loadPombos()},[loadPombos]);

  const filtrados=pombos.filter(p=>{
    if(filtroSexo&&p.sexo!==filtroSexo)return false;
    if(filtroStatus&&p.status!==filtroStatus)return false;
    if(busca){const q=busca.toLowerCase();return(p.anilha||"").toLowerCase().includes(q)||(p.nome||"").toLowerCase().includes(q)||(p.cor||"").toLowerCase().includes(q)}
    return true;
  });

  const machos=pombos.filter(p=>p.sexo==="macho");
  const femeas=pombos.filter(p=>p.sexo==="femea");

  async function excluirPombo(id:number){
    if(!confirm("⚠️ Tem certeza que deseja excluir este pombo?\n\nEsta ação não pode ser desfeita."))return;
    try{
      const r=await fetch(`/api/pombos?id=${id}`,{method:"DELETE"});
      if(r.ok){setSel(null);setPedigreeData(null);loadPombos()}
      else{const d=await r.json();alert(d.error||"Erro ao excluir")}
    }catch{alert("Erro de conexão")}
  }

  // EDIT MODE
  if(editPombo){
    return <Shell>
      <button onClick={()=>setEditPombo(null)} style={{...T.btnGhost,marginBottom:16}}>← Voltar</button>
      <EditarPombo pombo={editPombo} pombos={pombos} onSaved={()=>{setEditPombo(null);loadPombos()}} onCancel={()=>setEditPombo(null)}/>
    </Shell>;
  }

  // DETAIL VIEW
  if(sel){
    const ic=calcCoef(pedigreeData);
    const lin=linhagem(pedigreeData);
    return <Shell>
      <button onClick={()=>{setSel(null);setPedigreeData(null)}} style={{...T.btnGhost,marginBottom:16}}>← Voltar</button>
      <section style={{...T.card,border:`2px solid ${SEXO_COR[sel.sexo]||T.gold}55`,background:`${SEXO_COR[sel.sexo]||T.gold}0d`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}>
          <div>
            <span style={{padding:"3px 10px",borderRadius:12,fontSize:10,fontWeight:800,color:SEXO_COR[sel.sexo],background:`${SEXO_COR[sel.sexo]}18`}}>{sel.sexo==="macho"?"♂ MACHO":"♀ FÊMEA"}</span>
            <h1 style={{...T.h1,marginTop:8}}>{sel.nome||sel.anilha}</h1>
            <div style={{fontFamily:"monospace",fontSize:20,color:T.gold,fontWeight:900}}>{sel.anilha}</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"start"}}>
            <span style={{padding:"4px 12px",borderRadius:20,fontSize:10,fontWeight:800,color:STATUS_COR[sel.status||"ativo"],background:`${STATUS_COR[sel.status||"ativo"]}18`}}>{sel.status||"ativo"}</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16}}>
          <MiniBox label="🎨 Cor" value={sel.cor||"—"}/>
          <MiniBox label="📅 Nascimento" value={sel.dataNascimento?new Date(sel.dataNascimento).toLocaleDateString("pt-BR"):"—"}/>
          <MiniBox label="🧬 Linhagem" value={lin||"—"} full/>
          <MiniBox label="🔬 Coef. Endogamia" value={ic>0?`${(ic*100).toFixed(2)}%`:"0% (sem endocruzamento)"}/>
        </div>
        {sel.observacoes&&<p style={{...T.small,marginTop:12,color:T.dim}}>📝 {sel.observacoes}</p>}

        {/* ACTION BUTTONS */}
        <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
          <button onClick={()=>{setEditPombo(sel);}} style={{...T.btn,flex:1,background:T.blue}}>✏️ Editar</button>
          <button onClick={()=>excluirPombo(sel.id)} style={{...T.btn,flex:1,background:"#EF4444"}}>🗑️ Excluir</button>
        </div>
      </section>

      <section style={T.card}><Title>🌳 Árvore Genealógica</Title>
        <PedigreeTree pombo={pedigreeData} onSelect={p=>{setSel(p);loadPedigree(p.id)}}/>
      </section>

      <section style={T.card}><Title>🩸 Informações Sanguíneas</Title>
        <BloodInfo pombo={pedigreeData} pombos={pombos}/>
      </section>
    </Shell>;
  }

  // LIST VIEW
  return <Shell>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}><div><h1 style={T.h1}>🐦 Pombos</h1><p style={{...T.small,marginTop:4}}>Pedigree, linhagem e controle do plantel</p></div><Link href="/centro-provas" style={{...T.btnGhost,textDecoration:"none"}}>← Centro</Link></div>
    <Link href="/centro-provas/classificacao" style={{ display:"block", textDecoration:"none", padding:"12px 16px", marginBottom:14, borderRadius:11, background:"linear-gradient(135deg, rgba(234,179,8,0.15), rgba(34,197,94,0.15))", border:`1px solid ${T.gold}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <b style={{ color:T.gold, fontSize:14 }}>🏆 Seletor de Pombos por Quilometragem</b>
          <div style={{ fontSize:11, color:T.white, marginTop:2 }}>Calcule o coeficiente de aptidão para decidir qual pombo usar na próxima prova/temporada →</div>
        </div>
        <span style={{ fontSize:20 }}>➔</span>
      </div>
    </Link>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:14}}>
      <StatBox label="Total" value={pombos.length} color={T.gold}/>
      <StatBox label="♂ Machos" value={machos.length} color="#3B82F6"/>
      <StatBox label="♀ Fêmeas" value={femeas.length} color="#EC4899"/>
      <StatBox label="Ativos" value={pombos.filter(p=>p.status==="ativo").length} color="#4ADE80"/>
    </div>

    <section style={T.card}>
      <input placeholder="🔍 Buscar anilha, nome ou cor..." value={busca} onChange={e=>setBusca(e.target.value)} style={T.input}/>
      <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
        {["","macho","femea"].map(s=><button key={s} onClick={()=>setFiltroSexo(s)} style={{padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:700,color:filtroSexo===s?T.bg:T.dim,background:filtroSexo===s?T.gold:T.bgInput,border:`1px solid ${filtroSexo===s?T.gold:T.border}`}}>{s||"Sexo"}</button>)}
        {["","ativo","inativo","vendido","morto","tratamento"].map(s=><button key={s} onClick={()=>setFiltroStatus(s)} style={{padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:700,color:filtroStatus===s?T.bg:T.dim,background:filtroStatus===s?T.gold:T.bgInput,border:`1px solid ${filtroStatus===s?T.gold:T.border}`}}>{s||"Status"}</button>)}
      </div>
    </section>

    <nav style={{display:"flex",gap:6,marginBottom:14}}>
      <button onClick={()=>setTab("lista")} style={{flex:1,padding:10,borderRadius:9,fontWeight:800,color:tab==="lista"?T.bg:T.dim,background:tab==="lista"?T.gold:T.bgCard,border:`1px solid ${tab==="lista"?T.gold:T.border}`}}>📋 Lista</button>
      <button onClick={()=>setTab("novo")} style={{flex:1,padding:10,borderRadius:9,fontWeight:800,color:tab==="novo"?T.bg:T.dim,background:tab==="novo"?T.gold:T.bgCard,border:`1px solid ${tab==="novo"?T.gold:T.border}`}}>➕ Novo Pombo</button>
    </nav>

    {tab==="lista"&&<>
      {loading&&<div style={{textAlign:"center",padding:40,color:T.dim}}>Carregando...</div>}
      {!loading&&filtrados.length===0&&<div style={{textAlign:"center",padding:40,color:T.dim}}><div style={{fontSize:40}}>🐦</div><p>Nenhum pombo encontrado.</p></div>}
      {filtrados.map(p=>{
        const pai=pombos.find(x=>x.id===p.paiId);
        const mae=pombos.find(x=>x.id===p.maeId);
        return <div key={p.id} style={{marginBottom:8,borderRadius:11,background:T.bgCard,border:`1px solid ${SEXO_COR[p.sexo]||T.border}44`,borderLeft:`4px solid ${SEXO_COR[p.sexo]||T.border}`,overflow:"hidden"}}>
          <button onClick={()=>{setSel(p);loadPedigree(p.id)}} style={{width:"100%",textAlign:"left",padding:14,color:T.white,background:"transparent",border:"none",cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <b style={{fontSize:15}}>{p.nome||p.anilha}</b>
                  <span style={{padding:"2px 8px",borderRadius:12,fontSize:10,fontWeight:800,color:SEXO_COR[p.sexo],background:`${SEXO_COR[p.sexo]}18`}}>{p.sexo==="macho"?"♂":"♀"}</span>
                  <span style={{padding:"2px 8px",borderRadius:12,fontSize:9,fontWeight:700,color:STATUS_COR[p.status||"ativo"],background:`${STATUS_COR[p.status||"ativo"]}18`}}>{p.status||"ativo"}</span>
                </div>
                <div style={{fontFamily:"monospace",fontSize:13,color:T.gold,marginTop:2}}>{p.anilha}</div>
                <div style={{...T.small,marginTop:4,color:T.dim}}>
                  {p.cor&&<span>{p.cor} • </span>}
                  {p.dataNascimento&&<span>{new Date(p.dataNascimento).toLocaleDateString("pt-BR")} • </span>}
                  {pai||mae?<span style={{color:T.blue}}>🧬 {pai?pai.anilha:"?"} × {mae?mae.anilha:"?"}</span>:<span>🧬 Sem pedigree</span>}
                </div>
              </div>
              <span style={{color:T.dim,fontSize:18}}>›</span>
            </div>
          </button>
          {/* Quick actions */}
          <div style={{display:"flex",borderTop:`1px solid ${T.border}`}}>
            <button onClick={(e)=>{e.stopPropagation();setEditPombo(p)}} style={{flex:1,padding:"8px 0",fontSize:11,fontWeight:700,color:T.blue,background:"transparent",border:"none",cursor:"pointer",borderRight:`1px solid ${T.border}`}}>✏️ Editar</button>
            <button onClick={(e)=>{e.stopPropagation();excluirPombo(p.id)}} style={{flex:1,padding:"8px 0",fontSize:11,fontWeight:700,color:"#EF4444",background:"transparent",border:"none",cursor:"pointer"}}>🗑️ Excluir</button>
          </div>
        </div>;
      })}
    </>}

    {tab==="novo"&&<NovoPombo pombos={pombos} onSaved={loadPombos}/>}
  </Shell>;
}

function mascaraAnilha(v:string):string{
  if (/^[0-9]+$/.test(v) && v.length > 7 && v.length <= 9) {
    return v.slice(0, 7) + "/" + v.slice(7);
  }
  return v;
}

function validarAnilha(v:string):boolean{
  return v.trim().length >= 4;
}

/* ========== EDIT POMBO FORM ========== */
function EditarPombo({pombo,pombos,onSaved,onCancel}:{pombo:Pombo;pombos:Pombo[];onSaved:()=>void;onCancel:()=>void}){
  const[anilha,setAnilha]=useState(pombo.anilha);
  const[nome,setNome]=useState(pombo.nome||"");
  const[sexo,setSexo]=useState(pombo.sexo);
  const[cor,setCor]=useState(pombo.cor||"");
  const[nasc,setNasc]=useState(pombo.dataNascimento?pombo.dataNascimento.slice(0,10):"");
  const[paiId,setPaiId]=useState(pombo.paiId?String(pombo.paiId):"");
  const[maeId,setMaeId]=useState(pombo.maeId?String(pombo.maeId):"");
  const[status,setStatus]=useState(pombo.status||"ativo");
  const[obs,setObs]=useState(pombo.observacoes||"");
  const[saving,setSaving]=useState(false);

  const machos=pombos.filter(p=>p.sexo==="macho"&&p.id!==pombo.id);
  const femeas=pombos.filter(p=>p.sexo==="femea"&&p.id!==pombo.id);
  const anilhaOk=validarAnilha(anilha);

  async function salvar(){
    if(!anilhaOk){alert("Anilha inválida. Digite pelo menos 4 caracteres (ex: 1234567/26 ou 008488920)");return}
    setSaving(true);
    try{
      const r=await fetch("/api/pombos",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:pombo.id,anilha:anilha.trim(),nome:nome.trim()||null,sexo,cor:cor.trim()||null,dataNascimento:nasc||null,paiId:paiId?Number(paiId):null,maeId:maeId?Number(maeId):null,observacoes:obs.trim()||null,status})});
      if(r.ok){onSaved()}else{const d=await r.json();alert(d.error||"Erro ao salvar")}
    }catch{alert("Erro de conexão")}
    setSaving(false);
  }

  return <section style={T.card}>
    <Title>✏️ Editar Pombo</Title>
    <div style={{padding:10,marginBottom:12,borderRadius:9,color:T.gold,background:`${T.gold}10`,border:`1px solid ${T.gold}33`,fontSize:11}}>
      📋 Editando: <b>{pombo.nome||pombo.anilha}</b> ({pombo.anilha})
    </div>
    <Field label="🏷️ Anilha *"><div style={{position:"relative"}}><input value={anilha} onChange={e=>{const m=mascaraAnilha(e.target.value);setAnilha(m)}} placeholder="0000000/00" maxLength={10} style={{...T.input,fontFamily:"monospace",fontSize:18,fontWeight:900,letterSpacing:2,color:anilhaOk||!anilha?T.gold:T.red}}/>{anilha&&!anilhaOk&&<div style={{fontSize:10,color:T.red,marginTop:4}}>Digite pelo menos 4 caracteres</div>}{anilhaOk&&<div style={{fontSize:10,color:"#4ADE80",marginTop:4}}>✅ Anilha válida</div>}</div></Field>
    <Field label="📛 Nome"><input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome do pombo" style={T.input}/></Field>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      <Field label="⚥ Sexo"><select value={sexo} onChange={e=>setSexo(e.target.value)} style={{...T.input,appearance:"auto"}}><option value="macho">♂ Macho</option><option value="femea">♀ Fêmea</option></select></Field>
      <Field label="🎨 Cor"><input value={cor} onChange={e=>setCor(e.target.value)} placeholder="Ex: Azul barro" style={T.input}/></Field>
    </div>
    <Field label="📅 Data de Nascimento"><input type="date" value={nasc} onChange={e=>setNasc(e.target.value)} style={T.input}/></Field>
    <Field label="📊 Status"><select value={status} onChange={e=>setStatus(e.target.value)} style={{...T.input,appearance:"auto"}}><option value="ativo">✅ Ativo</option><option value="inativo">⏸️ Inativo</option><option value="vendido">💰 Vendido</option><option value="morto">💀 Morto</option><option value="tratamento">🏥 Em tratamento</option></select></Field>
    <div style={{padding:10,marginBottom:10,borderRadius:9,color:T.blue,background:`${T.blue}12`,border:`1px solid ${T.blue}44`,fontSize:11}}>🧬 <b>Selecione o pai e a mãe</b> para montar o pedigree.</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      <Field label="♂ Pai (macho)"><select value={paiId} onChange={e=>setPaiId(e.target.value)} style={{...T.input,appearance:"auto"}}><option value="">— Sem pai cadastrado —</option>{machos.map(p=><option key={p.id} value={p.id}>{p.anilha}{p.nome?` — ${p.nome}`:""}</option>)}</select></Field>
      <Field label="♀ Mãe (fêmea)"><select value={maeId} onChange={e=>setMaeId(e.target.value)} style={{...T.input,appearance:"auto"}}><option value="">— Sem mãe cadastrada —</option>{femeas.map(p=><option key={p.id} value={p.id}>{p.anilha}{p.nome?` — ${p.nome}`:""}</option>)}</select></Field>
    </div>
    <Field label="📝 Observações"><textarea value={obs} onChange={e=>setObs(e.target.value)} placeholder="Notas sobre o pombo..." rows={3} style={{...T.input,resize:"vertical"}}/></Field>
    <div style={{display:"flex",gap:8}}>
      <button onClick={salvar} disabled={saving} style={{...T.btn,flex:1,opacity:saving?0.5:1}}>{saving?"Salvando...":"💾 Salvar Alterações"}</button>
      <button onClick={onCancel} style={{...T.btnGhost,flex:1}}>Cancelar</button>
    </div>
  </section>;
}

/* ========== NOVO POMBO FORM ========== */
function NovoPombo({pombos,onSaved}:{pombos:Pombo[];onSaved:()=>void}){
  const[anilha,setAnilha]=useState("");
  const[nome,setNome]=useState("");
  const[sexo,setSexo]=useState("macho");
  const[cor,setCor]=useState("");
  const[nasc,setNasc]=useState("");
  const[paiId,setPaiId]=useState("");
  const[maeId,setMaeId]=useState("");
  const[obs,setObs]=useState("");
  const[saving,setSaving]=useState(false);

  const machos=pombos.filter(p=>p.sexo==="macho");
  const femeas=pombos.filter(p=>p.sexo==="femea");
  const anilhaOk=validarAnilha(anilha);

  async function salvar(){
    if(!anilhaOk){alert("Anilha inválida. Digite pelo menos 4 caracteres (ex: 1234567/26 ou 008488920)");return}
    setSaving(true);
    try{
      const r=await fetch("/api/pombos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({anilha:anilha.trim(),nome:nome.trim()||null,sexo,cor:cor.trim()||null,dataNascimento:nasc||null,paiId:paiId?Number(paiId):null,maeId:maeId?Number(maeId):null,observacoes:obs.trim()||null,status:"ativo"})});
      if(r.ok){setAnilha("");setNome("");setCor("");setNasc("");setPaiId("");setMaeId("");setObs("");onSaved()}else{const d=await r.json();alert(d.error||"Erro ao salvar")}
    }catch{alert("Erro de conexão")}
    setSaving(false);
  }

  return <section style={T.card}>
    <Title>➕ Cadastrar Novo Pombo</Title>
    <Field label="🏷️ Anilha *"><div style={{position:"relative"}}><input value={anilha} onChange={e=>{const m=mascaraAnilha(e.target.value);setAnilha(m)}} placeholder="0000000/00" maxLength={10} style={{...T.input,fontFamily:"monospace",fontSize:18,fontWeight:900,letterSpacing:2,color:anilhaOk||!anilha?T.gold:T.red}}/>{anilha&&!anilhaOk&&<div style={{fontSize:10,color:T.red,marginTop:4}}>Digite pelo menos 4 caracteres</div>}{anilhaOk&&<div style={{fontSize:10,color:"#4ADE80",marginTop:4}}>✅ Anilha válida</div>}</div></Field>
    <Field label="📛 Nome"><input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome do pombo" style={T.input}/></Field>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      <Field label="⚥ Sexo"><select value={sexo} onChange={e=>setSexo(e.target.value)} style={{...T.input,appearance:"auto"}}><option value="macho">♂ Macho</option><option value="femea">♀ Fêmea</option></select></Field>
      <Field label="🎨 Cor"><input value={cor} onChange={e=>setCor(e.target.value)} placeholder="Ex: Azul barro" style={T.input}/></Field>
    </div>
    <Field label="📅 Data de Nascimento"><input type="date" value={nasc} onChange={e=>setNasc(e.target.value)} style={T.input}/></Field>
    <div style={{padding:10,marginBottom:10,borderRadius:9,color:T.blue,background:`${T.blue}12`,border:`1px solid ${T.blue}44`,fontSize:11}}>🧬 <b>Selecione o pai e a mãe</b> para montar o pedigree. Se o pombo ainda não estiver cadastrado, cadastre primeiro e edite depois.</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      <Field label="♂ Pai (macho)"><select value={paiId} onChange={e=>setPaiId(e.target.value)} style={{...T.input,appearance:"auto"}}><option value="">— Sem pai cadastrado —</option>{machos.map(p=><option key={p.id} value={p.id}>{p.anilha}{p.nome?` — ${p.nome}`:""}</option>)}</select></Field>
      <Field label="♀ Mãe (fêmea)"><select value={maeId} onChange={e=>setMaeId(e.target.value)} style={{...T.input,appearance:"auto"}}><option value="">— Sem mãe cadastrada —</option>{femeas.map(p=><option key={p.id} value={p.id}>{p.anilha}{p.nome?` — ${p.nome}`:""}</option>)}</select></Field>
    </div>
    <Field label="📝 Observações"><textarea value={obs} onChange={e=>setObs(e.target.value)} placeholder="Notas sobre o pombo..." rows={3} style={{...T.input,resize:"vertical"}}/></Field>
    <button onClick={salvar} disabled={saving} style={{...T.btn,width:"100%",opacity:saving?0.5:1}}>{saving?"Salvando...":"💾 Cadastrar Pombo"}</button>
  </section>;
}

/* ========== PEDIGREE TREE ========== */
function PedigreeTree({pombo,onSelect}:{pombo:Pombo|null;onSelect:(p:Pombo)=>void}){
  if(!pombo)return <div style={{textAlign:"center",padding:30,color:T.dim}}>Carregando pedigree...</div>;

  return <div style={{overflowX:"auto",paddingBottom:10}}>
    <div style={{minWidth:500,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <PomboNode pombo={pombo} isRoot onSelect={onSelect}/>
      <div style={{display:"flex",gap:4,justifyContent:"center",width:"100%"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
          <div style={{width:1,height:16,background:T.border}}/>
          <PomboNode pombo={pombo.pai||null} onSelect={onSelect} label="♂ PAI"/>
          {pombo.pai&&<div style={{display:"flex",gap:4,width:"100%"}}>
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <div style={{width:1,height:12,background:T.border}}/>
              <PomboNode pombo={pombo.pai.pai||null} onSelect={onSelect} label="♂ AVÔ"/>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <div style={{width:1,height:12,background:T.border}}/>
              <PomboNode pombo={pombo.pai.mae||null} onSelect={onSelect} label="♀ AVÓ"/>
            </div>
          </div>}
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
          <div style={{width:1,height:16,background:T.border}}/>
          <PomboNode pombo={pombo.mae||null} onSelect={onSelect} label="♀ MÃE"/>
          {pombo.mae&&<div style={{display:"flex",gap:4,width:"100%"}}>
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <div style={{width:1,height:12,background:T.border}}/>
              <PomboNode pombo={pombo.mae.pai||null} onSelect={onSelect} label="♂ AVÔ"/>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <div style={{width:1,height:12,background:T.border}}/>
              <PomboNode pombo={pombo.mae.mae||null} onSelect={onSelect} label="♀ AVÓ"/>
            </div>
          </div>}
        </div>
      </div>
    </div>
  </div>;
}

function PomboNode({pombo,isRoot,label,onSelect}:{pombo:Pombo|null;isRoot?:boolean;label?:string;onSelect:(p:Pombo)=>void}){
  if(!pombo)return <div style={{padding:"8px 12px",borderRadius:8,border:`1px dashed ${T.border}`,background:T.bgInput,textAlign:"center",minWidth:100,opacity:.4}}>
    <div style={{fontSize:10,color:T.dim}}>?</div>
    <div style={{fontSize:9,color:T.dim}}>Não cadastrado</div>
  </div>;

  const cor=SEXO_COR[pombo.sexo]||T.gold;
  return <button onClick={()=>onSelect(pombo)} style={{padding:"8px 14px",borderRadius:10,border:`1px solid ${isRoot?cor:`${cor}55`}`,background:isRoot?`${cor}15`:`${cor}08`,textAlign:"center",minWidth:100,cursor:"pointer",color:T.white}}>
    {label&&<div style={{fontSize:9,fontWeight:800,color:cor,marginBottom:2}}>{label}</div>}
    <div style={{fontSize:12,fontWeight:800,color:isRoot?cor:T.white}}>{pombo.nome||pombo.anilha}</div>
    <div style={{fontFamily:"monospace",fontSize:10,color:T.gold}}>{pombo.anilha}</div>
    {(pombo.cor||pombo.dataNascimento)&&<div style={{fontSize:9,color:T.dim,marginTop:2}}>{pombo.cor||""}{pombo.cor&&pombo.dataNascimento?" • ":""}{pombo.dataNascimento?new Date(pombo.dataNascimento).toLocaleDateString("pt-BR"):""}</div>}
  </button>;
}

/* ========== BLOOD INFO ========== */
function BloodInfo({pombo,pombos}:{pombo:Pombo|null;pombos:Pombo[]}){
  if(!pombo)return null;
  const irmaos=pombos.filter(p=>p.id!==pombo.id&&((p.paiId&&p.paiId===pombo.paiId)||(p.maeId&&p.maeId===pombo.maeId))&&p.paiId&&p.maeId&&pombo.paiId&&pombo.maeId&&(p.paiId===pombo.paiId&&p.maeId===pombo.maeId));
  const filhos=pombos.filter(p=>p.paiId===pombo.id||p.maeId===pombo.id);
  const ic=calcCoef(pombo);

  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
      <div style={{padding:12,borderRadius:9,background:`${ic>0?"#EF4444":"#4ADE80"}12`,border:`1px solid ${ic>0?"#EF4444":"#4ADE80"}44`}}>
        <div style={{fontSize:10,color:T.dim}}>🔬 Coeficiente de Endogamia</div>
        <b style={{fontSize:18,color:ic>0?"#EF4444":"#4ADE80"}}>{ic>0?`${(ic*100).toFixed(2)}%`:"0%"}</b>
        <div style={{fontSize:10,color:T.dim,marginTop:2}}>{ic>0?"⚠️ Endocruzamento detectado":"✅ Sem endocruzamento próximo"}</div>
      </div>
      <div style={{padding:12,borderRadius:9,background:`${T.blue}12`,border:`1px solid ${T.blue}44`}}>
        <div style={{fontSize:10,color:T.dim}}>🧬 Linhagem Sanguínea</div>
        <b style={{fontSize:13,color:T.blue}}>{linhagem(pombo)}</b>
      </div>
    </div>
    {filhos.length>0&&<div style={{marginBottom:12}}><div style={{fontSize:11,fontWeight:800,color:T.gold,marginBottom:6}}>🐣 Filhos ({filhos.length})</div>{filhos.map(f=><div key={f.id} style={{padding:"5px 0",borderBottom:`1px solid ${T.border}`,fontSize:12,color:T.dim}}><span style={{color:SEXO_COR[f.sexo]}}>{f.sexo==="macho"?"♂":"♀"}</span> <b>{f.nome||f.anilha}</b> ({f.anilha})</div>)}</div>}
    {irmaos.length>0&&<div><div style={{fontSize:11,fontWeight:800,color:T.gold,marginBottom:6}}>🤝 Irmãos Completos ({irmaos.length})</div>{irmaos.map(i=><div key={i.id} style={{padding:"5px 0",borderBottom:`1px solid ${T.border}`,fontSize:12,color:T.dim}}><span style={{color:SEXO_COR[i.sexo]}}>{i.sexo==="macho"?"♂":"♀"}</span> <b>{i.nome||i.anilha}</b> ({i.anilha})</div>)}</div>}
  </div>;
}

/* ========== SHARED COMPONENTS ========== */
function StatBox({label,value,color}:{label:string;value:number;color:string}){return <div style={{padding:10,borderRadius:9,textAlign:"center",background:`${color}10`,border:`1px solid ${color}33`}}><div style={{fontSize:20,fontWeight:900,color}}>{value}</div><div style={{fontSize:10,color:T.dim}}>{label}</div></div>}
function MiniBox({label,value,full}:{label:string;value:string;full?:boolean}){return <div style={{padding:8,borderRadius:8,background:"#ffffff05",gridColumn:full?"1 / -1":undefined}}><div style={{fontSize:9,color:T.dim}}>{label}</div><div style={{fontSize:12,fontWeight:700}}>{value}</div></div>}
function Title({children}:{children:React.ReactNode}){return <div style={{fontSize:13,fontWeight:800,color:T.gold,marginBottom:10}}>{children}</div>}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label style={{display:"block",marginBottom:11}}><span style={{...T.label,display:"block",marginBottom:5}}>{label}</span>{children}</label>}
function Shell({children}:{children:React.ReactNode}){return <main style={{minHeight:"100vh",background:T.bg,color:T.white,padding:"18px 12px 50px"}}><div style={{maxWidth:760,margin:"0 auto"}}>{children}</div><style jsx global>{`button,input,select,textarea{font-family:inherit}button{cursor:pointer}`}</style></main>}
