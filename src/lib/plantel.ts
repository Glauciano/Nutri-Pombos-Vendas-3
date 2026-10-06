import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * 🔐 PLANEL PRIVADO (multi-tenant) — cada conta vê e mexe SÓ no pombal dela.
 *
 * Migração automática e idempotente (pode rodar quantas vezes quiser):
 *  1. adiciona a coluna usuario_id nas tabelas pombos / racoes / alimentacoes
 *  2. atribui tudo que já existia ao administrador (o dono histórico do app)
 *  3. anilha deixa de ser única no mundo inteiro e passa a ser única POR USUÁRIO
 *     (dois criadores podem ter a mesma anilha, cada um no seu plantel)
 *
 * Roda 1x por instância do servidor (flag em memória) — custo ~zero.
 */
let garantido = false;

export async function garantirPlantelPrivado(): Promise<void> {
  if (garantido) return;

  // 1) colunas de dono
  await db.execute(sql`ALTER TABLE pombos ADD COLUMN IF NOT EXISTS usuario_id integer REFERENCES usuarios(id) ON DELETE CASCADE`);
  await db.execute(sql`ALTER TABLE racoes ADD COLUMN IF NOT EXISTS usuario_id integer REFERENCES usuarios(id) ON DELETE CASCADE`);
  await db.execute(sql`ALTER TABLE alimentacoes ADD COLUMN IF NOT EXISTS usuario_id integer REFERENCES usuarios(id) ON DELETE CASCADE`);

  // 2) tudo que já existia pertence ao admin (ou ao primeiro usuário, se não houver admin)
  await db.execute(sql`
    UPDATE pombos SET usuario_id = COALESCE(
      (SELECT id FROM usuarios WHERE plano = 'admin' ORDER BY id LIMIT 1),
      (SELECT MIN(id) FROM usuarios)
    ) WHERE usuario_id IS NULL
  `);
  await db.execute(sql`
    UPDATE racoes SET usuario_id = COALESCE(
      (SELECT id FROM usuarios WHERE plano = 'admin' ORDER BY id LIMIT 1),
      (SELECT MIN(id) FROM usuarios)
    ) WHERE usuario_id IS NULL
  `);
  await db.execute(sql`
    UPDATE alimentacoes SET usuario_id = COALESCE(
      (SELECT id FROM usuarios WHERE plano = 'admin' ORDER BY id LIMIT 1),
      (SELECT MIN(id) FROM usuarios)
    ) WHERE usuario_id IS NULL
  `);

  // 3) anilha única POR USUÁRIO (tira a unicidade global)
  await db.execute(sql`ALTER TABLE pombos DROP CONSTRAINT IF EXISTS pombos_anilha_key`);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS pombos_usuario_anilha ON pombos (usuario_id, anilha)`);

  garantido = true;
}
