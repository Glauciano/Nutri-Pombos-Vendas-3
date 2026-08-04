"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

export default function GestaoCustos() {
  const [pombos, setPombos] = useState<number>(30);
  const [consumoG, setConsumoG] = useState<number>(35);
  const [precoKgRacao, setPrecoKgRacao] = useState<number>(6.80);
  const [custoMensalSuplementos, setCustoMensalSuplementos] = useState<number>(120.00);
  const [custoAnilhaFed, setCustoAnilhaFed] = useState<number>(5.50);
  const [inscrProvaPorAve, setInscrProvaPorAve] = useState<number>(12.00);
  const [provasAno, setProvasAno] = useState<number>(8);

  const calc = useMemo(() => {
    // 1. Ração
    const kgDiaPlantel = (pombos * consumoG) / 1000;
    const kgMesPlantel = kgDiaPlantel * 30;
    const kgAnoPlantel = kgDiaPlantel * 365;
    const custoRacaoMes = kgMesPlantel * precoKgRacao;
    const custoRacaoAno = kgAnoPlantel * precoKgRacao;

    // 2. Suplementos
    const custoSuplAno = custoMensalSuplementos * 12;

    // 3. Anilhas e Inscrições
    const custoAnilhasTotal = pombos * custoAnilhaFed;
    const custoProvasTotal = pombos * inscrProvaPorAve * provasAno;

    // 4. Totais
    const custoTotalAno = custoRacaoAno + custoSuplAno + custoAnilhasTotal + custoProvasTotal;
    const custoTotalMes = custoTotalAno / 12;
    const custoPorPomboAno = custoTotalAno / Math.max(1, pombos);
    const custoPorPomboMes = custoPorPomboAno / 12;
    const custoPorPomboDia = custoPorPomboAno / 365;

    return {
      kgMesPlantel,
      kgAnoPlantel,
      custoRacaoMes,
      custoRacaoAno,
      custoSuplAno,
      custoAnilhasTotal,
      custoProvasTotal,
      custoTotalAno,
      custoTotalMes,
      custoPorPomboAno,
      custoPorPomboMes,
      custoPorPomboDia,
    };
  }, [pombos, consumoG, precoKgRacao, custoMensalSuplementos, custoAnilhaFed, inscrProvaPorAve, provasAno]);

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>💸 Gestão Financeira & Custo por Pombo</h1>
            <p style={{ ...T.small, marginTop: 4 }}>
              Calcule o custo exato de manutenção do seu plantel, nutrição, inscrições e valor do atleta
            </p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>
            ← Centro
          </Link>
        </div>

        <section style={T.card}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 14 }}>
            ⚙️ Parâmetros de Custo do Pombal
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={T.label}>🐦 Quantidade de Aves no Plantel</label>
              <input
                type="number"
                min={1}
                value={pombos}
                onChange={(e) => setPombos(Math.max(1, Number(e.target.value)))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>
            <div>
              <label style={T.label}>🌾 Consumo de Ração (g/ave/dia)</label>
              <input
                type="number"
                min={15}
                value={consumoG}
                onChange={(e) => setConsumoG(Math.max(10, Number(e.target.value)))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>
            <div>
              <label style={T.label}>💰 Preço da Ração (R$ / kg)</label>
              <input
                type="number"
                step="0.10"
                min={1}
                value={precoKgRacao}
                onChange={(e) => setPrecoKgRacao(Math.max(0.5, Number(e.target.value)))}
                style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <div>
              <label style={T.label}>💊 Suplementação / Mês (R$)</label>
              <input
                type="number"
                min={0}
                value={custoMensalSuplementos}
                onChange={(e) => setCustoMensalSuplementos(Math.max(0, Number(e.target.value)))}
                style={T.input}
              />
            </div>
            <div>
              <label style={T.label}>🏷️ Custo Anilha Oficial (R$/ave)</label>
              <input
                type="number"
                step="0.50"
                min={0}
                value={custoAnilhaFed}
                onChange={(e) => setCustoAnilhaFed(Math.max(0, Number(e.target.value)))}
                style={T.input}
              />
            </div>
            <div>
              <label style={T.label}>🏁 Inscrição Média / Prova (R$)</label>
              <input
                type="number"
                step="1.00"
                min={0}
                value={inscrProvaPorAve}
                onChange={(e) => setInscrProvaPorAve(Math.max(0, Number(e.target.value)))}
                style={T.input}
              />
            </div>
          </div>
        </section>

        <section
          style={{
            ...T.card,
            border: `2px solid ${T.green}`,
            background: `${T.green}0f`,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.green, textTransform: "uppercase" }}>
                CUSTO TOTAL ANUAL DO PLANTEL ({pombos} AVES)
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: T.white, marginTop: 4 }}>
                R$ {calc.custoTotalAno.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 12, color: T.dim }}>
                Média de R$ {calc.custoTotalMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / mês
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: T.gold }}>
                R$ {calc.custoPorPomboAno.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 11, color: T.dim }}>Custo anual por pombo</div>
              <div style={{ fontSize: 11, color: T.green, fontWeight: 800 }}>
                ~R$ {calc.custoPorPomboDia.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / dia
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
              📊 Detalhamento de Despesas do Plantel
            </div>
            <div style={{ fontSize: 13, lineHeight: 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${T.border}` }}>
                <span>🌾 Ração Anual ({Math.round(calc.kgAnoPlantel)} kg):</span>
                <b>R$ {calc.custoRacaoAno.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${T.border}` }}>
                <span>💊 Suplementos & Remédios:</span>
                <b>R$ {calc.custoSuplAno.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${T.border}` }}>
                <span>🏷️ Anilhas Federativas:</span>
                <b>R$ {calc.custoAnilhasTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${T.border}` }}>
                <span>🏁 Inscrições em {provasAno} Provas:</span>
                <b>R$ {calc.custoProvasTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</b>
              </div>
            </div>
          </section>

          <section style={T.card}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>
              💡 Análise de Investimento Esportivo (ROI)
            </div>
            <p style={{ fontSize: 12, color: T.dim, lineHeight: 1.7, margin: 0 }}>
              Saber que cada atleta custa em média <b style={{ color: T.gold }}>R$ {calc.custoPorPomboAno.toFixed(2)}</b> por temporada permite avaliar quais aves justificam a renovação no plantel titular ou merecem migrar para a reprodução.
              <br /><br />
              Pombos com premiação em provas ou valorização em leilões pagam o custo de 5 a 10 aves irmãs no pombal!
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
