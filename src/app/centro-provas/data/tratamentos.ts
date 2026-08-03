export type Urgencia = "baixa" | "media" | "alta" | "critica";
export type Principio = { nome: string; dose: string; duracao: string; obs?: string };
export type Doenca = { id: string; nome: string; categoria: string; emoji: string; cor: string; urgencia: Urgencia; agente: string; transmissao: string; sinais: string[]; diagnostico: string; principios: Principio[]; profilaxia: string[]; recomendacoes: string[]; zoonose?: boolean; imunidade?: string };

export const CATEGORIAS = ["Todas", "Bacterianas", "Virais", "Fúngicas", "Parasitárias Internas", "Protozoários", "Parasitárias Externas", "Carenciais"];

/* ═══════════════════════════════════════════════════════════════
   DOENÇAS — Baseado no Guia Prático de Carlos Fonseca
   ═══════════════════════════════════════════════════════════════ */
export const DOENCAS: Doenca[] = [

  /* ─── BACTERIANAS ─────────────────────────────────────────── */
  { id:"salmonelose", nome:"Salmonelose / Paratifo", categoria:"Bacterianas", emoji:"🧫", cor:"#ef4444", urgencia:"critica",
    agente:"Salmonella Typhimurium",
    transmissao:"Oral (alimento/água), aérea (pó), ovárica (do ovário ao ovo)",
    sinais:["Forma Intestinal: diarreia espessa com muco, fezes pardo-esverdeadas espumosas, engrossamento da cloaca, emagrecimento","Forma Articular: asa caída (cotovelo acometido), o parasita passa do intestino ao sangue e às articulações","Forma Orgânica: respiração curta, debilitamento geral, ataca todos os órgãos","Forma Nervosa: perda de equilíbrio, paralisia, torticolos (semelhante a Paramixovirose)"],
    diagnostico:"Serológico — anticorpos no sangue dos animais infectados",
    principios:[
      {nome:"Tetraciclinas",dose:"Conforme prescrição veterinária",duracao:"Mínimo 15 dias",obs:"⚠️ Tratamento longo — adultos curados tornam-se portadores"},
      {nome:"Enrofloxacina",dose:"Conforme prescrição veterinária",duracao:"Conforme veterinário"},
      {nome:"Furazolidona",dose:"Conforme prescrição veterinária",duracao:"Conforme veterinário"},
    ],
    profilaxia:["Limpeza e desinfecção semanal","1-2 dias de antibióticos a cada 15 dias (preventivo)","Vitaminas de suporte"],
    recomendacoes:["🚨 ZOONOSE — pode contagiar o homem por contato direto!","Adultos curados tornam-se portadores — eliminar do plantel é preferível","Na postura, transmitem a doença pelos poros da casca do ovo","Desinfetar tudo com iodo povidona"],
    zoonose:true },

  { id:"pasteurelose", nome:"Pasteurelose / Cólera", categoria:"Bacterianas", emoji:"💀", cor:"#ef4444", urgencia:"critica",
    agente:"Pasteurella multocida",
    transmissao:"Contato direto, superpopulação e falta de higiene",
    sinais:["Febre alta (42-43°C)","Diarreia","Morte entre 24-48 horas","Pode causar epidemia no pombal"],
    diagnostico:"Exame bacteriológico",
    principios:[
      {nome:"Tetraciclinas",dose:"Conforme prescrição veterinária",duracao:"Conforme veterinário"},
      {nome:"Enrofloxacina",dose:"Conforme prescrição veterinária",duracao:"Conforme veterinário"},
    ],
    profilaxia:["Limpeza e desinfecção com iodo povidona","Evitar superpopulação","Vitaminas de suporte"],
    recomendacoes:["🚨 Doença fatal — mortalidade em 24-48h","Superpopulação e falta de higiene são os principais fatores","Isolar imediatamente aves doentes"] },

  { id:"coriza", nome:"Coriza", categoria:"Bacterianas", emoji:"🤧", cor:"#3b82f6", urgencia:"media",
    agente:"Hemophilus influenzae",
    transmissao:"Contato direto, gotículas respiratórias",
    sinais:["Lágrimas nos dois olhos ao mesmo tempo","Inchaço dos sacos lacrimais (cabeça de mocho)","Descarga nasal leve (muco)"],
    diagnostico:"Exame bacteriológico das secreções nasais e oculares",
    principios:[
      {nome:"Antibióticos",dose:"Conforme prescrição veterinária",duracao:"Conforme veterinário"},
    ],
    profilaxia:["Limpeza e desinfecção com iodo povidona","Vitaminas de suporte"],
    recomendacoes:["Vitaminas como coadjuvante","Desinfecção com iodo povidona"] },

  { id:"micoplasmose", nome:"Micoplasmose", categoria:"Bacterianas", emoji:"🫁", cor:"#3b82f6", urgencia:"alta",
    agente:"Micoplasma (microorganismo entre bactéria e vírus)",
    transmissao:"Contato direto — pombos curados tornam-se portadores e transmitem aos borrachos",
    sinais:["Secreção nasal húmida aquosa que se torna pegajosa e purulenta","Crosta cinzenta rugosa no interior da boca","Língua e paladar pegajosos","Hálito muito desagradável (repulsivo)","Nariz de cor cinza suja","Respiração muito dificultada","Ruídos de ressonar muito fortes à noite","Evolução lenta — raramente infecção generalizada"],
    diagnostico:"Exame serológico dos anticorpos",
    principios:[
      {nome:"Tilosina (Tylan)",dose:"12-25 mg/pombo/dia",duracao:"5 dias consecutivos",obs:"Indicado especificamente para micoplasmose"},
      {nome:"Enrofloxacina",dose:"5-10 mg/pombo/dia",duracao:"5 dias consecutivos"},
    ],
    profilaxia:["Desinfecção a fundo","Tratamentos preventivos nas semanas livres de concursos","Sobretudo após concursos difíceis","Geralmente associada à Ornitose"],
    recomendacoes:["Pombos curados tornam-se portadores","Doença aparece após esforço de concursos difíceis","Stress, falta de higiene e superpopulação desencadeiam a doença","⚠️ Não treinar aves com sinais respiratórios"] },

  { id:"ornitose", nome:"Ornitose / Clamidiose", categoria:"Bacterianas", emoji:"😷", cor:"#ef4444", urgencia:"critica",
    agente:"Clamídia",
    transmissao:"Contato direto, secreções",
    sinais:["Sintomas similares a uma gripe","Secreção nasal e ocular (semelhante à micoplasmose)","Diarreia","Emagrecimento lento","Morte"],
    diagnostico:"Laboratório — método Stamp",
    principios:[
      {nome:"Clortetraciclinas + Tilosina",dose:"Conforme prescrição veterinária",duracao:"Conforme veterinário",obs:"⚠️ Tratamento combinado"},
    ],
    profilaxia:["Desinfecção a fundo"],
    recomendacoes:["🚨 ZOONOSE — use luvas e máscara!","Procurar veterinário imediatamente","Evitar contato de pessoas vulneráveis","Isolar aves doentes"] ,
    zoonose:true },

  /* ─── VIRAIS ──────────────────────────────────────────────── */
  { id:"paramixovirose", nome:"Paramixovirose / New Castle", categoria:"Virais", emoji:"🧠", cor:"#ef4444", urgencia:"critica",
    agente:"Paramyxovírus aviar tipo 1",
    transmissao:"Contato direto, secreções, fezes",
    sinais:["Transtornos Digestivos (vírus vicerotrópico): excrementos aquosos/líquidos, sede intensa (4-5x mais consumo)","Transtornos Nervosos (vírus neurotrópico): tremores de cabeça, dificuldade para picar grãos, problemas de equilíbrio (piruetas), torticolis 0°-180°, descoloração de um olho, paralisia de asa(s) ou pata(s)","Transtornos Respiratórios (vírus neumotrópico): conjuntivite, coriza, estertor (pouco frequentes)"],
    diagnostico:"Laboratório — exame virológico do sangue",
    principios:[
      {nome:"Antibióticos (coadjuvante)",dose:"Tetraciclinas, enrofloxacina — conforme prescrição",duracao:"Conforme veterinário",obs:"Não há tratamento antiviral — antibióticos são coadjuvantes"},
      {nome:"Aminoácidos + Vitaminas",dose:"Suporte nutricional",duracao:"Durante todo o tratamento"},
      {nome:"Levamisol (estimulante das defesas)",dose:"Conforme prescrição veterinária",duracao:"1-2 dias",obs:"Imunomodulador"},
    ],
    profilaxia:["Limpeza e desinfecção do pombal","VACINAÇÃO: a) Vírus morto (Colombovac) — IM ou SC, imunidade 1 ano; b) Vírus vivo (cepa B1/La Sota) — na água, gota nasal/ocular, imunidade 2 meses","Após vacina com vírus vivo: Levamisol 1-2 dias + Vitaminas/Antibióticos/Aminoácidos por 4-5 dias"],
    recomendacoes:["🚨 Obrigação denunciar o surto à sociedade columbófila","Isolar aves doentes de pouco valor — eliminar","Reduzir consumo de água para 50 cc/dia","Encher bem os comedouros ou alimentar com manga/seringa","Não há cura antiviral — suporte é fundamental"] },

  { id:"adenovirus", nome:"Adenovírus", categoria:"Virais", emoji:"🧬", cor:"#a78bfa", urgencia:"media",
    agente:"Adenovírus (prefere órgãos do sistema linfático — gânglios, baço)",
    transmissao:"Contato direto",
    sinais:["Crescimento desigual dos borrachos","Vômitos frequentes (sintoma mais característico)"],
    diagnostico:"Clínico",
    principios:[
      {nome:"Substâncias homeopáticas",dose:"Conforme prescrição",duracao:"Conforme veterinário"},
    ],
    profilaxia:["Limpeza e desinfecção dos pombos"],
    recomendacoes:["Pouco se conhece sobre esta doença","Crescimento desigual dos borrachos é um sinal de alerta","Vômitos frequentes são o sintoma mais característico"] },

  { id:"herpesvirus", nome:"Herpes Vírus", categoria:"Virais", emoji:"🦠", cor:"#a78bfa", urgencia:"media",
    agente:"Herpesvírus",
    transmissao:"Contato direto",
    sinais:["Doença virósica de aparição recente","Pouca informação disponível"],
    diagnostico:"Laboratório",
    principios:[
      {nome:"Não há tratamento específico conhecido",dose:"Suporte veterinário",duracao:"Conforme evolução"},
    ],
    profilaxia:["Limpeza e desinfecção","Isolar aves doentes"],
    recomendacoes:["Doença de aparição recente","Procurar veterinário ao primeiro sinal"] },

  { id:"diftero-viruela", nome:"Diftero-Viruela", categoria:"Virais", emoji:"🟡", cor:"#f97316", urgencia:"alta",
    agente:"Borrelia columbae (vírus)",
    transmissao:"Água de bebida, alimento, material fecal, pó, picada de mosquitos, feridas. Borrachos são mais suscetíveis.",
    sinais:["Formações crostosas branco-amarelentas difíceis de desprender (sangrentas)","Localizadas nos olhos, nariz, bico, articulação das patas, boca, garganta, ao redor da cloaca"],
    diagnostico:"Clínico — lesões características",
    principios:[
      {nome:"Tintura de iodo (tópico)",dose:"Separar excrescências e aplicar tópicos de iodo",duracao:"Até cicatrizar"},
      {nome:"Antibióticos + Vitamina A",dose:"Conforme prescrição veterinária",duracao:"4-5 dias",obs:"Vitamina A é fundamental na recuperação"},
    ],
    profilaxia:["Limpeza e desinfecção com iodo povidona","Combater mosquitos"],
    recomendacoes:["O pombo curado adquire imunidade para toda a vida","Adultos raramente ficam doentes — borrachos são mais suscetíveis","Combater mosquitos (vetores)"],
    imunidade:"O pombo curado adquire imunidade para toda a vida" },

  /* ─── FÚNGICAS ────────────────────────────────────────────── */
  { id:"candidiase", nome:"Candidíase / Muguete", categoria:"Fúngicas", emoji:"🍄", cor:"#06b6d4", urgencia:"media",
    agente:"Cândida albicans (fungo)",
    transmissao:"Alimento contaminado, higiene precária. Pode estar associada à carência de Vitamina A.",
    sinais:["Placas branco-amarelentas FÁCEIS de desprender (diferente da tricomoníase)","Em toda a mucosa da boca e garganta"],
    diagnostico:"Clínico — placas fáceis de desprender (diferente de tricomoníase)",
    principios:[
      {nome:"Iodo povidona 10% (tópico)",dose:"Aplicações tópicas nas placas",duracao:"Até desaparecer"},
      {nome:"Tintura de iodo débil (diluída com glicerina)",dose:"Tópico nas placas",duracao:"Até desaparecer"},
      {nome:"Vitamina A",dose:"Conforme prescrição",duracao:"Durante o tratamento",obs:"A carência de Vitamina A está frequentemente associada"},
    ],
    profilaxia:["Evitar armazenamento prolongado dos alimentos","Dar sol aos alimentos","Fornecer Vitamina A","Desinfecção do pombal"],
    recomendacoes:["Diferente da tricomoníase: as placas são FÁCEIS de desprender","Investigar carência de Vitamina A","Descartar alimento mofado ou húmido"] },

  { id:"aspergilose", nome:"Aspergilose", categoria:"Fúngicas", emoji:"🫁", cor:"#06b6d4", urgencia:"alta",
    agente:"Aspergillus fumigatus (fungo) — reproduz-se rapidamente na palha dos ninhos ou alimento húmido",
    transmissao:"Inalação de esporos, alimento contaminado",
    sinais:["Forma Pulmonar: dificuldade respiratória (dispneia), excrescências esverdeadas sobre a língua e paladar","Forma Dermatológica: pele pelada e fraturas de plumas"],
    diagnostico:"Clínico e laboratorial",
    principios:[
      {nome:"Não existe tratamento eficaz",dose:"Suporte veterinário",duracao:"—",obs:"🚨 Doença sem tratamento eficaz conhecido"},
    ],
    profilaxia:["Pombal seco e bem arejado","Evitar humidade no alimento","Desinfecção com iodo povidona","Trocar palha dos ninhos frequentemente"],
    recomendacoes:["🚨 Não existe tratamento eficaz","Prevenção é a única arma: pombal seco e bem arejado","Evitar palha húmida nos ninhos","Descartar alimento com qualquer sinal de mofo"] },

  /* ─── PARASITÁRIAS INTERNAS ───────────────────────────────── */
  { id:"coccidiose", nome:"Coccidiose", categoria:"Parasitárias Internas", emoji:"🔬", cor:"#f97316", urgencia:"alta",
    agente:"Eimeria labbeana / Eimeria columbarum",
    transmissao:"Oral — ingestão de oocistos nas fezes. Ovos se reproduzem na matéria fecal (precisam temperatura, humidade e oxigénio).",
    sinais:["Forma Subclínica (adultos): sem sintomas, mas diminui rendimento desportivo. Há certa imunidade.","Forma Clínica (borrachos a partir da 3ª semana): fezes aquosas e descoloridas, às vezes sanguinolentas (nunca líquida e verde), perda de peso e forma, perda de cor da íris (muda para grisalho), mucosa da boca e garganta pálidas (anemia), plumagem opaca"],
    diagnostico:"Análise de material fecal",
    principios:[
      {nome:"Sulfamidas",dose:"Conforme prescrição veterinária",duracao:"Conforme veterinário",obs:"⚠️ Uso continuado provoca danos renais"},
      {nome:"Amprólio (Amprolium)",dose:"20 mg/pombo",duracao:"Conforme veterinário"},
      {nome:"Clazuril",dose:"2,5 mg/pombo — dose única",duracao:"1 dia",obs:"Baixa ou nula toxicidade"},
      {nome:"Toltrazuril (Baycox)",dose:"7-15 mg/pombo",duracao:"2 dias",obs:"Baixa ou nula toxicidade"},
    ],
    profilaxia:["Alternar drogas cada 30 dias (preventivo)","Pode administrar junto com tratamento contra tricomonas","Após tratamento: choque vitamínico 3-4 dias","Limpeza a fundo — evitar humidade (ovos precisam de humidade para se reproduzir)","Remover fezes diariamente"],
    recomendacoes:["Fezes sanguinolentas mas NUNCA líquidas e verdes (diferente de salmonelose)","Ovos de coccídeos precisam de temperatura, humidade e oxigénio — manter piso seco","Borrachos são os mais afetados"] },

  { id:"ascaridiose", nome:"Ascaridíase (Lombriga)", categoria:"Parasitárias Internas", emoji:"🪱", cor:"#a78bfa", urgencia:"media",
    agente:"Ascaris columbae",
    transmissao:"Oral — ciclo de 20 dias: ovo eliminado nas fezes → solo → larva → ingerido → amadurece → eliminado",
    sinais:["Poucas lombrigas: pouco dano, mas diminui rendimento desportivo","Muitas lombrigas: anorexia, perda de peso, debilidade, fezes pouco consistentes, sede intensa, anemia, plumagem opaca e eriçada","Parasitas visíveis nos excrementos e às vezes nos vômitos","Danos: 1) feridas na parede intestinal, 2) absorção de nutrientes, 3) excreção de substâncias tóxicas"],
    diagnostico:"Análise de matéria fecal",
    principios:[
      {nome:"Levamisol (Ripercol)",dose:"10-20 mg/pombo, 2 dias (ou 400 mg/litro de água)",duracao:"2 dias, repetir aos 15 dias",obs:"Pode produzir vômitos passageiros. Excelente imunomodulador."},
      {nome:"Piperazina",dose:"0,5 g/pombo",duracao:"2 dias"},
      {nome:"Ivermectina (Ivomec)",dose:"0,1 mg/pombo",duracao:"Dose única, repetir aos 10 dias",obs:"Age contra parasitas internos e externos"},
      {nome:"Mebendazol",dose:"5-7 mg/pombo",duracao:"2 dias",obs:"⚠️ Pode diminuir fertilidade e afetar plumagem na muda"},
    ],
    profilaxia:["Tratamento alternado cada 30 dias (diminui habituação)","Levamisol é imunomodulador — imprescindível ao vacinar contra New Castle","Animais velhos desenvolvem certa imunidade","Limpeza e higiene — desinfecção"],
    recomendacoes:["Ciclo de 20 dias — por isso tratamentos preventivos a cada 21 dias","Levamisol é excelente imunomodulador — usar junto com vacinação","Alternar drogas para evitar habituação"] },

  { id:"capilariose", nome:"Capilariose", categoria:"Parasitárias Internas", emoji:"🔬", cor:"#a78bfa", urgencia:"media",
    agente:"Capillaria obsignata",
    transmissao:"Oral — presente em ~50% dos pombos, mas mais sensíveis nos jovens",
    sinais:["Infestação leve: praticamente sem sintomas, apenas diminuição dos rendimentos desportivos","Infestação grave: diarreia → emagrecimento → morte (borrachos podem morrer em 1 semana)"],
    diagnostico:"Análise de matéria fecal (idem ascaridíase)",
    principios:[
      {nome:"Levamisol (Ripercol)",dose:"10-20 mg/pombo, 2 dias",duracao:"2 dias, repetir aos 15 dias",obs:"⚠️ NÃO usar Piperazina para capilariose"},
      {nome:"Ivermectina (Ivomec)",dose:"0,1 mg/pombo",duracao:"Repetir aos 10 dias"},
      {nome:"Mebendazol",dose:"5-7 mg/pombo",duracao:"2 dias"},
    ],
    profilaxia:["Idem ascaridíase — alternar drogas cada 30 dias","Limpeza e desinfecção"],
    recomendacoes:["Presente em ~50% dos pombos","⚠️ NÃO usar Piperazina para capilariose","Borrachos são mais sensíveis — podem morrer em 1 semana"] },

  { id:"teniase", nome:"Teníase", categoria:"Parasitárias Internas", emoji:"🪱", cor:"#a78bfa", urgencia:"baixa",
    agente:"Ténias (cestódeos)",
    transmissao:"Hóspedes intermediários: larvas de mosquitos, baratas, lesmas, caracóis",
    sinais:["Anéis de ténias às vezes visíveis na cloaca","Comum em pombos que estiveram extraviados"],
    diagnostico:"Visual — anéis na cloaca ou exame de fezes",
    principios:[
      {nome:"Niclosamida",dose:"100 mg/pombo",duracao:"Tratamento individual"},
    ],
    profilaxia:["Combater todos os hóspedes intermediários (mosquitos, baratas, lesmas, caracóis)"],
    recomendacoes:["Tratamento individual","Combater hóspedes intermediários é a melhor profilaxia"] },

  /* ─── PROTOZOÁRIOS ────────────────────────────────────────── */
  { id:"tricomonase", nome:"Tricomoníase", categoria:"Protozoários", emoji:"🦠", cor:"#eab308", urgencia:"alta",
    agente:"Trichomona columbae (protozoário)",
    transmissao:"Contato direto — 80% dos pombos velhos são portadores. Borrachos: fatal.",
    sinais:["Apatia","Plumagem eriçada","Diarreia viscosa → emagrecimento","Sede intensa","Anorexia (falta de apetite)","Dispneia (dificuldade respiratória — postura de pinguim)","Placas branco-amarelentas na boca e garganta (DIFÍCEIS de desprender — diferente de candidíase)"],
    diagnostico:"Exame microscópico de esfregaço do bucho e esófago",
    principios:[
      {nome:"Dimetridazol (Emtril)",dose:"1 g por litro de água",duracao:"7 dias"},
      {nome:"Metronidazol",dose:"20-25 mg/pombo/dia ou 1 g/litro de água",duracao:"5 dias"},
      {nome:"Ronidazol (Trichonazol)",dose:"2 mg/pombo/dia ou 2 g/litro de água",duracao:"5 dias"},
    ],
    profilaxia:["Higiene e desinfecção geral","Pequena quantidade de tricomonas em pombos saudáveis provoca seus próprios anticorpos"],
    recomendacoes:["80% dos pombos velhos são portadores — vivem em equilíbrio com as tricomonas","Nos borrachos é FATAL","Placas DIFÍCEIS de desprender (diferente da candidíase/muguete que são fáceis)","Higienizar bebedouros diariamente — não compartilhar água entre lotes"],
    imunidade:"Pequena quantidade de tricomonas em pombos saudáveis provoca seus próprios anticorpos" },

  { id:"plasmodiose", nome:"Plasmodiose / Malária", categoria:"Protozoários", emoji:"🦟", cor:"#ef4444", urgencia:"alta",
    agente:"Plasmodium (esporozoário)",
    transmissao:"Mosquitos transmissores (Culex, Aedes, Anopheles). Fatores: aves portadoras, mosquitos, temperatura/chuvas/flora da região. Doença de zonas litorais (proximidade a rios).",
    sinais:["Apatia","Febre remitente (sobe e baixa)","Anemia (olho e mucosas brancas)","Debilidade geral","Morte nos borrachos","Após fase aguda (30-40 dias): normalização das manifestações"],
    diagnostico:"Exame do sangue — método de Giemsa",
    principios:[
      {nome:"Cloroquina (Aralen)",dose:"2 mg/kg de peso (≈1 mg/pombo)",duracao:"3 doses em média",obs:"Plasmodicidas da malária humana"},
      {nome:"Outros: Quinina, Atebrina, Plasmoquina, Pludrina",dose:"Conforme prescrição veterinária",duracao:"Conforme veterinário"},
    ],
    profilaxia:["Evitar o mosquito: tela metálica, repelentes, Kaotrina","Combater mosquitos eliminando criadouros"],
    recomendacoes:["Doença de zonas litorais (proximidade a rios)","Transmitida por mosquitos — combater vetores é essencial","Animais curados desenvolvem certo grau de imunidade"],
    imunidade:"Animais curados desenvolvem certo grau de imunidade" },

  { id:"haemoproteose", nome:"Haemoproteose", categoria:"Protozoários", emoji:"🪰", cor:"#f97316", urgencia:"media",
    agente:"Haemoproteus columbae",
    transmissao:"Mosca hematófaga (Pseudolynchia canariensis) — hóspede definitivo. O pombo é o hóspede intermediário. A mosca infestada pica o pombo e transmite a doença. Sintomas aparecem 25-30 dias depois.",
    sinais:["Observável somente nos meses de verão","Sintomas muito similares à plasmodiose (malária)","Febre recorrente (sobe e baixa) — 43°C","Diarreia: fezes brancas ou branco-amarelentas, líquidas e persistentes","Dispneia (aumento da frequência respiratória)","Anemia gradual","Caquexia (enfraquecimento crónico)"],
    diagnostico:"Exame do sangue — método de Giemsa",
    principios:[
      {nome:"NENHUM tratamento conhecido",dose:"—",duracao:"—",obs:"🚨 Não existe tratamento eficaz para esta doença"},
    ],
    profilaxia:["Combater a mosca: Kaotrina","Eliminar criadouros de moscas"],
    recomendacoes:["🚨 Não existe tratamento!","Combater a mosca (Pseudolynchia canariensis) é a única prevenção","Doença sazonal — meses de verão","Pode ser confundida com malária (época e sintomas semelhantes)"] },

  /* ─── PARASITÁRIAS EXTERNAS ───────────────────────────────── */
  { id:"ectoparasitos", nome:"Piolhos, Ácaros, Moscas e Carraças", categoria:"Parasitárias Externas", emoji:"🐛", cor:"#94a3b8", urgencia:"media",
    agente:"Piolhos, ácaros, moscas (dipteros), carraças",
    transmissao:"Contato direto, ambiente contaminado",
    sinais:["Danos imensos na plumagem","Irritação e coceira","Pode causar baixos rendimentos nos concursos","Ácaros podem causar problemas respiratórios"],
    diagnostico:"Visual — inspeção das penas e pele",
    principios:[
      {nome:"Banho de aspersão (NUNCA de imersão)",dose:"Conforme produto",duracao:"Conforme produto"},
      {nome:"Carbaril 5% (em pó)",dose:"Conforme produto",duracao:"Conforme orientação"},
    ],
    profilaxia:["Banho de aspersão (NUNCA de imersão)","⚠️ Produtos derivados de piretrinas (ex: Kaotrina) são TÓXICOS para aves — podem causar baixos rendimentos","🚨 NUNCA utilizar Gamexane","Manter pombal limpo e seco"],
    recomendacoes:["⚠️ Piretrinas (Kaotrina) são tóxicas — podem não causar intoxicação visível mas causam baixos rendimentos","🚨 NUNCA utilizar Gamexane","Banho de aspersão apenas — NUNCA de imersão"] },

  /* ─── CARENCIAIS ──────────────────────────────────────────── */
  { id:"avitaminose-a", nome:"Carência de Vitamina A", categoria:"Carenciais", emoji:"👁️", cor:"#f97316", urgencia:"media",
    agente:"Deficiência dietética de Vitamina A",
    transmissao:"Não transmissível — deficiência nutricional",
    sinais:["Destruição do olho (semelhante a coriza)","Exsudado viscoso nas fossas nasais","Nódulos/pústulas brancas (tamanho de cabeça de alfinete) na boca, faringe, esófago e estômago"],
    diagnostico:"Clínico e histórico alimentar",
    principios:[
      {nome:"Vitamina A",dose:"200 UI/dia/pombo (necessidade diária)",duracao:"Até recuperação",obs:"Indispensável na formação de capilares, pigmentos da retina e revestimentos epiteliais. Coadjuvante em doenças infecciosas e antiparasitárias. Anti-stress e acompanhante de vacinações."},
    ],
    profilaxia:["Fornecer Vitamina A periodicamente","Usar como coadjuvante em tratamentos infecciosos e vacinações"],
    recomendacoes:["Necessidade diária: 200 UI/pombo","É praticamente impossível produzir hipervitaminose de vitaminas — o excesso é metabolizado e eliminado"] },

  { id:"avitaminose-d", nome:"Carência de Vitamina D", categoria:"Carenciais", emoji:"🦴", cor:"#3b82f6", urgencia:"media",
    agente:"Deficiência de Vitamina D e/ou falta de luz solar",
    transmissao:"Não transmissível",
    sinais:["Deformação do esterno","Ossos frágeis","Ovos com casca delgada e mole","Bico e unhas moles e frágeis","Atraso de crescimento","Problemas na plumagem","Raquitismo (carência prolongada)"],
    diagnostico:"Clínico",
    principios:[
      {nome:"Vitamina D3",dose:"45 UI/dia/pombo (necessidade diária)",duracao:"Até recuperação",obs:"O organismo sintetiza a partir dos raios ultravioleta — sol é fundamental! Promove absorção e fixação de cálcio e fósforo."},
    ],
    profilaxia:["Sol nos pombais (síntese a partir de UV)","Fornecer Vitamina D3 periodicamente"],
    recomendacoes:["Necessidade diária: 45 UI/pombo","Sol é fundamental — o organismo sintetiza Vitamina D a partir dos raios UV"] },

  { id:"avitaminose-e", nome:"Carência de Vitamina E", categoria:"Carenciais", emoji:"🥚", cor:"#22c55e", urgencia:"baixa",
    agente:"Deficiência de Vitamina E",
    transmissao:"Não transmissível",
    sinais:["Encefalomalácia: transtornos motores e flexão ventral da cabeça","Distrofia muscular: estrias brancas ao longo das fibras musculares dos peitorais","Problemas reprodutivos"],
    diagnostico:"Clínico",
    principios:[
      {nome:"Vitamina E",dose:"1 mg/dia/pombo (necessidade diária)",duracao:"Até recuperação",obs:"Atua na manutenção da função reprodutora e fertilidade dos ovos."},
    ],
    profilaxia:["Fornecer Vitamina E periodicamente"],
    recomendacoes:["Necessidade diária: 1 mg/pombo"] },

  { id:"avitaminose-b", nome:"Carência de Complexo B", categoria:"Carenciais", emoji:"🧠", cor:"#a78bfa", urgencia:"media",
    agente:"Deficiência de vitaminas do complexo B",
    transmissao:"Não transmissível",
    sinais:["B1 (Tiamina): sintomas nervosos — opistótono, paralisia das patas e músculos, atrofia dos órgãos genitais","B2 (Riboflavina): diarreia, atraso no crescimento, paralisia das patas, apoio dos tarsos, dobra dos dedos para dentro","B6 (Piridoxina): anorexia, atraso no crescimento, convulsões espasmódicas","B12 (Cianocobalamina): atraso no crescimento, anemia, transtornos na muda, baixa fertilidade","Ácido Fólico: anemia, atraso no crescimento, problemas na plumagem, perosis","Biotina: dermatite nas patas (patas ásperas, com greta e necrose)"],
    diagnostico:"Clínico e histórico alimentar",
    principios:[
      {nome:"Complexo B completo",dose:"Conforme produto e prescrição",duracao:"Até recuperação",obs:"⚠️ As vitaminas do complexo B atuam inter-relacionadas — a carência de uma significa fornecer o COMPLEXO B inteiro. Vitaminas B são menos estáveis (oxidam-se rapidamente) — usar em quantidades consumidas diariamente, NÃO deixar nos bebedouros de um dia para o outro."},
    ],
    profilaxia:["Fornecer complexo B periodicamente","NÃO deixar vitaminas B na água de um dia para o outro (oxidam-se rapidamente)","A carência de uma vitamina B = fornecer o COMPLEXO B inteiro"],
    recomendacoes:["Vitaminas B oxidam-se rapidamente — preparar solução fresca diariamente","A carência de uma B = fornecer o COMPLEXO B","Necessidades diárias: B1=0,1mg, B2=0,12mg, B6=0,12mg, B12=0,24mg, Biotina=0,002mg, Pantotênico=0,36mg, Fólico=0,014mg"] },
];

