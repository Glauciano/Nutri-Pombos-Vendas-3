/**
 * ☁️ Sincronização automática entre aparelhos (PC ↔ celular)
 * Estratégia: o localStorage do usuário é espelhado no banco (tabela dados_usuario),
 * chave a chave, com "último que escreveu vence" (timestamp em ms).
 */
import { getFoto } from "./fotos";

const META_KEY = "nutripombos-sync-meta-v1";
const STATUS_KEY = "nutripombos-sync-status-v1";
export const EVENTO_SYNC = "nutripombos:sync-agora";

const EXCLUIDAS = [
  "nutripombos-geocode",      // cache público de cidades
  "nutripombos-alerta-vespera", "nutripombos-vespera", // flags do dia
  "nutripombos-tema",          // preferência do aparelho
  "nutripombos-onboarding-feito",
  "nutripombos-fotos-v1",      // fotos ficam no aparelho (tamanho)
  "nutripombos-sync-meta-v1", "nutripombos-sync-status-v1",
];

function excluida(k: string) { return EXCLUIDAS.some((e) => k === e || k.startsWith(e + "-")); }
function sincronizavel(k: string) { return k.startsWith("nutripombos-") && !excluida(k); }

type Meta = Record<string, { t: number; del?: boolean }>;
function lerMeta(): Meta { try { return JSON.parse(localStorage.getItem(META_KEY) || "{}"); } catch { return {}; } }
function gravarMeta(m: Meta) { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch { /* ignora */ } }

let aplicandoRemoto = false;
let timers: Record<string, number> = {};

export function instalarInterceptor() {
  const originalSet = localStorage.setItem.bind(localStorage);
  const originalDel = localStorage.removeItem.bind(localStorage);
  localStorage.setItem = (k: string, v: string) => {
    originalSet(k, v);
    if (!aplicandoRemoto && sincronizavel(k)) {
      const m = lerMeta(); m[k] = { t: Date.now() }; gravarMeta(m);
      agendarPush(k);
    }
  };
  localStorage.removeItem = (k: string) => {
    originalDel(k);
    if (!aplicandoRemoto && sincronizavel(k)) {
      const m = lerMeta(); m[k] = { t: Date.now(), del: true }; gravarMeta(m);
      agendarPush(k);
    }
  };
}

function agendarPush(k: string) {
  window.clearTimeout(timers[k]);
  timers[k] = window.setTimeout(() => { void pushChave(k); }, 2500);
}

export function statusSync(): { ultimo: number; chaves: number } {
  try { return JSON.parse(localStorage.getItem(STATUS_KEY) || '{"ultimo":0,"chaves":0}'); } catch { return { ultimo: 0, chaves: 0 }; }
}
function gravarStatus(chaves: number) {
  try { localStorage.setItem(STATUS_KEY, JSON.stringify({ ultimo: Date.now(), chaves })); } catch { /* ignora */ }
  try { window.dispatchEvent(new Event("nutripombos:sync-ok")); } catch { /* ignora */ }
}

async function pushChave(k: string) {
  try {
    const m = lerMeta();
    const info = m[k];
    if (!info) return;
    const valor = info.del ? null : localStorage.getItem(k);
    await fetch("/api/dados", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chave: k, valor, at: info.t }),
    });
  } catch { /* offline — tenta no próximo ciclo */ }
}

/** Puxa tudo do servidor, aplica o que for mais novo lá, e devolve pro servidor o que for mais novo aqui */
export async function sincronizarAgora(): Promise<{ ok: boolean; aplicadas: number }> {
  let aplicadas = 0;
  try {
    const r = await fetch("/api/dados", { cache: "no-store" });
    if (!r.ok) return { ok: false, aplicadas };
    const j = (await r.json()) as { dados?: Record<string, { valor: string | null; at: number }> };
    const servidor = j.dados || {};
    const meta = lerMeta();
    const enviar: string[] = [];

    // 1) aplica do servidor o que é mais novo (ou que não existe localmente)
    aplicandoRemoto = true;
    Object.entries(servidor).forEach(([k, row]) => {
      if (!sincronizavel(k)) return;
      const localT = meta[k]?.t ?? (localStorage.getItem(k) !== null ? Date.now() : -1);
      if (row.at > localT) {
        if (row.valor == null) localStorage.removeItem(k);
        else localStorage.setItem(k, row.valor);
        meta[k] = { t: row.at, del: row.valor == null };
        aplicadas++;
      }
    });
    aplicandoRemoto = false;
    gravarMeta(meta);

    // 2) envia tudo local mais novo que o servidor (ou ausente lá)
    const chaves = new Set<string>(Object.keys(meta));
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && sincronizavel(k)) chaves.add(k);
    }
    chaves.forEach((k) => {
      const localT = meta[k]?.t ?? Date.now();
      const servidorTem = k in servidor;
      if (!servidorTem || localT > (servidor[k]?.at ?? 0)) enviar.push(k);
    });
    await Promise.all(enviar.map((k) => pushChave(k)));

    gravarStatus(Object.keys(servidor).length + enviar.length);
    return { ok: true, aplicadas };
  } catch {
    return { ok: false, aplicadas };
  }
}

/** Dispara sincronização completa + avisa as páginas que os dados podem ter mudado */
export async function sincronizarENotificar() {
  const r = await sincronizarAgora();
  if (r.aplicadas > 0) {
    try { window.dispatchEvent(new Event("nutripombos:calendario")); } catch { /* ignora */ }
    try { window.dispatchEvent(new Event("nutripombos:pombal")); } catch { /* ignora */ }
    window.location.reload();
  }
  return r;
}

export { getFoto };
