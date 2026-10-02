import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 🚦 Guarda de entrada do app:
 * 1. Rate limit GLOBAL em /api/* (por IP e grupo de rota) — protege o banco e
 *    evita travar por excesso de requisições (ataque ou bug de cliente).
 * 2. Repassa o pathname para a área logada (redirect do login).
 *
 * Limites (por IP):
 *  - /api/auth/login e /api/auth/cadastro :  8 a cada 10 min  (força bruta)
 *  - /api/push/*                          : 30 a cada 1 min
 *  - /api/publico/* (ficha QR)            : 60 a cada 1 min
 *  - /api/dados (sincronização)           : 60 a cada 1 min
 *  - demais /api/*                        : 120 a cada 1 min
 * Resposta ao estourar: 429 + Retry-After (o app continua funcionando depois).
 */

const janelas = new Map<string, { n: number; ate: number }>();

function limitar(chave: string, max: number, janelaMs: number): { bloqueado: boolean; restante: number; retrySeg: number } {
  const agora = Date.now();
  if (janelas.size > 10_000) {
    for (const [k, v] of janelas) if (v.ate < agora) janelas.delete(k);
  }
  const at = janelas.get(chave);
  if (!at || at.ate < agora) {
    janelas.set(chave, { n: 1, ate: agora + janelaMs });
    return { bloqueado: false, restante: max - 1, retrySeg: 0 };
  }
  at.n++;
  if (at.n > max) {
    return { bloqueado: true, restante: 0, retrySeg: Math.max(1, Math.ceil((at.ate - agora) / 1000)) };
  }
  return { bloqueado: false, restante: max - at.n, retrySeg: 0 };
}

function ipDe(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "desconhecido";
}

/** Define o limite (max, janela) por grupo de rota */
function limiteDaRota(pathname: string): { max: number; janelaMs: number; grupo: string } {
  if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/cadastro")) {
    return { max: 8, janelaMs: 10 * 60_000, grupo: "auth" };
  }
  if (pathname.startsWith("/api/push/")) return { max: 30, janelaMs: 60_000, grupo: "push" };
  if (pathname.startsWith("/api/publico/")) return { max: 60, janelaMs: 60_000, grupo: "publico" };
  if (pathname.startsWith("/api/dados")) return { max: 60, janelaMs: 60_000, grupo: "dados" };
  if (pathname.startsWith("/api/setup") || pathname.startsWith("/api/webhook")) {
    return { max: 20, janelaMs: 60_000, grupo: "admin" };
  }
  return { max: 120, janelaMs: 60_000, grupo: "geral" };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🚦 APIs: aplica o freio
  if (pathname.startsWith("/api/")) {
    const { max, janelaMs, grupo } = limiteDaRota(pathname);
    const r = limitar(`api:${grupo}:${ipDe(request)}`, max, janelaMs);
    if (r.bloqueado) {
      return NextResponse.json(
        { error: `Muitas requisições (${grupo}). Aguarde ${r.retrySeg}s e tente novamente.` },
        { status: 429, headers: { "Retry-After": String(r.retrySeg) } }
      );
    }
    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Limit", String(max));
    res.headers.set("X-RateLimit-Remaining", String(r.restante));
    return res;
  }

  // Área logada: repassa o pathname (usado no redirect pós-login)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/centro-provas/:path*", "/api/:path*"],
};
