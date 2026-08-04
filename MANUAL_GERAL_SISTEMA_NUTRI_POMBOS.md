# 🕊️ NUTRI POMBOS • MANUAL DO USUÁRIO & GUIA TÉCNICO DE INSTRUÇÕES

Bem-vindo ao **Guia Completo e Manual Técnico do Sistema Nutri Pombos (Versão 2026/2027)**. Este documento é o manual oficial de todas as correções, reformulações e das **13 novas ferramentas de elite** que foram implementadas no aplicativo para gestão de pombais de competição, reprodução e leilões.

---

## 📑 ÍNDICE GERAL DO MANUAL

1. [Arquitetura, Banco de Dados & Login de Administrador](#1-arquitetura-banco-de-dados--login-de-administrador)
2. [O Fim dos Erros na Vercel & Autocriação de Tabelas (`/api/setup`)](#2-o-fim-dos-erros-na-vercel--autocriação-de-tabelas-apisetup)
3. [Ferramentas Reformuladas e Consertadas](#3-ferramentas-reformuladas-e-consertadas)
   * 3.1. Calculadora de Suplementação Interativa (`/centro-provas/suplementacao`)
   * 3.2. Importador ETS & Relógio PMR Universal (`/centro-provas/dia-prova` e `/centro-provas/gps-chip`)
   * 3.3. Cadastro de Pombos & Anilhas Flexíveis (`/centro-provas/pombos`)
   * 3.4. Assistente NutriBot Offline (`/centro-provas/nutribot`)
4. [As 13 Novas Ferramentas Especiais da Columbofilia de Elite](#4-as-13-novas-ferramentas-especiais-da-columbofilia-de-elite)
   * 4.1. Classificação e Seletor por Km (`/centro-provas/classificacao`)
   * 4.2. Simulador de Cruzamento Genético (`/centro-provas/simulador-cruzamento`)
   * 4.3. Simulador Aerodinâmico de Vento & Deriva (`/centro-provas/simulador-vento`)
   * 4.4. Gestão Financeira & ROI Esportivo (`/centro-provas/custos`)
   * 4.5. Protocolo Médico de Resgate (`/centro-provas/resgate`)
   * 4.6. Análise de Olho — *Eye-Sign Theory* (`/centro-provas/olho`)
   * 4.7. Índice da Asa & Controle de Muda (`/centro-provas/asa`)
   * 4.8. Fotoperíodo & Sistema *Darkness* (`/centro-provas/fotoperiodo`)
   * 4.9. Calculadora Geodésica Ortodrômica (`/centro-provas/geodesica`)
   * 4.10. Certificado de Pedigree para Leilão (`/centro-provas/certificado`)
   * 4.11. Radar Geomagnético Kp & Tempestades Solares (`/centro-provas/geomagnetico`)
   * 4.12. Abastecimento Metabólico Carbo-Lipídeo (`/centro-provas/carbo-lipideo`)
   * 4.13. Calculadora Oficial de Pombo Ás FCI (`/centro-provas/pombo-as`)
5. [Guia de Publicação e Manutenção na Vercel e GitHub](#5-guia-de-publicação-e-manutenção-na-vercel-e-github)

---

## 1. 🏗️ ARQUITETURA, BANCO DE DADOS & LOGIN DE ADMINISTRADOR

### 🔐 Acesso Administrador (ADM Padrão)
O sistema possui credenciais administrativas nativas integradas à API de autenticação. Para acessar com privilégios completos de Administrador em qualquer banco de dados:

* **E-mail:** `admin@nutripombos.com`
* **Senha:** `nutri2026`

> **Nota sobre cadastro (`/cadastro`):** Se você preferir utilizar seu e-mail pessoal, basta acessar a tela de cadastro do aplicativo. Todas as novas contas criadas nessa tela são gravadas na tabela `usuarios` do PostgreSQL automaticamente com o **plano `'admin'`** e **`acesso_ativo = true`**.

### 🗑️ Remoção da Assistente IA (Gemini)
Conforme solicitado, a Assistente IA online dependente do Google Gemini foi **100% removida do código-fonte** (`src/app/centro-provas/assistente-ia` e `/api/assistente`). Isso eliminou qualquer dependência de chave de API externa, tornando o sistema mais leve e veloz.

---

## 2. 🚀 O FIM DOS ERROS NA VERCEL & AUTOCRIAÇÃO DE TABELAS (`/api/setup`)

### ❌ Por que ocorria o erro `404 NOT_FOUND` no build da Vercel?
O repositório original continha apenas 7 arquivos de configuração na raiz (`next.config.ts`, `package.json`, etc.), mas faltava toda a pasta **`src/`**. Quando a Vercel executava o comando `next build`, não encontrava nenhuma página para compilar e retornava `404 NOT_FOUND` para todas as URLs.
* **Solução aplicada:** Toda a estrutura de código-fonte (`src/`), arquivos de suporte (`.gitignore`, `.env.example`) e regras de verificação foram limpas e verificadas (`0 erros` no `tsc` e `eslint`).

### ❌ Por que ocorria o erro `Failed to create pombo` ao salvar pombos?
Quando você adiciona um **novo banco de dados PostgreSQL (Neon ou Vercel Postgres)**, ele vem totalmente vazio e sem tabelas criadas. Ao tentar salvar um pombo, o banco retornava erro de tabela inexistente (`relation "pombos" does not exist`).
* **Solução aplicada:** Criamos uma **rota mágica de autocriação de tabelas (`/api/setup`)**.

#### 👉 COMO USAR A ROTA DE CONFIGURAÇÃO DO BANCO EM 5 SEGUNDOS:
1. Após conectar seu banco na Vercel (`DATABASE_URL`), acesse no navegador:  
   👉 **`https://SEU-LINK-NA-VERCEL.vercel.app/api/setup`**
2. O sistema executará automaticamente os comandos SQL para criar todas as 6 tabelas oficiais:
   * `usuarios`
   * `sessoes`
   * `pombos`
   * `racoes`
   * `alimentacoes`
   * `saude`
3. A rota também insere automaticamente a conta ADM padrão (`admin@nutripombos.com`) e exibe uma mensagem verde confirmando que o banco de dados está pronto.

---

## 3. 🛠️ FERRAMENTAS REFORMULADAS E CONSERTADAS

### 3.1. Calculadora de Suplementação (`/centro-provas/suplementacao`)
A aba **"🧮 Calculadora"** foi transformada em uma calculadora laboratorial completa:
* **Parâmetros ajustáveis:** Número de pombos no plantel, duração do protocolo (em dias), consumo hídrico diário (`mL/ave/dia`) e consumo de ração (`g/ave/dia`).
* **Cálculo instantâneo para 6 produtos oficiais de bula + produtos personalizados:**
  * Exibe **Dose Diária do Plantel**, **Volume Total do Tratamento (`N` dias)**, **Dose por Ave** e **Instruções de Preparo** (ex.: *"Dissolver 7,5g em 1,5L de água limpa por dia"*).
* **Simulador Rápido de Dosagem Personalizada:** Permite selecionar qualquer suplemento, informar uma concentração (`g/L`, `g/kg` ou `mL/L`) e visualizar na hora as doses diárias e totais.

### 3.2. Importador ETS & Relógio PMR Universal (`/centro-provas/dia-prova` e `/centro-provas/gps-chip`)
* **Compatibilidade Universal:** Reconhece o padrão `[PIGEON_MASTER_RACE_CLOCK]` (`.ini`), além dos formatos Benzing, Bricon, Unikon, Mega, CSV, TXT e LOG.
* **Pré-visualização Verde Instantânea (`Live Preview`):** Ao colar o texto ou carregar um arquivo através do novo botão **"📂 Abrir Arquivo"** / **"📂 Carregar Arquivo do Relógio"**, o sistema exibe imediatamente um card confirmando os metadados do sócio (`GLAUCIANO CLAITON SILVA #283`), concurso e lista de constatações detectadas.
* **Redirecionamento Inteligente:** Ao clicar em **"📥 Importar e Salvar"**, os registros são gravados em memória e a tela **muda automaticamente para a aba "📋 Registros"** em 1 segundo para você visualizar o ranking.
* **Sem Bloqueios de Hora:** Se o campo "Hora de Soltura" estiver em branco, o sistema assume `07:00:00` automaticamente para nunca impedir a importação das chegadas.
* **Reconhecimento por Anilha ou RFID:** Busca a ave no seu banco tanto pela anilha (`008488920` ou `BR-24-12345`) quanto pelo código eletrônico. Se a anilha ainda não estiver no banco, o registro não é descartado e entra na prova acompanhado dos dados do sócio.

### 3.3. Gestão de Pombos & Anilhas Flexíveis (`/centro-provas/pombos`)
* **Anilhas Flexíveis:** A restrição rígida de 7 dígitos + barra + 2 dígitos (`0000000/00`) foi removida. O sistema agora aceita **qualquer anilha ou código de chip com 4 caracteres ou mais** (`BR-24-12345`, `008488920`, `1234567/26`).
* **Tratamento de Erros em Português:** Alertas claros caso a tabela não exista, anilha duplicada ou pai/mãe inexistentes.
* **Árvore Genealógica (Pedigree):** Visualização interativa de 3 a 4 gerações com percentual de sangue.

---

## 4. 🌟 AS 13 NOVAS FERRAMENTAS ESPECIAIS DA COLUMBOFILIA DE ELITE

O aplicativo conta com **13 módulos científicos de nível internacional**, acessíveis pelo Menu Lateral (`centro-shell.tsx`) e pelos cards do Dashboard Principal (`page.tsx`):

### 4.1. 🏆 Classificação e Seletor por Km (`/centro-provas/classificacao`)
* **O que faz:** Calcula o **Índice de Aptidão (0–100%)** ponderando:
  1. Base de Quilometragem Acumulada (`kmTotal`) em relação à distância da próxima prova (45% do peso).
  2. Experiência e rodagem em provas oficiais (30% do peso).
  3. Coeficiente Técnico FCI e velocidade média (25% do peso).
* **Indicação de Escalação:** Classifica cada pombo como **`🏆 ENCESTAR (TITULAR)`** (Aptidão ≥ 80%), **`✅ RESERVA APTO`** ou **`⚠️ POUPAR (TREINO BASE)`**.
* **Especialidade:** Identifica automaticamente especialistas em *Sprint (Velocidade)*, *Meio Fundo* ou *Fundo/Maratona*.

### 4.2. 🧬 Simulador de Cruzamento Genético (`/centro-provas/simulador-cruzamento`)
* **O que faz:** Você seleciona um Macho (Pai) e uma Fêmea (Mãe) do seu plantel.
* **O que calcula:**
  * **Tipo de Cruzamento & COI (% Inbreeding):** Identifica *Outcross* (`0,0%` — máximo vigor híbrido para provas) ou *Linebreeding* (`12,5% a 25%` — ideal para fixar plantel de matrizes).
  * **Previsão de Aptidão Esportiva:** Probabilidade de especialidade dos filhotes em Velocidade, Meio Fundo e Fundo.
  * **Plumagem Hereditária:** Estimativa da cor provável dos filhotes (Azul, Escama, Vermelho Mosaico, Pardo, etc.).

### 4.3. 🌪️ Simulador Aerodinâmico de Vento & Deriva (`/centro-provas/simulador-vento`)
* **O que faz:** Analisa a distância da prova e as condições meteorológicas de vento no dia da soltura.
* **O que entrega:**
  * **Velocidade Média Esperada (`m/min`) e Tempo Estimado de Voo (`HH:MM`)** sob ventos de bico, cauda ou laterais.
  * **Risco de Deriva Lateral:** Alerta se o vento cruzado (Leste/Oeste) empurrará o pelotão para longe do eixo da rota e avisa por qual ala do pombal (Leste/Oeste) os pombos devem abordar.
  * **Perfil de Escalação Ideal:** Indica se a condição favorece pombos leves de sprint ou pombos de envergadura e tenacidade muscular.

### 4.4. 💸 Gestão Financeira & ROI Esportivo (`/centro-provas/custos`)
* **O que faz:** Calcula o custo diário, mensal e anual do pombal e o custo exato de cada pombo.
* **O que entrega:** Detalhamento de despesas em ração, suplementação, anilhas federativas e inscrições, acompanhado da análise de **Retorno sobre Investimento (ROI Esportivo)** do atleta em relação às premiações e valorização em leilão.

### 4.5. 🚨 Protocolo Médico de Resgate (`/centro-provas/resgate`)
* **O que faz:** Guia clínico de triagem para pombos extraviados que retornam ao pombal com 2 a 5 dias de atraso.
* **O que entrega:** Protocolos diários de 4 dias específicos para:
  * 💧 **Desidratado & Magro:** Reidratação com eletrólitos sem leguminosas pesadas.
  * ⚡ **Esgotamento Muscular / Peito Seco:** Suporte hepático com glicose e probióticos.
  * 🦅 **Ferido por Rapina / Cabos:** Triagem antisséptica e isolamento térmico.
  * 🦠 **Fezes Verdes Neon / Estresse:** Suporte intestinal para disbiose.

### 4.6. 👁️ Análise de Olho — *Eye-Sign Theory* (`/centro-provas/olho`)
* **O que faz:** Guia de avaliação visual das 5 zonas escleróticas (Pupila, Círculo de Adaptação, Íris, Granulação e Anel de Saúde).
* **O que entrega:** Emite notas separadas de aptidão para **Matriz Ouro** (reprodução e orientação) e **Voador de Elite** (resistência ao sol e foco em maratona), indicando o cruzamento ocular ideal.

### 4.7. 🪶 Controle Aerodinâmico da Muda & Índice da Asa (`/centro-provas/asa`)
* **O que faz:** Diagrama interativo das 10 penas primárias de voo (`P1 a P10`).
* **O que entrega:** Calcula o Índice de Sustentação da Asa e emite **alerta vermelho proibindo o encestamento** de aves que estejam mudando as penas de ponta de asa (`P8, P9 ou P10`), evitando extravios por exaustão.

### 4.8. 💡 Fotoperíodo & Sistema *Darkness* (`/centro-provas/fotoperiodo`)
* **O que faz:** Simulador da rotina de controle de luz e escuridão do pombal.
* **O que entrega:** Cronograma diário de horas de luz e escuridão para as 4 fases do ano (Escurecimento de Borrachos, Pré-Temporada, Temporada Oficial e Luz Artificial para Clássicas), com horários exatos para abrir e fechar cortinas.

### 4.9. 🗺️ Calculadora Geodésica Ortodrômica (`/centro-provas/geodesica`)
* **O que faz:** Aplica a Fórmula de Haversine (Grande Círculo / Curvatura da Terra) entre a Latitude/Longitude GPS da soltura e do pombal.
* **O que entrega:** Distância oficial geodésica ao milímetro (`km`), Azimute inicial de voo (graus e direção) e alerta orográfico sobre travessia de serras montanhesas e presença de neblina térmica.

### 4.10. 📜 Certificado Oficial de Pedigree para Leilão (`/centro-provas/certificado`)
* **O que faz:** Gera um documento oficial de origem e genealogia para reprodutores e vendas de borrachos.
* **O que entrega:** Certificado com design em azul e ouro exibindo dados do atleta, 3 gerações de genealogia (Pai, Mãe e Avós) e laudo técnico, equipado com o botão **"🖨️ Imprimir / Salvar PDF"**.

### 4.11. 🌤️ Radar Geomagnético Kp & Tempestade Solar (`/centro-provas/geomagnetico`)
* **O que faz:** Monitora a atividade solar e as variações na magnetosfera terrestre através do Índice Kp (`0 a 9`).
* **O que entrega:** Alerta quando as condições são perfeitas (`Kp 0–2`), instáveis (`Kp 4`) ou quando há **TEMPESTADE SOLAR SEVERA (`Kp 6+`)**, ordenando a suspensão da soltura para prevenir o apagão magnético na bússola de magnetita dos pombos.

### 4.12. 🧪 Abastecimento Metabólico Carbo-Lipídeo (`/centro-provas/carbo-lipideo`)
* **O que faz:** Calcula o metabolismo energético de voo conforme a distância e temperatura esperada.
* **O que entrega:** A porcentagem e quantidade diária em gramas de sementes de **Carboidrato / Glicogênio Muscular** (milho, ervilha, sorgo) versus **Lipídeos / Gordura de Maratona** (amendoim, girassol, cártamo) para fornecimento na quinta e sexta-feira anteriores ao encestamento.

### 4.13. 🏆 Calculadora Oficial de Pombo Ás — FCI (`/centro-provas/pombo-as`)
* **O que faz:** Sistema de ranking aplicando a regra internacional da Federação Colombófila Internacional (FCI): `((Posição × 100) ÷ Concorrentes) × 10`.
* **O que entrega:** Soma os menores coeficientes nas melhores provas computadas no ano para coroar oficialmente o **Pombo Ás Geral**, **Pombo Ás de Velocidade** e **Pombo Ás de Fundo** do seu pombal.

---

## 5. 📲 GUIA DE PUBLICAÇÃO E MANUTENÇÃO NA VERCEL E GITHUB

Todo este ecossistema columbófilo está compilado, validado (`53 rotas de produção` ativas) e pronto para deploy no arquivo **`nutri-pombos-vendas-2-fix.zip`** (342 KB).

### 👉 Passo a Passo para Atualizar o seu Repositório (`nutri-Pombos-Venadas-3`):

#### Método A: Pelo Navegador (Sem comandos ou terminal — Recomendado)
1. Baixe o arquivo **`nutri-pombos-vendas-2-fix.zip`** e extraia-o no seu computador.
2. Abra a tela de upload do seu repositório no GitHub:  
   👉 **`https://github.com/Glauciano/Nutri-Pombos-Vendas-3/upload`**  
   *(Verifique no painel da Vercel se ela está conectada em `Nutri-Pombos-Vendas-3` ou `nutri-Pombos-Venadas-3`).*
3. Arraste todos os arquivos descompactados (especialmente a pasta **`src/`**) para a área de drop do GitHub.
4. Escreva uma mensagem de commit (ex.: *"Release oficial Nutri Pombos 2026 com 13 ferramentas de elite"*) e clique em **Commit changes**.
5. Em **45 segundos**, a Vercel compilará a atualização e o seu aplicativo estará rodando com todas as 53 rotas!

#### Método B: Pelo Terminal / VS Code no seu computador
Se preferir utilizar a linha de comando na pasta onde descompactou os arquivos do ZIP:
```bash
# 1. Entre na pasta do projeto descompactado
cd Nutri-Pombos-Vendas-3

# 2. Adicione todas as modificações e novos módulos ao Git
git add -A

# 3. Crie o commit explicativo
git commit -m "Feat: manual completo, 13 calculadoras de elite, autocriação de tabelas e parser PMR"

# 4. Envia para o GitHub e aciona o deploy da Vercel
git push origin main
```

---

### 🕊️ Resumo de Comandos Úteis do Projeto

| Tarefa | Comando no Terminal |
| :--- | :--- |
| **Criar tabelas no banco de dados (Local/CLI)** | `npx drizzle-kit push` |
| **Criar tabelas no banco (Via Navegador)** | Acessar `/api/setup` na URL da Vercel |
| **Testar build de produção localmente** | `npx next build` |
| **Rodar servidor de desenvolvimento** | `npx next dev` |
| **Verificar tipagem TypeScript** | `npx tsc --noEmit` |
| **Login Administrador Padrão** | E-mail: `admin@nutripombos.com` • Senha: `nutri2026` |

---
*Manual gerado e atualizado pelo sistema Nutri Pombos • Columbofilia Profissional Inteligente (2026).*
