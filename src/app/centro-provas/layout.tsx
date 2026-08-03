import type { ReactNode } from "react";
import CentroShell from "./centro-shell";
import { requireUser } from "@/lib/auth";

export default async function CentroProvasLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return <CentroShell user={{ nome: user.nome, email: user.email, plano: user.plano }}>{children}</CentroShell>;
}
