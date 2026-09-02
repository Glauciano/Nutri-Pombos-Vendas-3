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
  // 📥 importador de resultado oficial
  const [impTexto, setImpTexto] = useState("");
  const [impAberto, setImpAberto] = useState(false);
  const [impMsg, setImpMsg] = useState("");
  const [impData, setImpData] = useState(new Date().toISOString().slice(0, 10));
  const [impKm, setImpKm] = useState(300);

  useEffect(() => {
    setProvas(loadHistorico());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(HIST_KEY, JSON.stringify(provas));
  }, [provas, ready]);

  // 📥 extrai anilha + hora do texto do resultado oficial; cria registros
  const importar = () => {
    const linhasValidas: Form[] = [];
    let coloc = 1;
    const distancia = impKm || 300;
    const [hh0, mm0] = ["07", "00"];
    const soltaMin = Number(hh0) * 60 + Number(mm0);
    impTexto.split(/\n/).forEach((linha) => {
      const anilha = linha.match(/([A-Z]{2,4}[-\s]?\d{2,4}[-\s]?\d{3,6})/i);
      const hora = linha.match(/(\d{1,2}[:h](\d{2}))(?::(\d{2}))?/);
      if (!anilha) return;
      let velocidade = 1200;
      if (hora) {
        const H = Number(hora[1].replace("h", ":").split(":")[0]);
        const M = Number(hora[2]);
        const min = H * 60 + M - soltaMin;
        if (min > 10) velocidade = Math.round((distancia * 1000) / min);
      }
      linhasValidas.push({
        data: impData, competicao: `Importado ${new Date(impData).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`,
        distancia, colocacao: coloc++, velocidade, observacoes: `anilha ${anilha[1]}${hora ? ` • chegada ${hora[1]}` : ""} (importado)`,
      });
    });
    if (!linhasValidas.length) { setImpMsg("⚠️ Não achei anilhas no texto — cole o resultado do clube (com anilha e hora)."); return; }
    const novos = linhasValidas.map((f) => ({ ...f, id: crypto.randomUUID(), competicao: f.competicao || "", prova: f.competicao || "", observacoes: f.observacoes || "" } as ProvaHistorico));
    setProvas((atuais) => [...novos, ...atuais]);
    setImpMsg(`✅ ${novos.length} registro(s) importado(s)!`);
    setImpTexto("");
  };

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
            <button type="button" onClick={() => setImpAberto((v) => !v)} style={{ ...T.btnGhost, marginTop: 8 }}>📥 Importar resultado do clube</button>
            {impAberto && (
              <section style={{ ...T.card, marginTop: 10, borderColor: `${T.gold}55`, background: `${T.gold}0d` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.gold, marginBottom: 8 }}>📥 Importar resultado oficial</div>
                <div style={{ ...T.small, fontSize: 11, marginBottom: 8, lineHeight: 1.5 }}>Cole o resultado do site do clube/FBPU (linhas com <b>anilha</b> e <b>hora de chegada</b>). O app cria os registros sozinho — velocidade calculada da distância × hora (solta padrão 07:00, ajuste depois se precisar).</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                  <div><label style={T.label}>Data da prova</label><input type="date" value={impData} onChange={(e) => setImpData(e.target.value)} style={T.input} /></div>
                  <div><label style={T.label}>Distância (km)</label><input type="number" value={impKm} onChange={(e) => setImpKm(Number(e.target.value))} style={T.input} /></div>
                </div>
                <textarea value={impTexto} onChange={(e) => setImpTexto(e.target.value)} placeholder={"1º  BRP-2024-1234  10:42:15\n2º  BRP-2024-0987  10:51:03\n..."} style={{ ...T.input, minHeight: 110, fontFamily: "monospace", fontSize: 12 }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button type="button" onClick={importar} style={{ ...T.btn, flex: 1 }}>📥 Importar</button>
                  <button type="button" onClick={() => { setImpAberto(false); setImpMsg(""); }} style={T.btnGhost}>Fechar</button>
                </div>
                {impMsg && <div style={{ ...T.small, fontSize: 12, marginTop: 8, color: impMsg.startsWith("✅") ? T.green : T.orange }}>{impMsg}</div>}
              </section>
            )}
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
