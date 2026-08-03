import { NextResponse } from "next/server";

// Simple in-memory users for when DATABASE_URL is not configured
const USERS: Record<string, { nome: string; senha: string; plano: string }> = {
  "admin@nutripombos.com": { nome: "Admin", senha: "nutri2026", plano: "admin" },
};

export async function POST(request: Request) {
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

    // Fallback: check in-memory users
    const user = USERS[email];
    if (user && user.senha === senha) {
      const response = NextResponse.json({ ok: true, nome: user.nome, plano: user.plano });
      // Set fallback cookie (always, for when DB is not available or DB lookup failed)
      response.cookies.set("nutripombos_fallback_user", JSON.stringify({
        id: 1,
        nome: user.nome,
        email: email,
        plano: user.plano,
        acessoAtivo: true,
        acessoAte: null,
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 86_400, // 30 days
      });
      return response;
    }

    return NextResponse.json({ error: "Email ou senha incorretos." }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Não foi possível entrar agora." }, { status: 500 });
  }
}
