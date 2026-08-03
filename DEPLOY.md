# 🚀 Deploy do Nutri Pombos na Vercel

## Pré-requisitos

1. **Conta no Vercel** — [vercel.com](https://vercel.com) (free tier funciona)
2. **Banco PostgreSQL** — recomendado: Neon (free tier)

---

## Passo 1 — Criar banco PostgreSQL (Neon)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta (free)
2. Crie um novo projeto: nome `nutri-pombos`
3. Copie a **connection string** (algo como):
   ```
   postgresql://neondb_owner:senha@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Guarde essa URL — será sua `DATABASE_URL`

---

## Passo 2 — Deploy na Vercel

### Opção A: Via Dashboard (mais fácil)

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique **"Add New..." → "Project"**
3. Importe o repo **`Glauciano/Nutri-Pombo-Vendas-2`**
4. Em **Configure Project**:
   - **Framework Preset:** Next.js ✅
   - **Root Directory:** deixe vazio (projeto já está na raiz)
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
5. Em **Environment Variables**, adicione:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://...` (do Neon) |

6. Clique **Deploy** 🎉

### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Adicionar env vars
vercel env add DATABASE_URL

# Redeploy com as vars
vercel --prod
```

---

## Passo 3 — Criar tabelas no banco

Depois do deploy, você precisa criar as tabelas no PostgreSQL. Rode localmente:

```bash
# Instalar dependências
npm install

# Rodar migrations (usa DATABASE_URL do .env.local)
npx drizzle-kit push
```

Ou, se preferir gerar SQL e rodar manualmente no Neon:

```bash
npx drizzle-kit generate
# Os SQLs ficam em drizzle/meta/
```

---

## Passo 4 — Criar primeiro usuário admin

Use a tela de cadastro do app (`/cadastro`) ou rode SQL diretamente no banco:

```sql
-- No SQL Editor do Neon
INSERT INTO usuarios (nome, email, senha_hash, plano, acesso_ativo)
VALUES ('Admin', 'admin@nutripombos.com', 'HASH_BCRYPT', 'admin', true);
```

Para gerar o hash bcrypt localmente:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('sua_senha', 10));"
```

---

## Passo 5 — Verificar

1. Acesse a URL que o Vercel gerou (ex: `nutri-pombos.vercel.app`)
2. Teste a tela de login
3. Teste o NutriBot (`/centro-provas/nutribot`)
4. Confira o health check: `nutri-pombos.vercel.app/api/health`

---

## Estrutura do projeto

```
├── src/
│   ├── app/
│   │   ├── login/page.tsx       ← tela de login
│   │   ├── cadastro/page.tsx    ← tela de cadastro
│   │   ├── centro-provas/       ← área protegida (módulos)
│   │   └── api/                 ← rotas API
│   ├── components/auth-form.tsx ← formulário auth
│   ├── db/                      ← schema + conexão PostgreSQL
│   ├── lib/auth.ts              ← sessões/cookies
│   └── middleware.ts            ← auth middleware
├── .env.example                 ← documentação das env vars
├── drizzle.config.json          ← Drizzle ORM config
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Problemas comuns

| Problema | Solução |
|---|---|
| `DATABASE_URL is required` | Adicione a env var no Vercel dashboard |
| Login trava/fica branco | ✅ Já corrigido |
| Tabela não existe | Rode `npx drizzle-kit push` |
| Login redireciona errado | ✅ Já corrigido (preserva path original) |

---

## Custos (free tier)

| Serviço | Free tier |
|---|---|
| **Vercel** | 100GB bandwidth, Serverless Functions |
| **Neon PostgreSQL** | 0.5GB storage, 100k compute hours |

Total: **R$ 0/mês** para começar 🎉
