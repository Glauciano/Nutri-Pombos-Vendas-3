import type { CSSProperties } from "react";

type Paleta = {
  bg: string; bgCard: string; bgInput: string; border: string;
  dim: string; dim2: string; white: string;
};

const PALETA_ESCURO: Paleta = {
  bg: "#0b1426", bgCard: "#1b283c", bgInput: "#0b1529", border: "#31415a",
  dim: "#9aa8bc", dim2: "#64748b", white: "#f8fafc",
};

const PALETA_CLARO: Paleta = {
  bg: "#eef2f8", bgCard: "#ffffff", bgInput: "#f4f7fc", border: "#c6d2e4",
  dim: "#5a6b82", dim2: "#8494ab", white: "#1b283c",
};

const TEMA_KEY = "nutripombos-tema";
export const EVENTO_TEMA = "nutripombos:tema";

export function temaAtual(): "escuro" | "claro" {
  if (typeof window === "undefined") return "escuro";
  try { return localStorage.getItem(TEMA_KEY) === "claro" ? "claro" : "escuro"; } catch { return "escuro"; }
}

export function alternarTema() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(TEMA_KEY, temaAtual() === "claro" ? "escuro" : "claro"); } catch { /* ignora */ }
  try { window.dispatchEvent(new Event(EVENTO_TEMA)); } catch { /* ignora */ }
}

function criarTema(p: Paleta) {
  return {
    ...p,
    gold: "#f7bd00",
    goldDark: "#ca8a04",
    green: "#39e58c",
    blue: "#55a3ff",
    red: "#ff5d62",
    orange: "#f97316",
    btn: {
      boxSizing: "border-box",
      width: "100%",
      padding: "12px 16px",
      color: "#0b1426",
      background: "#f7bd00",
      border: "1px solid #f7bd00",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
    } satisfies CSSProperties,
    btnGhost: {
      padding: "8px 13px",
      color: p.white,
      background: p.bgCard,
      border: `1px solid ${p.border}`,
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
    } satisfies CSSProperties,
    btnSm: {
      padding: "8px 11px",
      color: "#0b1426",
      background: "#f7bd00",
      border: "1px solid #f7bd00",
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
    } satisfies CSSProperties,
    btnDanger: {
      padding: "8px 11px",
      color: "#fecaca",
      background: "rgba(239,68,68,.12)",
      border: "1px solid rgba(239,68,68,.4)",
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
    } satisfies CSSProperties,
    h1: {
      color: p.white,
      fontSize: 24,
      lineHeight: 1.2,
      fontWeight: 800,
      margin: 0,
    } satisfies CSSProperties,
    small: {
      color: p.dim,
      fontSize: 12,
      lineHeight: 1.5,
    } satisfies CSSProperties,
    label: {
      color: p.dim,
      fontSize: 10,
      lineHeight: 1.2,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    } satisfies CSSProperties,
    card: {
      background: p.bgCard,
      border: `1px solid ${p.border}`,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
    } satisfies CSSProperties,
    input: {
      boxSizing: "border-box",
      width: "100%",
      minHeight: 42,
      padding: "9px 12px",
      color: p.white,
      background: p.bgInput,
      border: `1px solid ${p.border}`,
      borderRadius: 8,
      outline: "none",
    } satisfies CSSProperties,
  };
}

const temaEscuro = criarTema(PALETA_ESCURO);
const temaClaro = criarTema(PALETA_CLARO);

/** Objeto T "vivo": cada acesso resolve a paleta do tema atual (escuro/claro) */
export const T = new Proxy({} as ReturnType<typeof criarTema>, {
  get(_alvo, prop) {
    const t = temaAtual() === "claro" ? temaClaro : temaEscuro;
    return (t as unknown as Record<string | symbol, unknown>)[prop];
  },
});