/* ═══════════════════════════════════════════════════════════════
   CONSTANTES FISIOLÓGICAS DO POMBO
   ═══════════════════════════════════════════════════════════════ */
export const CONSTANTES = {
  temperatura: "38,8°C — 40°C",
  pesoMedio: "450-500g (macho) / 400-450g (fêmea)",
  aguaPorDia: "30-60 mL/dia (média 45 mL) — 1 litro para 20 pombos. Dobrar no verão (60-100 mL)",
  alimentoPorDia: "30g/dia (média)",
};

/* ═══════════════════════════════════════════════════════════════
   RECOMENDAÇÕES GERAIS
   ═══════════════════════════════════════════════════════════════ */
export const RECOMENDACOES_GERAIS = [
  { titulo:"🚨 Quando procurar atendimento imediato", desc:"Dificuldade respiratória, sangramento, convulsão, torticolos, incapacidade de ficar em pé, intoxicação, trauma grave ou mortalidade súbita exigem atendimento veterinário.", urgente:true },
  { titulo:"📋 Regras de tratamento", desc:"Curativo-sintomático (geral), Preventivo/Profilático (higiene, vacinas), Coadjuvante (antibióticos em doenças virais). Dose insuficiente não cura e produz resistência. Sobredose pode causar efeitos graves (ex: sulfas).", urgente:true },
  { titulo:"💉 Administração de medicamentos", desc:"Forma injetável: subcutânea (pescoço). Forma oral: cápsulas/comprimidos (individual), na água de bebida (quantidade justa conforme época), no alimento (não recomendado), tópicos com cotonete (muguete, tricomoníase, viruela). Vitaminas na água ficam inativas de um dia para o outro.", urgente:false },
  { titulo:"📏 Medidas de referência", desc:"1 colher de café = 1,5-2g | 1 colher de chá = 3,5-4g | 1 colher de sobremesa = 8-10g | 1 colher de sopa = 15g | 20 gotas = 1 mL = 1 cc", urgente:false },
  { titulo:"⚠️ Importante ao usar antibióticos", desc:"Sempre que administrar antibióticos (tetraciclinas, tilosina, eritromicina), fornecer conjuntamente vitaminas, eletrólitos, aminoácidos e reconstituintes da flora intestinal (ex: ácido filofago, yogurte). Ao usar TETRACICLINAS (terramicina), SUPRIMIR O GRIT — sais de cálcio precipitam o antibiótico e o desativam. Não usar simultaneamente produtos interativos.", urgente:true },
  { titulo:"🧼 Profilaxia / Desinfecção", desc:"Iodo povidona é o desinfetante por excelência. Ação bactericida, viricida e fungicida. Aplicar com spray cada vez que limpar o pombal (mínimo 1x/semana). Diluição: 20 cc em 1 litro de água.", urgente:false },
  { titulo:"🔬 Diagnóstico antes do medicamento", desc:"Exame de fezes, cultura, antibiograma e avaliação clínica reduzem tratamentos errados e resistência antimicrobiana.", urgente:false },
  { titulo:"💧 Suporte", desc:"Água limpa, ambiente aquecido quando necessário, redução de estresse e nutrição adequada são essenciais durante a recuperação.", urgente:false },
];

