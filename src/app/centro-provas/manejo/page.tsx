"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * 📅 Lembretes de Manejo — vacinas, vermífugos, sanitização, muda...
 * Guarda na gaveta "nutripombos-manejo-v1" (sincronizada).
 * O robô das 06h30 (/api/push/diario) lê esta gaveta e manda notificação
 * quando um manejo vence HOJE, é AMANHÃ ou está ATRASADO.
 */
const KEY = "nutripombos-manejo-v1";

type Item = { id: string; nome: string; periodicidadeDias: number; proximaData: string; obs?: string; ativo: boolean };

const hojeBR = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

const PRESETS: { nome: string; dias: number; obs: string }[] = [
  { nome: "Vermífugo do plantel", dias: 90, obs: "Dose conforme o guia terapêutico — confirmar com veterinário." },
  { nome: "Sanitização do pombal", dias: 30, obs: "Limpeza geral, água trocada, bandejas e poleiros." },
  { nome: "Banho contra parasitas externos", dias: 60, obs: "Pulgas e ácaros — produto próprio para aves." },
  { nome: "Revisão anual de vacinas", dias: 365, obs: "Paramixo e outros — protocolo do seu veterinário." },
  { nome: "Início da muda (dieta de apoio)", dias: 365, obs: "Aumentar proteína e óleos; conferir calendário nutricional." },
  { nome: "Preparação pré-temporada", dias: 365, obs: "Check-up geral + programa de treinos progressivos." },
];

function carregar(): Item[] {
  try { const d = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(d) ? d : []; } catch { return []; }
}
function salvar(it: Item[]) {
  try { localStorage.setItem(KEY, JSON.stringify(it)); } catch { /* cheio */ }
}

function diasAte(dataISO: string): number {
  const hoje = new Date(hojeBR() + "T12:00:00");
  const alvo = new Date(dataISO + "T12:00:00");
  return Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);
}

