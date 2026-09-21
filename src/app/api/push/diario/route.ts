import { db, isDbConfigured } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import type webpushType from "web-push";

/**
 * 🔔 Cron diário (Vercel — 09:30 UTC / 06:30 de Brasília):
 * para cada aparelho inscrito, checa o calendário e o clima do usuário
 * (espelhados na tabela dados_usuario) e envia notificações com o app fechado.
 */
type Sub = { endpoint: string; p256dh: string; auth: string };
type ProvaCal = { num?: number; cidade?: string; km?: number; dataEmbarque?: string; dataSolta?: string; cancelada?: boolean };

function linhas<T>(r: unknown): T[] {
  return (((r as { rows?: unknown[] })?.rows ?? r) as T[]) || [];
}

export async function GET() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return NextResponse.json({ ok: false, motivo: "VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY não configuradas na Vercel" });
  if (!isDbConfigured()) return NextResponse.json({ ok: false, motivo: "sem banco" });

  try {
    const mod = await import("web-push");
    const webpush: typeof webpushType = (mod as unknown as { default?: typeof webpushType }).default ?? (mod as unknown as typeof webpushType);
    webpush.setVapidDetails("mailto:contato@nutripombos.app", pub, priv);

    const hojeBR = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
    const amanhaBR = new Date(Date.now() + 86_400_000).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS push_subs (
        id serial PRIMARY KEY, usuario_id integer NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        endpoint text UNIQUE NOT NULL, p256dh text NOT NULL, auth text NOT NULL, criado_em timestamptz NOT NULL DEFAULT now()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS dados_usuario (
        id serial PRIMARY KEY, usuario_id integer NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        chave text NOT NULL, valor text, atualizado_em bigint NOT NULL DEFAULT 0,
        CONSTRAINT dados_usuario_usuario_chave UNIQUE (usuario_id, chave)
      )
    `);

    const usuarios = linhas<{ usuario_id: number }>(await db.execute(sql`SELECT DISTINCT usuario_id FROM push_subs`));
    let enviados = 0;
    let removidos = 0;

    for (const { usuario_id } of usuarios) {
      try {
        const subs = linhas<Sub>(await db.execute(sql`SELECT endpoint, p256dh, auth FROM push_subs WHERE usuario_id = ${usuario_id}`));
        if (!subs.length) continue;

        const msgs: { title: string; body: string; tag: string }[] = [];

        // 1) calendário do usuário (espelhado do aparelho)
        const calRows = linhas<{ valor: string | null }>(await db.execute(sql`SELECT valor FROM dados_usuario WHERE usuario_id = ${usuario_id} AND chave = 'nutripombos-calendario-2026-v1'`));
        if (calRows[0]?.valor) {
          try {
            const provas: ProvaCal[] = JSON.parse(calRows[0].valor);
            (Array.isArray(provas) ? provas : []).filter((p) => !p.cancelada).forEach((p) => {
              if (p.dataEmbarque === hojeBR) msgs.push({ title: `📦 HOJE: embarque #${p.num} — ${p.cidade}`, body: `Pombos no clube! Prova de ${p.km}km. Confira o checklist de encestamento.`, tag: "embarque-hoje" });
              else if (p.dataEmbarque === amanhaBR) msgs.push({ title: `📦 Amanhã: embarque #${p.num} — ${p.cidade}`, body: `Prova de ${p.km}km. Mistura final e água nos cestos hoje!`, tag: "embarque-amanha" });
              if (p.dataSolta === hojeBR) msgs.push({ title: `🏁 HOJE é dia de prova: #${p.num} — ${p.cidade}`, body: `${p.km}km. Bom voo e sempre na taça! 🏆`, tag: "prova-hoje" });
            });
          } catch { /* calendário inválido */ }
        }

        // 2) madrugada fria no pombal do usuário
        const cfgRows = linhas<{ valor: string | null }>(await db.execute(sql`SELECT valor FROM dados_usuario WHERE usuario_id = ${usuario_id} AND chave = 'nutripombos-config-v1'`));
        if (cfgRows[0]?.valor) {
          try {
            const cfg = JSON.parse(cfgRows[0].valor) as { pombalLat?: number; pombalLon?: number };
            if (typeof cfg.pombalLat === "number" && typeof cfg.pombalLon === "number") {
              const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cfg.pombalLat}&longitude=${cfg.pombalLon}&daily=temperature_2m_min&forecast_days=1&timezone=America/Sao_Paulo`);
              if (r.ok) {
                const j = await r.json() as { daily?: { temperature_2m_min?: number[] } };
                const min = j.daily?.temperature_2m_min?.[0];
                if (typeof min === "number" && min <= 10) {
                  msgs.push({ title: `🥶 Madrugada fria no pombal (mín ${Math.round(min)}°C)`, body: "Aumente a energia da mistura de tarde (milho/girassol) e bloqueie correntes de vento.", tag: "frio" });
                }
              }
            }
          } catch { /* config inválida */ }
        }

        if (!msgs.length) continue;

        for (const sub of subs) {
          for (const m of msgs) {
            try {
              await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                JSON.stringify({ ...m, url: "/centro-provas/alertas", icon: "/icon-192.png" })
              );
              enviados++;
            } catch (e) {
              const status = (e as { statusCode?: number }).statusCode;
              if (status === 404 || status === 410) {
                await db.execute(sql`DELETE FROM push_subs WHERE endpoint = ${sub.endpoint}`);
                removidos++;
              }
            }
          }
        }
      } catch { /* segue pro próximo usuário */ }
    }

    return NextResponse.json({ ok: true, usuarios: usuarios.length, enviados, removidos });
  } catch (e) {
    const err = e as { message?: string };
    console.error("push/diario:", err?.message || e);
    return NextResponse.json({ ok: false, erro: "falha geral: " + (err?.message || String(e)) }, { status: 500 });
  }
}
