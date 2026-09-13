/**
 * 📷 Fotos dos pombos — salvas no próprio aparelho (localStorage), redimensionadas
 * pra caber (máx ~420px, JPEG) e não estourar o limite de ~5MB.
 */
const KEY_FOTOS = "nutripombos-fotos-v1";

type MapaFotos = Record<string, string>;

function ler(): MapaFotos {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY_FOTOS) || "{}"); } catch { return {}; }
}

export function getFoto(anilha: string): string | null {
  return ler()[anilha] ?? null;
}

export function removerFoto(anilha: string) {
  const m = ler();
  delete m[anilha];
  try { localStorage.setItem(KEY_FOTOS, JSON.stringify(m)); } catch { /* ignora */ }
}

/** Redimensiona e salva. Retorna dataURL ou null se falhar. */
export async function salvarFoto(anilha: string, arquivo: File): Promise<string | null> {
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
    const MAX = 420;
    const escala = Math.min(1, MAX / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const final = canvas.toDataURL("image/jpeg", 0.72);
    const m = ler();
    m[anilha] = final;
    try { localStorage.setItem(KEY_FOTOS, JSON.stringify(m)); return final; }
    catch {
      // sem espaço: tenta limpar fotos antigas de anilhas que não existem mais
      try { localStorage.setItem(KEY_FOTOS, JSON.stringify({ [anilha]: final })); return final; } catch { return null; }
    }
  } catch { return null; }
}
