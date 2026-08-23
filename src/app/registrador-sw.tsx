"use client";

import { useEffect } from "react";

/** Registra o Service Worker (notificações + instalar como app). Silencioso se não suportado. */
export default function RegistradorSW() {
  useEffect(() => {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => { /* sem suporte — ignora */ });
    }
  }, []);
  return null;
}
