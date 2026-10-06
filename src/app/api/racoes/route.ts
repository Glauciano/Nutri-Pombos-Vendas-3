import { db, isDbConfigured } from "@/db";
import { racoes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { exijaUsuario, resposta401 } from "@/lib/seguranca";
import { garantirPlantelPrivado } from "@/lib/plantel";

/** 🔐 Rações do PLANEL PRIVADO do usuário */
export async function GET() {
  const user = await exijaUsuario();
  if (!user) return resposta401();
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    await garantirPlantelPrivado();
    const minhas = await db.select().from(racoes).where(eq(racoes.usuarioId, user.id));
    return NextResponse.json(minhas);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch racoes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await exijaUsuario();
  if (!user) return resposta401();

  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    await garantirPlantelPrivado();
    const body = await request.json();

    const newRacao = await db.insert(racoes).values({
      usuarioId: user.id, // 🔐 nasce já com dono
      nome: body.nome,
      tipo: body.tipo,
      descricao: body.descricao,
      composicao: body.composicao,
      precoKg: body.precoKg ? body.precoKg.toString() : null,
    }).returning();

    return NextResponse.json(newRacao[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create racao" }, { status: 500 });
  }
}
