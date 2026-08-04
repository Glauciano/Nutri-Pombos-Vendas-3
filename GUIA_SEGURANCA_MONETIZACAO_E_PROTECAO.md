# 🛡️ GUIA DE SEGURANÇA, PROTEÇÃO CONTRA CÓPIA & ASSINATURAS MENSAIS

Como programar, gerenciar e blindar o aplicativo **Nutri Pombos Vendas** contra compartilhamento indevido de senhas, cópia de código-fonte e gerenciar assinaturas mensais recorrentes.

---

## 1. 💳 COMO PROGRAMAR E GERENCIAR ASSINATURAS MENSAIS (`/api/webhook/pagamento`)

O modelo de **Assinatura Mensal Recorrente** (ex.: **R$ 29,90 / mês**) é a forma mais rentável de monetizar um SaaS esportivo.

### Como a automação de pagamento funciona na prática:
1. **No Banco de Dados (`src/db/schema.ts`):**  
   A tabela `usuarios` já possui os campos essenciais:
   * `plano`: `'teste' | 'mensal' | 'anual' | 'vitalicio' | 'admin'`
   * `acesso_ativo`: boolean (`true` / `false`)
   * `acesso_ate`: data exata de expiração do plano.
2. **Plataforma de Pagamento:**  
   Você cadastra o plano de assinatura em gateways brasileiros como **Kiwify**, **Mercado Pago**, **Asaas** ou **Hotmart**.
3. **Notificação Instantânea (Webhook Automático):**  
   Acabamos de implementar a rota oficial de processamento de pagamentos:  
   👉 **`https://SEU-LINK.vercel.app/api/webhook/pagamento`**
   * Quando o cliente faz o pagamento no cartão ou Pix, o Mercado Pago / Kiwify envia uma notificação para esse endereço.
   * O aplicativo localiza o e-mail do cliente no PostgreSQL, renova automaticamente para `plano = 'mensal'`, ativa `acesso_ativo = true` e estende a validade `acesso_ate` por mais 35 dias (30 dias + carência).
   * Se o pagamento for cancelado ou estornado (`cancelled` / `refunded`), o Webhook suspende o acesso na mesma hora!

---

## 2. 🚫 COMO TER A CERTEZA DE QUE ELES NÃO VÃO COMPARTILHAR A CONTA ENTRE SI?

Uma dúvida comum em sistemas pagos é: *"E se o João assinar por R$ 29,90 e passar o e-mail e senha para 10 amigos do clube usarem de graça?"*

### Como blindamos o Nutri Pombos contra compartilhamento de senhas:
1. **Bloqueio de Simultaneidade (Sessão Única por Conta — Já Implementado!):**
   * Em `src/lib/auth.ts`, ativamos uma regra anti-compartilhamento: toda vez que um usuário faz login, o sistema **remove automaticamente as sessões anteriores daquele mesmo usuário** (`DELETE FROM sessoes WHERE usuario_id = X`).
   * **O que acontece na prática:** Se o "João" passar a senha dele para o "Pedro" e o Pedro entrar no celular, a sessão do João no computador dele é **derrubada na mesma hora**!
   * Quando o João tentar usar de novo, ele toma logout e derruba o Pedro. Eles perceberão rapidamente que **é impossível duas ou mais pessoas utilizarem a mesma conta ao mesmo tempo**.
2. **Marca D'Água nos Documentos e Certificados (`/centro-provas/certificado`):**
   * Quando um columbófilo emite o Certificado Oficial de Pedigree para Leilão em PDF, o sistema imprime o nome e dados do proprietário da conta no cabeçalho do documento. Ninguém quer emitir o pedigree dos próprios pombos com o nome do vizinho estampado no papel!
3. **Histórico e Plantel Individual:**
   * O aplicativo gerencia a linhagem, casais de viuvez e constatação individual do pombal de cada usuário. Se duas pessoas dividirem a mesma conta, os pombos e treinos de um vão se misturar com os do outro, inutilizando as calculadoras e o Pombo Ás FCI.

---

## 3. 🔒 COMO TER A CERTEZA DE QUE NÃO VÃO COPIAR OU ROUBAR O APP?

Muitos desenvolvedores têm receio de que alguém "copie" o site ou roube as fórmulas de cálculo. Veja por que o seu aplicativo na Vercel e GitHub é **tecnicamente impossível de ser copiado ou clonado por usuários**:

### 3.1. Arquitetura em Nuvem (O Código Roda Fechado no Servidor)
* O Nutri Pombos foi desenvolvido em **Next.js App Router (Server Components e API Routes)**.
* Quando um usuário acessa `nutri-pombos-vendas-3.vercel.app`, o navegador dele **só recebe a interface visual (HTML, CSS e JavaScript compilado de exibição)**.
* Todo o código-fonte real (`src/`), as regras de negócio, os algoritmos do Pombo Ás, as fórmulas do Simulador Genético e do Vento, e as senhas do banco de dados (`DATABASE_URL`) **ficam 100% protegidos dentro dos servidores seguros da Vercel e do seu repositório privado no GitHub**.
* Nenhum concorrente ou visitante consegue abrir, visualizar ou baixar o código do seu backend ou do banco de dados.

### 3.2. Banco de Dados Protegido por Criptografia SSL
* O seu banco PostgreSQL no Neon é protegido por autenticação SSL/TLS (`sslmode=require`). Ninguém consegue se conectar às suas tabelas sem a string de conexão que só existe dentro das variáveis de ambiente da sua Vercel.

### 3.3. Direitos Autorais e Proteção Legal
* O código original, design e marca **Nutri Pombos** são de sua propriedade intelectual. Em termos técnicos de segurança web, a sua aplicação tem o mesmo nível de proteção estrutural que plataformas profissionais bancárias e de SaaS em nuvem.

---
*Manual de Proteção & Segurança gerado por Nutri Pombos • Arquitetura de Software (2026).*