/* ═══════════════════════════════════════════════════════════════
   VITAMINAS — Necessidades diárias por pombo
   ═══════════════════════════════════════════════════════════════ */
export const VITAMINAS = [
  { nome:"Vitamina A", necessidade:"200 UI/dia", acao:"Formação de capilares, pigmentos da retina, revestimentos epiteliais. Coadjuvante em infecções e antiparasitários. Anti-stress e acompanhante de vacinações.", carencia:"Destruição do olho, exsudado nasal, nódulos brancos na boca/faringe" },
  { nome:"Vitamina D3", necessidade:"45 UI/dia", acao:"Absorção e fixação de cálcio e fósforo no esqueleto. Sintetizada a partir de raios UV (sol).", carencia:"Deformação do esterno, ossos frágeis, ovos com casca mole, raquitismo" },
  { nome:"Vitamina E", necessidade:"1 mg/dia", acao:"Manutenção da função reprodutora, fertilidade dos ovos.", carencia:"Encefalomalácia, distrofia muscular" },
  { nome:"Vitamina K", necessidade:"—", acao:"Coagulação do sangue. Coadjuvante em doenças que produzem anemias.", carencia:"Hemorragias → Anemia" },
  { nome:"Vitamina C", necessidade:"0,7 mg/dia", acao:"Formar e manter matéria intercelular. Reforço de cálcio e fósforo. Anti-stress. Aves sintetizam em quantidades suficientes.", carencia:"Rara — as aves sintetizam" },
  { nome:"Vitamina B1 (Tiamina)", necessidade:"0,1 mg/dia", acao:"Antineurítica (anti-nervosa). Metabolismo dos hidratos de carbono.", carencia:"Opistótono, paralisia, atrofia dos órgãos genitais" },
  { nome:"Vitamina B2 (Riboflavina)", necessidade:"0,12 mg/dia", acao:"Metabolismo celular.", carencia:"Diarreia, atraso no crescimento, paralisia das patas" },
  { nome:"Vitamina B6 (Piridoxina)", necessidade:"0,12 mg/dia", acao:"Metabolismo de aminoácidos.", carencia:"Anorexia, convulsões espasmódicas" },
  { nome:"Nicotinamida", necessidade:"—", acao:"Metabolismo dos hidratos de carbono.", carencia:"Inflamações na boca/faringe, arqueamento das patas" },
  { nome:"Vitamina B12 (Cianocobalamina)", necessidade:"0,24 mg/dia", acao:"Vitamina antianémica. Junto com Cobre e Cobalto, formação dos elementos do sangue.", carencia:"Atraso no crescimento, anemia, transtornos na muda, baixa fertilidade" },
  { nome:"Biotina", necessidade:"0,002 mg/dia", acao:"Metabolismo de gorduras e aminoácidos.", carencia:"Dermatite nas patas (patas ásperas, com greta e necrose)" },
  { nome:"Ácido Pantotênico", necessidade:"0,36 mg/dia", acao:"Metabolismo celular.", carencia:"Dermatite, ruptura de penas, perosis, atraso no crescimento" },
  { nome:"Ácido Fólico", necessidade:"0,014 mg/dia", acao:"Formação de células sanguíneas.", carencia:"Anemia, atraso no crescimento, problemas na plumagem, perosis" },
];

