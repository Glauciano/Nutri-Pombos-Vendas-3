"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function calcOrtodromica(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371.0; // raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;

  // Azimute
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  let brng = Math.atan2(y, x);
  brng = (brng * 180) / Math.PI;
  brng = (brng + 360) % 360;

  return {
    km: Math.round(km * 1000) / 1000,
    azimute: Math.round(brng * 10) / 10,
  };
}

export default function CalculadoraGeodesica() {
  const [latSolta, setLatSolta] = useState<number>(-21.022); // Jardinópolis SP
  const [lonSolta, setLonSolta] = useState<number>(-47.763);
  const [latPombal, setLatPombal] = useState<number>(-22.564); // Limeira SP
  const [lonPombal, setLonPombal] = useState<number>(-47.401);

  const analise = useMemo(() => {
    const { km, azimute } = calcOrtodromica(latSolta, lonSolta, latPombal, lonPombal);

    let direcaoNome = "Sul";
    if (azimute >= 22.5 && azimute < 67.5) direcaoNome = "Nordeste";
    else if (azimute >= 67.5 && azimute < 112.5) direcaoNome = "Leste";
    else if (azimute >= 112.5 && azimute < 157.5) direcaoNome = "Sudeste";
    else if (azimute >= 157.5 && azimute < 202.5) direcaoNome = "Sul-Sudeste";
    else if (azimute >= 202.5 && azimute < 247.5) direcaoNome = "Sudoeste";
    else if (azimute >= 247.5 && azimute < 292.5) direcaoNome = "Oeste";
    else if (azimute >= 292.5 && azimute < 337.5) direcaoNome = "Noroeste";
    else direcaoNome = "Norte";

    let avisoRelevo = "Trajeto limpo sem grandes variações orográficas";
    let corRelevo = "#22C55E";
    if (km > 400) {
      avisoRelevo =
        "Trajeto longo com provável travessia de serras regionais e corredores de vento térmico. Alerta para neblina matinal.";
      corRelevo = "#EAB308";
    } else if (km > 650) {
      avisoRelevo =
        "ALERTA SEVERO DE RELEVO: Prova de fundo cruzando formações montanhesas e vales fluviais. Alta incidência de aves de rapina (Gaviões).";
      corRelevo = "#F97316";
    }

    return {
      km,
      azimute,
      direcaoNome,
      avisoRelevo,
      corRelevo,
    };
  }, [latSolta, lonSolta, latPombal, lonPombal]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🗺️ Calculadora Geodésica Ortodrômica & Rota</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Distância do grande círculo entre as coordenadas GPS oficiais da soltura e do seu pombal
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 14 }}>
            📍 Coordenadas Geográficas (Latitude & Longitude em Graus Decimais)
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={T.label}>🚀 Latitude da Soltura</label>
              <input
                type="number"
                step="0.001"
                value={latSolta}
                onChange={(e) => setLatSolta(Number(e.target.value))}
                style={T.input}
              />
            </div>
            <div>
              <label style={T.label}>🚀 Longitude da Soltura</label>
              <input
                type="number"
                step="0.001"
                value={lonSolta}
                onChange={(e) => setLonSolta(Number(e.target.value))}
                style={T.input}
              />
            </div>
            <div>
              <label style={T.label}>🏠 Latitude do Pombal</label>
              <input
                type="number"
                step="0.001"
                value={latPombal}
                onChange={(e) => setLatPombal(Number(e.target.value))}
                style={T.input}
              />
            </div>
            <div>
              <label style={T.label}>🏠 Longitude do Pombal</label>
              <input
                type="number"
                step="0.001"
                value={lonPombal}
                onChange={(e) => setLonPombal(Number(e.target.value))}
                style={T.input}
              />
            </div>
          </div>
        </section>

        <section
          style={{
            ...T.card,
            border: `2px solid ${T.gold}`,
            background: "rgba(234,179,8,0.08)",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.gold, textTransform: "uppercase" }}>
                DISTÂNCIA OFICIAL GEODÉSICA DO CONCURSO
              </div>
              <div style={{ fontSize: 40, fontWeight: 900, color: T.white, marginTop: 4 }}>
                {analise.km.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} km
              </div>
              <div style={{ fontSize: 12, color: T.dim }}>Cálculo Ortodrômico de Haversine</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: T.blue }}>
                {analise.azimute}° ({analise.direcaoNome})
              </div>
              <div style={{ fontSize: 11, color: T.dim }}>Azimute inicial de voo</div>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              borderRadius: 10,
              background: `${analise.corRelevo}14`,
              border: `1px solid ${analise.corRelevo}55`,
              fontSize: 13,
            }}
          >
            <b style={{ color: analise.corRelevo }}>Análise de Relevo Geográfico:</b> {analise.avisoRelevo}
          </div>
        </section>
      </div>
    </main>
  );
}
