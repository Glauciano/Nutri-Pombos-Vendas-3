import { db, isDbConfigured } from "@/db";
import { racoes } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const allRacoes = await db.select().from(racoes);
    return NextResponse.json(allRacoes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch racoes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = await request.json();
    
    const newRacao = await db.insert(racoes).values({
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
