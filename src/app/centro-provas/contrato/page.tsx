"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { T } from "../theme";

/**
 * 🧾 Contrato de Compra e Venda de Pombo-Correio — gera e imprime.
 * Gaveta "nutripombos-contrato-v1" guarda os últimos dados (preenche na próxima).
 * Aviso: modelo simples departicular → para negócios grandes, advogado.
 */
const KEY = "nutripombos-contrato-v1";

type Pombo = { id: number; anilha: string; nome: string | null; sexo: string; cor: string | null; dataNascimento: string | null; paiId: number | null; maeId: number | null };

type Dados = {
  vNome: string; vCpf: string; vCidade: string; vFone: string;
  cNome: string; cCpf: string; cCidade: string; cFone: string;
  anilha: string; pNome: string; pSexo: string; pCor: string; pNasc: string;
  preco: string; pagamento: string; garantias: string;
  cidadeAssinatura: string; dataAssinatura: string;
};

const GARANTIAS_PADRAO = "I) O VENDEDOR declara que o pombo está saudável no ato da entrega, livre de doenças aparentes;\nII) A linhagem (pedigree) informada é verdadeira conforme os registros do criadouro;\nIII) O pombo é entregue com anilha original e inalterada;\nIV) Não há garantia de desempenho em provas futuras, por se tratar de ser vivo e de resultado dependente de manejo.";

const hojeBR = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

const inicial = (): Dados => ({
  vNome: "", vCpf: "", vCidade: "", vFone: "",
  cNome: "", cCpf: "", cCidade: "", cFone: "",
  anilha: "", pNome: "", pSexo: "", pCor: "", pNasc: "",
  preco: "", pagamento: "à vista", garantias: GARANTIAS_PADRAO,
  cidadeAssinatura: "", dataAssinatura: hojeBR(),
});

