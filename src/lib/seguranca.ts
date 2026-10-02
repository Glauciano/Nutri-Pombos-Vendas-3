/**
 * 🛡️ Camada de segurança do Nutri Pombos
 * - exijaUsuario(): autentica por sessão (cookie) para APIs privadas
 * - rateLimit(): freio de força bruta por IP (login/cadastro)
 * - webhookAutorizado(): valida token secreto do webhook de pagamento
 * - cronAutorizado(): valida o header secreto da Vercel (CRON_SECRET)
 *   (a Vercel envia automaticamente "Authorization: Bearer CRON_SECRET")
 */
import { db } from "@/db";
import { sessoes, usuarios } from "@/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";
import { createHash } from "crypto";

export type UsuarioAut = { id: number; nome: string; email: string; plano: string };

function hashToken(t: string) {
  return createHash("sha256").update(t).digest("hex");
}

/** Exige sessão válida. Retorna o usuário ou null. */
export async function exijaUsuario(): Promise<UsuarioAut | null> {
  try {
    const cookieHeader = await import("next/headers").then((m) => m.cookies());
    const token = cookieHeader.get("nutripombos_session")?.value;
    if (!token) return null;
    const [row] = await db
      .select({ id: usuarios.id, nome: usuarios.nome, email: usuarios.email, plano: usuarios.plano, acessoAtivo: usuarios.acessoAtivo })
      .from(sessoes)
      .innerJoin(usuarios, eq(sessoes.usuarioId, usuarios.id))
      .where(and(eq(sessoes.tokenHash, hashToken(token)), gt(sessoes.expiresAt, new Date())))
      .limit(1);
    if (!row || !row.acessoAtivo) return null;
    return { id: row.id, nome: row.nome, email: row.email, plano: row.plano };
  } catch {
    return null;
  }
}

/** Resposta 401 padrão */
export function resposta401(msg = "Não autenticado") {
  return Response.json({ error: msg }, { status: 401 });
}

/* ---------------- Rate limit (em memória; sobrevive ao processo) ---------------- */
const tentativas = new Map<string, { n: number; ate: number }>();

/**
 * Freio simples: máximo de `max` tentativas por janela de `janelaMs` por IP.
 * Uso: if (rateLimit(ip, 8, 10*60_000)) return resposta429()
 */
export function rateLimit(chave: string, max: number, janelaMs: number): boolean {
  const agora = Date.now();
  const at = tentativas.get(chave);
  if (!at || at.ate < agora) {
    tentativas.set(chave, { n: 1, ate: agora + janelaMs });
    return false;
  }
  at.n++;
  // limpeza leve ocasional
  if (tentativas.size > 5000) {
    for (const [k, v] of tentativas) if (v.ate < agora) tentativas.delete(k);
  }
  return at.n > max;
}

export function ipDaRequisicao(request: Request): string {
  const h = request.headers;
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconhecido";
}

export function resposta429() {
  return Response.json({ error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }, { status: 429 });
}

/* ---------------- Webhook de pagamento ---------------- */
export function webhookAutorizado(request: Request): boolean {
  const segredo = process.env.WEBHOOK_SECRET;
  if (!segredo) return false; // sem segredo configurado → NINGUÉM passa (fail closed)
  const enviado =
    request.headers.get("x-webhook-secret") ||
    (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "") ||
    new URL(request.url).searchParams.get("secret") ||
    "";
  // comparação em tempo constante (evita timing attack)
  const a = Buffer.from(segredo);
  const b = Buffer.from(enviado);
  return a.length === b.length && a.equals(b);
}

/* ---------------- Cron (Vercel) ---------------- */
export function cronAutorizado(request: Request): boolean {
  // 🛡️ FAIL-CLOSED: sem CRON_SECRET configurado, rota privilegiada fica FECHADA.
  // Configure CRON_SECRET na Vercel — o cron deles envia "Authorization: Bearer <CRON_SECRET>" sozinho.
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return false;
  const enviado = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  return enviado === segredo;
}
