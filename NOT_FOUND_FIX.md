# 🚨 NOT_FOUND no Vercel — Diagnóstico e Solução

## 1. 🔧 O FIX (O que fazer agora)

O repositório `Nutri-Pombo-Vendas-2` no GitHub tem **apenas 7 arquivos de configuração** — toda a pasta `src/` nunca foi enviada. O Vercel faz o build, não encontra nenhuma página, e retorna NOT_FOUND.

### Como resolver

No seu terminal local, clone o repositório corrigido e force-push:

```bash
# 1. Clone o repo original (que tem os fontes)
git clone https://github.com/Glauciano/Nutri-Pombos-Vendas.git ref-fontes

# 2. Clone o repo Vendas-2 (que está quebrado)
git clone https://github.com/Glauciano/Nutri-Pombo-Vendas-2.git
cd Nutri-Pombo-Vendas-2

# 3. Copie toda a pasta src/ do original
cp -r ../ref-fontes/src .

# 4. Copie os arquivos de suporte
cp ../ref-fontes/.env.example .
cp ../ref-fontes/.gitignore .
cp ../ref-fontes/DEPLOY.md .

# 5. Atualize o package.json (adiciona @neondatabase/serverless e @types/bcryptjs)
# Substitua o package.json pelo conteúdo do repo corrigido (ver abaixo)

# 6. Remova a Assistente IA
rm -rf src/app/centro-provas/assistente-ia
rm -rf src/app/api/assistente

# 7. Aplique as correções no centro-shell.tsx (remover "Assistente IA" do menu)
# Aplique as correções no db/index.ts (adicionar isDbConfigured)
# Aplique as correções no page.tsx (fallback quando DB falha)
# Adicione error.tsx, global-error.tsx, icon.svg

# 8. Instale, teste e faça push
npm install
npx next build   # deve passar sem erros
git add -A
git commit -m "Fix: restore src/, remove Assistente IA, add error boundaries"
git push origin main
```

Após o push, o Vercel vai re-deploy automaticamente e o site funcionará.

---

## 2. 🔍 ROOT CAUSE (Por que aconteceu)

### O que o código estava fazendo
O repo `Nutri-Pombo-Vendas-2` continha **apenas** estes 7 arquivos:
```
drizzle.config.json
eslint.config.mjs
next.config.ts
package-lock.json
package.json
postcss.config.mjs
tsconfig.json
```

### O que precisava ter
A pasta `src/` inteira com 54+ arquivos de código-fonte.

### O que aconteceu no Vercel
1. Vercel clona o repo → encontra só configs
2. Roda `next build` → compila com sucesso (não há páginas para compilar)
3. Gera 0 rotas → todo URL retorna NOT_FOUND (404)
4. O favicon `/favicon.ico` também não existe → 404 extra

### O erro de Server Components
Mesmo que o `src/` estivesse presente, as páginas Server Components (home, pombos, centro-provas) crashavam ao tentar acessar o banco PostgreSQL sem `DATABASE_URL`, causando o erro:

> "An error occurred in the Server Components render"

### A visão errada
"Preciso corrigir o código que está no repo" — mas o código **não estava no repo**. O problema era infraestrutura/arquivos, não lógica.

---

## 3. 📚 CONCEITO (O que aprender)

### Por que o NOT_FOUND existe
O Vercel não serve páginas que não existem no build output. Se o build produz 0 rotas, **toda** URL é 404. Isso protege contra:
- Deploys acidentais de repos vazios
- Builds que falham silenciosamente
- Projetos mal configurados

### Modelo mental correto
```
GitHub repo → Vercel clona → npm install → next build → .next/ output → Serve rotas
                                      ↑
                              Se src/ não existe, 0 rotas são geradas
```

**O Vercel só serve o que o build produz.** Se o build não produz nada, nada é servido.

### Por que o Server Components crash também é NOT_FOUND
Quando um Server Component lança uma exceção não tratada, o Next.js não consegue renderizar a página. Em produção, o erro é genérico e o Vercel pode retornar NOT_FOUND ou uma página de erro.

---

## 4. ⚠️ SINAIS DE ALERTA (Como reconhecer no futuro)

### ❌ Red flags que causam NOT_FOUND no Vercel

| Sinal | O que significa |
|-------|----------------|
| `git ls-files` mostra só configs | A pasta `src/` nunca foi commitada |
| Build gera 0 rotas | Nenhuma página foi encontrada |
| Server Component sem try/catch | Vai crashar se DB/serviço falhar |
| Sem `error.tsx` | Erro vira "This page couldn't load" sem recuperação |
| Sem favicon | Gera 404 extra no console |
| `next build` local passa mas Vercel falha | Arquivos estão no .gitignore ou não foram commitados |

### Erros similares que você pode cometer

1. **Esquecer de dar `git add`** após criar novos arquivos
2. **`.gitignore` agressivo demais** que exclui `src/` ou pastas importantes
3. **Trabalhar em branch errada** — push para `develop` mas Vercel deploya `main`
4. **Server Components sem error boundary** — qualquer exceção não tratada crasha a página
5. **Variáveis de ambiente faltando** — código que lê `process.env.X` sem fallback

---

## 5. 🔄 ALTERNATIVAS (Diferentes abordagens)

### A. Error boundaries (o que fizemos) ✅
```tsx
// src/app/error.tsx — captura erros de Server Components
"use client";
export default function Error({ error, reset }) {
  return <div>Erro: tente novamente <button onClick={reset}>Retry</button></div>;
}
```
**Pró:** Funciona com Next.js App Router, preserva o layout, permite retry.
**Contra:** Não captura erros no layout.tsx.

### B. Try/catch em cada Server Component
```tsx
async function HomePage() {
  let data = fallbackData;
  try { data = await db.query(...); } catch { /* usa fallback */ }
  return <Dashboard data={data} />;
}
```
**Pró:** Controle granular, fallbacks customizados.
**Contra:** Repetitivo, esquecer um = crash.

### C. Dynamic import com fallback
```tsx
const HeavyComponent = dynamic(() => import('./Heavy'), { loading: () => <Skeleton /> });
```
**Pró:** Isola falhas por componente.
**Contra:** Não funciona para Server Components.

### D. Middleware de proteção
```tsx
// middleware.ts — verifica se DB está disponível antes de qualquer rota
export function middleware(request) {
  if (!isDbConfigured() && request.nextUrl.pathname.startsWith('/centro-provas')) {
    return NextResponse.redirect(new URL('/login?error=no_db', request.url));
  }
}
```
**Pró:** Proteção centralizada.
**Contra:** Não resolve o erro de renderização, só redireciona.

### 🏆 Melhor abordagem: A + B combinados
- **Error boundaries** (A) como rede de segurança global
- **Try/catch** (B) em cada Server Component com fallbacks específicos
- **isDbConfigured()** check antes de qualquer query

---

## 6. ✅ Checklist de verificação antes de deploy

- [ ] `git ls-files` mostra todos os arquivos de `src/`
- [ ] `npx next build` passa sem erros
- [ ] `npx next start` local funciona (todas as páginas retornam 200)
- [ ] `error.tsx` e `global-error.tsx` existem
- [ ] Favicon existe (`src/app/icon.svg` ou `app/favicon.ico`)
- [ ] Server Components têm try/catch com fallbacks
- [ ] API routes retornam erro amigável quando DB não está disponível
- [ ] `DATABASE_URL` está configurada no Vercel
- [ ] `.gitignore` não exclui `src/` ou arquivos necessários