/* ═══════════════════════════════════════════════════════════════
   MINERAIS
   ═══════════════════════════════════════════════════════════════ */
export const MINERAIS = [
  { nome:"Sódio (Na)", acao:"Absorção e eliminação de água (diurese)" },
  { nome:"Cálcio (Ca) + Fósforo (P)", acao:"Formação dos ossos (junto com Vitamina D)" },
  { nome:"Potássio (K)", acao:"Funcionamento do músculo cardíaco (tom cardíaco) e diurese" },
  { nome:"Magnésio (Mg)", acao:"Relacionado intimamente com Cálcio e Fósforo" },
  { nome:"Iodo (I)", acao:"Funcionamento normal da glândula tireoide" },
  { nome:"Manganês (Mn)", acao:"Crescimento e reprodução. Carência causa Perosis (deslocamento dos tendões gastronêmios)" },
  { nome:"Cobre (Cu) + Cobalto (Co)", acao:"Junto com Vitamina B12, formação dos elementos do sangue (eritropoese)" },
  { nome:"Ferro (Fe)", acao:"Componente essencial da hemoglobina do sangue" },
];

/* ═══════════════════════════════════════════════════════════════
   AMINOÁCIDOS ESSENCIAIS — Necessidades diárias por pombo
   ═══════════════════════════════════════════════════════════════ */
