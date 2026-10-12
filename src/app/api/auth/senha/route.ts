import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { exijaUsuario, rateLimit, ipDaRequisicao, resposta429 } from "@/lib/seguranca";

/**
 * 🔐 TROCAR A PRÓPRIA SENHA — exige login + senha atual correta.
 * A nova senha precisa de no mínimo 8 caracteres (igual ao cadastro).
 * Freio anti-força-bruta: 5 tentativas por IP a cada 10 min.
 */
export async function PUT(request: Request) {
  if (rateLimit("senha:" + ipDaRequisicao(request), 5, 10 * 60_000)) return resposta429();
  const user = await exijaUsuario();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  try {
    const body = (await request.json()) as { senhaAtual?: string; senhaNova?: string };
    const senhaAtual = String(body.senhaAtual || "");
    const senhaNova = String(body.senhaNova || "");
    if (!senhaAtual || !senhaNova) return NextResponse.json({ error: "Preencha a senha atual e a nova." }, { status: 400 });
    if (senhaNova.length < 8) return NextResponse.json({ error: "A nova senha precisa ter pelo menos 8 caracteres." }, { status: 400 });

    const { db, isDbConfigured } = await import("@/db");
    if (!isDbConfigured()) return NextResponse.json({ error: "Banco não configurado" }, { status: 503 });
    const { usuarios } = await import("@/db/schema");
    const { compare, hash } = await import("bcryptjs");

    const [row] = await db.select({ senhaHash: usuarios.senhaHash }).from(usuarios).where(eq(usuarios.id, user.id)).limit(1);
    if (!row) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const ok = await compare(senhaAtual, row.senhaHash);
    if (!ok) return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });

    const senhaHash = await hash(senhaNova, 12);
    await db.update(usuarios).set({ senhaHash, updatedAt: new Date() }).where(eq(usuarios.id, user.id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("troca de senha:", e);
    return NextResponse.json({ error: "Não foi possível trocar a senha agora." }, { status: 500 });
  }
}
