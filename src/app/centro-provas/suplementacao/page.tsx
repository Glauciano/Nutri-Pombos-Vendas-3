"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadConfig } from "../config";
import { T } from "../theme";

type Categoria = "Velocidade" | "Meio Fundo" | "Fundo";
type Tab = "protocolo" | "produtos" | "calc" | "meus";
type Posologia = { situacao: string; dose: string; freq: string; obs?: string };
type Suplemento = { id:string; nome:string; fabricante:string; emoji:string; cor:string; tipo:string; descricao:string; composicao:string[]; indicacoes:string[]; posologia:Posologia[]; atencao:string[]; custom?:boolean };
const KEY="nutripombos-suplementos-custom-v1";

// ──────────────────────────────────────────────────────────────
//  BASE — 6 produtos conforme bula oficial
// ──────────────────────────────────────────────────────────────
const BASE:Suplemento[]=[

  /* ┌─────────────────────────────────────────────────────────┐
     │  1. BIOXAN COMPOSTO — Vallée                            │
     └─────────────────────────────────────────────────────────┘ */
  {id:"bioxan",nome:"Bioxan Composto",fabricante:"Vallée (MSD)",emoji:"💉",cor:"#3B82F6",
   tipo:"Polivitamínico reconstituinte injetável",
   descricao:"Soro composto à base de vitaminas do complexo B, minerais, dextrose e aminoácidos. Indicado para todas as espécies animais. Atua como hidratante, reconstituinte, energético, antitóxico e polivitamínico.",
   composicao:[
     "Vitamina B1 (Tiamina) — 3 mg/100 mL",
     "Vitamina B2 (Riboflavina 5-fosfato) — 20 mg/100 mL",
     "Vitamina B6 (Piridoxina) — 3 mg/100 mL",
     "Vitamina B12 (Cianocobalamina) — 2.000 mcg/100 mL",
     "Nicotinamida — 240 mg/100 mL",
     "Dextrose anidra — 6.000 mg/100 mL",
     "Cloreto de Sódio — 400 mg/100 mL",
     "Cloreto de Potássio — 50 mg/100 mL",
     "Cloreto de Cálcio diidratado — 39,8 mg/100 mL",
     "Cloreto de Magnésio hexaidratado — 34,2 mg/100 mL",
     "DL-Metionina — 600 mg/100 mL",
     "Cloreto de Colina — 300 mg/100 mL",
   ],
   indicacoes:[
     "Auxiliar no tratamento de doenças e desidratação",
     "Esgotamento por esforço físico ou excesso de produção",
     "Redução de apetite, emagrecimento e anemia",
     "Manutenção do equilíbrio hidroeletrolítico e ácido-básico",
     "Reconstituinte das funções orgânicas, hepática e renal",
   ],
   posologia:[
     {situacao:"Pequenos animais (incl. aves)",dose:"0,5 a 2 mL por via IV, ou 2 a 5 mL por via SC",freq:"3 dias consecutivos, intervalo 24h",obs:"Aplicar lentamente pela via IV. Dose para pombos deve ser ajustada pelo veterinário."},
     {situacao:"Bovinos e equinos adultos",dose:"1.000 a 2.000 mL por via IV",freq:"3 dias consecutivos, intervalo 24h"},
     {situacao:"Bezerros, potros, ovinos, caprinos e suínos",dose:"500 mL por via IV",freq:"3 dias consecutivos, intervalo 24h"},
   ],
   atencao:[
     "⚠️ Produto INJETÁVEL — aplicação exclusiva por profissional habilitado",
     "Podem ocorrer raras reações de hipersensibilidade (hipersalivação, incoordenação motora, edema das mucosas)",
     "Em animais alérgicos, aplicar previamente anti-histamínico ou corticosteroide",
     "Após a abertura do frasco, o restante NÃO utilizado deve ser DESCARTADO",
     "Limpar e desinfetar seringa, agulha e local de aplicação",
     "Outras posologias podem ser adotadas a critério do Médico Veterinário",
   ]},

  /* ┌─────────────────────────────────────────────────────────┐
     │  2. AMINOMIX PET — Vetnil                               │
     └─────────────────────────────────────────────────────────┘ */
  {id:"aminomix",nome:"Aminomix",fabricante:"Vetnil",emoji:"💪",cor:"#22C55E",
   tipo:"Vitamínico, mineral e aminoácido (oral)",
   descricao:"Suplemento de aminoácidos, vitaminas, macro e microminerais para cães, gatos, aves, répteis, mustelídeos e roedores. Contém minerais quelatados (ferro, cobre, zinco, manganês) que melhoram a absorção, leveduras vivas (Saccharomyces cerevisiae) e enzimas pancreáticas que auxiliam na digestibilidade.",
   composicao:[
     "Vitaminas: A, D3, E, B1, B2, B6, B12, C, Biotina, Ácido Nicotínico, Pantotenato de Cálcio, Ácido Fólico, Colina",
     "Aminoácidos: L-Lisina, DL-Metionina, L-Carnitina, Taurina, Cisteína, Triptofano e outros",
     "Minerais quelatados: Ferro, Cobre, Zinco, Manganês",
     "Outros minerais: Cálcio, Fósforo, Sódio, Iodo, Cobalto, Selênio, Enxofre, Magnésio",
     "Saccharomyces cerevisiae — 9×10⁹ UFC/kg",
     "Enzimas pancreáticas (tripsina, amilase, lipase)",
   ],
   indicacoes:[
     "Suplementação nas fases críticas: crescimento, gestação, lactação, geriatria",
     "Melhora da qualidade nutricional de rações, farinhadas e sementes",
     "Preparo de animais para exposições",
     "Melhora da performance muscular em treinamento",
     "Alterações ósseas, cartilaginosas e dermatopatias por deficiência nutricional",
     "Muda de penas",
   ],
   posologia:[
     {situacao:"Aves (inclusive pombos)",dose:"0,5 g por kg de peso corporal",freq:"Diariamente, incorporado à ração",obs:"Equivalente a 1 a 2% da dieta (10 a 20 g por kg de ração). Dose máxima diária: 20 g."},
     {situacao:"Cães e gatos",dose:"0,5 g por kg de peso corporal",freq:"Diariamente, na ração",obs:"Adaptação gradativa: iniciar com 1/3 da dose, atingindo dose plena em 3 semanas."},
   ],
   atencao:[
     "Não substitui alimentação completa",
     "Evitar duplicidade com outros polivitamínicos",
     "Fazer adaptação gradativa em animais que nunca usaram",
     "Contém medida dosadora no interior da embalagem",
     "Dosagens podem ser alteradas conforme orientação do médico veterinário",
   ]},

  /* ┌─────────────────────────────────────────────────────────┐
     │  3. ELETRÓLITOS — Vários (Cest-Pharma, DAC, etc.)      │
     └─────────────────────────────────────────────────────────┘ */
  {id:"eletrolitos",nome:"Eletrólitos",fabricante:"Vários (Cest-Pharma, DAC, Backs, etc.)",emoji:"⚡",cor:"#FBBF24",
   tipo:"Eletrólitos e carboidratos (pó solúvel)",
   descricao:"Pó de reidratação à base de glicose e eletrólitos. Restaura o equilíbrio eletrolítico e o nível de pH do sangue, previne a desidratação e acelera a recuperação após provas e esforço intenso. Produto de uso específico para pombos-correio.",
   composicao:[
     "Glicose / Dextrose — fonte energética imediata",
     "Cloreto de Sódio (NaCl)",
     "Bicarbonato de Sódio (NaHCO₃)",
     "Cloreto de Potássio (KCl)",
     "Constituintes analíticos típicos: Carboidratos ≈ 61%, Sódio ≈ 10,6%, Potássio ≈ 4,6%",
   ],
   indicacoes:[
     "Restaurar o equilíbrio eletrolítico e pH do sangue após esforço",
     "Prevenção da desidratação",
     "Recuperação rápida após provas e voos longos",
     "Apoio em dias de calor intenso",
   ],
   posologia:[
     {situacao:"Pombos (pré-prova)",dose:"5 g (1 medida) por litro de água",freq:"2 dias antes do encestamento",obs:"Preparar solução fresca diariamente."},
     {situacao:"Pombos (pós-prova)",dose:"5 g (1 medida) por litro de água",freq:"2 dias após o retorno da prova",obs:"Fundamental para reposição hídrica e eletrolítica."},
     {situacao:"Aves em geral (outras marcas)",dose:"Seguir exatamente o rótulo da apresentação adquirida",freq:"Conforme orientação"},
   ],
   atencao:[
     "Preparar solução fresca diariamente — não guardar de um dia para o outro",
     "Disponibilizar água limpa à vontade",
     "Excesso ou diluição incorreta pode ser prejudicial",
     "Aves prostradas exigem avaliação veterinária — eletrólito não substitui tratamento",
     "Confirmar se a apresentação é indicada para aves",
   ]},

  /* ┌─────────────────────────────────────────────────────────┐
     │  4. ORGANEW — Vetnil                                   │
     └─────────────────────────────────────────────────────────┘ */
  {id:"organew",nome:"Organew",fabricante:"Vetnil",emoji:"🦠",cor:"#A78BFA",
   tipo:"Probiótico e prebiótico (oral)",
   descricao:"Reúne vitaminas, aminoácidos, leveduras vivas (Saccharomyces cerevisiae), FOS (fruto-oligossacarídeos) e MOS (mananoligossacarídeos). Esta combinação auxilia no desenvolvimento de uma microbiota intestinal saudável, proporcionando melhor digestibilidade dos alimentos e aumento da eficiência alimentar.",
   composicao:[
     "Saccharomyces cerevisiae — 9×10⁹ UFC/kg",
     "FOS (Fruto-oligossacarídeos) — 2.000 mg/kg",
     "MOS (Mananoligossacarídeo) — 1.000 mg/kg",
     "Vitaminas: B1, B2, B6, B12, Biotina, Ácido Fólico, Ácido Nicotínico, Colina",
     "Aminoácidos: Lisina, Metionina, Treonina, Valina, Leucina, Isoleucina, Arginina e outros",
     "Proteína Bruta (mín.) 178,6 g/kg",
   ],
   indicacoes:[
     "Desenvolvimento e manutenção de microbiota intestinal saudável",
     "Animais em crescimento e ganho de peso",
     "Aumento da performance e estímulo do apetite",
     "Melhora na conversão alimentar e desempenho reprodutivo",
     "Pós-tratamento com antibióticos (restauração da flora)",
     "Melhora da digestibilidade dos alimentos",
   ],
   posologia:[
     {situacao:"Aves (inclusive pombos)",dose:"1 a 2 g por kg de ração",freq:"Uso diário, adicionado ao alimento",obs:"Ou 2,5 a 5 g por ave/dia (dosagem para ovinos/caprinos/aves)."},
     {situacao:"Cães",dose:"2,5 g para cada 10 kg de peso vivo",freq:"1 vez ao dia"},
     {situacao:"Gatos",dose:"1 g por animal",freq:"1 vez ao dia"},
   ],
   atencao:[
     "Armazenar em local seco e fresco, conforme embalagem",
     "Verificar compatibilidade com medicamentos em uso",
     "Não associar com antibióticos sem orientação veterinária (pode reduzir eficácia do probiótico)",
     "Contém medida dosadora no interior da embalagem",
   ]},

  /* ┌─────────────────────────────────────────────────────────┐
     │  5. EMOLITAN — Reconstituinte oral                     │
     └─────────────────────────────────────────────────────────┘ */
  {id:"emolitan",nome:"Emolitan",fabricante:"Conferir fabricante na embalagem",emoji:"🟠",cor:"#F97316",
   tipo:"Reconstituinte oral",
   descricao:"Nome comercial utilizado em diferentes apresentações de reconstituinte oral. A composição pode variar conforme fabricante e apresentação. Produtos com esse nome geralmente contêm vitaminas do complexo B, aminoácidos, ferro e oligoelementos, indicados para recuperação nutricional e hematínica. Confirme sempre fabricante, composição e espécie-alvo na embalagem antes de usar.",
   composicao:[
     "Vitaminas do complexo B (B1, B2, B6, B12) — conforme apresentação",
     "Ácido Fólico — conforme apresentação",
     "Ferro e oligoelementos — conforme apresentação",
     "Glicose / Dextrose — como veículo energético",
     "Outros componentes variáveis conforme fabricante",
   ],
   indicacoes:[
     "Suporte nutricional e recuperação de animais debilitados",
     "Anemias e convalescença",
     "Muda de penas e fases de crescimento",
     "Treinamento e performance de atletas",
     "Pós-tratamento e recuperação sob orientação veterinária",
   ],
   posologia:[
     {situacao:"Aves (inclusive pombos)",dose:"Conforme bula/rótulo do produto adquirido",freq:"Conforme orientação do fabricante e veterinário",obs:"Dose típica para reconstituintes orais em aves: 2 gotas/100 mL de água ou 1 gota via oral a cada 12h. CONFIRMAR na embalagem."},
     {situacao:"Pequenos animais",dose:"1 gota por kg de peso vivo",freq:"2 vezes ao dia",obs:"Dose de referência para Hemolitan Pet (Vetnil). Confirmar se o Emolitan adquirido é equivalente."},
   ],
   atencao:[
     "⚠️ Não assumir equivalência entre fabricantes diferentes",
     "Confirmar se a apresentação é indicada para AVES",
     "Preparar solução fresca quando indicado",
     "Agitar antes de usar",
     "Sempre conferir a bula ou rótulo que acompanha o produto",
   ]},

  /* ┌─────────────────────────────────────────────────────────┐
     │  6. POTENFORT — União Química                          │
     └─────────────────────────────────────────────────────────┘ */
  {id:"potenfort",nome:"Potenfort",fabricante:"União Química Farmacêutica",emoji:"🔋",cor:"#EF4444",
   tipo:"Tônico estimulante injetável (uso veterinário)",
   descricao:"Produto injetável que combina vitaminas do complexo B com Sulfato de Mefentermina — um estimulante cardiovascular/adrenérgico. Aumenta a tonicidade muscular e estimula o sistema circulatório. Indicado para bovinos, equinos, ovinos, suínos, caprinos, caninos, felinos e coelhos. A bula NÃO cita dose específica para aves.",
   composicao:[
     "Sulfato de Mefentermina — 600 mg/100 mL (estimulante cardiovascular)",
     "Nicotinamida (Vitamina PP/B3) — 10.000 mg/100 mL",
     "Pantotenato de Cálcio — 500 mg/100 mL",
     "Sulfato de Cobalto — 200 mg/100 mL",
   ],
   indicacoes:[
     "Tônico estimulante durante gestação e lactação",
     "Aumento da tonicidade muscular e estímulo circulatório",
     "Debilidade generalizada, perda de apetite",
     "Convalescença de enfermidades infecciosas e parasitárias",
     "Fadiga, estresse, apatia, anemias e desnutrição",
     "Fortificante na época da cobertura",
   ],
   posologia:[
     {situacao:"Cães, gatos e coelhos",dose:"1 a 2 mL (injetável)",freq:"Conforme prescrição veterinária"},
     {situacao:"Ovinos, suínos, caprinos e bezerros",dose:"5 mL (injetável)",freq:"Conforme prescrição veterinária"},
     {situacao:"Bovinos e equinos",dose:"10 mL (injetável)",freq:"Conforme prescrição veterinária"},
     {situacao:"AVES / POMBOS",dose:"⚠️ NÃO há dose na bula para aves — SOMENTE com prescrição veterinária",freq:"Definida exclusivamente pelo veterinário",obs:"O uso em aves é extra-bula e requer avaliação profissional."},
   ],
   atencao:[
     "⚠️⚠️⚠️ Contém MEFENTERMINA — estimulante cardiovascular potente",
     "⚠️ NÃO usar como estimulante de rotina no plantel",
     "⚠️ NÃO usar em aves com doença cardíaca ou suspeita",
     "Utilizar com CAUTELA em animais cardiopatas",
     "Produto INJETÁVEL — aplicação exclusiva por profissional habilitado",
     "NÃO associar a outros estimulantes ou cardiotônicos",
     "A bula NÃO contém dose para aves — uso em pombos é off-label",
     "Efeitos colaterais: taquicardia, hipertensão, arritmia",
     "Manipular com cuidado — não beber, fumar ou comer durante a administração",
   ]},

  /* ┌─────────────────────────────────────────────────────────┐
     │  7. ELETROVITT LÍQUIDO — Solução Oral Hidroeletrolítica  │
     └─────────────────────────────────────────────────────────┘ */
  {id:"eletrovitt",nome:"Eletrovitt Líquido (Solução Oral)",fabricante:"Linha Avícola / Veterinária (Coveli / Biofarm / Vetnil)",emoji:"💧",cor:"#38bdf8",
   tipo:"Polivitamínico com Eletrólitos e Aminoácidos (Líquido Solúvel)",
   descricao:"Suplemento hidroeletrolítico, vitamínico e energético em apresentação líquida de rápida biodisponibilidade à base de eletrólitos essenciais (Sódio, Potássio, Cloreto, Cálcio, Magnésio), dextrose e complexo vitamínico. Indicado para reidratação imediata pré e pós-prova, bem como suporte em estresse térmico ou transporte.",
   composicao:[
     "Eletrólitos: Cloreto de Sódio, Cloreto de Potássio, Bicarbonato de Sódio, Cloreto de Magnésio, Cálcio",
     "Fonte de Glicose rápida: Dextrose anidra solúvel",
     "Vitaminas: Complexo B (B1, B2, B6, B12), Vitamina A, D3, E e Vitamina C",
     "Aminoácidos: L-Lisina, DL-Metionina",
     "Apresentação LÍQUIDA / Solução Oral de absorção celular ultrarrápida",
   ],
   indicacoes:[
     "Reidratação hídrica e eletrolítica imediata após provas de velocidade ou fundo",
     "Reposição mineral rápida na água de beber durante períodos de calor intenso no pombal",
     "Prevenção contra esgotamento osmótico e acidose muscular",
     "Apoio pré-encestamento para manter o balanço de eletrólitos no caminhão",
   ],
   posologia:[
     {situacao:"Pombos (Pós-prova / Reidratação)",dose:"2,5 mL por litro de água",freq:"Durante 2 a 3 dias consecutivos após o retorno",obs:"Adicionar na água de beber limpa e fresca (~50 gotas por litro)."},
     {situacao:"Pombos (Pré-encestamento)",dose:"2 mL por litro de água",freq:"Na QUINTA-FEIRA pré-enceste (não fornecer na sexta-feira)",obs:"Evita a sede no cesto enquanto abastece os sais minerais."},
     {situacao:"Aves debilitadas / Triagem",dose:"2 a 3 gotas direto no bico",freq:"1 vez ao dia por 3 dias",obs:"Apenas em casos de extraviados com desidratação severa."},
   ],
   atencao:[
     "Preparar solução fresca diariamente e descartar sobras do dia anterior",
     "Não fornecer eletrólitos concentrados no dia exato do encestamento (Sexta-feira) para evitar sede no cesto",
     "Manter o frasco bem fechado em local fresco e ao abrigo da luz solar direta",
     "Consulte um Médico Veterinário em caso de aves prostradas",
   ]},
];

