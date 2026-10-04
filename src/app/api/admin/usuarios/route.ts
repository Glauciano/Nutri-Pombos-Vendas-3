import { db, isDbConfigured } from "@/db";
import { usuarios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { exijaUsuario, resposta401 } from "@/lib/seguranca";

/** 👑 Painel Admin — gestão de usuários (exige plano admin) */

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const user = await exijaUsuario();
  if (!user) return resposta401();
  if (user.plano !== "admin") return NextResponse.json({ error: "Acesso restrito ao administrador" }, { status: 403 });
  try {
    const lista = await db.select({
      id: usuarios.id, nome: usuarios.nome, email: usuarios.email, plano: usuarios.plano,
      acessoAtivo: usuarios.acessoAtivo, acessoAte: usuarios.acessoAte, createdAt: usuarios.createdAt,
    }).from(usuarios).orderBy(usuarios.id);
    // nunca devolve hash de senha
    return NextResponse.json(lista);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Falha ao listar" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const user = await exijaUsuario();
  if (!user) return resposta401();
  if (user.plano !== "admin") return NextResponse.json({ error: "Acesso restrito ao administrador" }, { status: 403 });
  try {
    const body = (await request.json()) as { id?: number; plano?: string; acessoAtivo?: boolean; dias?: number };
    if (!body.id || body.id === user.id) return NextResponse.json({ error: "Informe o id do usuário (não pode ser você mesmo)" }, { status: 400 });
    const [alvo] = await db.select().from(usuarios).where(eq(usuarios.id, body.id)).limit(1);
    if (!alvo) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    type Plano = "teste" | "mensal" | "anual" | "vitalicio" | "admin";
    const patch: { plano?: Plano; acessoAtivo?: boolean; acessoAte?: Date } = {};
    if (body.plano && ["teste", "mensal", "anual", "vitalicio", "admin"].includes(body.plano)) patch.plano = body.plano as Plano;
    if (typeof body.acessoAtivo === "boolean") patch.acessoAtivo = body.acessoAtivo;
    if (body.dias) patch.acessoAte = new Date(Date.now() + body.dias * 86_400_000);
    if (body.dias === 0 && body.plano && (body.plano === "vitalicio" || body.plano === "admin")) delete patch.acessoAte;
    if (!Object.keys(patch).length) return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    await db.update(usuarios).set(patch).where(eq(usuarios.id, body.id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Falha ao atualizar" }, { status: 500 });
  }
}
