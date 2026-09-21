import { db, isDbConfigured } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * 🔔 Envia uma notificação de TESTE para UM aparelho logado (ou todos os do usuário).
 * Usado pelo botão "🔔 Testar notificação" na Configuração — prova o ciclo completo
 * (inscrição → servidor → web-push → aparelho) sem esperar o cron das 06h30.
 */
type Sub = { endpoint: string; p256dh: string; auth: string };

function linhas<T>(r: unknown): T[] {
  return (((r as { rows?: unknown[] })?.rows ?? r) as T[]) || [];
}

export async function POST() {
  if (!isDbConfigured()) return NextResponse.json({ ok: false, erro: "banco não configurado" }, { status: 503 });
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ ok: false, erro: "não autenticado" }, { status: 401 });

  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return NextResponse.json({ ok: false, erro: "chaves VAPID ausentes na Vercel" }, { status: 500 });

  try {
    // import dinâmico + interop CJS (web-push é CommonJS)
    const mod = await import("web-push");
    const webpush = (mod as unknown as { default?: typeof import("web-push") }).default ?? (mod as unknown as typeof import("web-push"));
    webpush.setVapidDetails("mailto:contato@nutripombos.app", pub, priv);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS push_subs (
        id serial PRIMARY KEY, usuario_id integer NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        endpoint text UNIQUE NOT NULL, p256dh text NOT NULL, auth text NOT NULL, criado_em timestamptz NOT NULL DEFAULT now()
      )
    `);

    const subs = linhas<Sub>(await db.execute(sql`SELECT endpoint, p256dh, auth FROM push_subs WHERE usuario_id = ${user.id}`));
    if (!subs.length) return NextResponse.json({ ok: false, erro: "nenhum aparelho inscrito ainda — ative as notificações primeiro" }, { status: 400 });

    let entregues = 0;
    let falhas = 0;
    const detalhes: string[] = [];

    for (const sub of subs.slice(0, 5)) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({
            title: "🔔 Nutri Pombos — teste de notificação",
            body: "Se você está lendo isto, as notificações funcionam! Avisaremos de embarques, provas e madrugadas frias.",
            url: "/centro-provas/alertas",
            icon: "/icon-192.png",
            tag: "nutripombos-teste",
          })
        );
        entregues++;
      } catch (e) {
        falhas++;
        const err = e as { statusCode?: number; message?: string };
        detalhes.push(`aparelho ...${sub.endpoint.slice(-12)}: ${err.statusCode || "sem-status"} ${err.message || ""}`.trim());
        // inscrição morta → remove
        if (err.statusCode === 404 || err.statusCode === 410) {
          try { await db.execute(sql`DELETE FROM push_subs WHERE endpoint = ${sub.endpoint}`); } catch { /* ignora */ }
        }
      }
    }

    return NextResponse.json({ ok: entregues > 0, enviados: entregues, falhas, detalhes: detalhes.slice(0, 3) });
  } catch (e) {
    const err = e as { message?: string };
    return NextResponse.json({ ok: false, erro: "falha geral: " + (err.message || String(e)) }, { status: 500 });
  }
}
