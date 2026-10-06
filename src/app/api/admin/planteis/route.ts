import { db, isDbConfigured } from "@/db";
import { usuarios } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { exijaUsuario, resposta401 } from "@/lib/seguranca";
import { garantirPlantelPrivado } from "@/lib/plantel";

/**
 * 👑 Plantéis (Painel Admin) — ver quantos pombos cada usuário tem
 * e transferir um plantel inteiro de uma conta para outra.
 */
export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const user = await exijaUsuario();
  if (!user) return resposta401();
  if (user.plano !== "admin") return NextResponse.json({ error: "Acesso restrito ao administrador" }, { status: 403 });
  try {
    await garantirPlantelPrivado();
    const r = await db.execute(sql`
      SELECT u.id, u.nome, u.email, u.plano, u.acesso_ativo,
             (SELECT count(*)::int FROM pombos p WHERE p.usuario_id = u.id) AS pombos
      FROM usuarios u ORDER BY u.id
    `);
    const linhas = ((r as unknown as { rows?: unknown[] }).rows ?? r) as { id: number; nome: string; email: string; plano: string; acesso_ativo: boolean; pombos: number }[];
    return NextResponse.json({ meuId: user.id, usuarios: linhas });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Falha ao listar plantéis" }, { status: 500 });
  }
}

/** POST { de: idOrigem, para: idDestino } — transfere o plantel inteiro */
export async function POST(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const user = await exijaUsuario();
  if (!user) return resposta401();
  if (user.plano !== "admin") return NextResponse.json({ error: "Acesso restrito ao administrador" }, { status: 403 });
  try {
    await garantirPlantelPrivado();
    const body = (await request.json()) as { de?: number; para?: number };
    const de = Number(body.de);
    const para = Number(body.para);
    if (!de || !para || de === para) return NextResponse.json({ error: "Informe 'de' e 'para' (diferentes)" }, { status: 400 });
    const [alvo] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.id, para)).limit(1);
    if (!alvo) return NextResponse.json({ error: "Usuário destino não encontrado" }, { status: 404 });

    await db.execute(sql`UPDATE pombos SET usuario_id = ${para} WHERE usuario_id = ${de}`);
    await db.execute(sql`UPDATE racoes SET usuario_id = ${para} WHERE usuario_id = ${de}`);
    await db.execute(sql`UPDATE alimentacoes SET usuario_id = ${para} WHERE usuario_id = ${de}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Falha ao transferir plantel" }, { status: 500 });
  }
}