export const AMINOACIDOS = [
  { nome:"Metionina", necessidade:"0,09 g/dia" },
  { nome:"Lisina", necessidade:"0,18 g/dia" },
  { nome:"Valina", necessidade:"0,06 g/dia" },
  { nome:"Leucina", necessidade:"0,09 g/dia" },
  { nome:"Isoleucina", necessidade:"0,055 g/dia" },
  { nome:"Fenilalanina", necessidade:"0,09 g/dia" },
  { nome:"Triptofano", necessidade:"0,02 g/dia" },
  { nome:"Arginina", necessidade:"— " },
  { nome:"Histidina", necessidade:"— " },
  { nome:"Treonina", necessidade:"— " },
];

/* ═══════════════════════════════════════════════════════════════
   QUIMIOTERÁPICOS — Anti-infecciosos
   ═══════════════════════════════════════════════════════════════ */
export const QUIMIOTERAPICOS = [
  { classe:"Sintéticos", nome:"Sulfametoxazol", acao:"Bacteriostático", dose:"100 mg/pombo/dia", toxicidade:"Pode formar cristais renais" },
  { classe:"Sintéticos", nome:"Trimetoprim", acao:"Bacteriostático", dose:"10-20 mg/pombo ou 200 mg/L água", toxicidade:"Uso combinado com sulfametoxazol" },
  { classe:"Sintéticos", nome:"Furaltadona / Furazolidona", acao:"Bacteriostático", dose:"7,5 mg/pombo/dia", toxicidade:"Amplo espectro, ativo contra micoplasma" },
  { classe:"Sintéticos", nome:"Enrofloxacina (Baytril)", acao:"Bactericida", dose:"5-10 mg/pombo ou 200 mg/L água", toxicidade:"Amplo espectro, ativo contra micoplasma" },
  { classe:"Biosintéticos (Antibióticos)", nome:"Tilosina (Tylan)", acao:"Bacteriostático", dose:"12-25 mg/pombo", toxicidade:"Indicado na micoplasmose" },
  { classe:"Biosintéticos (Antibióticos)", nome:"Neomicina", acao:"Bactericida", dose:"5-25 mg/pombo", toxicidade:"Utilizado em diarreias infecciosas" },
  { classe:"Biosintéticos (Antibióticos)", nome:"Estreptomicina", acao:"Bactericida", dose:"50-100 mg/pombo", toxicidade:"Diarreias infecciosas" },
  { classe:"Biosintéticos (Antibióticos)", nome:"Cloranfenicol", acao:"Bacteriostático", dose:"50 mg/pombo 2x/dia", toxicidade:"⚠️ Administração prolongada provoca anemia fatal" },
  { classe:"Biosintéticos (Antibióticos)", nome:"Clortetraciclina", acao:"Bacteriostático amplo espectro", dose:"15-25 mg/pombo/dia ou 1-1,5 g/L água", toxicidade:"⚠️ Retirar o GRIT durante administração (sais de cálcio desativam)" },
  { classe:"Antimicóticos", nome:"Nistatina", acao:"Candidíase", dose:"100.000 UI/L água", toxicidade:"3 semanas" },
  { classe:"Antimicóticos", nome:"Cetoconazol", acao:"Candidíase", dose:"12-15 mg/pombo 2x/dia", toxicidade:"15 dias" },
];

