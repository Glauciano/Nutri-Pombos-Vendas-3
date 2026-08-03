"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#07101f",
      color: "#fff",
      padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>⚠️</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          Página não disponível
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          Não foi possível carregar esta página. O banco de dados pode estar temporariamente indisponível.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              padding: "14px 32px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            style={{
              padding: "14px 32px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(to right, #fcd34d, #fbbf24)",
              color: "#111827",
              fontWeight: 800,
              fontSize: 14,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
