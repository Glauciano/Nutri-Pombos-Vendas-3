"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadCalendario, type ProvaCalendario } from "../data/calendario";
import { T } from "../theme";
import {
  COORDS, POMBAL_BASE, ClimaPassado,
  buscarClimaPassado, bearingRota, direcaoCardeal, ventoNaRota, wmoInfo,
  aplicarPombalSalvo, getPombal,
} from "../lib/apis-gratis";

const HIST_KEY = "nutripombos-historico-provas-v1";

type ProvaHistorico = {
  id?: string;
  data: string;
  competicao?: string;
  prova?: string;
  distancia: number;
  colocacao: number;
  velocidade: number;
  observacoes?: string;
};

type Linha = {
  hist: ProvaHistorico;
  prova?: ProvaCalendario;
  clima?: ClimaPassado;
  vento?: { tipo: string; emoji: string; cor: string };
  erro?: string;
};

export default function ClimaDesempenho() {
  const [hist, setHist] = useState<ProvaHistorico[]>([]);
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [analisando, setAnalisando] = useState(false);

  useEffect(() => {
    try { setHist(JSON.parse(localStorage.getItem(HIST_KEY) || "[]")); } catch { setHist([]); }
  }, []);


  useEffect(() => { aplicarPombalSalvo(); }, []);

  const analisar = async () => {
    setAnalisando(true);
    const base = getPombal();
    const calendario = loadCalendario();
    const semDuplicado = hist.filter((h, i, a) => a.findIndex((x) => x.data === h.data && x.distancia === h.distancia) === i);
    const limite = semDuplicado.slice(0, 25);
    const resultado: Linha[] = await Promise.all(limite.map(async (h): Promise<Linha> => {
      const linha: Linha = { hist: h };
      const porData = calendario.find((p) => p.dataSolta === h.data);
      const porKm = calendario.find((p) => Math.abs(p.km - h.distancia) <= 25);
      const prova = porData || porKm;
      if (!prova) return { ...linha, erro: "não bate com nenhuma prova do calendário" };
      linha.prova = prova;
      const coord = prova.latitude != null && prova.longitude != null
        ? { lat: prova.latitude, lon: prova.longitude }
        : COORDS[prova.cidade];
      if (!coord) return { ...linha, erro: "cidade sem coordenadas" };
      try {
        const clima = await buscarClimaPassado(coord.lat, coord.lon, h.data);
        linha.clima = clima;
        linha.vento = ventoNaRota(clima.dirVento, bearingRota(coord.lat, coord.lon, base.lat, base.lon), clima.vento);
      } catch (e) {
        linha.erro = e instanceof Error ? e.message : "falhou";
      }
      return linha;
    }));
    setLinhas(resultado);
    setAnalisando(false);
  };

  const ok = (linhas || []).filter((l) => l.clima && l.vento);
  const media = (grupo: typeof ok) => (grupo.length ? Math.round(grupo.reduce((s, l) => s + l.hist.velocidade, 0) / grupo.length) : null);
  const favor = ok.filter((l) => l.vento!.tipo === "Vento a favor");
  const contra = ok.filter((l) => l.vento!.tipo === "Vento contra");
  const lateral = ok.filter((l) => l.vento!.tipo === "Vento lateral");
  const chuva = ok.filter((l) => l.clima!.chuva > 0.5);
  const seco = ok.filter((l) => l.clima!.chuva <= 0.5);
  const velMax = Math.max(media(favor) || 0, media(contra) || 0, media(lateral) || 0, 1);

  const Barra = ({ label, valor, cor, n }: { label: string; valor: number | null; cor: string; n: number }) => (
    <div style={{ padding: 10, borderRadius: 9, background: "#ffffff08" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <b style={{ color: cor }}>{label}</b>
        <span style={{ color: T.dim, fontSize: 10 }}>{n} prova(s)</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
        <div style={{ height: 6, flex: 1, background: "#ffffff12", borderRadius: 3 }}>
          {valor && <div style={{ height: "100%", width: `${Math.round((valor / velMax) * 100)}%`, background: cor, borderRadius: 3 }} />}
        </div>
        <b style={{ color: cor, fontSize: 13 }}>{valor ? `${valor} m/min` : "—"}</b>
      </div>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>📊 Clima × Desempenho Histórico</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Cruza os resultados que você registrou no Histórico com o clima REAL daquele dia (arquivo ERA5) — descubra com quais condições seus pombos voam melhor
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🔬 Como funciona</div>
          <div style={{ ...T.small, fontSize: 12, lineHeight: 1.7 }}>
            1️⃣ Pega cada prova registrada na página <b>Histórico</b> (data, distância e velocidade)<br />
            2️⃣ Casa com a cidade do calendário e busca o clima real daquele dia (temperatura, chuva, vento e direção — média de 9h às 13h)<br />
            3️⃣ Calcula se o vento daquele dia estava <b style={{ color: T.green }}>a favor</b>, <b style={{ color: "#fbbf24" }}>lateral</b> ou <b style={{ color: T.red }}>contra</b> a rota até o pombal
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button onClick={analisar} disabled={analisando || hist.length === 0} style={{ ...T.btn, opacity: analisando || hist.length === 0 ? 0.5 : 1, flex: 1 }}>
              {analisando ? "⏳ Analisando..." : `🔍 Analisar ${hist.length} prova(s) com clima real`}
            </button>
            <Link href="/centro-provas/historico" style={{ ...T.btnGhost, textDecoration: "none" }}>➕ Registrar resultados</Link>
          </div>
          {hist.length === 0 && (
            <div style={{ ...T.small, marginTop: 10, color: T.orange }}>
              ⚠️ Você ainda não registrou resultados no Histórico. Cadastre suas provas lá primeiro (data, distância e velocidade média).
            </div>
          )}
        </section>

        {ok.length >= 2 && (
          <section style={{ ...T.card, borderColor: `${T.gold}55`, background: `${T.gold}0d` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>🧠 O que os seus dados revelam</div>
            <div style={{ display: "grid", gap: 8 }}>
              <Barra label="🟢 Vento a favor" valor={media(favor)} cor={T.green} n={favor.length} />
              <Barra label="🟡 Vento lateral" valor={media(lateral)} cor="#fbbf24" n={lateral.length} />
              <Barra label="🔴 Vento contra" valor={media(contra)} cor={T.red} n={contra.length} />
              <Barra label="🌧️ Dias com chuva" valor={media(chuva)} cor="#55a3ff" n={chuva.length} />
              <Barra label="☀️ Dias secos" valor={media(seco)} cor={T.gold} n={seco.length} />
            </div>
            {favor.length && contra.length ? (
              <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: "#ffffff0a", fontSize: 12, lineHeight: 1.6 }}>
                💡 Entre {favor.length} prova(s) com vento a favor e {contra.length} com vento contra, a diferença média foi de{" "}
                <b style={{ color: Math.abs((media(favor) || 0) - (media(contra) || 0)) > 60 ? T.red : T.gold }}>
                  {Math.abs((media(favor) || 0) - (media(contra) || 0))} m/min
                </b>
                . {media(favor)! > media(contra)! ? "Seu plantel rende mais com cauda — encestamento extra nos dias de vento sul pode valer a pena." : "Curioso: seu plantel segurou bem mesmo com vento contra."}
              </div>
            ) : null}
          </section>
        )}

        {linhas && (
          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>📋 Provas analisadas</div>
            {linhas.map((l, i) => (
              <div key={`${l.hist.data}-${i}`} style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                  <div>
                    <b style={{ fontSize: 13 }}>
                      {l.hist.data.split("-").reverse().join("/")} · {l.prova ? `${l.prova.cidade} (${l.hist.distancia}km)` : l.hist.competicao || "Prova"}
                    </b>
                    <div style={{ ...T.small, fontSize: 11 }}>
                      {l.hist.colocacao}º lugar · {l.hist.velocidade} m/min
                      {l.clima && ` · ${wmoInfo(l.clima.chuva > 1 ? 63 : 0).emoji} ${l.clima.temp}°C · 💨 ${l.clima.vento}km/h ${direcaoCardeal(l.clima.dirVento)} · 🌧️ ${l.clima.chuva}mm`}
                    </div>
                  </div>
                  {l.vento ? (
                    <span style={{ padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800, color: l.vento.cor, background: `${l.vento.cor}12`, border: `1px solid ${l.vento.cor}55` }}>
                      {l.vento.emoji} {l.vento.tipo}
                    </span>
                  ) : (
                    <span style={{ ...T.small, fontSize: 10, color: T.orange }}>⚠️ {l.erro}</span>
                  )}
                </div>
              </div>
            ))}
            <div style={{ ...T.small, fontSize: 11, marginTop: 10 }}>
              ⚠️ O arquivo climático (ERA5/Open-Meteo) fica pronto com ~5 dias de atraso — provas muito recentes podem aparecer sem clima. Fonte: Open-Meteo Archive (gratuito).
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