export default function LembretesManejo() {
  const [itens, setItens] = useState<Item[]>([]);
  const [nome, setNome] = useState("");
  const [dias, setDias] = useState("30");
  const [proxima, setProxima] = useState(hojeBR());
  const [obs, setObs] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => { setItens(carregar()); }, []);

  function persistir(novos: Item[]) {
    setItens(novos);
    salvar(novos);
  }

  function adicionar(n: string = nome, d: number = parseInt(dias, 10) || 30, p: string = proxima, o: string = obs) {
    if (!n.trim()) { setOk("⚠️ Dê um nome pro manejo (ex: Vermífugo do plantel)."); return; }
    persistir([{ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), nome: n.trim(), periodicidadeDias: d, proximaData: p, obs: o.trim() || undefined, ativo: true }, ...itens]);
    setNome(""); setDias("30"); setObs(""); setProxima(hojeBR());
    setOk("✅ Lembrete criado! O avisinho das 06h30 já sabe dele.");
    window.setTimeout(() => setOk(""), 2500);
  }

  function feitoHoje(item: Item) {
    const prox = new Date();
    prox.setDate(prox.getDate() + item.periodicidadeDias);
    persistir(itens.map((i) => (i.id === item.id ? { ...i, proximaData: prox.toLocaleDateString("en-CA") } : i)));
  }

  function remover(id: string) { persistir(itens.filter((i) => i.id !== id)); }
  function alternar(id: string) { persistir(itens.map((i) => (i.id === id ? { ...i, ativo: !i.ativo } : i))); }

  const ordenados = useMemo(() => [...itens].sort((a, b) => diasAte(a.proximaData) - diasAte(b.proximaData)), [itens]);

  function status(d: number) {
    if (d < 0) return { cor: "#ff5d62", selo: `⚠️ ATRASADO ${Math.abs(d)} dia(s)` };
    if (d === 0) return { cor: "#f7bd00", selo: "🔔 É HOJE!" };
    if (d === 1) return { cor: "#f7bd00", selo: "Amanhã" };
    if (d <= 7) return { cor: "#55a3ff", selo: `Em ${d} dias` };
    return { cor: "#39e58c", selo: `Em ${d} dias` };
  }

  const input = { ...T.btnGhost, padding: "10px 12px", textAlign: "left" as const, fontWeight: 600, fontSize: 12.5, width: "100%" };

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>📅 Lembretes de Manejo</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Vacina vencendo, vermífugo, sanitização, muda... O avisinho das <b>06h30</b> toca a campainha quando chega o dia — e o dia de fazer é o de apertar o botão ✅.</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {/* CRIAR */}
        <section style={{ ...T.card, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>➕ Novo lembrete</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 8 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ ...T.small, fontSize: 10, marginBottom: 4 }}>🏷️ Nome do manejo</div>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="ex: Vermífugo do plantel" style={input} />
            </div>
            <div>
              <div style={{ ...T.small, fontSize: 10, marginBottom: 4 }}>🔄 Repetir a cada (dias)</div>
              <input inputMode="numeric" value={dias} onChange={(e) => setDias(e.target.value)} placeholder="30" style={input} />
            </div>
            <div>
              <div style={{ ...T.small, fontSize: 10, marginBottom: 4 }}>📅 Próxima vez</div>
              <input type="date" value={proxima} onChange={(e) => setProxima(e.target.value)} style={input} />
            </div>
          </div>
          <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Observação (opcional): dose, produto, orientação do veterinário..." style={{ ...input, marginBottom: 10 }} />
          <button onClick={() => adicionar()} style={T.btn}>💾 Criar lembrete</button>
          {ok && <div style={{ ...T.small, fontSize: 11.5, marginTop: 8, color: ok.startsWith("✅") ? T.green : T.orange }}>{ok}</div>}

          <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 14, paddingTop: 12 }}>
            <div style={{ ...T.small, fontSize: 11, fontWeight: 800, marginBottom: 8, color: T.dim }}>⚡ Sugestões prontas (toque pra adicionar):</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PRESETS.map((p) => (
                <button key={p.nome} onClick={() => adicionar(p.nome, p.dias, hojeBR(), p.obs)} style={{ padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontSize: 11, fontWeight: 700, border: `1px solid ${T.border}`, background: T.bgInput, color: T.dim }}>
                  + {p.nome} <span style={{ color: T.dim2 }}>({p.dias}d)</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* LISTA */}
        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🧹 Meus manejos ({ordenados.length})</div>
          {ordenados.length === 0 && <div style={{ ...T.small, fontSize: 12 }}>Nenhum lembrete ainda — comece com uma das sugestões prontas! 👆</div>}
          <div style={{ display: "grid", gap: 8 }}>
            {ordenados.map((i) => {
              const d = diasAte(i.proximaData);
              const s = status(d);
              return (
                <div key={i.id} style={{ padding: 12, borderRadius: 10, background: "#ffffff08", border: `1px solid ${i.ativo ? `${s.cor}55` : T.border}`, opacity: i.ativo ? 1 : 0.55 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div>
                      <b style={{ fontSize: 13.5 }}>{i.nome}</b>
                      <span style={{ marginLeft: 8, padding: "2px 9px", borderRadius: 8, fontSize: 10, fontWeight: 900, color: s.cor, background: `${s.cor}18` }}>{s.selo}</span>
                      <div style={{ ...T.small, fontSize: 10.5, marginTop: 3, color: T.dim }}>
                        Próxima vez: {i.proximaData.split("-").reverse().join("/")} · repete a cada {i.periodicidadeDias} dias
                      </div>
                      {i.obs && <div style={{ ...T.small, fontSize: 10.5, marginTop: 3, color: T.dim2 }}>📝 {i.obs}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => feitoHoje(i)} style={{ padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 800, border: `1px solid ${T.green}66`, background: `${T.green}15`, color: T.green }}>✅ Feito hoje</button>
                      <button onClick={() => alternar(i.id)} title={i.ativo ? "pausar lembrete" : "reativar lembrete"} style={{ ...T.btnGhost, padding: "7px 10px", fontSize: 11 }}>{i.ativo ? "⏸️" : "▶️"}</button>
                      <button onClick={() => remover(i.id)} style={{ ...T.btnGhost, padding: "7px 10px", fontSize: 11, color: T.red, borderColor: `${T.red}44` }}>🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div style={{ ...T.card, marginTop: 14, ...T.small, fontSize: 11, lineHeight: 1.7, color: T.dim }}>
          🔔 <b>Como funciona o avisinho:</b> todo dia às <b>06h30</b> o robô confere esta lista: manejo vencendo <b>hoje</b>, <b>amanhã</b> ou <b>atrasado</b> → notificação push no seu celular (precisa ter ativado as notificações na Configuração, e plano pago ou admin).
          <br />💊 <b>Saúde do plantel:</b> doses e produtos são responsabilidade do seu veterinário — o app avisa a data, o protocolo é sempre profissional. <Link href="/centro-provas/guia-terapeutico" style={{ color: T.blue }}>Ver guia terapêutico →</Link>
        </div>
      </div>
    </main>
  );
}
