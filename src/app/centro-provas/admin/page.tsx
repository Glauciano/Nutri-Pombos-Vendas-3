"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type Usuario = { id: number; nome: string; email: string; plano: string; acessoAtivo: boolean; acessoAte: string | null; createdAt: string };
type PlantelUser = { id: number; nome: string; email: string; plano: string; acesso_ativo: boolean; pombos: number };
const PLANOS: [string, string][] = [
  ["teste", "🆓 Teste"],
  ["mensal", "💰 Mensal"],
  ["anual", "📅 Anual"],
  ["vitalicio", "🏆 Vitalício"],
  ["admin", "👑 Admin"],
];

export default function PainelAdmin() {
  const [lista, setLista] = useState<Usuario[] | null>(null);
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");
  const [busca, setBusca] = useState("");
  const [planteis, setPlanteis] = useState<PlantelUser[] | null>(null);
  const [meuId, setMeuId] = useState<number>(0);

  const carregarPlanteis = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/planteis");
      if (!r.ok) { setPlanteis(null); return; }
      const j = (await r.json()) as { meuId?: number; usuarios?: PlantelUser[] };
      setMeuId(Number(j.meuId || 0));
      setPlanteis(Array.isArray(j.usuarios) ? j.usuarios : []);
    } catch { setPlanteis(null); }
  }, []);

  const transferir = async (de: PlantelUser, paraId: number) => {
    try {
      const r = await fetch("/api/admin/planteis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ de: de.id, para: paraId }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setMsg("⚠️ " + (j.error || "falhou")); return; }
      setMsg(`✅ Plantel de ${de.nome || de.email} transferido!`);
      window.setTimeout(() => setMsg(""), 3000);
      void carregarPlanteis();
    } catch { setMsg("⚠️ Falha na transferência."); }
  };

  const carregar = useCallback(async () => {
    setErro(""); setMsg("");
    try {
      const r = await fetch("/api/admin/usuarios");
      if (r.status === 403) { setErro("Acesso restrito ao administrador."); setLista([]); return; }
      if (!r.ok) throw new Error();
      setLista(await r.json());
    } catch { setErro("Falha ao carregar usuários."); }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);
  useEffect(() => { void carregarPlanteis(); }, [carregarPlanteis]);

  const atualizar = async (u: Usuario, patch: Record<string, unknown>, texto: string) => {
    try {
      const r = await fetch("/api/admin/usuarios", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: u.id, ...patch }) });
      if (!r.ok) { const j = await r.json(); setMsg("⚠️ " + (j.error || "falhou")); return; }
      setMsg("✅ " + texto);
      window.setTimeout(() => setMsg(""), 2500);
      void carregar();
    } catch { setMsg("⚠️ Falha na atualização."); }
  };

  const filtrados = (lista || []).filter((u) => (u.nome + u.email).toLowerCase().includes(busca.toLowerCase()));
  const contagem = (lista || []).reduce<Record<string, number>>((acc, u) => { acc[u.plano] = (acc[u.plano] || 0) + 1; return acc; }, {});

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>👑 Painel do Administrador</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Usuários, planos e acessos — a gestão do seu negócio sem tocar em SQL</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        {erro && <section style={{ ...T.card, borderColor: `${T.red}55`, background: `${T.red}0d` }}><b style={{ color: T.red }}>🚫 {erro}</b><div style={{ ...T.small, marginTop: 6 }}>Para virar admin: rode no Neon (SQL Editor): <code style={{ color: T.blue }}>UPDATE usuarios SET plano=&apos;admin&apos; WHERE email=&apos;seu@email.com&apos;;</code></div></section>}

        {lista === null && !erro && <section style={T.card}>⏳ Carregando usuários...</section>}

        {lista !== null && (
          <>
            <section style={{ ...T.card, borderColor: `${T.gold}55`, background: `${T.gold}0d` }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
                <div style={{ padding: 10, borderRadius: 9, background: "#ffffff08", textAlign: "center" }}><div style={{ ...T.small, fontSize: 10 }}>👥 TOTAL</div><b style={{ fontSize: 18, color: T.gold }}>{lista.length}</b></div>
                {PLANOS.map(([p, lbl]) => (
                  <div key={p} style={{ padding: 10, borderRadius: 9, background: "#ffffff08", textAlign: "center" }}>
                    <div style={{ ...T.small, fontSize: 10 }}>{lbl}</div>
                    <b style={{ fontSize: 16, color: p === "admin" ? "#f7bd00" : p === "teste" ? "#9aa8bc" : "#39e58c" }}>{contagem[p] || 0}</b>
                  </div>
                ))}
              </div>
            </section>

            <section style={T.card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>👥 Usuários ({filtrados.length})</div>
                <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="🔎 buscar nome/email" style={{ ...T.input, width: "auto", minHeight: 34, padding: "5px 10px", fontSize: 12 }} />
              </div>

              {filtrados.map((u) => {
                const vencido = u.acessoAte && new Date(u.acessoAte) < new Date() && u.plano !== "vitalicio" && u.plano !== "admin";
                return (
                  <div key={u.id} style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <b style={{ fontSize: 13 }}>{u.nome} {u.plano === "admin" && "👑"}</b>
                        <div style={{ ...T.small, fontSize: 11 }}>
                          {u.email} · desde {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                          {u.acessoAte ? ` · válido até ${new Date(u.acessoAte).toLocaleDateString("pt-BR")}` : ""}
                          {!u.acessoAtivo ? " · 🚫 SUSPENSO" : vencido ? " · ⏰ VENCIDO" : ""}
                        </div>
                      </div>
                      <span style={{ padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 800, color: u.plano === "admin" ? "#f7bd00" : u.plano === "teste" ? "#9aa8bc" : "#39e58c", background: u.plano === "admin" ? "#f7bd0015" : u.plano === "teste" ? "#9aa8bc15" : "#39e58c15", border: `1px solid ${u.plano === "admin" ? "#f7bd0055" : u.plano === "teste" ? "#9aa8bc55" : "#39e58c55"}` }}>
                        {PLANOS.find(([p]) => p === u.plano)?.[1] || u.plano}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
                      {PLANOS.filter(([p]) => p !== u.plano).map(([p, lbl]) => (
                        <button key={p} type="button" onClick={() => atualizar(u, { plano: p }, `${u.nome} agora é ${lbl}`)} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 10.5, fontWeight: 700, cursor: "pointer", color: T.dim, background: "#0b1529", border: `1px solid ${T.border}` }}>
                          {lbl}
                        </button>
                      ))}
                      <button type="button" onClick={() => atualizar(u, { acessoAtivo: !u.acessoAtivo }, u.acessoAtivo ? `${u.nome} suspenso` : `${u.nome} reativado`)} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 10.5, fontWeight: 700, cursor: "pointer", color: u.acessoAtivo ? T.red : T.green, background: "#0b1529", border: `1px solid ${T.border}` }}>
                        {u.acessoAtivo ? "🚫 Suspender" : "✅ Reativar"}
                      </button>
                      <button type="button" onClick={() => atualizar(u, { plano: "mensal", dias: 30 }, `${u.nome}: mensal +30 dias`)} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 10.5, fontWeight: 700, cursor: "pointer", color: T.gold, background: "#0b1529", border: `1px solid ${T.border}` }}>
                        +30 dias
                      </button>
                      <button type="button" onClick={() => atualizar(u, { plano: "anual", dias: 365 }, `${u.nome}: anual +365 dias`)} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 10.5, fontWeight: 700, cursor: "pointer", color: T.gold, background: "#0b1529", border: `1px solid ${T.border}` }}>
                        +365 dias
                      </button>
                    </div>
                  </div>
                );
              })}
              {filtrados.length === 0 && <div style={{ ...T.small, textAlign: "center", padding: 20 }}>Nenhum usuário encontrado.</div>}
            </section>

            {msg && <div style={{ ...T.card, color: msg.startsWith("✅") ? T.green : T.red, fontSize: 13 }}>{msg}</div>}

            {/* 🐦 PLANTÉIS — quem tem quantos pombos + transferir pra você */}
            <section style={T.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>🐦 Plantéis por usuário</div>
                <button type="button" onClick={() => void carregarPlanteis()} style={{ ...T.btnGhost, padding: "5px 12px", fontSize: 11, fontWeight: 700 }}>🔄 atualizar</button>
              </div>
              {planteis === null && <div style={{ ...T.small, fontSize: 12 }}>⏳ Carregando plantéis...</div>}
              {planteis !== null && (
                <div style={{ display: "grid", gap: 6 }}>
                  {planteis.map((p) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, background: "#ffffff08", flexWrap: "wrap" }}>
                      <div style={{ fontSize: 12.5 }}>
                        <b>{p.nome}</b> <span style={{ color: T.dim, fontSize: 11 }}>({p.email})</span>
                        {p.plano === "admin" && <span style={{ marginLeft: 6 }}>👑</span>}
                        {!p.acesso_ativo && <span style={{ marginLeft: 6, fontSize: 10, color: T.red, fontWeight: 800 }}>suspenso</span>}
                        {p.id === meuId && <span style={{ marginLeft: 6, fontSize: 10, color: T.green, fontWeight: 800 }}>você</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <b style={{ fontSize: 14, color: p.pombos > 0 ? T.gold : T.dim }}>{p.pombos} 🐦</b>
                        {p.pombos > 0 && p.id !== meuId && (
                          <button type="button" onClick={() => transferir(p, meuId)} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 10.5, fontWeight: 700, cursor: "pointer", color: T.gold, background: "#0b1529", border: `1px solid ${T.gold}55` }}>
                            ↔️ trazer pra mim
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ ...T.small, fontSize: 10.5, marginTop: 10, color: T.dim2, lineHeight: 1.6 }}>
                ℹ️ Cada usuário enxerga somente o próprio plantel. O botão "trazer pra mim" move o plantel inteiro daquela conta pra você — útil pra resgatar dados de conta antiga.
              </div>
            </section>

            <section style={{ ...T.card, borderColor: "#55a3ff55", background: "#55a3ff0d" }}>
              <div style={{ ...T.small, fontSize: 11.5, lineHeight: 1.7 }}>
                💡 <b>Dica de negócio:</b> quando o cliente pagar (PIX manual, por exemplo), toque em <b>💰 Mensal +30 dias</b> — o acesso dele abre na hora, sem SQL. Pagamento automático via gateway continua pelo webhook configurado na Vercel.
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
