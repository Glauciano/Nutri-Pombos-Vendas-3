import { db, isDbConfigured } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/** ☁️ Sincronização de dados entre aparelhos — guarda o "localStorage" do usuário no banco */
async function garantirTabela() {
  await db.execute(sql`CREATE TABLE IF NOT EXISTS dados_usuario (
    id serial PRIMARY KEY,
    usuario_id integer NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    chave text NOT NULL,
    valor text,
    atualizado_em bigint NOT NULL DEFAULT 0,
    CONSTRAINT dados_usuario_usuario_chave UNIQUE (usuario_id, chave)
  )`);
}

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  try {
    await garantirTabela();
    const r = await db.execute(sql`SELECT chave, valor, atualizado_em FROM dados_usuario WHERE usuario_id = ${user.id}`);
    const linhas = ((r as unknown as { rows?: unknown[] }).rows ?? r) as { chave: string; valor: string | null; atualizado_em: string | number }[];
    const dados: Record<string, { valor: string | null; at: number }> = {};
    linhas.forEach((l) => { dados[l.chave] = { valor: l.valor, at: Number(l.atualizado_em) }; });
    return NextResponse.json({ ok: true, dados });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Falha ao ler dados" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  try {
    const body = (await request.json()) as { chave?: string; valor?: string | null; at?: number };
    const chave = String(body.chave || "");
    if (!chave.startsWith("nutripombos-") || chave.length > 120) return NextResponse.json({ error: "Chave inválida" }, { status: 400 });
    const valor = body.valor === undefined ? null : body.valor;
    const at = Number(body.at) || Date.now();
    await garantirTabela();
    await db.execute(sql`
      INSERT INTO dados_usuario (usuario_id, chave, valor, atualizado_em)
      VALUES (${user.id}, ${chave}, ${valor}, ${at})
      ON CONFLICT (usuario_id, chave) DO UPDATE
      SET valor = excluded.valor, atualizado_em = excluded.atualizado_em
      WHERE dados_usuario.atualizado_em <= excluded.atualizado_em
    `);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Falha ao salvar" }, { status: 500 });
  }
}
