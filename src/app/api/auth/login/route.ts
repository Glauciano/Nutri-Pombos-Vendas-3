import { NextResponse } from "next/server";
import { rateLimit, ipDaRequisicao, resposta429 } from "@/lib/seguranca";

// 🛡️ Sem mais usuários hardcoded: senha de admin NUNCA em código-fonte.
// Admin real = cadastro normal no banco + plano 'admin' ajustado direto no banco.

export async function POST(request: Request) {
  if (rateLimit("login:" + ipDaRequisicao(request), 8, 10 * 60_000)) return resposta429();
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const senha = String(body.senha || "");

    const { isDbConfigured } = await import("@/db");

    // If DB is configured, try database FIRST
    if (isDbConfigured()) {
      try {
        const { compare } = await import("bcryptjs");
        const { eq } = await import("drizzle-orm");
        const { db } = await import("@/db");
        const { usuarios } = await import("@/db/schema");
        const { createSession } = await import("@/lib/auth");

        const [dbUser] = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);
        if (dbUser && await compare(senha, dbUser.senhaHash)) {
          if (!dbUser.acessoAtivo) {
            return NextResponse.json({ error: "Acesso suspenso." }, { status: 403 });
          }
          await createSession(dbUser.id);
          return NextResponse.json({ ok: true, nome: dbUser.nome, plano: dbUser.plano });
        }
      } catch (dbError) {
        console.error("DB login error, falling back:", dbError);
      }
    }

    return NextResponse.json({ error: "Email ou senha incorretos." }, { status: 401 });

  } catch {
    return NextResponse.json({ error: "Não foi possível entrar agora." }, { status: 500 });
  }
}
