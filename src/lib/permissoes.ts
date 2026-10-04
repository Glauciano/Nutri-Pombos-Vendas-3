/**
 * 🎫 Sistema de permissões do Nutri Pombos — o que cada plano pode fazer.
 *
 * Papéis (do menor ao maior):
 *  - "teste"    : experimenta o app (módulos essenciais, até X pombos)
 *  - "mensal" / "anual" / "vitalicio" : pago — tudo liberado para USO próprio
 *  - "admin"    : dono do app — tudo + rotas de administração
 *
 * Também valida assinatura expirada (acesso_ate vencido = rebaixa p/ "teste").
 */

export type Papel = "admin" | "vitalicio" | "anual" | "mensal" | "teste";
export type Nivel = 0 | 1 | 2; // 0=teste, 1=pago, 2=admin

const NIVEL_DO_PAPEL: Record<string, Nivel> = {
  teste: 0, mensal: 1, anual: 1, vitalicio: 1, admin: 2,
};

export function nivelDoPlano(plano: string | undefined | null, acessoAte?: string | Date | null): Nivel {
  let base = NIVEL_DO_PAPEL[plano || "teste"] ?? 0;
  // assinatura vencida → rebaixa pra teste (exceto vitalício/admin)
  if (base === 1 && acessoAte) {
    const fim = new Date(acessoAte).getTime();
    if (Number.isFinite(fim) && fim < Date.now()) base = 0;
  }
  return base;
}

/** Módulos livres (todos, inclusive teste) */
export const MODULOS_LIVRES: string[] = [
  "/centro-provas",            // painel
  "/centro-provas/primeiros-passos",
  "/centro-provas/guia-iniciante",
  "/centro-provas/configuracao",
  "/centro-provas/alertas",
  "/centro-provas/gerenciar-calendario",
  "/centro-provas/rota",
  "/centro-provas/previsao",   // widget (se existir)
];

/** Módulos que exigem plano pago (nível ≥ 1) — o "core" premium */
export const EXIGE_PAGO: string[] = [
  "/centro-provas/telao",
  "/centro-provas/equipe",
  "/centro-provas/checklist",
  "/centro-provas/historico",
  "/centro-provas/graficos",
  "/centro-provas/cronicas",
  "/centro-provas/clima-desempenho",
  "/centro-provas/relatorio-temporada",
  "/centro-provas/ranking",
  "/centro-provas/comparador",
  "/centro-provas/cartao-campeao",
  "/centro-provas/ficha-pombo",
  "/centro-provas/vendas",
  "/centro-provas/acasalamento",
  "/centro-provas/ninhadas",
];

/** Módulos só do DONO do app (nível 2) */
export const EXIGE_ADMIN: string[] = [
  "/centro-provas/admin",   // painel do administrador
];

/** Rotas de API que exigem plano pago */
export const API_EXIGE_PAGO: string[] = [
  "/api/dados",        // sincronização entre aparelhos
  "/api/push/",        // notificações push
];

/** Limite de pombos cadastrados por nível */
export const LIMITE_POMBOS: Record<Nivel, number> = { 0: 8, 1: 5000, 2: 100000 };

export function podeAcessarModulo(pathname: string, nivel: Nivel): { ok: boolean; motivo?: string } {
  if (EXIGE_ADMIN.some((m) => pathname.startsWith(m))) {
    return nivel >= 2 ? { ok: true } : { ok: false, motivo: "Área exclusiva do administrador." };
  }
  if (EXIGE_PAGO.some((m) => pathname.startsWith(m))) {
    return nivel >= 1 ? { ok: true } : { ok: false, motivo: "Recurso do plano pago. Assine para liberar." };
  }
  return { ok: true };
}

export function textoPlano(nivel: Nivel): string {
  return nivel === 2 ? "Administrador" : nivel === 1 ? "Plano pago" : "Teste grátis";
}