const PROTOCOLO:Record<Categoria,{dia:string;foco:string;itens:string[]}[]>={
  Velocidade:[{dia:"Domingo",foco:"Recuperação",itens:["Hidratação e observação","Eletrólito na água (5g/L) conforme rótulo"]},{dia:"Segunda",foco:"Digestão",itens:["Água limpa","Organew na ração (1-2g/kg) se indicado","Aminomix na ração (0,5g/kg) para suporte"]},{dia:"Terça",foco:"Treino",itens:["Dieta completa","Evitar combinações novas","Aminomix na ração se houver desgaste"]},{dia:"Quarta",foco:"Manutenção",itens:["Avaliar condição corporal","Observar fezes e consumo"]},{dia:"Quinta",foco:"Carga",itens:["Eletrólito na água (5g/L) — 2 dias antes","Suplementação apenas já testada e validada"]},{dia:"Sexta",foco:"Enceste",itens:["Eletrólito na água","Sem excessos","Hidratação é prioridade"]},{dia:"Sábado",foco:"PROVA",itens:["Água limpa","Manejo do protocolo pessoal","Bioxan SOMENTE se prescrito pelo veterinário"]}],
  "Meio Fundo":[{dia:"Domingo",foco:"Recuperação",itens:["Reposição hídrica com Eletrólito (5g/L)","Avaliar tempo de recuperação"]},{dia:"Segunda",foco:"Recuperação",itens:["Organew na ração para suporte digestivo","Aminomix se necessário"]},{dia:"Terça",foco:"Reconstrução",itens:["Dieta balanceada","Aminomix na ração (0,5g/kg)"]},{dia:"Quarta",foco:"Manutenção",itens:["Monitorar consumo e fezes","Observar estado geral"]},{dia:"Quinta",foco:"Preparação",itens:["Não introduzir produtos novos","Eletrólito a partir de quinta"]},{dia:"Sexta",foco:"Carga",itens:["Usar apenas produtos validados","Eletrólito na água"]},{dia:"Sábado",foco:"Enceste",itens:["Água limpa e observação","Eletrólito na água"]}],
  Fundo:[{dia:"Domingo",foco:"Recuperação total",itens:["Hidratação com Eletrólito (5g/L)","Avaliação individual","Organew na ração se indicado"]},{dia:"Segunda",foco:"Recuperação",itens:["Suporte digestivo com Organew","Aminomix na ração"]},{dia:"Terça",foco:"Reconstrução",itens:["Nutrição completa","Aminomix na ração (0,5g/kg)"]},{dia:"Quarta",foco:"Manutenção",itens:["Monitorar recuperação","Observar fezes"]},{dia:"Quinta",foco:"Preparação",itens:["⚠️ Nunca usar estimulante sem veterinário","Eletrólito na água (5g/L)"]},{dia:"Sexta",foco:"Carga",itens:["Somente protocolo testado","Eletrólito na água"]},{dia:"Sábado",foco:"Enceste",itens:["Hidratação conforme manejo","Eletrólito na água"]}],
};

