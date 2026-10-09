"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * 🎬 MODO DEMONSTRAÇÃO — a vitrine de vendas do app.
 * Preenche a conta com um plantel FICTÍCIO de 3 gerações (8 pombos com pedigree),
 * histórico de provas e dados nos módulos (diário, caixa, manejo, estoque, peso,
 * compradores) — tudo marcado com 🎬. Um toque em "limpar" remove tudo.
 * Perfeito pra MOSTRAR o app pro candidato a comprador sem expor seus pombos.
 */

/* ---------- chaves das gavetas (iguais às páginas dos módulos) ---------- */
const K = {
  diario: "nutripombos-diario-v1",
  caixa: "nutripombos-caixa-v1",
  manejo: "nutripombos-manejo-v1",
  estoque: "nutripombos-estoque-v1",
  peso: "nutripombos-peso-v1",
  historico: "nutripombos-historico-provas-v1",
  compradores: "nutripombos-compradores-v1",
};

function ler(chave: string): any[] {
  try { const d = JSON.parse(localStorage.getItem(chave) || "[]"); return Array.isArray(d) ? d : []; } catch { return []; }
}
function gravar(chave: string, v: unknown[]) {
  try { localStorage.setItem(chave, JSON.stringify(v)); } catch { /* cheio */ }
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const hoje = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const diasAtras = (n: number) => new Date(Date.now() - n * 86_400_000).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

/* ---------- o plantel fictício (3 gerações de pedigree) ---------- */
const FICTICIO: { anilha: string; nome: string; sexo: "macho" | "femea"; cor: string; nasc: string; pais?: [number, number]; obs: string }[] = [
  { anilha: "DEMO-1001/21", nome: "Bituca do Sul", sexo: "macho", cor: "Azul xadrez", nasc: "2021-05-10", obs: "🎬 Reprodutor cabeça do plantel demo — avô do campeão." },
  { anilha: "DEMO-1002/21", nome: "Safira Real", sexo: "femea", cor: "Vermelho barra", nasc: "2021-06-02", obs: "🎬 Matriz demo — avó do campeão." },
  { anilha: "DEMO-2001/22", nome: "Trovão Azul", sexo: "macho", cor: "Azul barra", nasc: "2022-04-18", pais: [0, 1], obs: "🎬 O CAMPEÃO demo: 1º lugar fundo 640km." },
  { anilha: "DEMO-2002/22", nome: "Estrela Dourada", sexo: "femea", cor: "Palha barra", nasc: "2022-05-30", obs: "🎬 Matriz demo — mãe da geração 2024." },
  { anilha: "DEMO-2003/22", nome: "Raio de Prata", sexo: "macho", cor: "Prata xadrez", nasc: "2022-06-11", pais: [0, 1], obs: "🎬 Meio-irmão do campeão (mesmos pais)." },
  { anilha: "DEMO-3001/24", nome: "Faísca Jr", sexo: "macho", cor: "Azul escama", nasc: "2024-03-14", pais: [2, 3], obs: "🎬 Filho do campeão — herdeiro do plantel demo." },
  { anilha: "DEMO-3002/24", nome: "Lua Cheia", sexo: "femea", cor: "Vermelho xadrez", nasc: "2024-03-14", pais: [2, 3], obs: "🎬 Filha do campeão." },
  { anilha: "DEMO-3003/25", nome: "Netuno", sexo: "macho", cor: "Azul barra", nasc: "2025-04-20", pais: [4, 6], obs: "🎬 Neto — 3ª geração com pedigree completo." },
];

export default function ModoDemonstracao() {
  const [ocupado, setOcupado] = useState(false);
  const [msg, setMsg] = useState("");
  const [temDemo, setTemDemo] = useState(false);

  useEffect(() => {
    fetch("/api/pombos")
      .then(async (r) => (r.ok ? r.json() : []))
      .then((d) => setTemDemo(Array.isArray(d) && d.some((p: { anilha: string }) => p.anilha.startsWith("DEMO-"))))
      .catch(() => setTemDemo(false));
  }, []);

  async function preencher() {
    setOcupado(true);
    setMsg("⏳ Criando o plantel demo...");
    try {
      // 1) pombos (na ordem, com pedigree encadeado)
      const ids: number[] = [];
      for (const f of FICTICIO) {
        const r = await fetch("/api/pombos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            anilha: f.anilha, nome: f.nome, sexo: f.sexo, cor: f.cor,
            dataNascimento: f.nasc,
            paiId: f.pais ? ids[f.pais[0]] : null,
            maeId: f.pais ? ids[f.pais[1]] : null,
            observacoes: f.obs, status: "ativo",
          }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          setMsg("⚠️ " + (j.error || "falha ao criar pombo demo"));
          setOcupado(false);
          return;
        }
        ids.push((await r.json()).id);
      }

      // 2) módulos locais — entradas marcadas com 🎬
      const di = ler(K.diario);
      gravar(K.diario, [
        { id: uid(), data: diasAtras(1), cat: "treino", pomboId: ids[2], pomboNome: "Trovão Azul", texto: "🎬 Treino 80km Pirassununga, chegou 1º em 1h02 — asas duras, olho brilhando." },
        { id: uid(), data: diasAtras(3), cat: "manejo", texto: "🎬 Sanitização completa do pombal, água trocada 2x." },
        { id: uid(), data: diasAtras(6), cat: "saude", pomboId: ids[5], pomboNome: "Faísca Jr", texto: "🎬 Checked-up de rotina, tudo limpo." },
        ...di,
      ]);

      const cx = ler(K.caixa);
      gravar(K.caixa, [
        { id: uid(), data: diasAtras(2), tipo: "gasto", cat: "Ração", valor: 168, desc: "🎬 2 sacos ração prova 40kg" },
        { id: uid(), data: diasAtras(2), tipo: "gasto", cat: "Anilhas / federação", valor: 95, desc: "🎬 Anilhas 2026" },
        { id: uid(), data: diasAtras(15), tipo: "ganho", cat: "Venda de pombo", valor: 900, desc: "🎬 Venda do filhote do Trovão" },
        ...cx,
      ]);

      const mj = ler(K.manejo);
      gravar(K.manejo, [
        { id: uid(), nome: "🎬 Vermífugo demo", periodicidadeDias: 90, proximaData: diasAtras(-4), obs: "Demonstração do avisinho das 06h30", ativo: true },
        ...mj,
      ]);

      const es = ler(K.estoque);
      gravar(K.estoque, [
        { id: uid(), nome: "🎬 Ração de prova demo", unidade: "saco", qtd: 1, consumoSemana: 0.5 },
        { id: uid(), nome: "🎬 Grit demo", unidade: "kg", qtd: 3, consumoSemana: 1 },
        ...es,
      ]);

      const ps = ler(K.peso);
      gravar(K.peso, [
        { id: uid(), pomboId: ids[2], data: diasAtras(21), peso: 438, forma: 3, obs: "🎬" },
        { id: uid(), pomboId: ids[2], data: diasAtras(14), peso: 431, forma: 4, obs: "🎬" },
        { id: uid(), pomboId: ids[2], data: diasAtras(7), peso: 427, forma: 5, obs: "🎬" },
        { id: uid(), pomboId: ids[2], data: diasAtras(1), peso: 425, forma: 5, obs: "🎬 ponto de prova" },
        ...ps,
      ]);

      const hi = ler(K.historico);
      gravar(K.historico, [
        { id: uid(), data: diasAtras(60), prova: "Fundo Demo 640km", distancia: 640, colocacao: 1, velocidade: 1180, observacoes: "🎬 Vitória do Trovão Azul!", pomboId: String(ids[2]) },
        { id: uid(), data: diasAtras(90), prova: "Meio fundo Demo 420km", distancia: 420, colocacao: 3, velocidade: 1240, observacoes: "🎬", pomboId: String(ids[2]) },
        { id: uid(), data: diasAtras(120), prova: "Velocidade Demo 220km", distancia: 220, colocacao: 7, velocidade: 1310, observacoes: "🎬", pomboId: String(ids[4]) },
        { id: uid(), data: diasAtras(30), prova: "Fundo Demo 560km", distancia: 560, colocacao: 2, velocidade: 1150, observacoes: "🎬 estreia do Faísca Jr", pomboId: String(ids[5]) },
        ...hi,
      ]);

      const cp = ler(K.compradores);
      gravar(K.compradores, [
        { id: uid(), nome: "🎬 Seu Zé de Franca", zap: "5516999990000", cidade: "Franca/SP", anilhas: "DEMO-3003/25", obs: "🎬 Interessado no Netuno", ultimoContato: diasAtras(5), proximoContato: diasAtras(-3) },
        ...cp,
      ]);

      setTemDemo(true);
      setMsg("✅ Demonstração pronta! 8 pombos com pedigree de 3 gerações + histórico e módulos preenchidos.");
    } catch {
      setMsg("⚠️ Erro de conexão — tente de novo.");
    }
    setOcupado(false);
  }

  async function limpar() {
    setOcupado(true);
    setMsg("⏳ Limpando a demonstração...");
    try {
      const r = await fetch("/api/pombos");
      const lista: { id: number; anilha: string }[] = (await r.json()) || [];
      for (const p of lista.filter((x) => x.anilha.startsWith("DEMO-"))) {
        await fetch(`/api/pombos?id=${p.id}`, { method: "DELETE" });
      }
      // remove as entradas 🎬 das gavetas
      gravar(K.diario, ler(K.diario).filter((x: { texto?: string }) => !String(x.texto || "").includes("🎬")));
      gravar(K.caixa, ler(K.caixa).filter((x: { desc?: string }) => !String(x.desc || "").includes("🎬")));
      gravar(K.manejo, ler(K.manejo).filter((x: { nome?: string }) => !String(x.nome || "").includes("🎬")));
      gravar(K.estoque, ler(K.estoque).filter((x: { nome?: string }) => !String(x.nome || "").includes("🎬")));
      gravar(K.peso, ler(K.peso).filter((x: { obs?: string }) => !String(x.obs || "").includes("🎬")));
      gravar(K.historico, ler(K.historico).filter((x: { observacoes?: string }) => !String(x.observacoes || "").includes("🎬")));
      gravar(K.compradores, ler(K.compradores).filter((x: { nome?: string }) => !String(x.nome || "").includes("🎬")));
      setTemDemo(false);
      setMsg("✅ Demonstração removida — seus dados reais continuam intactos.");
    } catch {
      setMsg("⚠️ Erro na limpeza — tente de novo.");
    }
    setOcupado(false);
  }

  const btn = { ...T.btn, marginTop: 8 };

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🎬 Modo Demonstração</h1>
            <p style={{ ...T.small, marginTop: 4 }}>A vitrine de vendas do app: preenche a conta com um plantel <b>fictício</b> (8 pombos, 3 gerações de pedigree, histórico e módulos) pra você MOSTRAR o app pro candidato a comprador — sem expor seus pombos de verdade.</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={{ ...T.card, borderColor: `${T.gold}55` }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 8 }}>🚀 Como usar na hora da venda</div>
          <div style={{ ...T.small, fontSize: 12, lineHeight: 1.8, color: T.dim }}>
            1️⃣ Toque em <b style={{ color: T.white }}>"Preencher demonstração"</b> antes de encontrar o cliente<br />
            2️⃣ Mostre o app: <b>Pombos</b> (pedigree do "Trovão Azul"), <b>Casamenteiro</b>, <b>Linhagens</b>, <b>Peso e Forma</b>, <b>Olho com mira</b> (cadastre a foto do olho dele!), <b>Rota da prova com clima</b>, <b>Ficha de venda com QR</b>...<br />
            3️⃣ Fechou a demonstração? Toque em <b style={{ color: T.white }}>"Limpar demonstração"</b> — tudo que tem 🎬 sai, seus dados reais nem mexem
          </div>
        </section>

        <section style={{ ...T.card, marginTop: 12 }}>
          <button onClick={preencher} disabled={ocupado} style={{ ...btn, opacity: ocupado ? 0.5 : 1 }}>
            {ocupado ? "⏳ Aguarde..." : "🎬 Preencher demonstração (8 pombos + dados)"}
          </button>
          {temDemo && (
            <button onClick={limpar} disabled={ocupado} style={{ ...btn, background: "#EF4444", borderColor: "#EF4444" }}>
              🧹 Limpar demonstração (remove só o que tem 🎬)
            </button>
          )}
          {msg && <div style={{ ...T.small, fontSize: 12, marginTop: 10, color: msg.startsWith("✅") ? T.green : msg.startsWith("⏳") ? T.gold : T.orange, lineHeight: 1.6 }}>{msg}</div>}
        </section>

        <section style={{ ...T.card, marginTop: 12, ...T.small, fontSize: 11, lineHeight: 1.7, color: T.dim }}>
          ℹ️ Os pombos demo nascem com anilha <b>DEMO-</b> e as anotações com marca <b>🎬</b> — é assim que a limpeza sabe o que remover. O plantel fictício usa nomes como "Trovão Azul" só pra contar uma história bonita de 3 gerações; a estrutura (pais, avós, resultados) é o que faz o pedigree, o casamenteiro e as linhagens brilharem na demonstração.
        </section>
      </div>
    </main>
  );
}
