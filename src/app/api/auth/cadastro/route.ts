import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nome = String(body.nome || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const senha = String(body.senha || "");

    if (nome.length < 2) return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Informe um email válido." }, { status: 400 });
    if (senha.length < 8) return NextResponse.json({ error: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });

    // Try database first
    const { isDbConfigured } = await import("@/db");
    if (isDbConfigured()) {
      const { hash } = await import("bcryptjs");
      const { eq } = await import("drizzle-orm");
      const { db } = await import("@/db");
      const { usuarios } = await import("@/db/schema");
      const { createSession } = await import("@/lib/auth");

      const [existing] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, email)).limit(1);
      if (existing) return NextResponse.json({ error: "Este email já possui uma conta." }, { status: 409 });

      const senhaHash = await hash(senha, 12);
      const acessoAte = new Date(Date.now() + 365 * 86_400_000);
      const [user] = await db.insert(usuarios).values({ nome, email, senhaHash, plano: "admin", acessoAte }).returning({ id: usuarios.id });
      await createSession(user.id);
      return NextResponse.json({ ok: true, nome, plano: "admin" });
    }

    // No database — use fallback cookie
    const response = NextResponse.json({ ok: true, nome, plano: "admin" });
    response.cookies.set("nutripombos_fallback_user", JSON.stringify({
      id: 1,
      nome: nome,
      email: email,
      plano: "admin",
      acessoAtivo: true,
      acessoAte: null,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 86_400,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Não foi possível criar sua conta." }, { status: 500 });
  }
}
