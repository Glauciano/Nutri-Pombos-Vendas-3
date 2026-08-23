import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import RegistradorSW from "./registrador-sw";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nutri Pombos - Gestão Nutricional de Pombos",
  description: "Sistema completo para columbófilos gerenciarem alimentação, saúde e desempenho dos seus pombos.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7bd00",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <RegistradorSW />
        {children}
      </body>
    </html>
  );
}
