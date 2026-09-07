# 📤 Como atualizar o app (GitHub → Vercel)

## ✅ Jeito FÁCIL (uma vez só, depois é 1 clique)

1. Baixe e instale o **Git** (git-scm.com → Next, Next, Next)
2. Uma única vez, no cmd:
   ```
   git clone https://github.com/Glauciano/Nutri-Pombos-Vendas-3.git nutri-app
   ```
   (se pedir login, use sua conta do GitHub)
3. Pronto! De agora em diante, **toda atualização é assim**:
   - Extraia o ZIP novo **por cima** da pasta `nutri-app` (substitua tudo)
   - **Dê um duplo clique em `ENVIAR-APP.bat`**
   - A Vercel publica sozinha em 1-2 minutos 🎉

## ⚠️ Jeito pelo site (se preferir) — e como NÃO falhar

O erro mais comum é arrastar o **zip fechado** ou **só parte dos arquivos**. O certo:

1. GitHub → seu repositório → **Add file → Upload files**
2. Abra o ZIP extraído, **selecione TUDO (Ctrl+A)** — as pastas `src`, `public` e TODOS os arquivos soltos
3. Arraste **de uma vez só** para a página do GitHub
4. **CONFIRA antes de commitar**: a página deve listar **~160 arquivos** alterados.
   Se aparecer só 10 ou 20, alguma pasta ficou de fora — arraste de novo!
5. Commit changes → a Vercel publica sozinha

## Como saber se atualizou

- Abra o app com **Ctrl+Shift+R** (PC) ou feche e reabra (celular)
- O site sempre atualiza: **nutri-pombos-vendas-3.vercel.app**
- (Atalhos antigos de outras URLs ficam congelados — use sempre esse endereço)

## ⚠️ Por que às vezes o site "não aceita"

O upload pela web do GitHub tem limite de **~100 arquivos por vez** — e o projeto inteiro tem ~160.
Por isso existem as duas opções acima: ou envie em lotes menores (pastas separadas),
ou use o `ENVIAR-APP.bat` (envia tudo de uma vez, sem limite).