function read():Suplemento[]{try{const v=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(v)?v:[]}catch{return[]}}
const novo=():Partial<Suplemento>=>({emoji:"💊",cor:T.gold,tipo:"Suplemento",composicao:[],indicacoes:[],posologia:[],atencao:[],custom:true});

function calcularDoseSuplemento(s: Suplemento, pombos: number, litrosAgua: number, kgRacao: number, dias: number) {
  let gMlDia = 0;
  let unidade = "g";
  let modo = "na água de beber";
  let instrucao = "";

  if (s.id === "eletrolitos") {
    gMlDia = Math.round(5 * litrosAgua * 10) / 10;
    unidade = "g";
    modo = "na água de beber";
    instrucao = `Dissolver ${gMlDia}g (${Math.ceil(gMlDia / 5)} medidas) em ${litrosAgua.toFixed(2)}L de água fresca limpa por dia.`;
  } else if (s.id === "aminomix") {
    gMlDia = Math.round(15 * kgRacao * 10) / 10;
    unidade = "g";
    modo = "na ração";
    instrucao = `Homogeneizar ${gMlDia}g na porção diária de ${kgRacao.toFixed(2)}kg de ração com óleo ou mel puro como aglutinante.`;
  } else if (s.id === "organew") {
    gMlDia = Math.round(1.5 * kgRacao * 10) / 10;
    unidade = "g";
    modo = "na ração";
    instrucao = `Misturar ${gMlDia}g de probiótico/prebiótico em ${kgRacao.toFixed(2)}kg de ração diária do plantel.`;
  } else if (s.id === "bioxan") {
    gMlDia = Math.round(0.3 * pombos * 10) / 10;
    unidade = "mL";
    modo = "via veterinária";
    instrucao = `Apenas com prescrição veterinária (~0,3mL/ave). Volume para ${pombos} pombos: ${gMlDia}mL/dia.`;
  } else if (s.id === "emolitan") {
    gMlDia = Math.round(2.5 * litrosAgua * 10) / 10;
    unidade = "mL";
    modo = "na água de beber";
    instrucao = `Adicionar ${gMlDia}mL em ${litrosAgua.toFixed(2)}L de água limpa no bebedouro.`;
  } else if (s.id === "eletrovitt") {
    gMlDia = Math.round(2.5 * litrosAgua * 10) / 10;
    unidade = "mL";
    modo = "na água de beber";
    instrucao = `Adicionar ${gMlDia}mL de Eletrovitt Líquido (~${Math.round(gMlDia * 20)} gotas) em ${litrosAgua.toFixed(2)}L de água limpa no bebedouro diariamente.`;
  } else if (s.id === "glicopan") {
    gMlDia = Math.round(2 * litrosAgua * 10) / 10;
    unidade = "mL";
    modo = "na água de beber";
    instrucao = `Adicionar ${gMlDia}mL em ${litrosAgua.toFixed(2)}L de água para suporte energético rápido.`;
  } else {
    gMlDia = Math.round(5 * litrosAgua * 10) / 10;
    unidade = "g/mL";
    modo = "conforme cadastro";
    instrucao = `Aplicar ${gMlDia} (${s.posologia[0]?.dose || "conforme bula"}) no manejo diário do plantel.`;
  }

  const totalPeriodo = Math.round(gMlDia * dias * 10) / 10;
  const porAve = Math.round((gMlDia / Math.max(1, pombos)) * 100) / 100;

  return { gMlDia, unidade, modo, instrucao, totalPeriodo, porAve };
}

