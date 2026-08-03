"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

type ProvaHistorico = {
  id: string;
  data: string;
  competicao?: string;
  prova?: string;
  distancia: number;
  colocacao: number;
  velocidade: number;
  observacoes: string;
  pomboId?: string;
  hora?: string;
};

type Form = {
  data: string;
  competicao: string;
  distancia: number;
  colocacao: number;
  velocidade: number;
  observacoes: string;
};

const HIST_KEY = "nutripombos-historico-provas-v1";
const novoForm = (): Form => ({
  data: new Date().toISOString().slice(0, 10),
  competicao: "",
  distancia: 300,
  colocacao: 1,
  velocidade: 1200,
  observacoes: "",
});

function loadHistorico(): ProvaHistorico[] {
  try {
    const raw = localStorage.getItem(HIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProvaHistorico[];
    return parsed.map((item) => ({ ...item, competicao: item.competicao || item.prova || "Prova sem nome" }));
  } catch {
    return [];
  }
}

export default function Historico() {
  const [provas, setProvas] = useState<ProvaHistorico[]>([]);
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<Form>(novoForm);

  useEffect(() => {
    setProvas(loadHistorico());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(HIST_KEY, JSON.stringify(provas));
  }, [provas, ready]);

  const abrir = (item?: ProvaHistorico) => {
    setForm(item ? {
      data: item.data,
      competicao: item.competicao || item.prova || "",
      distancia: item.distancia,
      colocacao: item.colocacao,
      velocidade: item.velocidade,
      observacoes: item.observacoes || "",
    } : novoForm());
    setEditId(item?.id || null);
    setShow(true);
  };

  const salvar = () => {
    if (!form.competicao.trim()) {
      window.alert("Digite o nome da competição!");
      return;
    }
    if (editId) {
      setProvas((previous) => previous.map((item) => item.id === editId ? { ...item, ...form, prova: form.competicao } : item).sort((a, b) => a.data.localeCompare(b.data)));
    } else {
      setProvas((previous) => [...previous, { id: crypto.randomUUID(), ...form, prova: form.competicao }].sort((a, b) => a.data.localeCompare(b.data)));
    }
    setShow(false);
    setEditId(null);
  };

  const excluir = (id: string) => {
    if (window.confirm("Excluir prova?")) setProvas((previous) => previous.filter((item) => item.id !== id));
  };

  const filtradas = useMemo(() => [...provas].sort((a, b) => b.data.localeCompare(a.data)).filter((item) => {
    const text = `${item.competicao || item.prova || ""} ${item.data} ${item.observacoes || ""}`.toLowerCase();
    return !busca || text.includes(busca.toLowerCase());
  }), [provas, busca]);

  const vitorias = provas.filter((item) => item.colocacao === 1).length;
  const podios = provas.filter((item) => item.colocacao <= 3).length;
  const velMed = provas.length ? Math.round(provas.reduce((sum, item) => sum + item.velocidade, 0) / provas.length) : 0;
  const mediaCol = provas.length ? (provas.reduce((sum, item) => sum + item.colocacao, 0) / provas.length).toFixed(1) : "—";

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "18px 12px 50px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
          <div>
            <Link href="/centro-provas" style={{ ...T.small, textDecoration: "none" }}>← Centro de Provas</Link>
            <h1 style={{ ...T.h1, marginTop: 9 }}>📜 Histórico de Provas</h1>
            <p style={{ ...T.small, marginTop: 4 }}>{provas.length} resultados registrados</p>
          </div>
          <button onClick={() => abrir()} style={T.btnSm}>+ Prova</button>
        </div>

        <div className="history-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { emoji: "🏆", label: "Vitórias", value: vitorias },
            { emoji: "🥇", label: "Pódios", value: podios },
            { emoji: "⚡", label: "Vel. média", value: `${velMed}m/min` },
            { emoji: "📊", label: "Col. média", value: `${mediaCol}º` },
          ].map((stat) => <div key={stat.label} style={{ ...T.card, marginBottom: 0, padding: 12 }}><span style={{ fontSize: 18 }}>{stat.emoji}</span><div style={T.small}>{stat.label}</div><div style={{ fontWeight: 900, fontSize: 20, color: T.gold, marginTop: 2 }}>{stat.value}</div></div>)}
        </div>

        <section style={T.card}>
          <input aria-label="Buscar provas" placeholder="🔍 Buscar por competição, data ou observação..." value={busca} onChange={(event) => setBusca(event.target.value)} style={T.input} />
        </section>

        {show && <FormHistorico form={form} setForm={setForm} editing={!!editId} onCancel={() => { setShow(false); setEditId(null); }} onSave={salvar} />}

        {filtradas.map((item) => {
          const cor = item.colocacao === 1 ? T.gold : item.colocacao <= 3 ? T.green : T.blue;
          const medalha = item.colocacao === 1 ? "🥇" : item.colocacao === 2 ? "🥈" : item.colocacao === 3 ? "🥉" : "";
          return <section key={item.id} style={T.card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {medalha && <span style={{ fontSize: 20 }}>{medalha}</span>}
                  <b style={{ fontSize: 14 }}>{item.competicao || item.prova}</b>
                </div>
                <div style={{ ...T.small, display: "flex", gap: 10, flexWrap: "wrap", marginTop: 5 }}>
                  <span>📅 {item.data}</span><span>📏 {item.distancia}km</span>
                  <span style={{ color: cor, fontWeight: 700 }}>🏆 {item.colocacao}º lugar</span>
                  <span style={{ color: T.green }}>⚡ {item.velocidade}m/min</span>
                  {item.hora && <span>🕐 {item.hora}</span>}
                </div>
                {item.observacoes && <div style={{ ...T.small, marginTop: 5, fontStyle: "italic" }}>{item.observacoes}</div>}
              </div>
              <div style={{ display: "flex", gap: 5 }}><button onClick={() => abrir(item)} style={T.btnGhost}>✏️</button><button onClick={() => excluir(item.id)} style={T.btnDanger}>🗑️</button></div>
            </div>
            <div style={{ height: 4, marginTop: 9, borderRadius: 3, overflow: "hidden", background: "rgba(255,255,255,.08)" }}><div style={{ height: "100%", width: `${Math.max(5, 100 - item.colocacao * 8)}%`, background: cor }} /></div>
          </section>;
        })}

        {ready && !filtradas.length && <div style={{ ...T.small, textAlign: "center", padding: 32, color: T.dim2 }}>{busca ? "Nenhuma prova encontrada" : "Nenhuma prova registrada"}</div>}
      </div>
      <style jsx global>{`button,input,textarea{font-family:inherit}@media(max-width:520px){.history-form-grid{grid-template-columns:1fr!important}}`}</style>
    </main>
  );
}

