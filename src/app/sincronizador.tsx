"use client";

import { useEffect } from "react";
import { instalarInterceptor, sincronizarAgora } from "./centro-provas/lib/sincronizacao";

/** ☁️ Sincroniza os dados do usuário entre aparelhos — silencioso e automático */
export default function Sincronizador() {
  useEffect(() => {
    instalarInterceptor();
    // puxa ao abrir (aplica mudanças de outros aparelhos)
    void sincronizarAgora();
    // e a cada 5 minutos
    const ciclo = window.setInterval(() => { void sincronizarAgora(); }, 5 * 60 * 1000);
    // botão manual (Configuração)
    const manual = () => { void sincronizarAgora(); };
    window.addEventListener("nutripombos:sync-agora", manual);
    return () => { window.clearInterval(ciclo); window.removeEventListener("nutripombos:sync-agora", manual); };
  }, []);
  return null;
}