export default function Suplementacao(){
  const [tab, setTab] = useState<Tab>("protocolo");
  const [cat, setCat] = useState<Categoria>("Velocidade");
  const [pombos, setPombos] = useState(() => {
    try { return loadConfig().quantidadePombos || 30; } catch { return 30; }
  });
  const [custom, setCustom] = useState<Suplemento[]>(() => read());
  const [ready, setReady] = useState(false);
  const [sel, setSel] = useState<Suplemento | null>(null);
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Suplemento>>(novo());
  const [tmp, setTmp] = useState("");
  const [pos, setPos] = useState<Posologia>({ situacao: "", dose: "", freq: "", obs: "" });
  const [dias, setDias] = useState(3);
  const [mlPorAve, setMlPorAve] = useState(50);
  const [gPorAve, setGPorAve] = useState(35);
  const [calcSelId, setCalcSelId] = useState("eletrolitos");
  const [customDose, setCustomDose] = useState(5);
  const [customTipoDose, setCustomTipoDose] = useState<"g_L" | "g_kg" | "ml_L">("g_L");

  useEffect(() => { setReady(true); }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(custom)); }, [custom, ready]);

  const todos = [...BASE, ...custom];
  const litrosAgua = Math.max(0.5, (pombos * mlPorAve) / 1000);
  const kgRacao = Math.max(0.1, (pombos * gPorAve) / 1000);
  const litrosAguaTotal = Math.round(litrosAgua * dias * 10) / 10;
  const kgRacaoTotal = Math.round(kgRacao * dias * 10) / 10;

  function salvar() {
    if (!form.nome?.trim()) { alert("Informe o nome do produto."); return; }
    const item: Suplemento = {
      id: editId || crypto.randomUUID(),
      nome: form.nome,
      fabricante: form.fabricante || "",
      emoji: form.emoji || "💊",
      cor: form.cor || T.gold,
      tipo: form.tipo || "Suplemento",
      descricao: form.descricao || "",
      composicao: form.composicao || [],
      indicacoes: form.indicacoes || [],
      posologia: form.posologia || [],
      atencao: form.atencao || [],
      custom: true,
    };
    setCustom(v => editId ? v.map(s => s.id === editId ? item : s) : [...v, item]);
    setShow(false);
    setEditId(null);
    setForm(novo());
  }

  if (sel) return <Shell><button onClick={() => setSel(null)} style={{ ...T.btnGhost, marginBottom: 16 }}>← Voltar</button><section style={{ ...T.card, border: `2px solid ${sel.cor}55`, background: `${sel.cor}0d` }}><div style={{ fontSize: 36 }}>{sel.emoji}</div><h1 style={{ ...T.h1, marginTop: 4 }}>{sel.nome}</h1><b style={{ color: sel.cor }}>{sel.tipo}</b><div style={T.small}>{sel.fabricante}</div><p style={{ color: T.dim, lineHeight: 1.6 }}>{sel.descricao}</p></section><Detail title="🧪 Composição (conforme bula)" values={sel.composicao} color={sel.cor} /><Detail title="✅ Indicações" values={sel.indicacoes} color={sel.cor} /><section style={T.card}><Title>💊 Posologia / Modo de usar</Title>{sel.posologia.map((p, i) => <div key={i} style={{ padding: 11, marginBottom: 8, borderRadius: 9, background: "#ffffff06", borderLeft: `3px solid ${sel.cor}` }}><b>{p.situacao}</b><div className="supp-dose" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}><Box label="Dose" value={p.dose} color={sel.cor} /><Box label="Frequência" value={p.freq} color={T.blue} /></div>{p.obs && <p style={{ ...T.small, marginTop: 4, padding: "4px 8px", borderRadius: 6, background: `${T.blue}12` }}>💡 {p.obs}</p>}</div>)}</section><Detail title="⚠️ Atenção e Precauções" values={sel.atencao} color="#FBBF24" />{sel.custom && <div style={{ display: "flex", gap: 8 }}><button onClick={() => { setForm({ ...sel }); setEditId(sel.id); setSel(null); setShow(true); setTab("meus"); }} style={{ ...T.btnGhost, flex: 1 }}>✏️ Editar</button><button onClick={() => { if (confirm("Excluir produto?")) { setCustom(v => v.filter(s => s.id !== sel.id)); setSel(null); } }} style={{ ...T.btnDanger, flex: 1 }}>🗑️ Excluir</button></div>}</Shell>;
  return <Shell><div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}><div><h1 style={T.h1}>💊 Suplementação</h1><p style={{ ...T.small, marginTop: 4 }}>Produtos conforme bula, planejamento e cadastro personalizado</p></div><Link href="/centro-provas" style={{ ...T.btnGhost, textDecoration: "none" }}>← Centro</Link></div><Notice /><nav style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>{([["protocolo", "📅 Protocolo"], ["produtos", "💊 Produtos"], ["calc", "🧮 Calculadora"], ["meus", "➕ Meus Produtos"]] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: 10, borderRadius: 9, fontWeight: 800, color: tab === k ? T.bg : T.dim, background: tab === k ? T.gold : T.bgCard, border: `1px solid ${tab === k ? T.gold : T.border}` }}>{l}</button>)}</nav>
    {tab === "protocolo" && <><div style={{ display: "flex", gap: 6, marginBottom: 13 }}>{(["Velocidade", "Meio Fundo", "Fundo"] as Categoria[]).map(c => <button key={c} onClick={() => setCat(c)} style={{ flex: 1, padding: 10, borderRadius: 9, color: cat === c ? T.bg : T.dim, background: cat === c ? T.gold : T.bgCard, border: `1px solid ${cat === c ? T.gold : T.border}` }}>{c}</button>)}</div>{PROTOCOLO[cat].map(d => <section key={d.dia} style={{ ...T.card, borderLeft: `4px solid ${d.foco.includes("PROVA") ? T.gold : T.blue}` }}><div style={{ display: "flex", justifyContent: "space-between" }}><b>{d.dia}</b><span style={{ color: T.blue }}>{d.foco}</span></div>{d.itens.map(v => <div key={v} style={{ ...T.small, paddingTop: 5 }}>• {v}</div>)}</section>)}</>}
    {tab === "produtos" && todos.map(s => <button key={s.id} onClick={() => setSel(s)} style={{ width: "100%", padding: 14, marginBottom: 8, borderRadius: 11, textAlign: "left", color: T.white, background: T.bgCard, border: `1px solid ${s.cor}44`, borderLeft: `4px solid ${s.cor}` }}><div style={{ display: "flex", gap: 11, alignItems: "center" }}><span style={{ width: 44, height: 44, display: "grid", placeItems: "center", fontSize: 23, borderRadius: 10, background: `${s.cor}18` }}>{s.emoji}</span><div style={{ flex: 1 }}><b>{s.nome}</b>{s.custom && <small style={{ color: "#A78BFA" }}> • MEU</small>}<div style={{ color: s.cor, fontSize: 11 }}>{s.tipo}</div><div style={T.small}>{s.fabricante}</div></div><span>›</span></div></button>)}
    {tab === "calc" && <section>
      <section style={T.card}>
        <Title>⚙️ Configuração da Calculadora de Suplementação</Title>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <Field label="🐦 Quantidade de pombos">
            <input type="number" min={1} value={pombos} onChange={e => setPombos(Math.max(1, +e.target.value))} style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }} />
          </Field>
          <Field label="📅 Duração (dias de protocolo)">
            <input type="number" min={1} max={30} value={dias} onChange={e => setDias(Math.max(1, +e.target.value))} style={{ ...T.input, textAlign: "center", fontSize: 18, fontWeight: 800 }} />
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <Field label="💧 Água / ave (mL/dia)">
            <input type="number" min={10} value={mlPorAve} onChange={e => setMlPorAve(Math.max(10, +e.target.value))} style={{ ...T.input, textAlign: "center" }} />
          </Field>
          <Field label="🌾 Ração / ave (g/dia)">
            <input type="number" min={10} value={gPorAve} onChange={e => setGPorAve(Math.max(10, +e.target.value))} style={{ ...T.input, textAlign: "center" }} />
          </Field>
        </div>
        <div style={{ padding: 12, borderRadius: 9, color: T.blue, background: `${T.blue}12`, border: `1px solid ${T.blue}44`, fontSize: 12, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span>💧 Volume hídrico diário: <b>{litrosAgua.toFixed(2)} L/dia</b> ({litrosAguaTotal.toFixed(1)} L em {dias} dias)</span>
          <span>🌾 Consumo ração diário: <b>{kgRacao.toFixed(2)} kg/dia</b> ({kgRacaoTotal.toFixed(1)} kg em {dias} dias)</span>
        </div>
      </section>

      <section style={T.card}>
        <Title>📊 Cálculo Geral do Protocolo ({dias} dias para {pombos} pombos)</Title>
        <p style={{ ...T.small, marginBottom: 14 }}>Doses diárias e volume total calculados com base em bulas oficiais e consumo estimado do plantel:</p>
        {todos.map(s => {
          const { gMlDia, unidade, modo, instrucao, totalPeriodo, porAve } = calcularDoseSuplemento(s, pombos, litrosAgua, kgRacao, dias);
          return <div key={s.id} style={{ padding: 14, marginBottom: 10, borderRadius: 11, background: T.bgCard, border: `1px solid ${s.cor}55`, borderLeft: `4px solid ${s.cor}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div><span style={{ fontSize: 20, marginRight: 6 }}>{s.emoji}</span><b style={{ color: s.cor, fontSize: 15 }}>{s.nome}</b></div>
              <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800, background: `${s.cor}22`, color: s.cor }}>{modo.toUpperCase()}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, margin: "10px 0" }}>
              <Box label="Dose Diária (Plantel)" value={`${gMlDia} ${unidade}`} color={s.cor} />
              <Box label={`Total (${dias} dias)`} value={`${totalPeriodo} ${unidade}`} color="#22C55E" />
              <Box label="Média / ave / dia" value={`${porAve} ${unidade}`} color={T.blue} />
            </div>
            <div style={{ ...T.small, padding: "6px 9px", borderRadius: 7, background: "#ffffff08", color: T.white, marginTop: 4 }}>💡 <b>Modo de preparo:</b> {instrucao}</div>
          </div>;
        })}
      </section>

      <section style={T.card}>
        <Title>🔬 Simulador Rápido de Dosagem Personalizada</Title>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <Field label="Selecione o Suplemento">
            <select value={calcSelId} onChange={e => setCalcSelId(e.target.value)} style={{ ...T.input, background: T.bgInput, color: T.white }}>
              {todos.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.nome}</option>)}
            </select>
          </Field>
          <Field label="Concentração (dose na água ou ração)">
            <div style={{ display: "flex", gap: 6 }}>
              <input type="number" step="0.5" min={0.1} value={customDose} onChange={e => setCustomDose(Math.max(0.1, +e.target.value))} style={{ ...T.input, width: 80, textAlign: "center" }} />
              <select value={customTipoDose} onChange={e => setCustomTipoDose(e.target.value as any)} style={{ ...T.input, flex: 1, background: T.bgInput, color: T.white }}>
                <option value="g_L">g / Litro de água</option>
                <option value="g_kg">g / Kg de ração</option>
                <option value="ml_L">mL / Litro de água</option>
              </select>
            </div>
          </Field>
        </div>
        {(() => {
          const supSel = todos.find(s => s.id === calcSelId) || BASE[0];
          const isAgua = customTipoDose === "g_L" || customTipoDose === "ml_L";
          const unit = customTipoDose === "ml_L" ? "mL" : "g";
          const baseVol = isAgua ? litrosAgua : kgRacao;
          const diaCalc = Math.round(customDose * baseVol * 10) / 10;
          const totCalc = Math.round(diaCalc * dias * 10) / 10;
          return <div style={{ padding: 14, borderRadius: 10, background: `${supSel.cor}12`, border: `1px solid ${supSel.cor}44` }}>
            <b style={{ color: supSel.cor, fontSize: 14 }}>Resultado Simulação: {supSel.emoji} {supSel.nome}</b>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <Box label="Volume diário (Plantel)" value={`${diaCalc} ${unit}/dia`} color={supSel.cor} />
              <Box label={`Volume total (${dias} dias)`} value={`${totCalc} ${unit} total`} color="#22C55E" />
            </div>
          </div>;
        })()}
      </section>
    </section>}
    {tab === "meus" && <><button onClick={() => { setForm(novo()); setEditId(null); setShow(true); }} style={{ ...T.btn, marginBottom: 12 }}>➕ Adicionar meu produto</button>{show && <section style={T.card}><Title>{editId ? "✏️ Editar Produto" : "➕ Novo Produto"}</Title><div className="supp-head" style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 8 }}><Field label="Emoji"><input value={form.emoji || "💊"} onChange={e => setForm(v => ({ ...v, emoji: e.target.value }))} style={{ ...T.input, textAlign: "center" }} /></Field><Field label="Cor"><input type="color" value={form.cor || T.gold} onChange={e => setForm(v => ({ ...v, cor: e.target.value }))} style={{ ...T.input, padding: 4 }} /></Field></div>{[["Nome *", "nome"], ["Fabricante", "fabricante"], ["Tipo", "tipo"], ["Descrição", "descricao"]].map(([l, k]) => <Field key={k} label={l}><input value={String(form[k as keyof Suplemento] || "")} onChange={e => setForm(v => ({ ...v, [k]: e.target.value }))} style={T.input} /></Field>)}<ListEditor label="🧪 Composição" value={tmp} setValue={setTmp} items={form.composicao || []} setItems={items => setForm(v => ({ ...v, composicao: items }))} /><ListEditor label="✅ Indicações" value={tmp} setValue={setTmp} items={form.indicacoes || []} setItems={items => setForm(v => ({ ...v, indicacoes: items }))} /><Field label="💊 Referência de uso"><div className="supp-pos" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>{(["situacao", "dose", "freq", "obs"] as const).map(k => <input key={k} placeholder={k} value={pos[k]} onChange={e => setPos(v => ({ ...v, [k]: e.target.value }))} style={T.input} />)}</div><button onClick={() => { if (pos.situacao && pos.dose) { setForm(v => ({ ...v, posologia: [...(v.posologia || []), pos] })); setPos({ situacao: "", dose: "", freq: "", obs: "" }); } }} style={{ ...T.btnGhost, width: "100%", marginTop: 6 }}>+ Adicionar referência</button></Field><div style={{ display: "flex", gap: 8 }}><button onClick={() => setShow(false)} style={{ ...T.btnGhost, flex: 1 }}>Cancelar</button><button onClick={salvar} style={{ ...T.btn, flex: 2 }}>💾 Salvar produto</button></div></section>}{custom.map(s => <button key={s.id} onClick={() => setSel(s)} style={{ width: "100%", padding: 13, marginBottom: 7, textAlign: "left", borderRadius: 10, color: T.white, background: T.bgCard, border: `1px solid ${s.cor}44`, borderLeft: `4px solid ${s.cor}` }}>{s.emoji} <b>{s.nome}</b> <small style={{ color: s.cor }}>• {s.tipo}</small></button>)}{ready && !custom.length && !show && <div style={{ padding: 35, textAlign: "center", color: T.dim }}>Nenhum produto personalizado.</div>}</>}
  </Shell>;
}
function Notice(){return <div style={{padding:10,margin:"12px 0",borderRadius:9,color:T.blue,background:`${T.blue}12`,border:`1px solid ${T.blue}44`,fontSize:11,lineHeight:1.6}}>ℹ️ As informações dos 7 produtos cadastrados (incluindo Eletrovitt Líquido / Solução Oral) são baseadas nas bulas oficiais dos fabricantes. Confirme no rótulo se a apresentação é indicada para aves. Produtos injetáveis e estimulantes exigem orientação veterinária. Em caso de dúvida, consulte um Médico Veterinário.</div>}
function Detail({title,values,color}:{title:string;values:string[];color:string}){return <section style={T.card}><Title>{title}</Title>{values.length?values.map(v=><div key={v} style={{padding:"5px 0",borderBottom:`1px solid ${T.border}`,fontSize:12,color:T.dim}}><span style={{color}}>•</span> {v}</div>):<div style={T.small}>Sem informações cadastradas.</div>}</section>}
function Box({label,value,color}:{label:string;value:string;color:string}){return <div style={{padding:7,borderRadius:7,background:`${color}12`}}><div style={T.small}>{label}</div><b style={{color,fontSize:12}}>{value}</b></div>}
function ListEditor({label,value,setValue,items,setItems}:{label:string;value:string;setValue:(v:string)=>void;items:string[];setItems:(v:string[])=>void}){return <Field label={label}><div style={{display:"flex",gap:6}}><input value={value} onChange={e=>setValue(e.target.value)} style={{...T.input,flex:1}}/><button onClick={()=>{if(value.trim()){setItems([...items,value.trim()]);setValue("")}}} style={T.btnSm}>+</button></div>{items.map((v,i)=><div key={`${v}-${i}`} style={{display:"flex",justifyContent:"space-between",padding:5,color:T.dim,fontSize:12}}>• {v}<button onClick={()=>setItems(items.filter((_,j)=>j!==i))} style={{color:T.red,background:"none",border:0}}>×</button></div>)}</Field>}
function Shell({children}:{children:React.ReactNode}){return <main style={{minHeight:"100vh",background:T.bg,color:T.white,padding:"18px 12px 50px"}}><div style={{maxWidth:760,margin:"0 auto"}}>{children}</div><style jsx global>{`button,input{font-family:inherit}button{cursor:pointer}@media(max-width:520px){.supp-dose,.supp-pos,.supp-head{grid-template-columns:1fr!important}}`}</style></main>}
function Title({children}:{children:React.ReactNode}){return <div style={{fontSize:13,fontWeight:800,color:T.gold,marginBottom:10}}>{children}</div>}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label style={{display:"block",marginBottom:11}}><span style={{...T.label,display:"block",marginBottom:5}}>{label}</span>{children}</label>}
