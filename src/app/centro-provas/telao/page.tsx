"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { classificarProva, loadCalendario, type ProvaCalendario } from "../data/calendario";
import { T } from "../theme";
import { ClimaPonto, KpReal, buscarClimaPonto, buscarKpNoaa, faseLua, getPombal, wmoInfo } from "../lib/apis-gratis";

type Slide = 0 | 1 | 2 | 3;

export default function ModoTelao() {
  const [agora, setAgora] = useState(new Date());
  const [slide, setSlide] = useState<Slide>(0);
  const [proxima, setProxima] = useState<ProvaCalendario | null>(null);
  const [proximas, setProximas] = useState<ProvaCalendario[]>([]);
  const [clima, setClima] = useState<ClimaPonto | null>(null);
  const [kp, setKp] = useState<KpReal | null>(null);
  const [nomePombal, setNomePombal] = useState("Pombal");

  // relógio + troca de slides
  useEffect(() => {
    const t = window.setInterval(() => setAgora(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => {
    const t = window.setInterval(() => setSlide((s) => (((s + 1) % 4) as Slide)), 9000);
    return () => window.clearInterval(t);
  }, []);

  // dados: carrega, escuta mudanças do calendário (sync/edição) e renova clima/kp a cada 5 min
  useEffect(() => {
    let vivo = true;
    const carregar = () => {
      const p = getPombal();
      if (vivo) setNomePombal(p.nome === "Pombal (sua base)" ? "Pombal" : p.nome);
      const lista = loadCalendario().filter((x) => !x.cancelada);
      const hoje = new Date().toISOString().slice(0, 10);
      if (vivo) {
        setProximas(lista.filter((x) => x.dataSolta >= hoje).slice(0, 4));
        setProxima(lista.find((x) => x.dataSolta >= hoje) || lista[lista.length - 1] || null);
      }
      buscarClimaPonto(p.lat, p.lon).then((c) => { if (vivo) setClima(c); }).catch(() => {});
      buscarKpNoaa().then((k) => { if (vivo) setKp(k); });
    };
    carregar();
    window.addEventListener("nutripombos:calendario", carregar);
    window.addEventListener("nutripombos:pombal", carregar);
    const ciclo = window.setInterval(carregar, 5 * 60 * 1000);
    return () => { vivo = false; window.clearInterval(ciclo); window.removeEventListener("nutripombos:calendario", carregar); window.removeEventListener("nutripombos:pombal", carregar); };
  }, []);

  const hoje = new Date().toISOString().slice(0, 10);
  const temFutura = proximas.length > 0;
  const dif = proxima ? new Date(`${proxima.dataSolta}T06:30:00`).getTime() - agora.getTime() : 0;
  const passou = proxima ? new Date(`${proxima.dataSolta}T23:59`).getTime() < agora.getTime() : false;
  const hojeEProva = !!(proxima && proxima.dataSolta === hoje);
  const dias = Math.max(0, Math.floor(dif / 86400000));
  const horas = Math.max(0, Math.floor((dif % 86400000) / 3600000));
  const min = Math.max(0, Math.floor((dif % 3600000) / 60000));
  const seg = Math.max(0, Math.floor((dif % 60000) / 1000));
  const c = proxima ? classificarProva(proxima.km) : null;
  const lua = faseLua(hoje);
  const wi = clima ? wmoInfo(clima.wmo) : null;

  const Num = ({ v, l }: { v: number; l: string }) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "min(18vw, 120px)", fontWeight: 900, color: T.gold, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{String(v).padStart(2, "0")}</div>
      <div style={{ fontSize: "min(3.4vw, 22px)", color: T.dim, fontWeight: 800, letterSpacing: 2 }}>{l}</div>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "16px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: "min(3vw, 20px)", fontWeight: 900 }}>🕊️ <span style={{ color: T.gold }}>NUTRI POMBOS</span> — {nomePombal}</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: "min(3vw, 19px)", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{agora.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}</div>
          <div style={{ fontSize: "min(3.6vw, 24px)", fontWeight: 900, color: T.gold, fontVariantNumeric: "tabular-nums" }}>{agora.toLocaleTimeString("pt-BR")}</div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, padding: "8px 0" }}>
        {/* SLIDE 0 — contagem regressiva / aviso de calendário */}
        {slide === 0 && (
          temFutura && proxima && c ? (
            <div style={{ width: "100%", textAlign: "center" }}>
              <div style={{ fontSize: "min(4vw, 26px)", color: hojeEProva ? T.gold : T.dim, fontWeight: 800 }}>{hojeEProva ? "🏁 É HOJE!" : "PRÓXIMA PROVA"}</div>
              <div style={{ fontSize: "min(8vw, 54px)", fontWeight: 900, margin: "6px 0 2px" }}>
                #{proxima.num} {proxima.cidade} <span style={{ color: T.dim }}>- {proxima.estado}</span>
              </div>
              <div style={{ fontSize: "min(4vw, 24px)", color: c.cor, fontWeight: 800, marginBottom: 14 }}>
                {c.emoji} {c.tipo} • {proxima.km}km • solta {proxima.diaSolta} {proxima.dataSolta.split("-").reverse().slice(0, 2).join("/")}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "min(6vw, 48px)", flexWrap: "wrap" }}>
                <Num v={dias} l="DIAS" />
                <Num v={horas} l="HORAS" />
                <Num v={min} l="MIN" />
                <Num v={seg} l="SEG" />
              </div>
            </div>
          ) : (
            <div style={{ width: "100%", textAlign: "center" }}>
              <div style={{ fontSize: "min(10vw, 72px)", lineHeight: 1 }}>📅</div>
              <div style={{ fontSize: "min(5vw, 34px)", fontWeight: 900, margin: "12px 0 6px" }}>
                {passou && proxima ? `Última prova: #${proxima.num} ${proxima.cidade}` : "Nenhuma prova futura no calendário"}
              </div>
              <div style={{ fontSize: "min(3.4vw, 22px)", color: T.dim, fontWeight: 700, lineHeight: 1.6 }}>
                {passou && proxima ? `Realizada em ${proxima.dataSolta.split("-").reverse().slice(0, 2).join("/")} — aguardando a próxima temporada` : "Cadastre as provas no 📅 Calendário (ou faça login com a mesma conta pra sincronizar)"}
              </div>
            </div>
          )
        )}

        {/* SLIDE 1 — clima agora no pombal */}
        {slide === 1 && (
          clima && wi ? (
            <div style={{ width: "100%", textAlign: "center" }}>
              <div style={{ fontSize: "min(4vw, 26px)", color: T.dim, fontWeight: 800 }}>🌡️ AGORA NO {nomePombal.toUpperCase()}</div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "min(6vw, 48px)", flexWrap: "wrap", margin: "12px 0" }}>
                <div style={{ fontSize: "min(20vw, 130px)", lineHeight: 1 }}>{wi.emoji}</div>
                <div>
                  <div style={{ fontSize: "min(22vw, 150px)", fontWeight: 900, color: T.gold, lineHeight: 1 }}>{clima.temp}°</div>
                  <div style={{ fontSize: "min(4vw, 24px)", color: T.dim, fontWeight: 800 }}>{wi.desc}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "min(5vw, 40px)", flexWrap: "wrap", fontSize: "min(3.6vw, 22px)", fontWeight: 800 }}>
                <span>💨 {clima.ventoKmh} km/h</span>
                <span>🌧️ {clima.chuvaMm} mm</span>
                <span>💧 {clima.umidade}%</span>
                <span>🧭 {clima.pressaoMsl > 0 ? `${clima.pressaoMsl} hPa` : "—"}</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "min(8vw, 56px)" }}>🌡️</div>
              <div style={{ fontSize: "min(3.4vw, 22px)", color: T.dim, fontWeight: 800, marginTop: 10 }}>Conectando ao clima do pombal...</div>
            </div>
          )
        )}

        {/* SLIDE 2 — Kp + lua */}
        {slide === 2 && (
          <div style={{ width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "min(4vw, 26px)", color: T.dim, fontWeight: 800 }}>🧲 CONDIÇÕES DE NAVEGAÇÃO</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "min(8vw, 70px)", alignItems: "center", flexWrap: "wrap", margin: "18px 0" }}>
              <div>
                <div style={{ fontSize: "min(3vw, 18px)", color: T.dim, fontWeight: 800 }}>KP GEOMAGNÉTICO (NOAA)</div>
                <div style={{ fontSize: "min(16vw, 100px)", fontWeight: 900, lineHeight: 1, color: kp ? (kp.kp >= 5 ? T.red : kp.kp >= 3 ? "#fbbf24" : T.green) : T.dim }}>{kp ? kp.kp.toFixed(1) : "—"}</div>
                <div style={{ fontSize: "min(3.2vw, 20px)", fontWeight: 800, color: kp ? (kp.kp >= 5 ? T.red : kp.kp >= 3 ? "#fbbf24" : T.green) : T.dim }}>
                  {kp ? (kp.kp <= 2 ? "CALMO ✅" : kp.kp <= 4 ? "INSTÁVEL ⚠️" : "TEMPESTADE 🚨") : "sem dados"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "min(3vw, 18px)", color: T.dim, fontWeight: 800 }}>FASE DA LUA</div>
                <div style={{ fontSize: "min(16vw, 100px)", lineHeight: 1.1 }}>{lua.emoji}</div>
                <div style={{ fontSize: "min(3.2vw, 20px)", fontWeight: 800, color: T.gold }}>{lua.fase} · {lua.iluminacao}%</div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3 — próximas provas da temporada */}
        {slide === 3 && (
          <div style={{ width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "min(4vw, 26px)", color: T.dim, fontWeight: 800 }}>📅 PRÓXIMAS PROVAS DA TEMPORADA</div>
            {proximas.length === 0 && <div style={{ fontSize: "min(5vw, 32px)", fontWeight: 900, marginTop: 20 }}>Sem provas futuras — cadastre no 📅 Calendário</div>}
            {proximas.map((p, i) => {
              const cc = classificarProva(p.km);
              const d = Math.max(0, Math.ceil((new Date(p.dataSolta + "T00:00:00").getTime() - new Date(new Date().toISOString().slice(0, 10) + "T00:00:00").getTime()) / 86400000));
              return (
                <div key={p.id} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "min(4vw, 32px)", margin: "min(1.6vw, 12px) 0", flexWrap: "wrap" }}>
                  <div style={{ minWidth: "min(8vw, 64px)", fontSize: "min(5.5vw, 36px)", fontWeight: 900, color: i === 0 ? T.gold : T.dim }}>{i === 0 ? "➡️" : i + 1 + "."}</div>
                  <div style={{ fontSize: "min(5.5vw, 36px)", fontWeight: 900 }}>#{p.num} {p.cidade}</div>
                  <div style={{ fontSize: "min(3.2vw, 20px)", color: cc.cor, fontWeight: 800 }}>{cc.emoji} {p.km}km</div>
                  <div style={{ fontSize: "min(3.2vw, 20px)", color: T.dim, fontWeight: 800 }}>{p.dataSolta.split("-").reverse().slice(0, 2).join("/")}</div>
                  <div style={{ fontSize: "min(4.5vw, 30px)", fontWeight: 900, color: d <= 7 ? T.gold : T.dim }}>{d === 0 ? "HOJE!" : d === 1 ? "amanhã" : `${d}d`}</div>
                </div>
              );
            })}
            <div style={{ fontSize: "min(2.6vw, 15px)", color: T.dim, marginTop: 10 }}>🕊️ Nutri Pombos · dados: Open-Meteo + NOAA</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 7 }}>
          {([0, 1, 2, 3] as Slide[]).map((i) => (
            <button key={i} onClick={() => setSlide(i)} type="button" aria-label={`slide ${i + 1}`} style={{ width: slide === i ? 26 : 10, height: 10, borderRadius: 5, background: slide === i ? T.gold : T.border, border: 0, cursor: "pointer", transition: "width .3s" }} />
          ))}
        </div>
        <Link href="/centro-provas" style={{ ...T.small, textDecoration: "none" }}>sair do telão ←</Link>
      </div>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", border: `2px solid ${T.gold}22`, margin: 6, borderRadius: 18 }} />
    </main>
  );
}