function carregar(): Dados {
  try { return { ...inicial(), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return inicial(); }
}

export default function ContratoVenda() {
  const [dados, setDados] = useState<Dados>(inicial());
  const [pombos, setPombos] = useState<Pombo[]>([]);
  const [gerado, setGerado] = useState(false);
  const [ok, setOk] = useState("");

  useEffect(() => {
    setDados(carregar());
    fetch("/api/pombos")
      .then(async (r) => (r.ok ? r.json() : []))
      .then((d) => setPombos(Array.isArray(d) ? d : []))
      .catch(() => setPombos([]));
  }, []);

  const set = (k: keyof Dados, v: string) => setDados((d) => ({ ...d, [k]: v }));

  function escolherPombo(anilha: string) {
    const p = pombos.find((x) => x.anilha === anilha);
    if (p) {
      setDados((d) => ({
        ...d,
        anilha: p.anilha,
        pNome: p.nome || "",
        pSexo: p.sexo === "macho" ? "Macho" : "Fêmea",
        pCor: p.cor || "",
        pNasc: p.dataNascimento ? new Date(p.dataNascimento).toLocaleDateString("pt-BR") : "",
      }));
    } else {
      set("anilha", anilha);
    }
  }

  function gerar() {
    if (!dados.vNome.trim() || !dados.cNome.trim() || !dados.anilha.trim()) {
      setOk("⚠️ Preencha pelo menos: vendedor, comprador e a anilha.");
      return;
    }
    try { localStorage.setItem(KEY, JSON.stringify(dados)); } catch { /* cheio */ }
    setGerado(true);
    setOk("✅ Contrato gerado lá embaixo — revise e imprima!");
    window.setTimeout(() => { setOk(""); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }, 300);
  }

  const input = { ...T.btnGhost, padding: "10px 12px", textAlign: "left" as const, fontWeight: 600, fontSize: 12.5, width: "100%" };
  const lbl = { ...T.small, fontSize: 10, marginBottom: 4, color: T.dim };

  const fmtPreco = (() => {
    const v = parseFloat(dados.preco.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(v) ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "____";
  })();

  return (
    <main style={{ minHeight: "100vh", background: T.bg, color: T.white, padding: "20px 16px 60px" }}>
      <style>{`@media print { .nao-imprimir { display: none !important; } body { background: #fff !important; } }`}</style>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div className="nao-imprimir" style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={T.h1}>🧾 Contrato de Venda</h1>
            <p style={{ ...T.small, marginTop: 4 }}>Contrato de compra e venda de pombo-correio, pronto pra preencher, revisar e imprimir — vendedor e comprador assinam com testemunhas.</p>
          </div>
          <Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link>
        </div>

        <section className="nao-imprimir" style={{ ...T.card, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 10 }}>✍️ Preencher</div>

          <div style={{ fontSize: 11.5, fontWeight: 800, color: T.blue, margin: "6px 0 8px" }}>👤 VENDEDOR</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 12 }}>
            <input value={dados.vNome} onChange={(e) => set("vNome", e.target.value)} placeholder="Nome completo" style={input} />
            <input value={dados.vCpf} onChange={(e) => set("vCpf", e.target.value)} placeholder="CPF" style={input} />
            <input value={dados.vCidade} onChange={(e) => set("vCidade", e.target.value)} placeholder="Cidade/UF" style={input} />
            <input value={dados.vFone} onChange={(e) => set("vFone", e.target.value)} placeholder="WhatsApp/telefone" style={input} />
          </div>

          <div style={{ fontSize: 11.5, fontWeight: 800, color: "#ff8fa3", margin: "6px 0 8px" }}>👥 COMPRADOR</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 12 }}>
            <input value={dados.cNome} onChange={(e) => set("cNome", e.target.value)} placeholder="Nome completo" style={input} />
            <input value={dados.cCpf} onChange={(e) => set("cCpf", e.target.value)} placeholder="CPF" style={input} />
            <input value={dados.cCidade} onChange={(e) => set("cCidade", e.target.value)} placeholder="Cidade/UF" style={input} />
            <input value={dados.cFone} onChange={(e) => set("cFone", e.target.value)} placeholder="WhatsApp/telefone" style={input} />
          </div>

          <div style={{ fontSize: 11.5, fontWeight: 800, color: T.gold, margin: "6px 0 8px" }}>🐦 O POMBO {pombos.length > 0 && <span style={{ fontWeight: 600, color: T.dim2 }}>(escolha do plantel preenche sozinho)</span>}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 12 }}>
            {pombos.length > 0 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <select value={dados.anilha} onChange={(e) => escolherPombo(e.target.value)} style={input}>
                  <option value="">— escolher do plantel —</option>
                  {pombos.map((p) => <option key={p.id} value={p.anilha}>{p.nome || p.anilha} — {p.anilha}</option>)}
                </select>
              </div>
            )}
            <input value={dados.anilha} onChange={(e) => set("anilha", e.target.value)} placeholder="Anilha (ex: 1234567/26)" style={input} />
            <input value={dados.pNome} onChange={(e) => set("pNome", e.target.value)} placeholder="Nome" style={input} />
            <input value={dados.pSexo} onChange={(e) => set("pSexo", e.target.value)} placeholder="Sexo" style={input} />
            <input value={dados.pCor} onChange={(e) => set("pCor", e.target.value)} placeholder="Cor" style={input} />
            <input value={dados.pNasc} onChange={(e) => set("pNasc", e.target.value)} placeholder="Nascimento" style={input} />
          </div>

          <div style={{ fontSize: 11.5, fontWeight: 800, color: T.green, margin: "6px 0 8px" }}>💰 NEGÓCIO</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 12 }}>
            <input value={dados.preco} onChange={(e) => set("preco", e.target.value)} placeholder="Preço (ex: 1.500,00)" style={input} />
            <input value={dados.pagamento} onChange={(e) => set("pagamento", e.target.value)} placeholder="Pagamento (à vista, 2x...)" style={input} />
            <input value={dados.cidadeAssinatura} onChange={(e) => set("cidadeAssinatura", e.target.value)} placeholder="Cidade da assinatura" style={input} />
            <input type="date" value={dados.dataAssinatura} onChange={(e) => set("dataAssinatura", e.target.value)} style={input} />
          </div>
          <div style={lbl}>🛡️ Garantias e declarações (podem ser editadas)</div>
          <textarea value={dados.garantias} onChange={(e) => set("garantias", e.target.value)} rows={6} style={{ ...input, resize: "vertical", lineHeight: 1.7 }} />

          <button onClick={gerar} style={{ ...T.btn, marginTop: 12 }}>🧾 Gerar contrato</button>
          {ok && <div style={{ ...T.small, fontSize: 11.5, marginTop: 8, color: ok.startsWith("✅") ? T.green : T.orange }}>{ok}</div>}
          <div style={{ ...T.small, fontSize: 10, marginTop: 10, color: T.dim2, lineHeight: 1.6 }}>
            ⚖️ Modelo simples entre particulares. Pra vendas de valor alto ou negócios formais, vale revisar com um advogado — e registrar em cartório se quiser força extra.
          </div>
        </section>

        {/* CONTRATO GERADO */}
        {gerado && (
          <section style={{ ...T.card, background: "#fff", color: "#1b283c", borderColor: `${T.gold}66` }}>
            <div className="nao-imprimir" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <b style={{ fontSize: 13, color: "#8a6a00" }}>Pré-visualização do contrato</b>
              <button onClick={() => window.print()} style={{ padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 900, fontSize: 12.5, background: "#f7bd00", color: "#0b1426", border: "1px solid #ca8a04" }}>🖨️ Imprimir / salvar PDF</button>
            </div>

            <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: 1.9, fontSize: 13.5 }}>
              <div style={{ textAlign: "center", fontWeight: 900, fontSize: 15, letterSpacing: 0.5 }}>CONTRATO DE COMPRA E VENDA DE POMBO-CORREIO</div>
              <div style={{ textAlign: "center", fontSize: 11, color: "#5a6b82", marginBottom: 16 }}>
                {dados.cidadeAssinatura || "___________"} — {dados.dataAssinatura ? dados.dataAssinatura.split("-").reverse().join("/") : "___/___/____"}
              </div>

              <p style={{ textAlign: "justify" }}>
                <b>VENDEDOR:</b> {dados.vNome || "___________"}{dados.vCpf ? `, CPF ${dados.vCpf}` : ""}{dados.vCidade ? `, residente em ${dados.vCidade}` : ""}{dados.vFone ? `, contato ${dados.vFone}` : ""}.
                <br />
                <b>COMPRADOR:</b> {dados.cNome || "___________"}{dados.cCpf ? `, CPF ${dados.cCpf}` : ""}{dados.cCidade ? `, residente em ${dados.cCidade}` : ""}{dados.cFone ? `, contato ${dados.cFone}` : ""}.
              </p>

              <p style={{ textAlign: "justify" }}>
                As partes acima qualificadas têm entre si, justo e contratado, a compra e venda do pombo-correio abaixo descrito, mediante as cláusulas e condições seguintes:
              </p>

              <p style={{ textAlign: "justify" }}>
                <b>CLÁUSULA 1ª — DO OBJETO.</b> O presente contrato tem como objeto o pombo-correio de anilha <b style={{ fontFamily: "monospace" }}>{dados.anilha || "___________"}</b>
                {dados.pNome ? `, de nome "${dados.pNome}"` : ""}
                {dados.pSexo ? `, sexo ${dados.pSexo.toLowerCase()}` : ""}
                {dados.pCor ? `, cor ${dados.pCor.toLowerCase()}` : ""}
                {dados.pNasc ? `, nascido em ${dados.pNasc}` : ""}.
              </p>

              <p style={{ textAlign: "justify" }}>
                <b>CLÁUSULA 2ª — DO PREÇO.</b> O preço ajustado é de <b>{fmtPreco}</b>{dados.pagamento ? `, pago ${dados.pagamento.toLowerCase()}` : ""}, plenamente aceito pelas partes.
              </p>

              <p style={{ textAlign: "justify" }}>
                <b>CLÁUSULA 3ª — DA ENTREGA.</b> A entrega do pombo será feita pessoalmente ao COMPRADOR, que o recebe por sua conta e risco, dando plena e geral quitação ao VENDEDOR pelo recebimento do animal.
              </p>

              <p style={{ textAlign: "justify" }}>
                <b>CLÁUSULA 4ª — DAS GARANTIAS E DECLARAÇÕES.</b>
              </p>
              <div style={{ whiteSpace: "pre-wrap", textAlign: "justify", paddingLeft: 12 }}>{dados.garantias}</div>

              <p style={{ textAlign: "justify" }}>
                <b>CLÁUSULA 5ª — DO ACORDO.</b> E por estarem justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor, na presença das testemunhas abaixo.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 48, fontSize: 12.5 }}>
                <div style={{ borderTop: "1px solid #1b283c", paddingTop: 6, textAlign: "center" }}>
                  <b>{dados.vNome || "____________________"}</b>
                  <div style={{ fontSize: 10.5, color: "#5a6b82" }}>VENDEDOR</div>
                </div>
                <div style={{ borderTop: "1px solid #1b283c", paddingTop: 6, textAlign: "center" }}>
                  <b>{dados.cNome || "____________________"}</b>
                  <div style={{ fontSize: 10.5, color: "#5a6b82" }}>COMPRADOR</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 36, fontSize: 12.5 }}>
                <div style={{ borderTop: "1px solid #1b283c", paddingTop: 6, textAlign: "center" }}>
                  <b>____________________</b>
                  <div style={{ fontSize: 10.5, color: "#5a6b82" }}>TESTEMUNHA 1</div>
                </div>
                <div style={{ borderTop: "1px solid #1b283c", paddingTop: 6, textAlign: "center" }}>
                  <b>____________________</b>
                  <div style={{ fontSize: 10.5, color: "#5a6b82" }}>TESTEMUNHA 2</div>
                </div>
              </div>

              <div style={{ textAlign: "center", fontSize: 9.5, color: "#8494ab", marginTop: 24 }}>
                Gerado pelo app Nutri Pombos — Centro de Provas do columófilo
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
