import { db, isDbConfigured } from "@/db";
import { pombos } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const pedigree = searchParams.get("pedigree");

    if (id) {
      const pombo = await db.select().from(pombos).where(eq(pombos.id, Number(id))).limit(1);
      if (!pombo.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

      if (pedigree === "1") {
        const result = await buildPedigree(pombo[0]);
        return NextResponse.json(result);
      }
      return NextResponse.json(pombo[0]);
    }

    const allPombos = await db.select().from(pombos).orderBy(asc(pombos.anilha));
    return NextResponse.json(allPombos);
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
    return "Já existe um pombo cadastrado com esta mesma anilha.";
  }
  if (code === "23503" || msg.includes("foreign key constraint")) {
    return "O pai ou a mãe selecionados não existem no sistema.";
  }
  return defaultMsg + (error?.message ? `: ${error.message}` : "");
}

export async function POST(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = await request.json();
    const anilhaStr = String(body.anilha || "").trim();
    if (!anilhaStr || anilhaStr.length < 4) {
      return NextResponse.json({ error: "Anilha inválida. Informe pelo menos 4 caracteres (ex: 1234567/26 ou BR-24-12345)." }, { status: 400 });
    }
    const newPombo = await db.insert(pombos).values({
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
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
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
    }).where(eq(pombos.id, Number(body.id))).returning();
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: formatDbError(error, "Não foi possível atualizar o pombo") }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const deleted = await db.delete(pombos).where(eq(pombos.id, Number(id))).returning();
    if (!deleted.length) return NextResponse.json({ error: "Pombo não encontrado" }, { status: 404 });
    return NextResponse.json({ success: true, deleted: deleted[0] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: formatDbError(error, "Não foi possível excluir o pombo") }, { status: 500 });
  }
}
