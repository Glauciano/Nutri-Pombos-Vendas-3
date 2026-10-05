/**
 * 🔔 Chaves VAPID à prova de "colagem errada" na Vercel.
 *
 * A Vercel aceita colar a chave com Enter no fim (ou espaço), e a biblioteca
 * web-push REJEITA qualquer caractere fora do alfabeto Base64URL (A-Z a-z 0-9 - _)
 * com o erro: "Vapid public key must be a URL safe Base 64 (without '=')".
 * Também há geradores que devolvem Base64 CLÁSSICO (+ e /) em vez de URL-safe.
 *
 * Esta função normaliza qualquer um desses formatos para Base64URL limpo:
 *  1. remove ENTERS, tabs e espaços (colagem com linha extra)
 *  2. converte + → -  e  / → _  (Base64 clássico → URL-safe)
 *  3. remove o "=" do final (padding)
 */
export function normalizarBase64Url(chave: string | undefined | null): string | null {
  if (!chave) return null;
  const limpa = chave
    .replace(/\s+/g, "") // enters, tabs e espaços fora
    .replace(/\+/g, "-") // + → -
    .replace(/\//g, "_") // / → _
    .replace(/=+$/, ""); // "=" do fim fora
  if (!limpa) return null;
  // se ainda sobrou caractere estranho (aspas, vírgula...), a chave é inválida
  if (!/^[A-Za-z0-9\-_]+$/.test(limpa)) return null;
  return limpa;
}

/** VAPID_PUBLIC_KEY limpa (ou null se ausente/irrecuperável) */
export function vapidPublica(): string | null {
  return normalizarBase64Url(process.env.VAPID_PUBLIC_KEY);
}

/** VAPID_PRIVATE_KEY limpa (ou null se ausente/irrecuperável) */
export function vapidPrivada(): string | null {
  return normalizarBase64Url(process.env.VAPID_PRIVATE_KEY);
}
