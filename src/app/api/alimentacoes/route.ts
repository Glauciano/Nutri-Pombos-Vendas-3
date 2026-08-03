import { db, isDbConfigured } from "@/db";
import { alimentacoes } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const body = await request.json();
    
    const newAlimentacao = await db.insert(alimentacoes).values({
      pomboId: body.pomboId,
      racaoId: body.racaoId,
      quantidadeG: body.quantidadeG,
      observacoes: body.observacoes,
    }).returning();

    return NextResponse.json(newAlimentacao[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to register feeding" }, { status: 500 });
  }
}
