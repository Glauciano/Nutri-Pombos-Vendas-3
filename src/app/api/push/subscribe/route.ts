import { db, isDbConfigured } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/** 🔔 Salva a inscrição de notificação deste aparelho (push 2º plano) */
export async function POST(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  try {
    const body = (await request.json()) as { subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } } };
    const sub = body.subscription;
    if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
      return NextResponse.json({ error: "Inscrição inválida" }, { status: 400 });
    }
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS push_subs (
        id serial PRIMARY KEY,
        usuario_id integer NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        endpoint text UNIQUE NOT NULL,
        p256dh text NOT NULL,
        auth text NOT NULL,
        criado_em timestamptz NOT NULL DEFAULT now()
      )
    `);
    await db.execute(sql`
      INSERT INTO push_subs (usuario_id, endpoint, p256dh, auth)
      VALUES (${user.id}, ${sub.endpoint}, ${sub.keys.p256dh}, ${sub.keys.auth})
      ON CONFLICT (endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth
    `);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Falha ao salvar inscrição" }, { status: 500 });
  }
}

/** Remove a inscrição deste aparelho (desativar) */
export async function DELETE(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  try {
    const { endpoint } = (await request.json()) as { endpoint?: string };
    if (endpoint) await db.execute(sql`DELETE FROM push_subs WHERE endpoint = ${endpoint}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Falha ao remover" }, { status: 500 });
  }
}
