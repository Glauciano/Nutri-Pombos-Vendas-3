"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

export default function SobreOApp() {
  const [versao] = useState("4.0");
  useEffect(() => { /* montagem */ }, []);
  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>⚖️ Sobre o Nutri Pombos</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Centro de Provas — versão {versao}</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 8 }}>🕊️ O que é</div>
          <div style={{ ...T.small, fontSize: 12, lineHeight: 1.8 }}>
            O <b>Nutri Pombos — Centro de Provas</b> é um sistema de gestão para columófilos: planeja a prova (rota cidade a cidade, clima, vento, janela de soltura), acompanha o dia de corrida (radar de chuva, alarme de chegada, bússola), cuida da nutrição (misturas semanais, mix energético, suplementação) e registra a temporada (histórico, ranking, crônicas, gráficos, relatórios).
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 8 }}>📡 Fontes de dados (todas gratuitas)</div>
          {([
            ["🌡️ Open-Meteo", "Clima atual e previsão, pressão, vento, nascer/pôr do sol, altimetria e qualidade do ar — open-meteo.com", "https://open-meteo.com"],
            ["🧲 NOAA / SWPC", "Índice geomagnético Kp em tempo real (EUA) — swpc.noaa.gov", "https://www.swpc.noaa.gov"],
            ["🌧️ RainViewer", "Radar de chuva em tempo real — rainviewer.com", "https://www.rainviewer.com"],
            ["🛰️ NASA GIBS", "Imagens de satélite GOES-East (nuvens reais) — earthdata.nasa.gov", "https://gibs.earthdata.nasa.gov"],
            ["🗺️ Esri / OpenStreetMap", "Mapas base e imagens de satélite — esri.com · openstreetmap.org", "https://www.openstreetmap.org"],
          ] as const).map(([n, d, u]) => (
            <div key={n} style={{ padding: "9px 12px", borderRadius: 9, background: "#ffffff08", marginBottom: 6, fontSize: 12, lineHeight: 1.6 }}>
              <b>{n}</b> — {d} · <a href={u} target="_blank" rel="noreferrer" style={{ color: T.blue }}>site ↗</a>
            </div>
          ))}
        </section>

        <section style={{ ...T.card, borderColor: "#f9731655", background: "#f973160d" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.orange, marginBottom: 8 }}>⚠️ Avisos importantes</div>
          <div style={{ ...T.small, fontSize: 12, lineHeight: 1.9 }}>
            • <b>Previsões não são garantia.</b> Clima, vento, Kp e radar são estimativas de fontes públicas; condições reais podem mudar. A decisão de soltar/encestar é sempre sua, de acordo com o regulamento do seu clube e federação.<br />
            • <b>Saúde e medicação:</b> protocolos de suplementação e tratamentos são referências de manejo — consulte um médico veterinário antes de medicar. Creatina e beta-alanina no mix devem ser validadas por profissional.<br />
            • <b>Eye-sign:</b> conteúdo histórico/cultural da columofilia apresentado com contexto científico — é mais uma ferramenta de seleção, nunca o veredito.<br />
            • <b>Índices do app</b> (score, IDP, risco de extravio, linha do tempo) são <b>estimativas calculadas</b> com pesos configuráveis — úteis pra decisão, não verdades absolutas.
          </div>
        </section>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 8 }}>🔒 Privacidade</div>
          <div style={{ ...T.small, fontSize: 12, lineHeight: 1.8 }}>
            Seus dados de uso (calendário, histórico, configurações) ficam salvos <b>no seu aparelho</b> e, se ativar a sincronização, no <b>seu banco de dados</b> — nada é vendido nem compartilhado. Fotos dos pombos ficam somente no aparelho. Backup e restauração são feitos por você, quando quiser.
          </div>
        </section>

        <section style={{ ...T.card, textAlign: "center" }}>
          <div style={{ fontSize: 34 }}>🕊️</div>
          <b style={{ fontSize: 15 }}>Nutri Pombos</b>
          <div style={{ ...T.small, fontSize: 11, marginTop: 6 }}>
            Feito com carrego pro esporte columófilo · Next.js · dados abertos · sem custo de API<br />
            "Bons voos e sempre na taça!" 🏆
          </div>
        </section>
      </div>
    </main>
  );
}
