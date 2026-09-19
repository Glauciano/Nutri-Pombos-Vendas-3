"use client";

import { useEffect } from "react";

/**
 * 🌐 Tradutor global de conteúdo: percorre os nós de texto da página e
 * traduz (dicionário + cache + API em lote) quando o idioma não é PT.
 * Ao chegar nova tradução (evento "nutripombos:traduziu"), passa de novo.
 */
const IGNORAR = /^(https?:|\/|mailto:|#|\d)/;
const MAX_NO = 60;

function traduzirPagina(idioma: string) {
  if (idioma === "pt") return;
  import("./centro-provas/lib/traducao").then(({ traduz }) => {
    let count = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const t = (node.textContent || "").trim();
        if (!t || t.length < 2 || t.length > 180) return NodeFilter.FILTER_REJECT;
        if (IGNORAR.test(t)) return NodeFilter.FILTER_REJECT;
        const pai = node.parentElement;
        if (!pai || pai.closest("script,style,code,pre,textarea,input,svg")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nos: Text[] = [];
    let n: Node | null;
    while ((n = walker.nextNode()) && nos.length < MAX_NO) nos.push(n as Text);
    nos.forEach((no) => {
      const original = (no.textContent || "").trim();
      const novo = traduz(original, idioma as "es" | "en");
      if (novo && novo !== original) {
        no.textContent = no.textContent!.replace(original, novo);
        count++;
      }
    });
  }).catch(() => { /* módulo não carregou — ignora */ });
}

export default function TradutorGlobal() {
  useEffect(() => {
    let idioma = "pt";
    try { idioma = localStorage.getItem("nutripombos-idioma") || "pt"; } catch { /* ignora */ }
    if (idioma === "pt") return;
    const rodar = () => traduzirPagina(idioma);
    const t1 = window.setTimeout(rodar, 400); // deixa a página montar
    const aoTraduzir = () => { window.clearTimeout(t1); rodar(); };
    window.addEventListener("nutripombos:traduziu", aoTraduzir);
    return () => { window.clearTimeout(t1); window.removeEventListener("nutripombos:traduziu", aoTraduzir); };
  }, []);
  return null;
}
