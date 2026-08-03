"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
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
            <div style={{ fontSize: 64, marginBottom: 24 }}>🐦</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
              Algo deu errado
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
              Ocorreu um erro inesperado. Isso pode ser temporário — tente novamente.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "14px 32px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(to right, #fcd34d, #fbbf24)",
                color: "#111827",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