/* ═══════════════════════════════════════════════════════════════
   ANTIPARASITÁRIOS
   ═══════════════════════════════════════════════════════════════ */
export const ANTIPARASITARIOS = [
  { classe:"Nematódeos (vermes redondos)", nome:"Piperazina", acao:"Ascaris adultos", dose:"0,5 g/pombo/2 dias", toxicidade:"—" },
  { classe:"Nematódeos (vermes redondos)", nome:"Levamisol (Ripercol)", acao:"Ascaricida + Capilaricida", dose:"10-20 mg/pombo 2 dias ou 400 mg/L água — repetir 15 dias", toxicidade:"Pode produzir vômitos passageiros. Excelente imunomodulador." },
  { classe:"Nematódeos (vermes redondos)", nome:"Ivermectina (Ivomec)", acao:"Parasitas internos e externos", dose:"0,1 mg/pombo — repetir 10 dias", toxicidade:"—" },
  { classe:"Nematódeos + Ténias", nome:"Mebendazol", acao:"Ascaris, Capillária e Ténias", dose:"5-7 mg/pombo/2 dias", toxicidade:"⚠️ Pode diminuir fertilidade e afetar plumagem na muda" },
  { classe:"Nematódeos + Ténias", nome:"Albendazol (Vermix A)", acao:"Ascaris, Capillária e Ténias", dose:"Conforme prescrição", toxicidade:"⚠️ Idem mebendazol" },
  { classe:"Ténias", nome:"Niclosamida", acao:"Ténias", dose:"100 mg/pombo", toxicidade:"—" },
  { classe:"Tricomonícidas", nome:"Metronidazol", acao:"Tricomonas", dose:"20-25 mg/pombo 5 dias ou 1 g/L água", toxicidade:"—" },
  { classe:"Tricomonícidas", nome:"Dimetridazol (Emtril)", acao:"Tricomonas", dose:"5-25 mg/pombo 5 dias ou 0,5 g/L água", toxicidade:"⚠️ Sobredose é MUITO tóxica" },
  { classe:"Tricomonícidas", nome:"Ronidazol", acao:"Tricomonas", dose:"2 mg/pombo 5 dias ou 2 g/L água", toxicidade:"—" },
  { classe:"Coccidicidas", nome:"Sulfaquinoxalina", acao:"Coccidios", dose:"50 mg/pombo ou 0,25 g/L água — 3 dias, descansar 3, repetir 2 dias", toxicidade:"⚠️ Produz cálculos renais" },
  { classe:"Coccidicidas", nome:"Sulfamerazina", acao:"Coccidios", dose:"1,5 g/L água", toxicidade:"⚠️ Idem sulfaquinoxalina" },
  { classe:"Coccidicidas", nome:"Sulfadimetoxina", acao:"Coccidios", dose:"0,5 g/L água", toxicidade:"⚠️ Idem sulfaquinoxalina" },
  { classe:"Coccidicidas", nome:"Clazuril", acao:"Coccidios", dose:"2,5 mg/pombo — dose única", toxicidade:"Baixa ou nula toxicidade" },
  { classe:"Coccidicidas", nome:"Toltrazuril (Baycox)", acao:"Coccidios", dose:"7-15 mg/pombo — 2 dias", toxicidade:"Baixa ou nula toxicidade" },
  { classe:"Coccidicidas", nome:"Amprólio (Amprolium)", acao:"Coccidios", dose:"20 mg/pombo", toxicidade:"—" },
];
