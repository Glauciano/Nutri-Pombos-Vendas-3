/**
 * 📷 Fotos dos pombos — salvas no próprio aparelho (localStorage), redimensionadas
 * pra caber (JPEG) e não estourar o limite de ~5MB.
 * - Foto do CORPO: máx ~420px, qualidade 0.72 (avatar/miniatura)
 * - Foto do OLHO (eye-sign): máx ~640px, qualidade 0.8 — os círculos são o detalhe!
 */
const KEY_FOTOS = "nutripombos-fotos-v1";
const KEY_FOTOS_OLHO = "nutripombos-fotos-olho-v1";

type MapaFotos = Record<string, string>;

function ler(chave: string): MapaFotos {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(chave) || "{}"); } catch { return {}; }
}

export function getFoto(anilha: string): string | null {
  return ler(KEY_FOTOS)[anilha] ?? null;
}

export function getFotoOlho(anilha: string): string | null {
  return ler(KEY_FOTOS_OLHO)[anilha] ?? null;
}

export function removerFoto(anilha: string) {
  const m = ler(KEY_FOTOS);
  delete m[anilha];
  try { localStorage.setItem(KEY_FOTOS, JSON.stringify(m)); } catch { /* ignora */ }
}

export function removerFotoOlho(anilha: string) {
  const m = ler(KEY_FOTOS_OLHO);
  delete m[anilha];
  try { localStorage.setItem(KEY_FOTOS_OLHO, JSON.stringify(m)); } catch { /* ignora */ }
}

/** Redimensiona e salva. Retorna dataURL ou null se falhar. */
async function salvarEm(chave: string, anilha: string, arquivo: File, max: number, qualidade: number): Promise<string | null> {
  try {
    const dataUrl = await new Promise<string>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result));
      fr.onerror = () => rej(new Error("leitura falhou"));
      fr.readAsDataURL(arquivo);
    });
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("imagem inválida"));
      i.src = dataUrl;
    });
    const escala = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const final = canvas.toDataURL("image/jpeg", qualidade);
    const m = ler(chave);
    m[anilha] = final;
    try { localStorage.setItem(chave, JSON.stringify(m)); return final; }
    catch {
      // sem espaço: tenta limpar fotos antigas de anilhas que não existem mais
      try { localStorage.setItem(chave, JSON.stringify({ [anilha]: final })); return final; } catch { return null; }
    }
  } catch { return null; }
}

/** Foto do corpo do pombo (miniatura) */
export function salvarFoto(anilha: string, arquivo: File): Promise<string | null> {
  return salvarEm(KEY_FOTOS, anilha, arquivo, 420, 0.72);
}

/** 👁️ Foto do OLHO (eye-sign) — maior e mais nítida que a do corpo */
export function salvarFotoOlho(anilha: string, arquivo: File): Promise<string | null> {
  return salvarEm(KEY_FOTOS_OLHO, anilha, arquivo, 640, 0.8);
}
