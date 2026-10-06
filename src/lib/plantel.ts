import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * 🔐 PLANEL PRIVADO (multi-tenant) — cada conta vê e mexe SÓ no pombal dela.
 *
 * Migração automática e idempotente (pode rodar quantas vezes quiser):
 *  1. adiciona a coluna usuario_id nas tabelas pombos / racoes / alimentacoes
 *  2. atribui tudo que já existia ao administrador (o dono histórico do app)
 *  3. anilha deixa de ser única no mundo inteiro e passa a ser única POR USUÁRIO
 *
 * ⚠️ A conta "fantasma" admin@nutripombos.com (login antigo desativado) NUNCA
 * é preferida na entrega — e o plantel dela pode ser resgatado pelo admin real
 * (resgatarDoFantasma), que roda sozinho ao abrir a página de Pombos.
 */
let garantido = false;

/** e-mail da conta fantasma criada pelo setup antigo (login desativado) */
export const EMAIL_FANTASMA = "admin@nutripombos.com";

export async function garantirPlantelPrivado(): Promise<void> {
  if (garantido) return;

  // 1) colunas de dono
  await db.execute(sql`ALTER TABLE pombos ADD COLUMN IF NOT EXISTS usuario_id integer REFERENCES usuarios(id) ON DELETE CASCADE`);
  await db.execute(sql`ALTER TABLE racoes ADD COLUMN IF NOT EXISTS usuario_id integer REFERENCES usuarios(id) ON DELETE CASCADE`);
  await db.execute(sql`ALTER TABLE alimentacoes ADD COLUMN IF NOT EXISTS usuario_id integer REFERENCES usuarios(id) ON DELETE CASCADE`);

  // 2) tudo que já existia pertence a um admin de verdade (nunca ao fantasma)
  //    ordem: admin real (menor id) → qualquer admin → primeiro usuário
  await db.execute(sql`
    UPDATE pombos SET usuario_id = COALESCE(
      (SELECT id FROM usuarios WHERE plano = 'admin' AND email <> ${EMAIL_FANTASMA} ORDER BY id LIMIT 1),
      (SELECT id FROM usuarios WHERE plano = 'admin' ORDER BY id LIMIT 1),
      (SELECT MIN(id) FROM usuarios)
    ) WHERE usuario_id IS NULL
  `);
  await db.execute(sql`
    UPDATE racoes SET usuario_id = COALESCE(
      (SELECT id FROM usuarios WHERE plano = 'admin' AND email <> ${EMAIL_FANTASMA} ORDER BY id LIMIT 1),
      (SELECT id FROM usuarios WHERE plano = 'admin' ORDER BY id LIMIT 1),
      (SELECT MIN(id) FROM usuarios)
    ) WHERE usuario_id IS NULL
  `);
  await db.execute(sql`
    UPDATE alimentacoes SET usuario_id = COALESCE(
      (SELECT id FROM usuarios WHERE plano = 'admin' AND email <> ${EMAIL_FANTASMA} ORDER BY id LIMIT 1),
      (SELECT id FROM usuarios WHERE plano = 'admin' ORDER BY id LIMIT 1),
      (SELECT MIN(id) FROM usuarios)
    ) WHERE usuario_id IS NULL
  `);

  // 3) anilha única POR USUÁRIO (tira a unicidade global)
  await db.execute(sql`ALTER TABLE pombos DROP CONSTRAINT IF EXISTS pombos_anilha_key`);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS pombos_usuario_anilha ON pombos (usuario_id, anilha)`);

  garantido = true;
}

/**
 * 🕊️ RESGATE: transfere o plantel da conta FANTASMA (login antigo desativado)
 * para o admin informado. Devolve quantos pombos foram resgatados.
 * Seguro: só mexe no que pertence exclusivamente ao fantasma.
 */
export async function resgatarDoFantasma(adminId: number): Promise<number> {
  // quantos pombos o fantasma tem agora?
  const cont = await db.execute(sql`
    SELECT count(*)::int AS n FROM pombos
    WHERE usuario_id = (SELECT id FROM usuarios WHERE email = ${EMAIL_FANTASMA})
  `);
  const linhas = ((cont as unknown as { rows?: unknown[] }).rows ?? cont) as { n?: number }[];
  const n = Number(linhas?.[0]?.n || 0);
  if (n > 0) {
    await db.execute(sql`
      UPDATE pombos SET usuario_id = ${adminId}
      WHERE usuario_id = (SELECT id FROM usuarios WHERE email = ${EMAIL_FANTASMA})
    `);
    await db.execute(sql`
      UPDATE racoes SET usuario_id = ${adminId}
      WHERE usuario_id = (SELECT id FROM usuarios WHERE email = ${EMAIL_FANTASMA})
    `);
    await db.execute(sql`
      UPDATE alimentacoes SET usuario_id = ${adminId}
      WHERE usuario_id = (SELECT id FROM usuarios WHERE email = ${EMAIL_FANTASMA})
    `);
  }
  return n;
}
