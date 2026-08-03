"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadConfig } from "../config";
import { T } from "../theme";

type Pombo = { id: number; status: string | null };
type Prova = { id: string; competicao?: string; prova?: string; colocacao: number; velocidade: number; data?: string };
type Treino = { distancia?: number; data?: string };
type Estoque = { kg?: number; ingrediente?: string };

function localArray<T>(key: string): T[] {
  try { const parsed = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}

export default function Performance() {
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [provas, setProvas] = useState<Prova[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [estoque, setEstoque] = useState<Estoque[]>([]);
  const [consumo, setConsumo] = useState(30);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/pombos").then(r => r.json()).then(v => setPombos(Array.isArray(v) ? v : [])).catch(() => setPombos([]));
    setProvas(localArray<Prova>("nutripombos-historico-provas-v1"));
    setTreinos(localArray<Treino>("nutripombos-treinos-v1"));
    setEstoque(localArray<Estoque>("nutripombos-estoque-v1"));
    setConsumo(loadConfig().consumoDiario);
    setReady(true);
  }, []);

  const dados = useMemo(() => {
    const ultimas = [...provas].sort((a,b) => (a.data || "").localeCompare(b.data || "")).slice(-5);
    const mediaCol = ultimas.length ? ultimas.reduce((s,p) => s + Number(p.colocacao || 0), 0) / ultimas.length : 0;
    const fisica = ultimas.length ? Math.max(0, Math.min(100, Math.round(100 - mediaCol * 6))) : 50;
    const treino = treinos.length ? Math.min(100, Math.round(treinos.slice(-10).length / 10 * 100)) : 40;
    const ativos = pombos.filter(p => !p.status || p.status.toLowerCase() === "ativo").length;
    const estoqueKg = estoque.reduce((s,e) => s + Number(e.kg || 0), 0);
    const necessidade30Dias = ativos * consumo * 30 / 1000;
    const nutricao = estoque.length ? Math.min(100, Math.round(estoqueKg / Math.max(necessidade30Dias, 1) * 100)) : 50;
    const recuperacao = treinos.length >= 3 ? 82 : treinos.length ? 65 : 50;
    const motivacao = 75;
    const indice = Math.round((fisica + treino + nutricao + recuperacao + motivacao) / 5);
    return { ultimas, fisica, treino, nutricao, recuperacao, motivacao, indice, ativos, estoqueKg, necessidade30Dias };
  }, [provas, treinos, estoque, pombos, consumo]);

  const vitorias = provas.filter(p => p.colocacao === 1).length;
  const podios = provas.filter(p => p.colocacao <= 3).length;
  const velMed = provas.length ? Math.round(provas.reduce((s,p) => s + Number(p.velocidade || 0), 0) / provas.length) : 0;
  const corIndice = dados.indice >= 70 ? T.green : dados.indice >= 50 ? "#FBBF24" : T.red;
  const indices = [
    { label:"💪 Forma Física", value:dados.fisica, color:T.gold, description:provas.length ? "Resultados das cinco provas recentes" : "Sem resultados suficientes — valor neutro" },
    { label:"💙 Recuperação", value:dados.recuperacao, color:T.blue, description:treinos.length ? "Frequência recente de treinos" : "Sem registros de treino — valor neutro" },
    { label:"🌾 Nutrição", value:dados.nutricao, color:T.green, description:estoque.length ? `Estoque para consumo configurado de ${consumo}g/dia` : "Sem estoque registrado — valor neutro" },
    { label:"🏋️ Treinamento", value:dados.treino, color:"#A78BFA", description:treinos.length ? "Consistência dos últimos registros" : "Nenhum treino registrado" },
    { label:"❤️ Motivação", value:dados.motivacao, color:"#F472B6", description:"Referência manual padrão; ajuste pela observação" },
  ];

  return <main style={{ minHeight:"100vh", background:T.bg, color:T.white, padding:"18px 12px 50px" }}><div style={{ maxWidth:760, margin:"0 auto" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", gap:10, marginBottom:20 }}><div><h1 style={T.h1}>⚡ Centro de Performance</h1><p style={{ ...T.small, marginTop:4 }}>Índices estimados a partir dos registros disponíveis</p></div><Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration:"none" }}>← Centro</Link></div>
    <Link href="/centro-provas/classificacao" style={{ display:"block", textDecoration:"none", padding:"14px 18px", marginBottom:14, borderRadius:12, background:"linear-gradient(135deg, rgba(234,179,8,0.15), rgba(34,197,94,0.15))", border:`1px solid ${T.gold}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <b style={{ color:T.gold, fontSize:15 }}>🏆 Novo: Classificação de Pombos por Quilometragem</b>
          <div style={{ fontSize:12, color:T.white, marginTop:3 }}>Calcule o coeficiente técnico de aptidão e veja qual pombo encestar na próxima prova →</div>
        </div>
        <span style={{ fontSize:22 }}>➔</span>
      </div>
    </Link>
    <div style={{ padding:"10px 13px", marginBottom:12, borderRadius:9, color:T.blue, background:`${T.blue}12`, border:`1px solid ${T.blue}44`, fontSize:11 }}>ℹ️ O índice é uma estimativa de manejo e consistência. Não representa probabilidade estatística nem garante resultado.</div>
    <section style={{ padding:20, marginBottom:14, textAlign:"center", borderRadius:14, background:`${corIndice}10`, border:`2px solid ${corIndice}55` }}><small style={{ color:corIndice, fontWeight:800, letterSpacing:2 }}>ÍNDICE ESTIMADO DE PREPARAÇÃO</small><div style={{ fontSize:56, lineHeight:1, fontWeight:900, color:corIndice, marginTop:7 }}>{ready ? dados.indice : "—"}%</div><div style={{ marginTop:8, fontWeight:800 }}>{dados.indice >= 70 ? "🏆 Boa preparação registrada" : dados.indice >= 50 ? "✅ Condição intermediária" : "⚠️ Registros indicam atenção"}</div><div style={{ height:10, marginTop:12, borderRadius:6, background:"#ffffff14", overflow:"hidden" }}><div style={{ width:`${dados.indice}%`, height:"100%", borderRadius:6, background:corIndice }}/></div></section>
    <div className="performance-stats" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>{[["🏆","Vitórias",String(vitorias)],["🥇","Pódios",String(podios)],["⚡","Vel. média",velMed?`${velMed}m/min`:"—"]].map(([e,l,v])=><Stat key={l} emoji={e} label={l} value={v}/>)}</div>
    <section style={T.card}><Title>📊 Índices Detalhados</Title>{indices.map(i=><div key={i.label} style={{ marginBottom:15 }}><div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"center" }}><div><b>{i.label}</b><div style={T.small}>{i.description}</div></div><strong style={{ color:i.color, fontSize:25 }}>{i.value}%</strong></div><div style={{ height:8, marginTop:5, borderRadius:5, background:"#ffffff14", overflow:"hidden" }}><div style={{ width:`${i.value}%`, height:"100%", borderRadius:5, background:i.color }}/></div></div>)}</section>
    {dados.ultimas.length > 0 && <section style={T.card}><Title>📈 Últimas Provas</Title>{[...dados.ultimas].reverse().map((p,i)=>{const cor=p.colocacao===1?T.gold:p.colocacao<=3?T.green:T.blue;return <div key={p.id || i} style={{ marginBottom:11 }}><div style={{ display:"flex", justifyContent:"space-between", gap:10, fontSize:12 }}><span style={{ color:T.dim }}>{(p.competicao || p.prova || "Prova").slice(0,30)}</span><b style={{ color:cor }}>{p.colocacao}º — {p.velocidade}m/min</b></div><div style={{ height:5, marginTop:4, borderRadius:3, background:"#ffffff14" }}><div style={{ height:"100%", width:`${Math.max(5,100-p.colocacao*10)}%`, background:cor }}/></div></div>})}</section>}
    <section style={T.card}><Title>💡 Recomendações</Title>{!provas.length&&<Item color="#FBBF24">Registre resultados no Histórico de Provas para melhorar o índice físico.</Item>}{!treinos.length&&<Item color={T.orange}>Ainda não há registros de treino; o índice usa valor neutro.</Item>}{!estoque.length&&<Item color={T.orange}>Ainda não há estoque registrado; a nutrição usa valor neutro.</Item>}{dados.fisica<70&&provas.length>0&&<Item color={T.orange}>Resultados recentes abaixo da meta — revise treino e recuperação.</Item>}{dados.nutricao<60&&estoque.length>0&&<Item color={T.red}>Estoque abaixo da necessidade estimada para 30 dias.</Item>}{dados.indice>=70&&<Item color={T.green}>Mantenha o protocolo e continue registrando dados consistentes.</Item>}<Item color={T.dim}>Avalie cada ave individualmente e procure orientação veterinária quando necessário.</Item></section>
  </div><style jsx global>{`button{font-family:inherit}@media(max-width:520px){.performance-stats{grid-template-columns:repeat(3,1fr)!important}}`}</style></main>
}
function Stat({emoji,label,value}:{emoji:string;label:string;value:string}){return <div style={{ ...T.card, margin:0, padding:11, textAlign:"center" }}><div style={{fontSize:20}}>{emoji}</div><div style={T.small}>{label}</div><b style={{color:T.gold,fontSize:17}}>{value}</b></div>}
function Title({children}:{children:React.ReactNode}){return <div style={{fontSize:13,fontWeight:800,color:T.gold,marginBottom:13}}>{children}</div>}
function Item({color,children}:{color:string;children:React.ReactNode}){return <div style={{padding:"7px 0",fontSize:12,color,borderBottom:`1px solid ${T.border}`}}>• {children}</div>}
