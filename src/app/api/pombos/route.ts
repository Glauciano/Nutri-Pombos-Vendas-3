import { db, isDbConfigured } from "@/db";
import { pombos } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { exijaUsuario, resposta401 } from "@/lib/seguranca";
import { LIMITE_POMBOS, nivelDoPlano } from "@/lib/permissoes";
import { garantirPlantelPrivado } from "@/lib/plantel";

/**
 * 🔐 POMBOS — PLANEL PRIVADO: cada usuário só vê e mexe nos SEUS pombos.
 * A migração (coluna usuario_id + dono padrão) roda sozinha no primeiro acesso.
 */
export async function GET(request: Request) {
  const user = await exijaUsuario();
  if (!user) return resposta401();

  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    await garantirPlantelPrivado();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const pedigree = searchParams.get("pedigree");

    if (id) {
      const pombo = await db.select().from(pombos)
        .where(and(eq(pombos.id, Number(id)), eq(pombos.usuarioId, user.id)))
        .limit(1);
      if (!pombo.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

      if (pedigree === "1") {
        const result = await buildPedigree(pombo[0]);
        return NextResponse.json(result);
      }
      return NextResponse.json(pombo[0]);
    }

    const meusPombos = await db.select().from(pombos)
      .where(eq(pombos.usuarioId, user.id))
      .orderBy(asc(pombos.anilha));
    return NextResponse.json(meusPombos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch pombos" }, { status: 500 });
  }
}

async function buildPedigree(pombo: any, depth = 0): Promise<any> {
  if (depth > 4) return { ...pombo, pai: null, mae: null };
  let pai = null, mae = null;
  if (pombo.paiId) {
    const rows = await db.select().from(pombos).where(eq(pombos.id, pombo.paiId)).limit(1);
    if (rows.length) pai = await buildPedigree(rows[0], depth + 1);
  }
  if (pombo.maeId) {
    const rows = await db.select().from(pombos).where(eq(pombos.id, pombo.maeId)).limit(1);
    if (rows.length) mae = await buildPedigree(rows[0], depth + 1);
  }
  return { ...pombo, pai, mae };
}

function formatDbError(error: any, defaultMsg: string) {
  const msg = String(error?.message || error || "");
  const code = error?.code;
  if (code === "42P01" || msg.includes('relation "pombos" does not exist')) {
    return "As tabelas do banco de dados ainda não foram criadas. Rode no seu projeto: npx drizzle-kit push";
  }
  if (code === "23505" || msg.includes("unique constraint") || msg.includes("duplicate key")) {
    return "Já existe um pombo com esta mesma anilha no SEU plantel.";
  }
  if (code === "23503" || msg.includes("foreign key constraint")) {
    return "O pai ou a mãe selecionados não existem no sistema.";
  }
  return defaultMsg + (error?.message ? `: ${error.message}` : "");
}

export async function POST(request: Request) {
  const user = await exijaUsuario();
  if (!user) return resposta401();
  // 🎫 limite de pombos por plano (teste = 8) — conta só os SEUS
  const nivel = nivelDoPlano(user.plano);
  try {
    if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    await garantirPlantelPrivado();
    const [cont] = await db.select({ n: sql<number>`count(*)` }).from(pombos).where(eq(pombos.usuarioId, user.id));
    if (Number(cont?.n || 0) >= LIMITE_POMBOS[nivel]) {
      return NextResponse.json({ error: `Limite do plano atingido (${LIMITE_POMBOS[nivel]} pombos no teste grátis). Assine para cadastrar mais.` }, { status: 402 });
    }
  } catch {}

  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = await request.json();
    const anilhaStr = String(body.anilha || "").trim();
    if (!anilhaStr || anilhaStr.length < 4) {
      return NextResponse.json({ error: "Anilha inválida. Informe pelo menos 4 caracteres (ex: 1234567/26 ou BR-24-12345)." }, { status: 400 });
    }
    const newPombo = await db.insert(pombos).values({
      usuarioId: user.id, // 🔐 nasce já com dono
      anilha: anilhaStr,
      nome: body.nome || null,
      sexo: body.sexo,
      dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : null,
      cor: body.cor || null,
      paiId: body.paiId ? Number(body.paiId) : null,
      maeId: body.maeId ? Number(body.maeId) : null,
      status: body.status || "ativo",
      observacoes: body.observacoes || null,
    }).returning();
    return NextResponse.json(newPombo[0], { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: formatDbError(error, "Não foi possível criar o pombo") }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await exijaUsuario();
  if (!user) return resposta401();

  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    await garantirPlantelPrivado();
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const anilhaStr = body.anilha ? String(body.anilha).trim() : "";
    if (anilhaStr && anilhaStr.length < 4) {
      return NextResponse.json({ error: "Anilha inválida. Informe pelo menos 4 caracteres (ex: 1234567/26 ou BR-24-12345)." }, { status: 400 });
    }
    const updated = await db.update(pombos).set({
      anilha: anilhaStr || undefined,
      nome: body.nome || null,
      sexo: body.sexo,
      dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : null,
      cor: body.cor || null,
      paiId: body.paiId ? Number(body.paiId) : null,
      maeId: body.maeId ? Number(body.maeId) : null,
      status: body.status || "ativo",
      observacoes: body.observacoes || null,
      updatedAt: new Date(),
    }).where(and(eq(pombos.id, Number(body.id)), eq(pombos.usuarioId, user.id))).returning(); // 🔐 só o SEU
    if (!updated.length) return NextResponse.json({ error: "Pombo não encontrado no seu plantel" }, { status: 404 });
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: formatDbError(error, "Não foi possível atualizar o pombo") }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await exijaUsuario();
  if (!user) return resposta401();

  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    await garantirPlantelPrivado();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const deleted = await db.delete(pombos)
      .where(and(eq(pombos.id, Number(id)), eq(pombos.usuarioId, user.id))) // 🔐 só o SEU
      .returning();
    if (!deleted.length) return NextResponse.json({ error: "Pombo não encontrado no seu plantel" }, { status: 404 });
    return NextResponse.json({ success: true, deleted: deleted[0] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: formatDbError(error, "Não foi possível excluir o pombo") }, { status: 500 });
  }
}
