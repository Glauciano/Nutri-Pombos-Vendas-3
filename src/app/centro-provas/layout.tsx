import type { ReactNode } from "react";
import CentroShell from "./centro-shell";
import { requireUser } from "@/lib/auth";
import { nivelDoPlano } from "@/lib/permissoes";

export default async function CentroProvasLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const nivel = nivelDoPlano(user.plano, (user as { acessoAte?: string | Date | null }).acessoAte ?? null);
  return <CentroShell user={{ nome: user.nome, email: user.email, plano: user.plano, nivel }}>{children}</CentroShell>;
}
