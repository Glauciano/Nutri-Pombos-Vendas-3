import { db, isDbConfigured } from "@/db";
import { pombos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { rateLimit, ipDaRequisicao, resposta429 } from "@/lib/seguranca";

/** 🏷️ Ficha PÚBLICA do pombo (para o QR Code de venda) — sem login, dados mínimos */
export async function GET(request: Request) {
  if (rateLimit("ficha:" + ipDaRequisicao(request), 60, 60_000)) return resposta429();

  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    const { searchParams } = new URL(request.url);
    const anilha = searchParams.get("anilha")?.trim();
    if (!anilha) return NextResponse.json({ error: "anilha obrigatória" }, { status: 400 });

    const [p] = await db.select().from(pombos).where(eq(pombos.anilha, anilha)).limit(1);
    if (!p) return NextResponse.json({ error: "Pombo não encontrado" }, { status: 404 });

    let pai: { anilha: string; nome: string | null } | null = null;
    let mae: { anilha: string; nome: string | null } | null = null;
    if (p.paiId) {
      const [r] = await db.select().from(pombos).where(eq(pombos.id, p.paiId)).limit(1);
      if (r) pai = { anilha: r.anilha, nome: r.nome };
    }
    if (p.maeId) {
      const [r] = await db.select().from(pombos).where(eq(pombos.id, p.maeId)).limit(1);
      if (r) mae = { anilha: r.anilha, nome: r.nome };
    }

    // somente dados não-sensíveis (sem observações internas, sem status, sem contato)
    return NextResponse.json({
      anilha: p.anilha,
      nome: p.nome,
      sexo: p.sexo,
      cor: p.cor,
      dataNascimento: p.dataNascimento,
      pai,
      mae,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Falha ao buscar pombo" }, { status: 500 });
  }
}