function FormHistorico({ form, setForm, editing, onCancel, onSave }: { form: Form; setForm: (value: Form) => void; editing: boolean; onCancel: () => void; onSave: () => void }) {
  return <section style={T.card}>
    <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 12 }}>{editing ? "✏️ Editar Prova" : "+ Prova"}</div>
    <Field label="🏆 Competição *"><input value={form.competicao} onChange={(event) => setForm({ ...form, competicao: event.target.value })} placeholder="Ex: Cravinhos SP — Etapa 1" style={T.input} /></Field>
    <Field label="📅 Data"><input type="date" value={form.data} onChange={(event) => setForm({ ...form, data: event.target.value })} style={T.input} /></Field>
    <div className="history-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
      <Field label="📏 Distância"><input type="number" min={1} value={form.distancia} onChange={(event) => setForm({ ...form, distancia: +event.target.value })} style={T.input} /></Field>
      <Field label="🏆 Colocação"><input type="number" min={1} value={form.colocacao} onChange={(event) => setForm({ ...form, colocacao: +event.target.value })} style={T.input} /></Field>
      <Field label="⚡ m/min"><input type="number" min={1} value={form.velocidade} onChange={(event) => setForm({ ...form, velocidade: +event.target.value })} style={T.input} /></Field>
    </div>
    <Field label="📝 Observações"><textarea rows={3} value={form.observacoes} onChange={(event) => setForm({ ...form, observacoes: event.target.value })} style={{ ...T.input, height: 80 }} /></Field>
    <div style={{ display: "flex", gap: 8 }}><button onClick={onCancel} style={{ ...T.btnGhost, flex: 1 }}>Cancelar</button><button onClick={onSave} style={{ ...T.btn, flex: 2 }}>💾 Salvar</button></div>
  </section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={{ display: "block", marginBottom: 11 }}><span style={{ ...T.label, display: "block", marginBottom: 5 }}>{label}</span>{children}</label>;
}
