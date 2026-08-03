import "server-only";

import { createHash, randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";
import { sessoes, usuarios } from "@/db/schema";

export const SESSION_COOKIE = "nutripombos_session";
const SESSION_DAYS = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(usuarioId: number) {
  if (!isDbConfigured()) return; // Skip if no DB
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.insert(sessoes).values({ usuarioId, tokenHash: hashToken(token), expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && isDbConfigured()) {
    try { await db.delete(sessoes).where(eq(sessoes.tokenHash, hashToken(token))); } catch {}
  }
  store.delete(SESSION_COOKIE);
  store.delete("nutripombos_fallback_user");
}

export async function getCurrentUser() {
  // 1. Try DB session first
  if (isDbConfigured()) {
    try {
      const store = await cookies();
      const token = store.get(SESSION_COOKIE)?.value;
      if (token) {
        const [result] = await db.select({
          id: usuarios.id,
          nome: usuarios.nome,
          email: usuarios.email,
          plano: usuarios.plano,
          acessoAtivo: usuarios.acessoAtivo,
          acessoAte: usuarios.acessoAte,
        }).from(sessoes)
          .innerJoin(usuarios, eq(sessoes.usuarioId, usuarios.id))
          .where(and(eq(sessoes.tokenHash, hashToken(token)), gt(sessoes.expiresAt, new Date())))
          .limit(1);
        if (result && result.acessoAtivo) {
          if (result.acessoAte && result.acessoAte < new Date() && result.plano !== "vitalicio" && result.plano !== "admin") {
            // expired access
          } else {
            return result;
          }
        }
      }
    } catch {}
  }

  // 2. Check for fallback user cookie
  const store = await cookies();
  const fallbackUser = store.get("nutripombos_fallback_user")?.value;
  if (fallbackUser) {
    try {
      return JSON.parse(fallbackUser) as { id: number; nome: string; email: string; plano: string; acessoAtivo: boolean; acessoAte: null };
    } catch {}
  }

  // 3. No session found
  return null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const headerStore = await headers();
    const pathname = headerStore.get("x-pathname") || "/centro-provas";
    redirect(`/login?next=${pathname}`);
  }
  return user;
}
