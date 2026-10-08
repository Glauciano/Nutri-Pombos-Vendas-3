import { db, isDbConfigured } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { exijaUsuario, exijaPago } from "@/lib/seguranca";

/**
 * 🛒 VITRINE ENTRE CRIADORES — o quadro de anúncios do app.
 * - GET: lista os anúncios (público: quem tem o link vê; publica exige conta paga)
 * - POST: publica um pombo à venda (só dono do pombo, plano pago, máx 10 anúncios)
 * - DELETE: remove o próprio anúncio (ou admin remove qualquer um)
 */
type Anuncio = {
  id: number; usuario_id: number; anilha: string; nome: string | null; sexo: string | null;
  cor: string | null; nascimento: string | null; preco: string | null; obs: string | null;
  whatsapp: string | null; criador: string;
};

function linhas<T>(r: unknown): T[] {
  return (((r as { rows?: unknown[] })?.rows ?? r) as T[]) || [];
}

async function garantirTabela() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS anuncios_vitrine (
      id serial PRIMARY KEY,
      usuario_id integer NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      anilha text NOT NULL,
      nome text, sexo text, cor text, nascimento text,
      preco text, obs text, whatsapp text,
      criado_em timestamptz NOT NULL DEFAULT now()
    )
  `);
}

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  try {
    await garantirTabela();
    // sessão opcional: marca quais anúncios são do próprio usuário
    const user = await exijaUsuario().catch(() => null);
    const r = await db.execute(sql`
      SELECT a.id, a.usuario_id, a.anilha, a.nome, a.sexo, a.cor, a.nascimento, a.preco, a.obs, a.whatsapp, u.nome AS criador
      FROM anuncios_vitrine a
      JOIN usuarios u ON u.id = a.usuario_id
      ORDER BY a.criado_em DESC
      LIMIT 100
    `);
    return NextResponse.json({ meuId: user?.id ?? null, anuncios: linhas<Anuncio>(r) });
  } catch (e) {
    console.error("vitrine GET:", e);
    return NextResponse.json({ error: "Falha ao carregar a vitrine" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const { user, erro } = await exijaPago();
  if (erro) return erro;
  try {
    await garantirTabela();
    const body = (await request.json()) as { anilha?: string; preco?: string; obs?: string; whatsapp?: string };
    const anilha = String(body.anilha || "").trim();
    if (anilha.length < 4) return NextResponse.json({ error: "Anilha inválida" }, { status: 400 });

    // 🔐 o pombo tem que ser do PLANEL do usuário (cópia dos dados vem da tabela dele)
    const p = linhas<{ id: number; nome: string | null; sexo: string; cor: string | null; data_nascimento: string | null }>(
      await db.execute(sql`SELECT id, nome, sexo, cor, data_nascimento FROM pombos WHERE anilha = ${anilha} AND usuario_id = ${user.id} LIMIT 1`)
    );
    if (!p.length) return NextResponse.json({ error: "Pombo não encontrado no SEU plantel — selecione da lista." }, { status: 404 });

    // limite anti-spam: 10 anúncios por usuário
    const cont = linhas<{ n: number }>(await db.execute(sql`SELECT count(*)::int AS n FROM anuncios_vitrine WHERE usuario_id = ${user.id}`));
    if (Number(cont[0]?.n || 0) >= 10) {
      return NextResponse.json({ error: "Limite de 10 anúncios — remova um antes de publicar outro." }, { status: 400 });
    }

    // re-publicar a mesma anilha atualiza (remove o antigo e insere)
    await db.execute(sql`DELETE FROM anuncios_vitrine WHERE usuario_id = ${user.id} AND anilha = ${anilha}`);
    await db.execute(sql`
      INSERT INTO anuncios_vitrine (usuario_id, anilha, nome, sexo, cor, nascimento, preco, obs, whatsapp)
      VALUES (${user.id}, ${anilha}, ${p[0].nome}, ${p[0].sexo}, ${p[0].cor},
              ${p[0].data_nascimento ? String(p[0].data_nascimento).slice(0, 10) : null},
              ${String(body.preco || "").slice(0, 60) || null}, ${String(body.obs || "").slice(0, 300) || null},
              ${String(body.whatsapp || "").replace(/\D/g, "").slice(0, 20) || null})
    `);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("vitrine POST:", e);
    return NextResponse.json({ error: "Falha ao publicar anúncio" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const user = await exijaUsuario();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  try {
    await garantirTabela();
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    // 🔐 só remove o PRÓPRIO anúncio (admin pode remover qualquer)
    const filtro = user.plano === "admin" ? sql`id = ${id}` : sql`id = ${id} AND usuario_id = ${user.id}`;
    await db.execute(sql`DELETE FROM anuncios_vitrine WHERE ${filtro}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("vitrine DELETE:", e);
    return NextResponse.json({ error: "Falha ao remover anúncio" }, { status: 500 });
  }
}
