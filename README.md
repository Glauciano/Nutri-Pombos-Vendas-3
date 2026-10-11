# 🕊️ Nutri Pombos — Centro de Provas do Columófilo

**O app completo de columofilia em português**: acompanha seu plantel do ovo à taça — pedigree, genética, eye-sign, provas com clima de verdade, manejo, saúde e vendas com QR Code.

> Feito por um columófilo, pra columófilos. 🏁

---

## ✨ O que tem dentro (55+ módulos)

**🐦 Plantel** — pombos com pedigree e fotos (inclusive **foto do olho**), casamenteiro por parentesco (Wright), genética dos 75% com calculadora, cores dos filhotes (genética de pena de verdade), desempenho por linhagem, pedigree imprimível, certificado de leilão.

**👁️ Eye-Sign — o Congresso Mundial** — análise com **mira ajustável sobre a foto do olho do SEU pombo**, scores voador × reprodutor e **quatro escolas**: 🇧🇷 clássica, 🇿🇦 **Jack Barkel** (sinal de corrida em %, regra dos 100% e matriz de cores), 🇬🇧 **Escola Inglesa** (Bishop: fórmula, anatomia interativa, olho em voo) e 🇨🇳 **Escola Chinesa** (眼志: camadas, 8 formas, Yin-Yang) — com quiz pra treinar o olho.

**🏁 Provas** — rota cidade a cidade com **clima, vento e chuva reais** (Open-Meteo), radar de chuva e satélite, janela ideal de soltura, matriz cidade × hora, checklist de encestamento, telão do clube, exportação pro Google Agenda.

**🍖 Alimentação e Saúde** — mistura semanal de 16 sementes, mix energético por lote, guia terapêutico com referências veterinárias, peso e forma com curva, lembretes de manejo, estoque com previsão de "acaba em X dias".

**💰 Vendas** — vitrine entre criadores com WhatsApp, ficha premium pública com QR Code, etiquetas de cesto pra imprimir, contrato de venda, CRM de compradores, caixa do pombal e relatórios.

**🛠️ Plataforma** — plantel privado (cada conta vê só o seu), planos com painel admin, notificações push às 06h30 (véspera de embarque, dia de prova, frio, manejo, estoque), sincronização entre aparelhos, PWA instalável, tema claro/escuro, Modo Campo offline, tour de boas-vindas e Modo Demonstração.

## 🔗 Veja funcionando

**[nutri-pombos-vendas-3.vercel.app](https://nutri-pombos-vendas-3.vercel.app)**

## 🧰 Tecnologia

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Drizzle ORM** + **Neon PostgreSQL** (serverless)
- **Vercel** (deploy + cron das 06h30) · **Web Push** (VAPID) · **PWA**
- Ilustrações e diagramas 100% **SVG autorais** — sem imagem de terceiros

## 🚀 Rodando localmente

```bash
npm install
# crie um .env com DATABASE_URL (Neon) e as chaves VAPID
npm run dev
```

As tabelas do banco são criadas automaticamente no primeiro uso — cadastre-se normalmente no app.

## 📄 Licença e uso

Código deste repositório é do projeto Nutri Pombos. Conteúdo educacional (eye-sign, genética, tratamentos) é tradição columófila apresentada com disclaimers: **tradição de criador, não ciência fechada — e doses de medicamentos são sempre com veterinário.**

---

*Pombal Ruah · Limeira/SP · 2026* 🕊️🏆
