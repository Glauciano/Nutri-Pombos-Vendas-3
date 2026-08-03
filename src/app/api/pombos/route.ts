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

export async function POST(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = await request.json();
    if (!body.anilha || !/^\d{7}\/\d{2}$/.test(body.anilha)) {
      return NextResponse.json({ error: "Anilha inválida. Use o formato 0000000/00 (ex: 1234567/26)" }, { status: 400 });
    }
    const newPombo = await db.insert(pombos).values({
      anilha: body.anilha,
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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create pombo" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    if (body.anilha && !/^\d{7}\/\d{2}$/.test(body.anilha)) {
      return NextResponse.json({ error: "Anilha inválida. Use o formato 0000000/00 (ex: 1234567/26)" }, { status: 400 });
    }
    const updated = await db.update(pombos).set({
      anilha: body.anilha,
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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update pombo" }, { status: 500 });
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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete pombo" }, { status: 500 });
  }
}
